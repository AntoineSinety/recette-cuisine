// src/components/IngredientAutocomplete.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import { useToast } from './ToastContainer';

const IngredientAutocomplete = ({ ingredients, onSelectIngredient }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'g', imageUrl: '' });
  const inputRef = useRef(null);
  const suggestionRefs = useRef([]);
  const { addIngredient } = useIngredients();
  const { showSuccess, showError } = useToast();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHighlightedIndex(-1);

    if (value.trim() === '') {
      // Afficher tous les ingrédients si pas de recherche
      setSuggestions(ingredients.slice(0, 10));
      setIsOpen(true);
      return;
    }

    // Filtrer les suggestions basées sur l'entrée de l'utilisateur
    const filteredSuggestions = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 10); // Limiter à 10 suggestions

    setSuggestions(filteredSuggestions);
    setIsOpen(true); // Toujours ouvrir, même sans résultats
  };

  const handleSelect = (ingredient) => {
    onSelectIngredient(ingredient);
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    // Afficher tous les ingrédients au focus si pas de recherche
    if (inputValue.trim() === '') {
      setSuggestions(ingredients.slice(0, 10));
    }
    setIsOpen(true);
  };

  const handleBlur = (e) => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionRefs.current[highlightedIndex]) {
      suggestionRefs.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex]);

  const handleOpenAddNew = () => {
    setNewIngredient({ name: inputValue || '', unit: 'g', imageUrl: '' });
    setIsAddingNew(true);
    setIsOpen(false);
  };

  const handleCloseAddNew = () => {
    setIsAddingNew(false);
    setNewIngredient({ name: '', unit: 'g', imageUrl: '' });
  };

  const handleSaveNewIngredient = async () => {
    if (!newIngredient.name.trim()) {
      showError('Le nom de l\'ingrédient est obligatoire');
      return;
    }

    // Vérifier si l'ingrédient existe déjà
    const exists = ingredients.some(
      ing => ing.name.toLowerCase() === newIngredient.name.trim().toLowerCase()
    );

    if (exists) {
      showError(`L'ingrédient "${newIngredient.name}" existe déjà`);
      return;
    }

    try {
      const ingredientToAdd = {
        name: newIngredient.name.trim(),
        unit: newIngredient.unit,
        imageUrl: newIngredient.imageUrl || ''
      };

      await addIngredient(ingredientToAdd);

      // Ajouter l'ingrédient à la recette
      onSelectIngredient({
        ...ingredientToAdd,
        id: Date.now().toString(), // ID temporaire
        quantity: ''
      });

      showSuccess(`Ingrédient "${ingredientToAdd.name}" créé et ajouté !`);
      handleCloseAddNew();
      setInputValue('');
    } catch (error) {
      console.error('Erreur lors de la création de l\'ingrédient:', error);
      showError('Erreur lors de la création de l\'ingrédient');
    }
  };

  return (
    <div className="autocomplete">
      <div className="autocomplete__wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="🔍 Rechercher un ingrédient..."
          className="autocomplete__input"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="autocomplete__clear"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className="autocomplete__dropdown">
          {suggestions.length > 0 ? (
            <div className="autocomplete__list">
              {suggestions.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  ref={el => suggestionRefs.current[index] = el}
                  className={`autocomplete__item ${
                    index === highlightedIndex ? 'autocomplete__item--active' : ''
                  }`}
                  onClick={() => handleSelect(ingredient)}
                >
                  <div className="autocomplete__image">
                    {ingredient.imageUrl ? (
                      <img
                        src={ingredient.imageUrl}
                        alt={ingredient.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="autocomplete__placeholder">
                      🥄
                    </div>
                  </div>
                  <div className="autocomplete__content">
                    <div className="autocomplete__name">
                      {ingredient.name}
                    </div>
                    <div className="autocomplete__unit">
                      Unité: {ingredient.unit}
                    </div>
                  </div>
                  <div className="autocomplete__add">
                    +
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="autocomplete__no-results">
              <p>Aucun ingrédient trouvé</p>
            </div>
          )}

          {/* Bouton de création toujours visible */}
          <button
            type="button"
            className="autocomplete__create-btn autocomplete__create-btn--bottom"
            onClick={handleOpenAddNew}
          >
            {inputValue ? `+ Créer "${inputValue}"` : '+ Créer un nouvel ingrédient'}
          </button>
        </div>
      )}

      {/* Popup d'ajout rapide */}
      {isAddingNew && (
        <div className="autocomplete__modal-overlay" onClick={handleCloseAddNew}>
          <div className="autocomplete__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="autocomplete__modal-title">Créer un nouvel ingrédient</h3>

            <div className="autocomplete__modal-form">
              <div className="autocomplete__modal-field">
                <label>Nom *</label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  placeholder="Ex: Farine"
                  autoFocus
                />
              </div>

              <div className="autocomplete__modal-field">
                <label>Unité *</label>
                <select
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                >
                  <option value="g">Grammes (g)</option>
                  <option value="kg">Kilogrammes (kg)</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="l">Litres (l)</option>
                  <option value="cl">Centilitres (cl)</option>
                  <option value="u">Unités (u)</option>
                  <option value="cc">Cuillère à café (cc)</option>
                  <option value="cs">Cuillère à soupe (cs)</option>
                </select>
              </div>

              <div className="autocomplete__modal-actions">
                <button
                  type="button"
                  className="autocomplete__modal-btn autocomplete__modal-btn--cancel"
                  onClick={handleCloseAddNew}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="autocomplete__modal-btn autocomplete__modal-btn--save"
                  onClick={handleSaveNewIngredient}
                >
                  Créer et ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientAutocomplete;

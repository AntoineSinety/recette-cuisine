// src/components/IngredientAutocomplete.jsx
import React, { useState, useRef, useEffect } from 'react';

const IngredientAutocomplete = ({ ingredients, onSelectIngredient }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionRefs = useRef([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHighlightedIndex(-1);

    if (value.trim() === '') {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Filtrer les suggestions basées sur l'entrée de l'utilisateur
    const filteredSuggestions = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 6); // Limiter à 6 suggestions
    
    setSuggestions(filteredSuggestions);
    setIsOpen(filteredSuggestions.length > 0);
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
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
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

  return (
    <div className="ingredient-autocomplete">
      <div className="ingredient-autocomplete__input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="🔍 Rechercher un ingrédient..."
          className="ingredient-autocomplete__input"
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
            className="ingredient-autocomplete__clear"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="ingredient-autocomplete__dropdown">
          <div className="ingredient-autocomplete__suggestions">
            {suggestions.map((ingredient, index) => (
              <div
                key={ingredient.id}
                ref={el => suggestionRefs.current[index] = el}
                className={`ingredient-autocomplete__suggestion ${
                  index === highlightedIndex ? 'ingredient-autocomplete__suggestion--highlighted' : ''
                }`}
                onClick={() => handleSelect(ingredient)}
              >
                <div className="ingredient-autocomplete__suggestion-image">
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
                  <div className="ingredient-autocomplete__suggestion-placeholder">
                    🥄
                  </div>
                </div>
                <div className="ingredient-autocomplete__suggestion-content">
                  <div className="ingredient-autocomplete__suggestion-name">
                    {ingredient.name}
                  </div>
                  <div className="ingredient-autocomplete__suggestion-unit">
                    Unité: {ingredient.unit}
                  </div>
                </div>
                <div className="ingredient-autocomplete__suggestion-add">
                  +
                </div>
              </div>
            ))}
          </div>
          {suggestions.length === 6 && (
            <div className="ingredient-autocomplete__more">
              Tapez plus de caractères pour affiner la recherche
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientAutocomplete;

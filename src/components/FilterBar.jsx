// src/components/FilterBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useIngredients } from '../hooks/useIngredients';

const FilterBar = ({ onFiltersChange, activeFiltersCount = 0 }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

  const { categories } = useCategories();
  const { ingredients } = useIngredients();
  const ingredientRef = useRef(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ingredientRef.current && !ingredientRef.current.contains(event.target)) {
        setShowIngredientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mettre à jour les filtres parent
  useEffect(() => {
    onFiltersChange({
      searchText,
      category: selectedCategory,
      timeRange: selectedTime,
      ingredients: selectedIngredients,
    });
  }, [searchText, selectedCategory, selectedTime, selectedIngredients]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleIngredientClick = (ingredient) => {
    if (!selectedIngredients.find(ing => ing.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setIngredientSearch('');
  };

  const handleRemoveIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== ingredientId));
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedTime('');
    setSelectedIngredients([]);
    setIngredientSearch('');
  };

  // Filtrer les ingrédients pour l'autocomplete
  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
    !selectedIngredients.find(selected => selected.id === ing.id)
  );

  const timeRanges = [
    { value: '', label: 'Temps de préparation' },
    { value: '15', label: '15 min ou moins' },
    { value: '30', label: '30 min ou moins' },
    { value: '45', label: '45 min ou moins' },
    { value: '60', label: '1h ou moins' },
    { value: '120', label: '2h ou moins' },
  ];

  return (
    <div className="filter-bar">
      {/* Ligne principale de filtres */}
      <div className="filter-bar__main">
        {/* Recherche textuelle */}
        <div className="filter-bar__search">
          <svg className="filter-bar__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="filter-bar__input"
            placeholder="Rechercher une recette..."
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>

        {/* Catégorie */}
        <select
          className="filter-bar__select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Temps de préparation */}
        <select
          className="filter-bar__select"
          value={selectedTime}
          onChange={handleTimeChange}
        >
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {/* Sélecteur d'ingrédients */}
        <div className="filter-bar__ingredient-picker" ref={ingredientRef}>
          <input
            type="text"
            className="filter-bar__input"
            placeholder="Ajouter des ingrédients..."
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            onFocus={() => setShowIngredientDropdown(true)}
          />
          {showIngredientDropdown && filteredIngredients.length > 0 && (
            <div className="filter-bar__dropdown">
              {filteredIngredients.slice(0, 8).map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="filter-bar__dropdown-item"
                  onClick={() => handleIngredientClick(ingredient)}
                >
                  {ingredient.imageUrl && (
                    <img
                      src={ingredient.imageUrl}
                      alt={ingredient.name}
                      className="filter-bar__dropdown-img"
                    />
                  )}
                  <span>{ingredient.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton reset */}
        {activeFiltersCount > 0 && (
          <button
            className="filter-bar__reset"
            onClick={handleResetFilters}
            title="Réinitialiser les filtres"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" stroke="currentColor" strokeWidth="2"/>
              <path d="M13 7L7 13M7 7l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Badges des filtres actifs */}
      {(selectedIngredients.length > 0 || selectedCategory || selectedTime || searchText) && (
        <div className="filter-bar__badges">
          {searchText && (
            <div className="filter-badge">
              <span className="filter-badge__icon">🔍</span>
              <span className="filter-badge__text">"{searchText}"</span>
              <button
                className="filter-badge__remove"
                onClick={() => setSearchText('')}
              >
                ×
              </button>
            </div>
          )}

          {selectedCategory && (
            <div className="filter-badge">
              <span className="filter-badge__icon">📂</span>
              <span className="filter-badge__text">{selectedCategory}</span>
              <button
                className="filter-badge__remove"
                onClick={() => setSelectedCategory('')}
              >
                ×
              </button>
            </div>
          )}

          {selectedTime && (
            <div className="filter-badge">
              <span className="filter-badge__icon">⏱️</span>
              <span className="filter-badge__text">
                {timeRanges.find(r => r.value === selectedTime)?.label}
              </span>
              <button
                className="filter-badge__remove"
                onClick={() => setSelectedTime('')}
              >
                ×
              </button>
            </div>
          )}

          {selectedIngredients.map((ingredient) => (
            <div key={ingredient.id} className="filter-badge filter-badge--ingredient">
              {ingredient.imageUrl && (
                <img
                  src={ingredient.imageUrl}
                  alt={ingredient.name}
                  className="filter-badge__img"
                />
              )}
              <span className="filter-badge__text">{ingredient.name}</span>
              <button
                className="filter-badge__remove"
                onClick={() => handleRemoveIngredient(ingredient.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;

// src/components/IngredientAutocomplete.jsx
import React, { useState } from 'react';
import IngredientPreview from './IngredientPreview';

const IngredientAutocomplete = ({ ingredients, onSelectIngredient }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Filtrer les suggestions basées sur l'entrée de l'utilisateur
    const filteredSuggestions = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSelect = (ingredient) => {
    onSelectIngredient(ingredient);
    setInputValue('');
    setSuggestions([]);
  };

  return (
    <div className="autocomplete-wrapper">
      <input
        type="text"

        value={inputValue}
        onChange={handleInputChange}
        placeholder="Rechercher un ingrédient"
        className="autocomplete-input field-input"
      />
      {suggestions.length > 0 && (
        <div className="autocomplete-suggestions">
          {suggestions.map((ingredient, index) => (
            <div key={index} onClick={() => handleSelect(ingredient)}>
              <IngredientPreview ingredient={ingredient} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IngredientAutocomplete;

// src/components/IngredientAutocomplete.jsx
import React, { useState } from 'react';

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
        placeholder="Ajouter un ingrédient"
        className="autocomplete-input"
      />
      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((ingredient, index) => (
            <li key={index} onClick={() => handleSelect(ingredient)}>
              {ingredient.name} ({ingredient.unit})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IngredientAutocomplete;

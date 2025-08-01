// src/components/IngredientPreview.jsx
import React from 'react';

const IngredientPreview = ({ ingredient, onDelete }) => (
  <div className="preview-card">
    <img
      src={ingredient.imageUrl || '/placeholder.png'}
      alt={ingredient.name}
      className="preview-image"
    />
    <span className="ingredient-name">{ingredient.name}</span>
    <span className="ingredient-unit">{ingredient.unit}</span>
    <div className="preview-actions">
      <button className="bouton" onClick={e => { e.stopPropagation(); onDelete(ingredient.id); }}>
        Supprimer
      </button>
    </div>
  </div>
);

export default IngredientPreview;

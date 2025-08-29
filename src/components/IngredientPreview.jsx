// src/components/IngredientPreview.jsx
import React from 'react';

const IngredientPreview = ({ ingredient, onDelete }) => (
  <div className="preview-card">
    <img
      src={ingredient.imageUrl || '/placeholder.png'}
      alt={ingredient.name}
      className="preview-image"
    />
    <span className="preview-name">{ingredient.name}</span>
    <span className="preview-unit">{ingredient.unit}</span>
    <button className="delete-cross" onClick={e => { e.stopPropagation(); onDelete(ingredient.id); }}>
    </button>
  </div>
);

export default IngredientPreview;

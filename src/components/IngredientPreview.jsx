// src/components/IngredientPreview.jsx
import React from 'react';

const IngredientPreview = ({ ingredient, onDelete }) => (
  <div className="preview-card">
    <div className="preview-image-container">
      <img
        src={ingredient.imageUrl || '/placeholder.png'}
        alt={ingredient.name}
        className="preview-image"
      />
    </div>
    <div className="preview-content">
      <span className="preview-name">{ingredient.name}</span>
      <span className="preview-unit">{ingredient.unit}</span>
    </div>
    <button className="delete-cross" onClick={e => { e.stopPropagation(); onDelete(ingredient.id); }}>
    </button>
  </div>
);

export default IngredientPreview;

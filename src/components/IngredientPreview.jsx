// src/components/IngredientPreview.jsx
import React from 'react';

const IngredientPreview = ({ ingredient, onDelete }) => {
  const usageCount = ingredient.usageCount || 0;
  const isUnused = usageCount === 0;

  return (
    <div className="preview-card">
      <div className="preview-image-container">
        <img
          src={ingredient.imageUrl || '/placeholder.png'}
          alt={ingredient.name}
          className="preview-image"
        />
        {ingredient.usageCount !== undefined && (
          <div className={`ingredient-usage-badge ${isUnused ? 'unused' : ''}`}>
            {usageCount}
          </div>
        )}
      </div>
      <div className="preview-content">
        <span className="preview-name">{ingredient.name}</span>
        <span className="preview-unit">{ingredient.unit}</span>
      </div>
      <button className="delete-cross" onClick={e => { e.stopPropagation(); onDelete(ingredient.id); }}>
      </button>
    </div>
  );
};

export default IngredientPreview;

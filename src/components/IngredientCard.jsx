import React, { useState, useEffect } from 'react';

const IngredientCard = ({ ingredient, onQuantityChange, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(ingredient.quantity);

  // Mettre à jour tempQuantity si la quantité de l'ingrédient change
  useEffect(() => {
    setTempQuantity(ingredient.quantity);
  }, [ingredient.quantity]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleQuantitySubmit = (e) => {
    if (e) e.preventDefault();
    // Sauvegarder seulement si la valeur a changé et est valide
    if (tempQuantity !== ingredient.quantity && tempQuantity !== '' && tempQuantity >= 0) {
      onQuantityChange(tempQuantity);
    }
    setIsEditing(false);
  };

  const handleQuantityCancel = () => {
    setTempQuantity(ingredient.quantity);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit(e);
    } else if (e.key === 'Escape') {
      handleQuantityCancel();
    }
  };

  const handleBlur = () => {
    // Sauvegarder les changements au lieu de les annuler
    handleQuantitySubmit();
  };

  return (
    <div className="ingredient" onClick={!isEditing ? handleClick : undefined}>
      <div className="ingredient__remove" onClick={onRemove}>
        ×
      </div>
      
      <div className="ingredient__image">
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
        <div 
          className="ingredient__placeholder"
          style={{ display: ingredient.imageUrl ? 'none' : 'flex' }}
        >
          🥄
        </div>
      </div>
      
      <div className="ingredient__content">
        <h4 className="ingredient__name">{ingredient.name}</h4>
        
        {isEditing ? (
          <form onSubmit={handleQuantitySubmit} className="ingredient__edit-form">
            <input
              type="number"
              value={tempQuantity}
              onChange={(e) => setTempQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="ingredient__input"
              min="0"
              step="0.1"
              autoFocus
            />
            <span className="ingredient__unit">{ingredient.unit}</span>
          </form>
        ) : (
          <div className="ingredient__quantity">
            <span className="ingredient__quantity-value">
              {ingredient.quantity || '?'}
            </span>
            <span className="ingredient__unit">{ingredient.unit}</span>
          </div>
        )}
      </div>
      
      {!isEditing && (
        <div className="ingredient__hint">
          Cliquer pour modifier
        </div>
      )}
    </div>
  );
};

export default IngredientCard;
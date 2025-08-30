import React from 'react';

const IngredientPopup = ({ ingredient, onClose, onSave, onChange, onImageChange }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>{ingredient.id ? 'Modifier' : 'Ajouter'} Ingrédient</h3>
        <div className="ingredient-form">
          <input
            className="field-input"
            type="text"
            name="name"
            value={ingredient.name}
            onChange={onChange}
            placeholder="Nom"
          />
          <input
            className="field-file"
            type="file"
            onChange={onImageChange}
          />
          <select
            className="field-select"
            name="unit"
            value={ingredient.unit}
            onChange={onChange}
          >
            <option value="">Sélectionner une unité</option>
            <option value="g">Grammes</option>
            <option value="kg">Kilogrammes</option>
            <option value="ml">Millilitres</option>
            <option value="l">Litres</option>
            <option value="cl">Centilitres</option>
          </select>
        </div>
        <div className="popup-actions">
          <button className="bouton add" onClick={onSave}>
            {ingredient.id ? 'Mettre à jour' : 'Ajouter'}
          </button>
          <button className="bouton delete" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientPopup;

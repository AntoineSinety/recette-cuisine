import React, { useState, useEffect } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import IngredientPreview from './IngredientPreview';
import IngredientPopup from './IngredientPopup';

const IngredientManager = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, uploadImage } = useIngredients();
  const [newIngredient, setNewIngredient] = useState({ name: '', imageUrl: '', unit: '' });
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const imageUrl = await uploadImage(file);
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      imageUrl: imageUrl,
    }));
  };

  const handleAddIngredient = async () => {
    await addIngredient(newIngredient);
    closePopup();
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient(ingredient);
    setIsPopupOpen(true);
  };

  const handleUpdateIngredient = async () => {
    await updateIngredient(editingIngredient.id, newIngredient);
    closePopup();
  };

  const handleDeleteIngredient = async (id) => {
    await deleteIngredient(id);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setEditingIngredient(null);
    setNewIngredient({ name: '', imageUrl: '', unit: '' });
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      closePopup();
    }
  };

  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);

  return (
    <div>
      <h2>Gestion des Ingrédients</h2>
      <div className="ingredient-manager">
        <button className="bouton" onClick={openPopup}>Ajouter un Ingrédient</button>
        <div className="ingredient-list">
          {ingredients.map(ingredient => (
            <IngredientPreview
              key={ingredient.id}
              ingredient={ingredient}
              onEdit={handleEditIngredient}
              onDelete={handleDeleteIngredient}
            />
          ))}
        </div>
      </div>
      {isPopupOpen && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingIngredient ? 'Modifier' : 'Ajouter'} Ingrédient</h3>
            <div className="ingredient-form">
              <input
                className="field-input"
                type="text"
                name="name"
                value={newIngredient.name}
                onChange={handleInputChange}
                placeholder="Nom"
              />
              <input
                className="field-file"
                type="file"
                onChange={handleImageChange}
              />
              <select
                className="field-select"
                name="unit"
                value={newIngredient.unit}
                onChange={handleInputChange}
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
              <button className="bouton" onClick={editingIngredient ? handleUpdateIngredient : handleAddIngredient}>
                {editingIngredient ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button className="bouton" onClick={closePopup}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientManager;

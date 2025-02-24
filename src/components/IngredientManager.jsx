// src/components/IngredientManager.jsx
import React, { useState } from 'react';
import { useIngredients } from '../hooks/useIngredients';

const IngredientManager = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, uploadImage } = useIngredients();
  const [newIngredient, setNewIngredient] = useState({ name: '', imageUrl: '', unit: '' });
  const [editingIngredient, setEditingIngredient] = useState(null);

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
    setNewIngredient({ name: '', imageUrl: '', unit: '' });
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient(ingredient);
  };

  const handleUpdateIngredient = async () => {
    await updateIngredient(editingIngredient.id, newIngredient);
    setEditingIngredient(null);
    setNewIngredient({ name: '', imageUrl: '', unit: '' });
  };

  const handleDeleteIngredient = async (id) => {
    await deleteIngredient(id);
  };

  return (
    <div>
      <h2>Gestion des Ingrédients</h2>
      <div className="ingredient-manager">
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
        <div className="ingredient-preview">
            <div className="preview-card">
              {newIngredient.imageUrl ? (
                <img src={newIngredient.imageUrl} alt={newIngredient.name} className="preview-image" />
              )
              : (
                <svg className="preview-image"  xmlns="http://www.w3.org/2000/svg" width="800" height="800" fill="none" viewBox="0 0 120 120"><path fill="#EFF1F3" d="M0 0h120v120H0z"/><path fill="#687787" fill-rule="evenodd" d="M33.25 38.482a2.625 2.625 0 0 1 2.604-2.607h47.292a2.606 2.606 0 0 1 2.604 2.607v42.036a2.625 2.625 0 0 1-2.604 2.607H35.854a2.607 2.607 0 0 1-2.604-2.607V38.482Zm47.25 2.643h-42v36.75l24.392-24.397a2.625 2.625 0 0 1 3.712 0L80.5 67.401V41.125Zm-36.75 10.5a5.25 5.25 0 1 0 10.5 0 5.25 5.25 0 0 0-10.5 0Z" clip-rule="evenodd"/></svg>
              )}
              <span><b>{newIngredient.name}</b> ({newIngredient.unit})</span>
            </div>
        </div>
        {editingIngredient ? (
          <button className="bouton" onClick={handleUpdateIngredient}>Mettre à jour</button>
        ) : (
          <button className="bouton" onClick={handleAddIngredient}>Ajouter</button>
        )}
      </div>
      <ul>
        {ingredients.map(ingredient => (
          <li key={ingredient.id}>
            {ingredient.name} ({ingredient.unit})
            <button className="bouton" onClick={() => handleEditIngredient(ingredient)}>Modifier</button>
            <button className="bouton" onClick={() => handleDeleteIngredient(ingredient.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientManager;

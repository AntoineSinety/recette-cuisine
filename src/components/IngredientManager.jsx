// src/components/IngredientManager.jsx
import React, { useState } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import IngredientPreview from './IngredientPreview';

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
          <IngredientPreview ingredient={newIngredient} />
        </div>
        {editingIngredient ? (
          <button className="bouton" onClick={handleUpdateIngredient}>Mettre à jour</button>
        ) : (
          <button className="bouton" onClick={handleAddIngredient}>Ajouter</button>
        )}
      </div>
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
  );
};

export default IngredientManager;

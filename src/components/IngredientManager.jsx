// src/components/IngredientManager.jsx
import React, { useState } from 'react';
import { useIngredients } from '../hooks/useIngredients';

const IngredientManager = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useIngredients();
  const [newIngredient, setNewIngredient] = useState({ name: '', imageUrl: '', unit: '' });
  const [editingIngredient, setEditingIngredient] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      [name]: value,
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
    <div className="ingredient-manager">
      <h2>Gestion des Ingrédients</h2>
      <div>
        <input
          type="text"
          name="name"
          value={newIngredient.name}
          onChange={handleInputChange}
          placeholder="Nom"
        />
        <input
          type="text"
          name="imageUrl"
          value={newIngredient.imageUrl}
          onChange={handleInputChange}
          placeholder="URL de l'image"
        />
        <input
          type="text"
          name="unit"
          value={newIngredient.unit}
          onChange={handleInputChange}
          placeholder="Unité"
        />
        {editingIngredient ? (
          <button onClick={handleUpdateIngredient}>Mettre à jour</button>
        ) : (
          <button onClick={handleAddIngredient}>Ajouter</button>
        )}
      </div>
      <ul>
        {ingredients.map(ingredient => (
          <li key={ingredient.id}>
            {ingredient.name} ({ingredient.unit})
            <button onClick={() => handleEditIngredient(ingredient)}>Modifier</button>
            <button onClick={() => handleDeleteIngredient(ingredient.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientManager;

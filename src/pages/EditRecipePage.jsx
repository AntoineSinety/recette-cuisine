// src/pages/EditRecipePage.jsx
import React from 'react';
import RecipeForm from '../components/RecipeForm';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';
import { useLocation } from 'react-router-dom';

const EditRecipePage = () => {
  const location = useLocation();
  const { state } = location;
  const recipe = state ? state.recipe : null;

  const updateRecipe = useUpdateRecipe();

  const handleSubmit = (formData) => {
    updateRecipe(formData);
  };

  return (
    <div>
      <h2>Modifier la Recette</h2>
      {recipe ? (
        <RecipeForm recipe={recipe} onSubmit={handleSubmit} />
      ) : (
        <p>Recette non trouvée.</p>
      )}
    </div>
  );
};

export default EditRecipePage;

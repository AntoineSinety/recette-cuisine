import React from 'react';
import RecipeForm from '../components/RecipeForm';
import { useAddRecipe } from '../hooks/useAddRecipe';
import { useNavigate } from 'react-router-dom';

const AddRecipePage = () => {
  const addRecipe = useAddRecipe();
  const navigate = useNavigate(); // 🚀 Remplace history par useNavigate

  const handleSubmit = async (recipe) => {
    await addRecipe(recipe);
    navigate('/'); // 🚀 Redirige vers l'accueil
  };

  return (
    <div>
      <h1>Ajouter une Recette</h1>
      <RecipeForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddRecipePage;

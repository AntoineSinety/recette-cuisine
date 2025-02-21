// src/pages/EditRecipePage.jsx
import React, { useEffect, useState } from 'react';
import RecipeForm from '../components/RecipeForm';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';
import { useGetRecipe } from '../hooks/useGetRecipe';

const EditRecipePage = ({ match, history }) => {
  const { id } = match.params;
  const updateRecipe = useUpdateRecipe();
  const [recipe, setRecipe] = useState(null);

  const { getRecipe } = useGetRecipe();

  useEffect(() => {
    const fetchRecipe = async () => {
      const recipeData = await getRecipe(id);
      setRecipe(recipeData);
    };

    fetchRecipe();
  }, [id, getRecipe]);

  const handleSubmit = async (updatedRecipe) => {
    await updateRecipe(id, updatedRecipe);
    history.push('/');
  };

  if (!recipe) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Modifier la Recette</h1>
      <RecipeForm recipe={recipe} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditRecipePage;

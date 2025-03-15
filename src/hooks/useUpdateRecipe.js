// src/hooks/useUpdateRecipe.js
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useUpdateRecipe = () => {
  const updateRecipe = async (recipe) => {
    const recipeDocRef = doc(db, 'recipes', recipe.id);
    try {
      await updateDoc(recipeDocRef, recipe);
      console.log('Recipe updated successfully');
    } catch (error) {
      console.error('Error updating recipe: ', error);
    }
  };

  return updateRecipe;
};

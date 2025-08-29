// src/hooks/useUpdateRecipe.js
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useUpdateRecipe = () => {
  const updateRecipe = async (recipe) => {
    const recipeDocRef = doc(db, 'recipes', recipe.id);
    try {
      // Transformez les ingrédients pour ne stocker que leurs IDs et quantités
      const ingredientsRefs = await Promise.all(
        recipe.ingredients.map(async (ingredient) => {
          const ingredientDocRef = doc(db, "ingredients", ingredient.id);
          const ingredientDoc = await getDoc(ingredientDocRef);
          if (ingredientDoc.exists()) {
            return { id: ingredient.id, quantity: ingredient.quantity };
          } else {
            throw new Error(`Ingrédient avec l'ID ${ingredient.id} introuvable`);
          }
        })
      );

      const recipeData = {
        ...recipe,
        ingredients: ingredientsRefs,
        updatedAt: new Date()
      };

      await updateDoc(recipeDocRef, recipeData);
      console.log('Recipe updated successfully');
    } catch (error) {
      console.error('Error updating recipe: ', error);
    }
  };

  return updateRecipe;
};

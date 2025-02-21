// src/hooks/useDeleteRecipe.js
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useDeleteRecipe = () => {
  const deleteRecipe = async (id) => {
    try {
      if (typeof id !== 'string') {
        throw new TypeError('Recipe ID must be a string');
      }

      const recipeRef = doc(db, "recipes", id);
      console.log(recipeRef)
      await deleteDoc(recipeRef);
      console.log("Recipe deleted with ID: ", id);
    } catch (e) {
      console.error("Error deleting recipe: ", e);
    }
  };

  return deleteRecipe;
};

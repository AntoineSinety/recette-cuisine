// src/hooks/useUpdateRecipe.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useUpdateRecipe = () => {
  const updateRecipe = async (id, recipe) => {
    try {
      const recipeRef = doc(db, "recipes", id);
      await updateDoc(recipeRef, recipe);
      console.log("Recipe updated with ID: ", id);
    } catch (e) {
      console.error("Error updating recipe: ", e);
    }
  };

  return updateRecipe;
};

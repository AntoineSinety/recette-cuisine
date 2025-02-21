// src/hooks/useAddRecipe.js
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const useAddRecipe = () => {
  const addRecipe = async (recipe) => {
    try {
      const docRef = await addDoc(collection(db, "recipes"), recipe);
      console.log("Recipe written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding recipe: ", e);
    }
  };

  return addRecipe;
};

export default useAddRecipe;

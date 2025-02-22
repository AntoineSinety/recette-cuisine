// src/hooks/useAddRecipe.js
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useUploadImage } from "./useUploadImage";

export const useAddRecipe = () => {
  const uploadImage = useUploadImage();

  const addRecipe = async (recipe) => {
    try {
      let imageUrl = recipe.image;

      // Si l'image est un objet File, téléchargez-la et obtenez l'URL
      if (recipe.image instanceof File) {
        imageUrl = await uploadImage(recipe.image);
      }

      const recipeData = {
        ...recipe,
        image: imageUrl,
      };

      const docRef = await addDoc(collection(db, "recipes"), recipeData);
      console.log("Recipe written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding recipe: ", e);
    }
  };

  return addRecipe;
};

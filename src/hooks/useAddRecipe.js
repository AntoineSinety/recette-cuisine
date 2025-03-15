// src/hooks/useAddRecipe.js
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
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

      // Transformez les ingrédients pour ne stocker que leurs IDs
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
        image: imageUrl,
        ingredients: ingredientsRefs,
      };

      const docRef = await addDoc(collection(db, "recipes"), recipeData);
      console.log("Recipe written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding recipe: ", e);
    }
  };

  return addRecipe;
};

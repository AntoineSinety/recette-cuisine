// src/hooks/useIngredients.js
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable, getStorage, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const ingredientsCollection = collection(db, "ingredients");
        const ingredientsSnapshot = await getDocs(ingredientsCollection);
        const ingredientsData = ingredientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Récupérer les recettes pour calculer le nombre d'utilisations
        const recipesCollection = collection(db, "recipes");
        const recipesSnapshot = await getDocs(recipesCollection);
        const recipes = recipesSnapshot.docs.map(doc => doc.data());

        // Calculer le nombre d'utilisations pour chaque ingrédient
        const ingredientsWithUsage = ingredientsData.map(ingredient => {
          const usageCount = recipes.reduce((count, recipe) => {
            const ingredientList = recipe.ingredients || [];
            const isUsed = ingredientList.some(
              recipeIngredient => recipeIngredient.id === ingredient.id
            );
            return count + (isUsed ? 1 : 0);
          }, 0);

          return {
            ...ingredient,
            usageCount
          };
        });

        setIngredients(ingredientsWithUsage);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  const addIngredient = async (ingredient) => {
    try {
      const docRef = await addDoc(collection(db, "ingredients"), ingredient);
      setIngredients([...ingredients, { id: docRef.id, ...ingredient }]);
      return docRef.id;
    } catch (error) {
      console.error("Error adding ingredient:", error);
      throw error;
    }
  };

  const updateIngredient = async (id, updatedIngredient) => {
    try {
      const ingredientRef = doc(db, "ingredients", id);
      await updateDoc(ingredientRef, updatedIngredient);
      setIngredients(ingredients.map(ingredient =>
        ingredient.id === id ? { id, ...updatedIngredient } : ingredient
      ));
    } catch (error) {
      console.error("Error updating ingredient:", error);
    }
  };

  const deleteIngredient = async (id) => {
    try {
      const ingredientRef = doc(db, "ingredients", id);
      await deleteDoc(ingredientRef);
      setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    }
  };

  const uploadImage = async (fileOrBase64, folder = 'ingredients', isBase64 = false) => {
    const storage = getStorage();
    let fileRef;
    let snapshot;
    if (isBase64) {
      // Pour les images webcam (base64)
      const response = await fetch(fileOrBase64);
      const blob = await response.blob();
      const filename = `ingredient_${Date.now()}.jpg`;
      fileRef = ref(storage, `${folder}/${filename}`);
      snapshot = await uploadBytes(fileRef, blob);
    } else {
      // Pour les fichiers classiques
      const filename = `ingredient_${Date.now()}_${fileOrBase64.name}`;
      fileRef = ref(storage, `${folder}/${filename}`);
      snapshot = await uploadBytes(fileRef, fileOrBase64);
    }
    const url = await getDownloadURL(fileRef);
    return url;
  };

  return { ingredients, addIngredient, updateIngredient, deleteIngredient, uploadImage };
};

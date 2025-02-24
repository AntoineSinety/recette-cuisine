// src/hooks/useIngredients.js
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
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
        setIngredients(ingredientsData);
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
    } catch (error) {
      console.error("Error adding ingredient:", error);
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

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await uploadTask;
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  return { ingredients, addIngredient, updateIngredient, deleteIngredient, uploadImage };
};

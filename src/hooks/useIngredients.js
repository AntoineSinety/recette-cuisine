// src/hooks/useIngredients.js
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const recipesCollection = collection(db, "recipes");
        const recipesSnapshot = await getDocs(recipesCollection);
        const allIngredients = new Set();

        recipesSnapshot.docs.forEach(doc => {
          const recipeIngredients = doc.data().ingredients;
          if (recipeIngredients) {
            recipeIngredients.forEach(ingredient => allIngredients.add(ingredient));
          }
        });

        setIngredients(Array.from(allIngredients));
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  return ingredients;
};

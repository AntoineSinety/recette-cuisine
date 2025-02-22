// src/hooks/useIngredientsAndCategories.js
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useIngredientsAndCategories = () => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchIngredients = async () => {
          const ingredientsCollection = collection(db, "ingredients");
          const ingredientsSnapshot = await getDocs(ingredientsCollection);
          const ingredientsData = ingredientsSnapshot.docs.map(doc => doc.data().name);
          setIngredients(ingredientsData);
        };

        const fetchCategories = async () => {
          const categoriesCollection = collection(db, "categories");
          const categoriesSnapshot = await getDocs(categoriesCollection);
          const categoriesData = categoriesSnapshot.docs.map(doc => doc.data().name);
          setCategories(categoriesData);
        };

        await fetchIngredients();
        await fetchCategories();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const addIngredient = async (newIngredient) => {
    try {
      await addDoc(collection(db, "ingredients"), { name: newIngredient });
      setIngredients([...ingredients, newIngredient]);
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const addCategory = async (newCategory) => {
    try {
      await addDoc(collection(db, "categories"), { name: newCategory });
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return { ingredients, addIngredient, categories, addCategory };
};

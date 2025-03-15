import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "recipes"), (snapshot) => {
      const newRecipes = snapshot.docs.map((doc) => ({
        id: doc.id,
        firestoreId: doc.id, // Utilise l'ID Firestore correct
        ...doc.data(),
      }));
      setRecipes(newRecipes);
    });

    return () => unsubscribe(); // Nettoyage du listener
  }, []);

  return recipes;
};

export default useRecipes;

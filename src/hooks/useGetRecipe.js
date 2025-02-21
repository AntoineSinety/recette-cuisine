// src/hooks/useGetRecipe.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useGetRecipe = () => {
  const getRecipe = async (id) => {
    try {
      const docRef = doc(db, "recipes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (e) {
      console.error("Error getting recipe: ", e);
      return null;
    }
  };

  return getRecipe;
};

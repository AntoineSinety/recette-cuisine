import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const useRecipeStats = () => {
  const [recipeUsageCount, setRecipeUsageCount] = useState({});

  useEffect(() => {
    const fetchRecipeUsage = async () => {
      try {
        // Compter l'utilisation des recettes dans les menus
        const menusSnapshot = await getDocs(collection(db, 'weeklyMenus'));
        const usageCount = {};

        menusSnapshot.docs.forEach(doc => {
          const menuData = doc.data();

          // Parcourir tous les jours et repas
          Object.keys(menuData).forEach(key => {
            if (key === 'extras') {
              // Compter les extras
              const extras = menuData[key] || [];
              extras.forEach(extra => {
                if (extra.recipeId) {
                  usageCount[extra.recipeId] = (usageCount[extra.recipeId] || 0) + 1;
                }
              });
            } else if (typeof menuData[key] === 'object' && menuData[key] !== null) {
              // Compter midi et soir
              ['midi', 'soir'].forEach(mealType => {
                const meal = menuData[key][mealType];
                if (meal && meal.id) {
                  usageCount[meal.id] = (usageCount[meal.id] || 0) + 1;
                }
              });
            }
          });
        });

        setRecipeUsageCount(usageCount);
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques:', error);
      }
    };

    fetchRecipeUsage();
  }, []);

  return recipeUsageCount;
};

export default useRecipeStats;

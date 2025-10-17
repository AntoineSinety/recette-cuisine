import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const useMenuPlanning = () => {
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [loading, setLoading] = useState(true);

  // Générer l'ID de la semaine courante (format: YYYY-WW)
  const getCurrentWeekId = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.ceil(diff / oneWeek);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  // Charger le menu de la semaine depuis Firebase
  useEffect(() => {
    const weekId = getCurrentWeekId();
    const menuDocRef = doc(db, 'weeklyMenus', weekId);

    const unsubscribe = onSnapshot(menuDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setWeeklyMenu(docSnap.data().menu || {});
      } else {
        setWeeklyMenu({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sauvegarder le menu dans Firebase
  const saveMenu = async (menu) => {
    try {
      const weekId = getCurrentWeekId();
      const menuDocRef = doc(db, 'weeklyMenus', weekId);
      
      await setDoc(menuDocRef, {
        menu,
        weekId,
        lastUpdated: new Date(),
        startDate: getWeekStartDate()
      }, { merge: true });

      setWeeklyMenu(menu);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du menu:', error);
      throw error;
    }
  };

  // Ajouter/modifier un plat
  const updateMeal = async (dayKey, mealType, recipe) => {
    const newMenu = {
      ...weeklyMenu,
      [dayKey]: {
        ...weeklyMenu[dayKey],
        [mealType]: recipe
      }
    };
    await saveMenu(newMenu);
  };

  // Supprimer un plat
  const removeMeal = async (dayKey, mealType) => {
    const newMenu = {
      ...weeklyMenu,
      [dayKey]: {
        ...weeklyMenu[dayKey],
        [mealType]: null
      }
    };
    await saveMenu(newMenu);
  };

  // Ajouter un plat extra global
  const addExtraMeal = async (dayKey, recipe, customName) => {
    if (dayKey === 'global') {
      const extras = weeklyMenu.extras || [];
      
      const newExtra = {
        id: Date.now().toString(),
        recipe,
        customName: customName || recipe.title,
        addedAt: new Date()
      };

      const newMenu = {
        ...weeklyMenu,
        extras: [...extras, newExtra]
      };
      await saveMenu(newMenu);
    } else {
      // Pour rétrocompatibilité avec l'ancien système par jour
      const currentDay = weeklyMenu[dayKey] || {};
      const extras = currentDay.extras || [];
      
      const newExtra = {
        id: Date.now().toString(),
        recipe,
        customName: customName || recipe.title,
        addedAt: new Date()
      };

      const newMenu = {
        ...weeklyMenu,
        [dayKey]: {
          ...currentDay,
          extras: [...extras, newExtra]
        }
      };
      await saveMenu(newMenu);
    }
  };

  // Supprimer un plat extra
  const removeExtraMeal = async (dayKey, extraId) => {
    if (dayKey === 'global') {
      const extras = (weeklyMenu.extras || []).filter(extra => extra.id !== extraId);
      
      const newMenu = {
        ...weeklyMenu,
        extras
      };
      await saveMenu(newMenu);
    } else {
      // Pour rétrocompatibilité avec l'ancien système par jour
      const currentDay = weeklyMenu[dayKey] || {};
      const extras = (currentDay.extras || []).filter(extra => extra.id !== extraId);
      
      const newMenu = {
        ...weeklyMenu,
        [dayKey]: {
          ...currentDay,
          extras
        }
      };
      await saveMenu(newMenu);
    }
  };

  // Obtenir la date de début de semaine
  const getWeekStartDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lundi comme début de semaine
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday;
  };

  // Déplacer une recette d'un slot à un autre
  const moveMeal = async (sourceDayKey, sourceMealType, targetDayKey, targetMealType) => {
    try {
      // Récupérer la recette source
      const sourceRecipe = weeklyMenu[sourceDayKey]?.[sourceMealType];
      if (!sourceRecipe) return;

      // Créer une copie du menu
      const newMenu = { ...weeklyMenu };

      // Supprimer de la source
      if (newMenu[sourceDayKey]) {
        newMenu[sourceDayKey] = {
          ...newMenu[sourceDayKey],
          [sourceMealType]: null
        };
      }

      // Ajouter à la destination
      if (!newMenu[targetDayKey]) {
        newMenu[targetDayKey] = {};
      }
      newMenu[targetDayKey] = {
        ...newMenu[targetDayKey],
        [targetMealType]: sourceRecipe
      };

      await saveMenu(newMenu);
    } catch (error) {
      console.error('Erreur lors du déplacement de la recette:', error);
      throw error;
    }
  };

  return {
    weeklyMenu,
    loading,
    updateMeal,
    removeMeal,
    addExtraMeal,
    removeExtraMeal,
    moveMeal,
    saveMenu,
    getCurrentWeekId
  };
};

export default useMenuPlanning;
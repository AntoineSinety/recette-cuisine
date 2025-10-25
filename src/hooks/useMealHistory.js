import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const useMealHistory = (weekDays = []) => {
  const [historyData, setHistoryData] = useState({});
  const [loading, setLoading] = useState(true);

  // Charger l'historique des repas pour des dates spécifiques
  useEffect(() => {
    if (!weekDays || weekDays.length === 0) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const history = {};

        // Pour chaque jour de la semaine précédente, récupérer le menu
        await Promise.all(
          weekDays.map(async (day) => {
            try {
              // Calculer le weekId pour ce jour
              const date = new Date(day.dateKey);
              const start = new Date(date.getFullYear(), 0, 1);
              const diff = date - start;
              const oneWeek = 1000 * 60 * 60 * 24 * 7;
              const weekNumber = Math.ceil(diff / oneWeek);
              const weekId = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;

              // Récupérer le document de cette semaine
              const menuDocRef = collection(db, 'weeklyMenus');
              const q = query(menuDocRef, where('weekId', '==', weekId), limit(1));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const menuData = querySnapshot.docs[0].data();
                const dayMenu = menuData.menu?.[day.dateKey];

                if (dayMenu) {
                  history[day.dateKey] = {
                    midi: dayMenu.midi || null,
                    soir: dayMenu.soir || null,
                    extras: dayMenu.extras || []
                  };
                }
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération de l'historique pour ${day.dateKey}:`, error);
            }
          })
        );

        setHistoryData(history);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [weekDays]);

  // Obtenir les recettes les plus utilisées (pour suggestions)
  const getMostUsedRecipes = useMemo(() => {
    const recipeCount = {};

    Object.values(historyData).forEach(day => {
      ['midi', 'soir'].forEach(mealType => {
        const meal = day[mealType];
        if (meal && meal.id) {
          const key = meal.id;
          recipeCount[key] = recipeCount[key] || { count: 0, recipe: meal };
          recipeCount[key].count++;
        }
      });
    });

    // Trier par nombre d'utilisations
    return Object.values(recipeCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5
      .map(item => item.recipe);
  }, [historyData]);

  // Obtenir les suggestions basées sur l'historique
  const getSuggestions = useMemo(() => {
    // Récupérer les recettes des 14 derniers jours
    const recentRecipes = [];
    const seenIds = new Set();

    Object.entries(historyData)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // Plus récent en premier
      .forEach(([_, day]) => {
        ['midi', 'soir'].forEach(mealType => {
          const meal = day[mealType];
          if (meal && meal.id && !seenIds.has(meal.id)) {
            recentRecipes.push(meal);
            seenIds.add(meal.id);
          }
        });
      });

    return recentRecipes.slice(0, 8); // Top 8 suggestions
  }, [historyData]);

  // Vérifier si un repas a déjà été cuisiné récemment
  const wasRecentlyCooked = (recipeId, daysBack = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return Object.entries(historyData).some(([dateKey, day]) => {
      const date = new Date(dateKey);
      if (date < cutoffDate) return false;

      return ['midi', 'soir'].some(mealType => {
        const meal = day[mealType];
        return meal && meal.id === recipeId;
      });
    });
  };

  // Obtenir le dernier jour où une recette a été cuisinée
  const getLastCookedDate = (recipeId) => {
    let lastDate = null;

    Object.entries(historyData).forEach(([dateKey, day]) => {
      ['midi', 'soir'].forEach(mealType => {
        const meal = day[mealType];
        if (meal && meal.id === recipeId) {
          const date = new Date(dateKey);
          if (!lastDate || date > lastDate) {
            lastDate = date;
          }
        }
      });
    });

    return lastDate;
  };

  // Obtenir les stats de la semaine précédente
  const getPreviousWeekStats = useMemo(() => {
    const stats = {
      totalMeals: 0,
      plannedMeals: 0,
      customMeals: 0,
      uniqueRecipes: new Set(),
      categories: {}
    };

    Object.values(historyData).forEach(day => {
      ['midi', 'soir'].forEach(mealType => {
        stats.totalMeals++;
        const meal = day[mealType];

        if (meal) {
          stats.plannedMeals++;
          if (meal.isCustomText) {
            stats.customMeals++;
          } else if (meal.id) {
            stats.uniqueRecipes.add(meal.id);
          }

          if (meal.category) {
            stats.categories[meal.category] = (stats.categories[meal.category] || 0) + 1;
          }
        }
      });
    });

    stats.uniqueRecipes = stats.uniqueRecipes.size;
    stats.completionRate = stats.totalMeals > 0
      ? Math.round((stats.plannedMeals / stats.totalMeals) * 100)
      : 0;

    return stats;
  }, [historyData]);

  return {
    historyData,
    loading,
    getMostUsedRecipes,
    getSuggestions,
    wasRecentlyCooked,
    getLastCookedDate,
    getPreviousWeekStats
  };
};

export default useMealHistory;

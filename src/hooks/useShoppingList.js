import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useMenuPlanning from './useMenuPlanning';
import { formatQuantityWithBestUnit, canCombineUnits, convertToBaseUnit, getUnitConfig } from '../utils/unitConverter';

const useShoppingList = () => {
  const { weeklyMenu, getCurrentWeekId } = useMenuPlanning();
  const [shoppingList, setShoppingList] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);

  // Charger l'état des éléments cochés depuis Firebase
  useEffect(() => {
    const weekId = getCurrentWeekId();
    const shoppingDocRef = doc(db, 'shoppingLists', weekId);

    const unsubscribe = onSnapshot(shoppingDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCheckedItems(docSnap.data().checkedItems || {});
      } else {
        setCheckedItems({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [getCurrentWeekId]);

  // Générer la liste des courses à partir du menu de la semaine
  useEffect(() => {
    if (!weeklyMenu || Object.keys(weeklyMenu).length === 0) {
      setShoppingList({});
      return;
    }

    const fetchIngredientsData = async () => {
      const ingredientsList = {};
      const ingredientIds = new Set();

      // Date d'aujourd'hui à minuit pour comparaison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Collecter tous les IDs d'ingrédients (uniquement pour les dates futures ou aujourd'hui)
      Object.keys(weeklyMenu).forEach(dayKey => {
        if (dayKey === 'extras') return;

        // Vérifier si la date du jour est passée
        const dayDate = new Date(dayKey);
        if (dayDate < today) {
          console.log(`Ignoring past day: ${dayKey}`);
          return; // Ignorer les jours passés
        }

        const dayMenu = weeklyMenu[dayKey];
        ['midi', 'soir'].forEach(mealType => {
          const recipe = dayMenu[mealType];
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ingredientRef => {
              ingredientIds.add(ingredientRef.id);
            });
          }
        });
      });

      // Collecter les extras
      if (weeklyMenu.extras) {
        weeklyMenu.extras.forEach(extra => {
          if (extra.recipe && extra.recipe.ingredients) {
            extra.recipe.ingredients.forEach(ingredientRef => {
              ingredientIds.add(ingredientRef.id);
            });
          }
        });
      }

      // Récupérer les données des ingrédients depuis Firebase
      const ingredientsData = {};
      await Promise.all(
        Array.from(ingredientIds).map(async (ingredientId) => {
          try {
            const ingredientDocRef = doc(db, 'ingredients', ingredientId);
            const ingredientDoc = await getDoc(ingredientDocRef);
            if (ingredientDoc.exists()) {
              ingredientsData[ingredientId] = ingredientDoc.data();
            }
          } catch (error) {
            console.error('Erreur lors de la récupération de l\'ingrédient:', ingredientId, error);
          }
        })
      );

      // Construire la liste avec les vraies données (uniquement jours futurs)
      Object.keys(weeklyMenu).forEach(dayKey => {
        if (dayKey === 'extras') return;

        // Vérifier si la date du jour est passée
        const dayDate = new Date(dayKey);
        if (dayDate < today) {
          return; // Ignorer les jours passés
        }

        const dayMenu = weeklyMenu[dayKey];
        ['midi', 'soir'].forEach(mealType => {
          const recipe = dayMenu[mealType];
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ingredientRef => {
              const key = ingredientRef.id;
              const quantity = ingredientRef.quantity || 1;
              const unit = ingredientRef.unit || ingredientsData[key]?.unit || '';
              const name = ingredientsData[key]?.name || `Ingrédient ${key}`;

              if (ingredientsList[key]) {
                // Vérifier si les unités peuvent être combinées
                if (canCombineUnits(ingredientsList[key].unit, unit)) {
                  // Convertir tout en unité de base pour l'addition
                  const existingBaseQuantity = convertToBaseUnit(ingredientsList[key].totalQuantity, ingredientsList[key].unit);
                  const newBaseQuantity = convertToBaseUnit(quantity, unit);
                  const totalBaseQuantity = existingBaseQuantity + newBaseQuantity;

                  // Reconvertir vers l'unité d'origine
                  const config = getUnitConfig(ingredientsList[key].unit);
                  ingredientsList[key].totalQuantity = totalBaseQuantity / config.factor;
                } else {
                  // Unités différentes, ajouter comme quantité alternative
                  ingredientsList[key].alternateQuantities = ingredientsList[key].alternateQuantities || [];
                  ingredientsList[key].alternateQuantities.push({
                    quantity,
                    unit,
                    source: `${dayKey}-${mealType}`
                  });
                }
                // Ajouter la source
                ingredientsList[key].sources.push(`${dayKey}-${mealType}`);
              } else {
                ingredientsList[key] = {
                  id: key,
                  name,
                  totalQuantity: quantity,
                  unit,
                  imageUrl: ingredientsData[key]?.imageUrl || '',
                  category: ingredientsData[key]?.category || '',
                  sources: [`${dayKey}-${mealType}`],
                  alternateQuantities: []
                };
              }
            });
          }
        });
      });

      // Traiter les extras globaux
      if (weeklyMenu.extras) {
        weeklyMenu.extras.forEach(extra => {
          if (extra.recipe && extra.recipe.ingredients) {
            extra.recipe.ingredients.forEach(ingredientRef => {
              const key = ingredientRef.id;
              const quantity = ingredientRef.quantity || 1;
              const unit = ingredientRef.unit || ingredientsData[key]?.unit || '';
              const name = ingredientsData[key]?.name || `Ingrédient ${key}`;
              
              if (ingredientsList[key]) {
                // Vérifier si les unités peuvent être combinées
                if (canCombineUnits(ingredientsList[key].unit, unit)) {
                  // Convertir tout en unité de base pour l'addition
                  const existingBaseQuantity = convertToBaseUnit(ingredientsList[key].totalQuantity, ingredientsList[key].unit);
                  const newBaseQuantity = convertToBaseUnit(quantity, unit);
                  const totalBaseQuantity = existingBaseQuantity + newBaseQuantity;
                  
                  // Reconvertir vers l'unité d'origine
                  const config = getUnitConfig(ingredientsList[key].unit);
                  ingredientsList[key].totalQuantity = totalBaseQuantity / config.factor;
                } else {
                  // Unités différentes, ajouter comme quantité alternative
                  ingredientsList[key].alternateQuantities = ingredientsList[key].alternateQuantities || [];
                  ingredientsList[key].alternateQuantities.push({
                    quantity,
                    unit,
                    source: `extra-${extra.id}`
                  });
                }
                // Ajouter la source
                ingredientsList[key].sources.push(`extra-${extra.id}`);
              } else {
                ingredientsList[key] = {
                  id: key,
                  name,
                  totalQuantity: quantity,
                  unit,
                  imageUrl: ingredientsData[key]?.imageUrl || '',
                  category: ingredientsData[key]?.category || '',
                  sources: [`extra-${extra.id}`],
                  alternateQuantities: []
                };
              }
            });
          }
        });
      }

      setShoppingList(ingredientsList);
    };

    fetchIngredientsData();
  }, [weeklyMenu]);

  // Sauvegarder l'état des éléments cochés
  const saveCheckedItems = async (newCheckedItems) => {
    try {
      const weekId = getCurrentWeekId();
      const shoppingDocRef = doc(db, 'shoppingLists', weekId);
      
      await setDoc(shoppingDocRef, {
        checkedItems: newCheckedItems,
        weekId,
        lastUpdated: new Date()
      }, { merge: true });

      setCheckedItems(newCheckedItems);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  // Cocher/décocher un ingrédient
  const toggleIngredient = async (ingredientId) => {
    const newCheckedItems = {
      ...checkedItems,
      [ingredientId]: !checkedItems[ingredientId]
    };
    await saveCheckedItems(newCheckedItems);
  };

  // Marquer tous les ingrédients comme cochés/décochés
  const toggleAll = async (checked) => {
    const newCheckedItems = {};
    Object.keys(shoppingList).forEach(ingredientId => {
      newCheckedItems[ingredientId] = checked;
    });
    await saveCheckedItems(newCheckedItems);
  };

  // Réinitialiser la liste (tout décocher)
  const resetList = async () => {
    await saveCheckedItems({});
  };

  // Ajouter un article personnalisé
  const addCustomItem = async (itemName) => {
    try {
      const weekId = getCurrentWeekId();
      const shoppingDocRef = doc(db, 'shoppingLists', weekId);
      const docSnap = await getDoc(shoppingDocRef);

      const customItems = docSnap.exists() ? (docSnap.data().customItems || []) : [];
      const newItem = {
        id: `custom-${Date.now()}`,
        name: itemName.trim(),
        category: 'autres',
        isCustom: true,
        addedAt: new Date().toISOString()
      };

      await setDoc(shoppingDocRef, {
        customItems: [...customItems, newItem],
        weekId,
        lastUpdated: new Date()
      }, { merge: true });

      return newItem;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article personnalisé:', error);
      throw error;
    }
  };

  // Supprimer un article personnalisé
  const removeCustomItem = async (itemId) => {
    try {
      const weekId = getCurrentWeekId();
      const shoppingDocRef = doc(db, 'shoppingLists', weekId);
      const docSnap = await getDoc(shoppingDocRef);

      if (docSnap.exists()) {
        const customItems = (docSnap.data().customItems || []).filter(item => item.id !== itemId);

        await setDoc(shoppingDocRef, {
          customItems,
          weekId,
          lastUpdated: new Date()
        }, { merge: true });

        // Supprimer aussi de l'état coché si présent
        const newCheckedItems = { ...checkedItems };
        delete newCheckedItems[itemId];
        await saveCheckedItems(newCheckedItems);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article personnalisé:', error);
      throw error;
    }
  };

  // Charger les articles personnalisés
  const [customItems, setCustomItems] = useState([]);

  useEffect(() => {
    const weekId = getCurrentWeekId();
    const shoppingDocRef = doc(db, 'shoppingLists', weekId);

    const unsubscribe = onSnapshot(shoppingDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCustomItems(docSnap.data().customItems || []);
      } else {
        setCustomItems([]);
      }
    });

    return () => unsubscribe();
  }, [getCurrentWeekId]);

  // Obtenir les statistiques
  const getStats = () => {
    const total = Object.keys(shoppingList).length + customItems.length;
    const checked = Object.keys(checkedItems).filter(id => checkedItems[id]).length;
    return { total, checked, remaining: total - checked };
  };

  return {
    shoppingList: Object.values(shoppingList).sort((a, b) => a.name.localeCompare(b.name)),
    customItems,
    checkedItems,
    loading,
    toggleIngredient,
    toggleAll,
    resetList,
    addCustomItem,
    removeCustomItem,
    getStats: getStats()
  };
};

export default useShoppingList;
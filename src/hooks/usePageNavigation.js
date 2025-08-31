// Hook pour gérer la navigation avec paramètres et édition
import { useState, useEffect } from 'react';
import { 
  PAGES, 
  saveLastPage, 
  getLastPage,
  setCookie,
  getCookie
} from '../utils/navigation';

export const usePageNavigation = () => {
  const [currentPage, setCurrentPage] = useState(getLastPage());
  const [editRecipeId, setEditRecipeId] = useState(null);

  // Sauvegarder et récupérer l'ID de recette en cours d'édition
  const saveEditRecipeId = (id) => {
    if (id) {
      setCookie('recette_edit_id', id, 1); // 1 jour
      setEditRecipeId(id);
    }
  };

  const getEditRecipeId = () => {
    return getCookie('recette_edit_id');
  };

  const clearEditRecipeId = () => {
    setCookie('recette_edit_id', '', -1); // Supprimer
    setEditRecipeId(null);
  };

  // Navigation vers une page
  const navigateToPage = (page, params = {}) => {
    setCurrentPage(page);
    saveLastPage(page);

    // Gérer les paramètres spéciaux
    if (page === 'edit-recipe' && params.id) {
      saveEditRecipeId(params.id);
    } else if (page !== 'edit-recipe') {
      clearEditRecipeId();
    }
  };

  // Navigation vers l'édition d'une recette
  const navigateToEditRecipe = (recipeId) => {
    navigateToPage('edit-recipe', { id: recipeId });
  };

  // Récupération des paramètres au chargement
  useEffect(() => {
    const savedEditId = getEditRecipeId();
    if (savedEditId && currentPage === 'edit-recipe') {
      setEditRecipeId(savedEditId);
    }
  }, [currentPage]);

  return {
    currentPage,
    editRecipeId,
    navigateToPage,
    navigateToEditRecipe,
    clearEditRecipeId
  };
};
// Contexte de navigation pour remplacer React Router
import React, { createContext, useContext, useState } from 'react';
import { PAGES, saveLastPage, setCookie, getCookie } from '../utils/navigation';

const NavigationContext = createContext();

export const useNavigate = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigate must be used within a NavigationProvider');
  }
  return context.navigate;
};

export const useLocation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useLocation must be used within a NavigationProvider');
  }
  return { pathname: `/${context.currentPage}` };
};

export const useParams = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useParams must be used within a NavigationProvider');
  }
  
  // Gérer l'ID de recette pour l'édition
  const editId = getCookie('recette_edit_id');
  return editId ? { id: editId } : {};
};

export const NavigationProvider = ({ children, currentPage, onNavigate }) => {
  const navigate = (path, options = {}) => {
    // Convertir les chemins en pages
    let targetPage = PAGES.HOME;
    
    if (path === '/' || path === '/home') {
      targetPage = PAGES.HOME;
    } else if (path === '/add-recipe') {
      targetPage = PAGES.ADD_RECIPE;
    } else if (path === '/manage-ingredients') {
      targetPage = PAGES.MANAGE_INGREDIENTS;
    } else if (path === '/menu-planning') {
      targetPage = PAGES.MENU_PLANNING;
    } else if (path === '/shopping-list') {
      targetPage = PAGES.SHOPPING_LIST;
    } else if (path.startsWith('/edit/')) {
      // Extraire l'ID de la recette
      const recipeId = path.split('/edit/')[1];
      if (recipeId) {
        setCookie('recette_edit_id', recipeId, 1);
        targetPage = PAGES.EDIT_RECIPE;
      }
    }
    
    // Gérer les options
    if (options.state?.recipe?.id) {
      // Navigation vers édition avec données
      setCookie('recette_edit_id', options.state.recipe.id, 1);
      // Encoder les données en JSON puis en URI pour éviter les problèmes de caractères spéciaux
      const encodedData = encodeURIComponent(JSON.stringify(options.state.recipe));
      setCookie('recette_edit_data', encodedData, 1);
      targetPage = PAGES.EDIT_RECIPE;
    }
    
    onNavigate(targetPage);
  };

  const value = {
    navigate,
    currentPage,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Composant Link de remplacement
export const Link = ({ to, children, onClick, ...props }) => {
  const { navigate } = useContext(NavigationContext);
  
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
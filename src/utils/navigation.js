// Système de navigation par cookies pour éviter les problèmes d'URL sur GitHub Pages

// Imports statiques des composants (en haut pour éviter les problèmes de hooks React 19)
import HomePage from '../pages/HomePage';
import AddRecipePage from '../pages/AddRecipePage';
import EditRecipePage from '../pages/EditRecipePage';
import ImportRecipePage from '../pages/ImportRecipePage';
import IngredientManagerPage from '../pages/IngredientManagerPage';
import MenuPlanningPageNew from '../pages/MenuPlanningPageNew';
import ShoppingListPage from '../pages/ShoppingListPage';

export const NAVIGATION_COOKIE_NAME = 'recette_last_page';
export const NAVIGATION_COOKIE_EXPIRES = 30; // jours

// Pages disponibles
export const PAGES = {
  HOME: 'home',
  ADD_RECIPE: 'add-recipe',
  EDIT_RECIPE: 'edit-recipe',
  IMPORT_RECIPE: 'import-recipe',
  MANAGE_INGREDIENTS: 'manage-ingredients',
  MENU_PLANNING: 'menu-planning',
  SHOPPING_LIST: 'shopping-list'
};

// Composants correspondants (chargés statiquement pour éviter les problèmes de hooks React 19)
export const PAGE_COMPONENTS = {
  [PAGES.HOME]: HomePage,
  [PAGES.ADD_RECIPE]: AddRecipePage,
  [PAGES.EDIT_RECIPE]: EditRecipePage,
  [PAGES.IMPORT_RECIPE]: ImportRecipePage,
  [PAGES.MANAGE_INGREDIENTS]: IngredientManagerPage,
  [PAGES.MENU_PLANNING]: MenuPlanningPageNew,
  [PAGES.SHOPPING_LIST]: ShoppingListPage
};

// Noms d'affichage
export const PAGE_NAMES = {
  [PAGES.HOME]: 'Accueil',
  [PAGES.ADD_RECIPE]: 'Ajouter une Recette',
  [PAGES.EDIT_RECIPE]: 'Modifier une Recette',
  [PAGES.IMPORT_RECIPE]: 'Importer une Recette',
  [PAGES.MANAGE_INGREDIENTS]: 'Gérer les Ingrédients',
  [PAGES.MENU_PLANNING]: 'Menu de la semaine',
  [PAGES.SHOPPING_LIST]: 'Liste de courses'
};

// Icônes pour chaque page
export const PAGE_ICONS = {
  [PAGES.HOME]: '🏠',
  [PAGES.ADD_RECIPE]: '➕',
  [PAGES.EDIT_RECIPE]: '✏️',
  [PAGES.IMPORT_RECIPE]: '🔗',
  [PAGES.MANAGE_INGREDIENTS]: '🥄',
  [PAGES.MENU_PLANNING]: '📅',
  [PAGES.SHOPPING_LIST]: '🛒'
};

// Pages visibles dans le menu (edit-recipe est caché)
export const VISIBLE_PAGES = {
  [PAGES.HOME]: PAGES.HOME,
  [PAGES.ADD_RECIPE]: PAGES.ADD_RECIPE,
  [PAGES.IMPORT_RECIPE]: PAGES.IMPORT_RECIPE,
  [PAGES.MANAGE_INGREDIENTS]: PAGES.MANAGE_INGREDIENTS,
  [PAGES.MENU_PLANNING]: PAGES.MENU_PLANNING,
  [PAGES.SHOPPING_LIST]: PAGES.SHOPPING_LIST
};

// Utilitaires pour les cookies
export const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Fonctions de navigation
export const saveLastPage = (page) => {
  if (Object.values(PAGES).includes(page)) {
    setCookie(NAVIGATION_COOKIE_NAME, page, NAVIGATION_COOKIE_EXPIRES);
  }
};

export const getLastPage = () => {
  const lastPage = getCookie(NAVIGATION_COOKIE_NAME);
  return Object.values(PAGES).includes(lastPage) ? lastPage : PAGES.HOME;
};

export const clearLastPage = () => {
  deleteCookie(NAVIGATION_COOKIE_NAME);
};

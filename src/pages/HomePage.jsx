import React, { useState, useRef, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import FilterBar from '../components/FilterBar';
import RecipeDetail from '../components/RecipeDetail';
import useRecipes from '../hooks/useRecipes';
import useRecipeStats from '../hooks/useRecipeStats';

const HomePage = () => {
  const recipes = useRecipes();
  const recipeUsageCount = useRecipeStats();
  const [filters, setFilters] = useState({
    searchText: '',
    category: '',
    timeRange: '',
    ingredients: [],
  });
  const [sortBy, setSortBy] = useState('recent'); // recent, category, popular
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const recipeDetailRef = useRef(null);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeDetail = () => {
    setSelectedRecipe(null);
  };

  // Filtrer les recettes
  const filteredRecipes = recipes.filter((recipe) => {
    // Filtre par recherche textuelle (titre)
    const matchesSearch = filters.searchText
      ? recipe.title?.toLowerCase().includes(filters.searchText.toLowerCase())
      : true;

    // Filtre par catégorie
    const matchesCategory = filters.category
      ? recipe.category === filters.category
      : true;

    // Filtre par temps de préparation
    const matchesTime = filters.timeRange
      ? (recipe.time && recipe.time <= parseInt(filters.timeRange, 10))
      : true;

    // Filtre par ingrédients (la recette doit contenir TOUS les ingrédients sélectionnés)
    const matchesIngredients = filters.ingredients.length > 0
      ? filters.ingredients.every((filterIngredient) => {
          const recipeIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
          return recipeIngredients.some(
            (recipeIngredient) =>
              recipeIngredient.id === filterIngredient.id ||
              recipeIngredient.name?.toLowerCase() === filterIngredient.name?.toLowerCase()
          );
        })
      : true;

    return matchesSearch && matchesCategory && matchesTime && matchesIngredients;
  });

  // Trier les recettes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        // Tri par date d'ajout (du plus récent au plus ancien)
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;

      case 'category':
        // Tri par catégorie (alphabétique)
        const catA = a.category || '';
        const catB = b.category || '';
        return catA.localeCompare(catB);

      case 'popular':
        // Tri par popularité (nombre d'utilisations dans les menus)
        const usageA = recipeUsageCount[a.id] || 0;
        const usageB = recipeUsageCount[b.id] || 0;
        return usageB - usageA;

      default:
        return 0;
    }
  });

  useEffect(() => {
    if (selectedRecipe && recipeDetailRef.current) {
      recipeDetailRef.current.open();
    } else if (recipeDetailRef.current) {
      recipeDetailRef.current.close();
    }
  }, [selectedRecipe]);

  // Compter les filtres actifs
  const activeFiltersCount =
    (filters.searchText ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.timeRange ? 1 : 0) +
    filters.ingredients.length;

  return (
    <div className="home-page">
      <div className="home-page__header">
        <h1>Recettes de Cuisine</h1>
        <div className="home-page__stats">
          <span className="home-page__stat">
            {sortedRecipes.length} recette{sortedRecipes.length > 1 ? 's' : ''}
          </span>
          {activeFiltersCount > 0 && (
            <span className="home-page__stat home-page__stat--filter">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Container pour filtres et tri côte à côte */}
      <div className="filter-sort-container">
        <div className="filter-sort-container__filters">
          <FilterBar onFiltersChange={handleFiltersChange} activeFiltersCount={activeFiltersCount} />
        </div>

        {/* Barre de tri */}
        <div className="filter-sort-container__sort">
          <div className="sort-bar">
            <button
              className={`sort-bar__btn ${sortBy === 'recent' ? 'sort-bar__btn--active' : ''}`}
              onClick={() => setSortBy('recent')}
              title="Récentes"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className={`sort-bar__btn ${sortBy === 'category' ? 'sort-bar__btn--active' : ''}`}
              onClick={() => setSortBy('category')}
              title="Catégorie"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className={`sort-bar__btn ${sortBy === 'popular' ? 'sort-bar__btn--active' : ''}`}
              onClick={() => setSortBy('popular')}
              title="Populaires"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="recipes">
        {sortedRecipes.length > 0 ? (
          sortedRecipes.map((recipe) => (
            <RecipeCard key={recipe.firestoreId} recipe={recipe} onClick={handleRecipeClick} />
          ))
        ) : (
          <div className="home-page__empty">
            <div className="home-page__empty-icon">🔍</div>
            <h3>Aucune recette trouvée</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
      {selectedRecipe && <RecipeDetail ref={recipeDetailRef} recipe={selectedRecipe} onClose={closeDetail} />}
    </div>
  );
};

export default HomePage;

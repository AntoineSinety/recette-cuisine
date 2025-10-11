import React, { useState, useRef, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import FilterBar from '../components/FilterBar';
import RecipeDetail from '../components/RecipeDetail';
import useRecipes from '../hooks/useRecipes';

const HomePage = () => {
  const recipes = useRecipes();
  const [filters, setFilters] = useState({
    searchText: '',
    category: '',
    timeRange: '',
    ingredients: [],
  });
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
            {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
          </span>
          {activeFiltersCount > 0 && (
            <span className="home-page__stat home-page__stat--filter">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <FilterBar onFiltersChange={handleFiltersChange} activeFiltersCount={activeFiltersCount} />
      <div className="recipes">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
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

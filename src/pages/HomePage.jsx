import React, { useState, useRef, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import FilterBar from '../components/FilterBar';
import RecipeDetail from '../components/RecipeDetail';
import useRecipes from '../hooks/useRecipes';

const HomePage = () => {
  const recipes = useRecipes();
  const [filters, setFilters] = useState({ ingredient: '', type: '', time: '' });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const recipeDetailRef = useRef(null);

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeDetail = () => {
    setSelectedRecipe(null);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const matchesIngredient = filters.ingredient
      ? ingredientsArray.some((ingredient) =>
          ingredient.toLowerCase().includes(filters.ingredient.toLowerCase())
        )
      : true;

    const matchesType = filters.type
      ? (recipe.type?.toLowerCase().includes(filters.type.toLowerCase()) ?? false)
      : true;

    const matchesTime = filters.time
      ? (recipe.time ? recipe.time <= parseInt(filters.time, 10) : false)
      : true;

    return matchesIngredient && matchesType && matchesTime;
  });

  useEffect(() => {
    if (selectedRecipe && recipeDetailRef.current) {
      recipeDetailRef.current.open();
    } else if (recipeDetailRef.current) {
      recipeDetailRef.current.close();
    }
  }, [selectedRecipe]);

  return (
    <div>
      <h1>Recettes de Cuisine</h1>
      <FilterBar onFilterChange={handleFilterChange} />
      <div className="recipe-list">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={handleRecipeClick} />
        ))}
      </div>
      {selectedRecipe && <RecipeDetail ref={recipeDetailRef} recipe={selectedRecipe} onClose={closeDetail} />}
    </div>
  );
};

export default HomePage;

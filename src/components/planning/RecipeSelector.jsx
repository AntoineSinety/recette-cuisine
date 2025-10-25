import React, { useState, useMemo } from 'react';

const RecipeSelector = ({
  isOpen,
  onClose,
  onSelectRecipe,
  recipes = [],
  recentRecipes = [],
  isExtraMode = false
}) => {
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes', 'quick', 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [customText, setCustomText] = useState('');
  const [extraName, setExtraName] = useState('');

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    return [...new Set(recipes.map(r => r.category).filter(Boolean))];
  }, [recipes]);

  // Filtrer les recettes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = !searchQuery ||
        recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients?.some(ing =>
          ing.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
      const matchesTime = !maxTime || (recipe.time && parseInt(recipe.time) <= parseInt(maxTime));

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [recipes, searchQuery, selectedCategory, maxTime]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMaxTime('');
  };

  const handleQuickAdd = () => {
    if (!customText.trim()) return;

    const customRecipe = {
      id: `custom-${Date.now()}`,
      title: customText.trim(),
      isCustomText: true,
      image: null,
      ingredients: [],
      category: 'Personnalisé'
    };

    onSelectRecipe(customRecipe, isExtraMode ? (extraName || customText.trim()) : null);
    setCustomText('');
    setExtraName('');
  };

  const handleRecipeSelect = (recipe) => {
    onSelectRecipe(recipe, isExtraMode ? extraName : null);
    setExtraName('');
  };

  if (!isOpen) return null;

  return (
    <div className="recipe-selector__overlay" onClick={onClose}>
      <div className="recipe-selector" onClick={(e) => e.stopPropagation()}>
        <div className="recipe-selector__header">
          <h2 className="recipe-selector__title">
            {isExtraMode ? 'Ajouter un extra' : 'Choisir une recette'}
          </h2>
          <button
            className="recipe-selector__close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Onglets */}
        <div className="recipe-selector__tabs">
          <button
            className={`recipe-selector__tab ${activeTab === 'quick' ? 'recipe-selector__tab--active' : ''}`}
            onClick={() => setActiveTab('quick')}
          >
            <span className="recipe-selector__tab-icon">⚡</span>
            Création rapide
          </button>
          <button
            className={`recipe-selector__tab ${activeTab === 'recipes' ? 'recipe-selector__tab--active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <span className="recipe-selector__tab-icon">📖</span>
            Mes recettes
          </button>
          {recentRecipes.length > 0 && (
            <button
              className={`recipe-selector__tab ${activeTab === 'history' ? 'recipe-selector__tab--active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="recipe-selector__tab-icon">🕒</span>
              Historique
            </button>
          )}
        </div>

        <div className="recipe-selector__content">
          {/* Onglet Création rapide */}
          {activeTab === 'quick' && (
            <div className="recipe-selector__quick-add">
              <div className="recipe-selector__form-group">
                <label htmlFor="customRecipe">
                  ✍️ Nom du plat
                </label>
                <input
                  id="customRecipe"
                  type="text"
                  placeholder="Ex: Pizza maison, Restaurant, Raclette..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customText.trim()) {
                      handleQuickAdd();
                    }
                  }}
                  className="recipe-selector__input"
                  autoFocus
                />
              </div>

              {isExtraMode && (
                <div className="recipe-selector__form-group">
                  <label htmlFor="extraName">
                    🏷️ Nom personnalisé (optionnel)
                  </label>
                  <input
                    id="extraName"
                    type="text"
                    placeholder="Ex: Dessert, Goûter, Apéro..."
                    value={extraName}
                    onChange={(e) => setExtraName(e.target.value)}
                    className="recipe-selector__input"
                  />
                </div>
              )}

              <button
                onClick={handleQuickAdd}
                disabled={!customText.trim()}
                className="recipe-selector__submit-btn"
              >
                <span className="recipe-selector__submit-icon">✓</span>
                Ajouter
              </button>

              <div className="recipe-selector__quick-tips">
                <p className="recipe-selector__tip-title">💡 Astuce</p>
                <p className="recipe-selector__tip-text">
                  Utilisez cette option pour ajouter rapidement un repas sans créer une recette complète. Parfait pour les restaurants, plats improvisés ou repas simples.
                </p>
              </div>
            </div>
          )}

          {/* Onglet Mes recettes */}
          {activeTab === 'recipes' && (
            <>
              {/* Filtres */}
              <div className="recipe-selector__filters">
                <div className="recipe-selector__filter-group">
                  <input
                    type="text"
                    placeholder="🔍 Rechercher une recette ou un ingrédient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="recipe-selector__filter-input"
                  />
                </div>

                <div className="recipe-selector__filter-row">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="recipe-selector__filter-select"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="⏱ Temps max (min)"
                    value={maxTime}
                    onChange={(e) => setMaxTime(e.target.value)}
                    className="recipe-selector__filter-input recipe-selector__filter-input--small"
                    min="0"
                  />

                  {(searchQuery || selectedCategory || maxTime) && (
                    <button
                      onClick={resetFilters}
                      className="recipe-selector__filter-reset"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                <div className="recipe-selector__filter-results">
                  {filteredRecipes.length} recette(s) trouvée(s)
                </div>
              </div>

              {/* Liste des recettes */}
              <div className="recipe-selector__list">
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe.id || recipe.firestoreId}
                    className="recipe-selector__item"
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="recipe-selector__item-image"
                      />
                    )}
                    <div className="recipe-selector__item-info">
                      <h4 className="recipe-selector__item-title">
                        {recipe.title}
                      </h4>
                      {recipe.category && (
                        <span className="recipe-selector__item-category">
                          {recipe.category}
                        </span>
                      )}
                      {recipe.time && (
                        <span className="recipe-selector__item-time">
                          ⏱ {recipe.time} min
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {filteredRecipes.length === 0 && (
                  <div className="recipe-selector__empty">
                    <span className="recipe-selector__empty-icon">🔍</span>
                    <p className="recipe-selector__empty-text">
                      Aucune recette trouvée
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Onglet Historique */}
          {activeTab === 'history' && (
            <div className="recipe-selector__history">
              <p className="recipe-selector__history-subtitle">
                Vos recettes récentes
              </p>
              <div className="recipe-selector__list">
                {recentRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id || index}
                    className="recipe-selector__item"
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="recipe-selector__item-image"
                      />
                    )}
                    <div className="recipe-selector__item-info">
                      <h4 className="recipe-selector__item-title">
                        {recipe.title}
                      </h4>
                      {recipe.category && (
                        <span className="recipe-selector__item-category">
                          {recipe.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSelector;

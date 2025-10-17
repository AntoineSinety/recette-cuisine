import React, { useState, useEffect } from 'react';
import useRecipes from '../hooks/useRecipes';
import useMenuPlanning from '../hooks/useMenuPlanning';

const MenuPlanningPage = () => {
  const recipes = useRecipes();
  const {
    weeklyMenu,
    loading,
    updateMeal,
    removeMeal,
    addExtraMeal,
    removeExtraMeal
  } = useMenuPlanning();

  const [showRecipeSelector, setShowRecipeSelector] = useState(null);
  const [showExtraModal, setShowExtraModal] = useState(null);
  const [extraName, setExtraName] = useState('');
  const [customRecipeText, setCustomRecipeText] = useState('');

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxTime, setMaxTime] = useState('');

  // Extraire les catégories uniques
  const categories = [...new Set(recipes.map(r => r.category).filter(Boolean))];

  // Filtrer les recettes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchQuery ||
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients?.some(ing =>
        ing.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;

    const matchesTime = !maxTime || (recipe.time && parseInt(recipe.time) <= parseInt(maxTime));

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMaxTime('');
  };

  // Générer les 7 prochains jours
  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      const formattedDate = date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long' 
      });
      
      days.push({
        key: date.toISOString().split('T')[0],
        displayName: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${formattedDate}`,
        date: date
      });
    }
    return days;
  };

  const [weekDays] = useState(generateWeekDays());

  const handleRecipeSelect = async (dayKey, mealType, recipe) => {
    try {
      if (mealType === 'extra') {
        await addExtraMeal('global', recipe, extraName);
        setExtraName('');
        setShowExtraModal(null);
      } else {
        await updateMeal(dayKey, mealType, recipe);
        setShowRecipeSelector(null);
      }
      setCustomRecipeText('');
    } catch (error) {
      console.error('Erreur lors de la sélection de la recette:', error);
    }
  };

  const handleCustomRecipeSubmit = async (dayKey, mealType) => {
    if (!customRecipeText.trim()) return;

    try {
      const customRecipe = {
        id: `custom-${Date.now()}`,
        title: customRecipeText.trim(),
        isCustomText: true,
        image: null,
        ingredients: [],
        category: 'Personnalisé'
      };

      if (mealType === 'extra') {
        await addExtraMeal('global', customRecipe, extraName);
        setExtraName('');
        setShowExtraModal(null);
      } else {
        await updateMeal(dayKey, mealType, customRecipe);
        setShowRecipeSelector(null);
      }
      setCustomRecipeText('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la recette personnalisée:', error);
    }
  };

  const handleRemoveRecipe = async (dayKey, mealType) => {
    try {
      await removeMeal(dayKey, mealType);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleRemoveExtra = async (dayKey, extraId) => {
    try {
      await removeExtraMeal(dayKey, extraId);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'extra:', error);
    }
  };

  const openRecipeSelector = (dayKey, mealType) => {
    if (mealType === 'extra') {
      setShowExtraModal({ dayKey: 'global', mealType });
    } else {
      setShowRecipeSelector({ dayKey, mealType });
    }
  };

  if (loading) {
    return (
      <div className="menu-planning">
        <div className="menu-planning__header">
          <h1>Chargement du menu...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-planning">
      <div className="menu-planning__header">
        <h1>Menu de la semaine</h1>
        <p>Planifiez vos repas pour les 7 prochains jours</p>
      </div>

      <div className="menu-planning__container">
        <div className="menu-planning__main-section">
          {weekDays.map(day => (
            <div key={day.key} className="menu-planning__day-row">
              <div className="menu-planning__day-info">
                <h2 className="menu-planning__day-title">{day.displayName}</h2>
              </div>
              
              <div className="menu-planning__meals-row">
                {['midi', 'soir'].map(mealType => (
                  <div key={mealType} className="menu-planning__meal">
                    <h3 className="menu-planning__meal-title">
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </h3>
                    
                    {weeklyMenu[day.key]?.[mealType] ? (
                      <div className="menu-planning__selected-recipe">
                        <div className="menu-planning__recipe-info">
                          {weeklyMenu[day.key][mealType].image && (
                            <img 
                              src={weeklyMenu[day.key][mealType].image} 
                              alt={weeklyMenu[day.key][mealType].title}
                              className="menu-planning__recipe-image"
                            />
                          )}
                          <span className="menu-planning__recipe-title">
                            {weeklyMenu[day.key][mealType].title}
                          </span>
                        </div>
                        <button 
                          className="menu-planning__remove-btn"
                          onClick={() => handleRemoveRecipe(day.key, mealType)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="menu-planning__add-btn"
                        onClick={() => openRecipeSelector(day.key, mealType)}
                      >
                        + Ajouter un plat
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Section Extra à droite */}
        <div className="menu-planning__extras-section">
          <h2 className="menu-planning__extras-title">Extras de la semaine</h2>
          <p className="menu-planning__extras-subtitle">
            Desserts, goûters, plats à préparer à l'avance...
          </p>
          
          {/* Plats extra existants */}
          <div className="menu-planning__extras-list">
            {weeklyMenu.extras?.map((extra) => (
              <div key={extra.id} className="menu-planning__extra-item">
                <div className="menu-planning__recipe-info">
                  {extra.recipe.image && (
                    <img 
                      src={extra.recipe.image} 
                      alt={extra.recipe.title}
                      className="menu-planning__recipe-image"
                    />
                  )}
                  <div className="menu-planning__extra-details">
                    <span className="menu-planning__recipe-title">
                      {extra.customName || extra.recipe.title}
                    </span>
                    {extra.customName && (
                      <span className="menu-planning__recipe-subtitle">
                        ({extra.recipe.title})
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  className="menu-planning__remove-btn"
                  onClick={() => handleRemoveExtra('global', extra.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          {/* Bouton pour ajouter un extra */}
          <button 
            className="menu-planning__add-btn menu-planning__add-btn--extra"
            onClick={() => openRecipeSelector('global', 'extra')}
          >
            + Ajouter un extra
          </button>
        </div>
      </div>

      {/* Modal de sélection de recette standard */}
      {showRecipeSelector && (
        <div className="menu-planning__modal">
          <div className="menu-planning__modal-content">
            <div className="menu-planning__modal-header">
              <h3>Choisir une recette</h3>
              <button
                className="menu-planning__modal-close"
                onClick={() => {
                  setShowRecipeSelector(null);
                  setCustomRecipeText('');
                }}
              >
                ✕
              </button>
            </div>

            {/* Formulaire de recette personnalisée */}
            <div className="menu-planning__custom-recipe-form">
              <div className="menu-planning__form-group">
                <label htmlFor="customRecipe">
                  ✍️ Ou saisir une recette personnalisée
                </label>
                <div className="menu-planning__custom-recipe-input-group">
                  <input
                    id="customRecipe"
                    type="text"
                    placeholder="Ex: Pizza maison, Resto..."
                    value={customRecipeText}
                    onChange={(e) => setCustomRecipeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customRecipeText.trim()) {
                        handleCustomRecipeSubmit(
                          showRecipeSelector.dayKey,
                          showRecipeSelector.mealType
                        );
                      }
                    }}
                    className="menu-planning__input"
                  />
                  <button
                    onClick={() => handleCustomRecipeSubmit(
                      showRecipeSelector.dayKey,
                      showRecipeSelector.mealType
                    )}
                    disabled={!customRecipeText.trim()}
                    className="menu-planning__custom-recipe-btn"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
              <div className="menu-planning__divider">
                <span>ou choisir une recette existante</span>
              </div>
            </div>

            {/* Filtres */}
            <div className="menu-planning__filters">
              <div className="menu-planning__filter-group">
                <input
                  type="text"
                  placeholder="🔍 Rechercher une recette ou un ingrédient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="menu-planning__filter-input"
                />
              </div>

              <div className="menu-planning__filter-row">
                <div className="menu-planning__filter-group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="menu-planning__filter-select"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="menu-planning__filter-group">
                  <input
                    type="number"
                    placeholder="⏱ Temps max (min)"
                    value={maxTime}
                    onChange={(e) => setMaxTime(e.target.value)}
                    className="menu-planning__filter-input menu-planning__filter-input--small"
                    min="0"
                  />
                </div>

                {(searchQuery || selectedCategory || maxTime) && (
                  <button
                    onClick={resetFilters}
                    className="menu-planning__filter-reset"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="menu-planning__filter-results">
                {filteredRecipes.length} recette(s) trouvée(s)
              </div>
            </div>

            <div className="menu-planning__recipe-list">
              {filteredRecipes.map(recipe => (
                <div 
                  key={recipe.id || recipe.firestoreId} 
                  className="menu-planning__recipe-item"
                  onClick={() => handleRecipeSelect(
                    showRecipeSelector.dayKey, 
                    showRecipeSelector.mealType, 
                    recipe
                  )}
                >
                  {recipe.image && (
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="menu-planning__recipe-item-image"
                    />
                  )}
                  <div className="menu-planning__recipe-item-info">
                    <h4>{recipe.title}</h4>
                    {recipe.category && (
                      <span className="menu-planning__recipe-category">
                        {recipe.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter un extra avec nom personnalisé */}
      {showExtraModal && (
        <div className="menu-planning__modal">
          <div className="menu-planning__modal-content">
            <div className="menu-planning__modal-header">
              <h3>Ajouter un extra</h3>
              <button
                className="menu-planning__modal-close"
                onClick={() => {
                  setShowExtraModal(null);
                  setExtraName('');
                  setCustomRecipeText('');
                }}
              >
                ✕
              </button>
            </div>

            {/* Formulaire de recette personnalisée */}
            <div className="menu-planning__custom-recipe-form">
              <div className="menu-planning__form-group">
                <label htmlFor="customRecipeExtra">
                  ✍️ Saisir une recette personnalisée
                </label>
                <div className="menu-planning__custom-recipe-input-group">
                  <input
                    id="customRecipeExtra"
                    type="text"
                    placeholder="Ex: Gâteau au chocolat, Crème brûlée..."
                    value={customRecipeText}
                    onChange={(e) => setCustomRecipeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customRecipeText.trim()) {
                        handleCustomRecipeSubmit(
                          showExtraModal.dayKey,
                          showExtraModal.mealType
                        );
                      }
                    }}
                    className="menu-planning__input"
                  />
                  <button
                    onClick={() => handleCustomRecipeSubmit(
                      showExtraModal.dayKey,
                      showExtraModal.mealType
                    )}
                    disabled={!customRecipeText.trim()}
                    className="menu-planning__custom-recipe-btn"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="menu-planning__form-group">
                <label htmlFor="extraName">Nom personnalisé (optionnel)</label>
                <input
                  id="extraName"
                  type="text"
                  placeholder="Ex: Dessert, Goûter, etc."
                  value={extraName}
                  onChange={(e) => setExtraName(e.target.value)}
                  className="menu-planning__input"
                />
              </div>

              <div className="menu-planning__divider">
                <span>ou choisir une recette existante</span>
              </div>
            </div>

            {/* Filtres */}
            <div className="menu-planning__filters">
              <div className="menu-planning__filter-group">
                <input
                  type="text"
                  placeholder="🔍 Rechercher une recette ou un ingrédient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="menu-planning__filter-input"
                />
              </div>

              <div className="menu-planning__filter-row">
                <div className="menu-planning__filter-group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="menu-planning__filter-select"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="menu-planning__filter-group">
                  <input
                    type="number"
                    placeholder="⏱ Temps max (min)"
                    value={maxTime}
                    onChange={(e) => setMaxTime(e.target.value)}
                    className="menu-planning__filter-input menu-planning__filter-input--small"
                    min="0"
                  />
                </div>

                {(searchQuery || selectedCategory || maxTime) && (
                  <button
                    onClick={resetFilters}
                    className="menu-planning__filter-reset"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="menu-planning__filter-results">
                {filteredRecipes.length} recette(s) trouvée(s)
              </div>
            </div>

            <div className="menu-planning__recipe-list">
              {filteredRecipes.map(recipe => (
                <div 
                  key={recipe.id || recipe.firestoreId} 
                  className="menu-planning__recipe-item"
                  onClick={() => handleRecipeSelect(
                    showExtraModal.dayKey, 
                    showExtraModal.mealType, 
                    recipe
                  )}
                >
                  {recipe.image && (
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="menu-planning__recipe-item-image"
                    />
                  )}
                  <div className="menu-planning__recipe-item-info">
                    <h4>{recipe.title}</h4>
                    {recipe.category && (
                      <span className="menu-planning__recipe-category">
                        {recipe.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPlanningPage;
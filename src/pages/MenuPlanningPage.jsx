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
    } catch (error) {
      console.error('Erreur lors de la sélection de la recette:', error);
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
        <div className="menu-planning__grid">
          {weekDays.map(day => (
            <div key={day.key} className="menu-planning__day">
              <h2 className="menu-planning__day-title">{day.displayName}</h2>
              
              <div className="menu-planning__meals">
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
                onClick={() => setShowRecipeSelector(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="menu-planning__recipe-list">
              {recipes.map(recipe => (
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
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="menu-planning__extra-form">
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
            </div>
            
            <div className="menu-planning__recipe-list">
              {recipes.map(recipe => (
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
import React, { useState } from 'react';
import useRecipes from '../hooks/useRecipes';
import useMenuPlanning from '../hooks/useMenuPlanning';
import useCalendarNavigation from '../hooks/useCalendarNavigation';
import useMealHistory from '../hooks/useMealHistory';
import WeekViewVertical from '../components/planning/WeekViewVertical';
import ExtrasPanel from '../components/planning/ExtrasPanel';
import HistoryTimeline from '../components/planning/HistoryTimeline';
import RecipeSelector from '../components/planning/RecipeSelector';

const MenuPlanningPageNew = () => {
  const recipes = useRecipes();
  const {
    weeklyMenu,
    loading,
    updateMeal,
    removeMeal,
    addExtraMeal,
    removeExtraMeal,
    moveMeal,
    duplicateWeek,
    resetWeek,
    getWeekStats,
    getDayMenu,
    hasMealsPlanned
  } = useMenuPlanning();

  console.log('moveMeal function:', moveMeal); // Debug

  const {
    currentWeekLabel,
    getCurrentWeekDays,
    getPreviousWeekDays,
    goToToday,
    goToNextWeek,
    goToPreviousWeek
  } = useCalendarNavigation();

  const previousWeekDays = getPreviousWeekDays;
  const {
    historyData,
    getSuggestions,
    getPreviousWeekStats
  } = useMealHistory(previousWeekDays);

  // États locaux
  const [selectorState, setSelectorState] = useState(null); // { dayKey, mealType } ou { isExtra: true }
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Données de la semaine courante
  const weekDays = getCurrentWeekDays;
  const weekStats = getWeekStats();
  const suggestions = getSuggestions;
  const previousWeekStats = getPreviousWeekStats;

  // État pour gérer le drag & drop
  const [dragState, setDragState] = useState({
    source: null,
    target: null,
    isDragging: false
  });

  // Gestionnaires
  const handleMealAdd = (dayKey, mealType) => {
    setSelectorState({ dayKey, mealType, isExtra: false });
  };

  const handleMealRemove = async (dayKey, mealType) => {
    if (window.confirm('Supprimer ce repas ?')) {
      await removeMeal(dayKey, mealType);
    }
  };

  const handleMealMove = async (sourceDayKey, sourceMealType, targetDayKey, targetMealType) => {
    try {
      await moveMeal(sourceDayKey, sourceMealType, targetDayKey, targetMealType);
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      alert('Erreur lors du déplacement du repas');
    }
  };

  const handleRecipeSelect = async (recipe, customName) => {
    if (!selectorState) return;

    try {
      if (selectorState.isExtra) {
        await addExtraMeal('global', recipe, customName);
      } else {
        await updateMeal(selectorState.dayKey, selectorState.mealType, recipe);
      }
      setSelectorState(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout du repas');
    }
  };

  const handleAddExtra = () => {
    setSelectorState({ isExtra: true });
  };

  const handleRemoveExtra = async (extraId) => {
    if (window.confirm('Supprimer cet extra ?')) {
      await removeExtraMeal('global', extraId);
    }
  };

  const handleResetWeek = async () => {
    if (window.confirm('Réinitialiser toute la semaine ? Cette action est irréversible.')) {
      await resetWeek();
    }
  };

  const handleSelectSuggestion = (recipe) => {
    // Ouvrir le sélecteur avec la recette pré-sélectionnée (on simule juste l'ouverture)
    setSelectorState({ isExtra: false });
  };

  const handleReuseRecipe = (recipe) => {
    // Ouvrir le sélecteur pour réutiliser une recette de l'historique
    setSelectorState({ isExtra: false });
  };

  // Gestionnaire drag & drop simplifié
  const handleDrop = async (e, targetDate, targetMealType) => {
    e.preventDefault();

    // Essayer de récupérer les données du drag
    let dragData = null;

    // Essai 1 : données d'un repas existant
    const mealData = e.dataTransfer.getData('application/json');
    if (mealData) {
      try {
        dragData = JSON.parse(mealData);
        console.log('Drop meal data:', dragData);

        // Déplacer le repas d'une position à une autre
        if (dragData.meal && dragData.date && dragData.mealType) {
          const sourceDate = dragData.date;
          const sourceMealType = dragData.mealType;

          // Si c'est le même emplacement, ne rien faire
          if (sourceDate === targetDate && sourceMealType === targetMealType) {
            console.log('Même emplacement, rien à faire');
            return;
          }

          console.log(`Déplacement: ${sourceDate} ${sourceMealType} → ${targetDate} ${targetMealType}`);
          console.log('Utilisation de moveMeal...');

          // Utiliser moveMeal au lieu de updateMeal + removeMeal
          await moveMeal(sourceDate, sourceMealType, targetDate, targetMealType);
          console.log('✅ Repas déplacé avec succès !');

          return;
        }
      } catch (error) {
        console.error('Erreur lors du parsing meal data:', error);
      }
    }

    // Essai 2 : nouvelle recette depuis la liste
    const recipeData = e.dataTransfer.getData('recipe');
    if (recipeData) {
      try {
        const recipe = JSON.parse(recipeData);
        console.log('Drop recipe data:', recipe);
        await updateMeal(targetDate, targetMealType, recipe);
      } catch (error) {
        console.error('Erreur lors du parsing recipe data:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="menu-planning-new">
        <div className="menu-planning-new__loading">
          <div className="menu-planning-new__spinner"></div>
          <p>Chargement du menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-planning-new">
      {/* Header simple et épuré */}
      <header className="menu-planning-new__header">
        <div className="menu-planning-new__header-content">
          <h1 className="menu-planning-new__title">Planning des repas</h1>

          <div className="menu-planning-new__week-nav">
            <button
              className="menu-planning-new__nav-btn"
              onClick={goToPreviousWeek}
              title="Semaine précédente"
            >
              ←
            </button>

            <span className="menu-planning-new__week-label">
              {currentWeekLabel}
            </span>

            <button
              className="menu-planning-new__nav-btn"
              onClick={goToNextWeek}
              title="Semaine suivante"
            >
              →
            </button>

            <button
              className="menu-planning-new__today-btn"
              onClick={goToToday}
            >
              Aujourd'hui
            </button>
          </div>

          <button
            className="menu-planning-new__reset-btn"
            onClick={handleResetWeek}
            title="Réinitialiser la semaine"
          >
            🗑️
          </button>
        </div>

        {/* Stats compactes */}
        {weekStats && weekStats.plannedMeals < weekStats.totalMeals && (
          <div className="menu-planning-new__stats">
            <span>⚠️ {weekStats.missingMeals} repas à planifier</span>
            <div className="menu-planning-new__progress">
              <div
                className="menu-planning-new__progress-bar"
                style={{ width: `${weekStats.completionRate}%` }}
              ></div>
            </div>
          </div>
        )}
        {weekStats && weekStats.completionRate === 100 && (
          <div className="menu-planning-new__stats menu-planning-new__stats--complete">
            🎉 Tous vos repas sont planifiés !
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <div className="menu-planning-new__content">
        <div className="menu-planning-new__main">
          {/* Vue semaine verticale */}
          <WeekViewVertical
            weekDays={weekDays.map(day => ({
              date: day.date,
              dateStr: day.dateKey,
              dayName: day.dayNameLong,
              dayNumber: day.day,
              meals: {
                midi: weeklyMenu[day.dateKey]?.midi,
                soir: weeklyMenu[day.dateKey]?.soir
              }
            }))}
            onMealClick={handleMealAdd}
            onMealRemove={handleMealRemove}
            onDrop={handleDrop}
          />
        </div>

        {/* Panel latéral */}
        <aside className="menu-planning-new__sidebar">
          <ExtrasPanel
            extras={weeklyMenu.extras || []}
            suggestions={suggestions}
            weekStats={weekStats}
            onAddExtra={handleAddExtra}
            onRemoveExtra={handleRemoveExtra}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </aside>
      </div>

      {/* Modal de sélection */}
      <RecipeSelector
        isOpen={!!selectorState}
        onClose={() => setSelectorState(null)}
        onSelectRecipe={handleRecipeSelect}
        recipes={recipes}
        recentRecipes={suggestions}
        isExtraMode={selectorState?.isExtra}
      />
    </div>
  );
};

export default MenuPlanningPageNew;

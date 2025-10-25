import React, { useState } from 'react';
import DayCard from './DayCard';

const HistoryTimeline = ({
  previousWeekDays,
  historyData,
  previousWeekStats,
  onReuseRecipe
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!previousWeekDays || previousWeekDays.length === 0) {
    return null;
  }

  return (
    <div className="history-timeline">
      <button
        className="history-timeline__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="history-timeline__toggle-icon">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="history-timeline__toggle-text">
          Semaine dernière
        </span>
        {previousWeekStats && (
          <span className="history-timeline__toggle-stats">
            {previousWeekStats.plannedMeals}/{previousWeekStats.totalMeals} repas
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="history-timeline__content">
          {previousWeekStats && (
            <div className="history-timeline__stats">
              <div className="history-timeline__stat">
                <span className="history-timeline__stat-label">Complétion</span>
                <span className="history-timeline__stat-value">
                  {previousWeekStats.completionRate}%
                </span>
              </div>
              <div className="history-timeline__stat">
                <span className="history-timeline__stat-label">Recettes uniques</span>
                <span className="history-timeline__stat-value">
                  {previousWeekStats.uniqueRecipes}
                </span>
              </div>
              <div className="history-timeline__stat">
                <span className="history-timeline__stat-label">Personnalisés</span>
                <span className="history-timeline__stat-value">
                  {previousWeekStats.customMeals}
                </span>
              </div>
            </div>
          )}

          <div className="history-timeline__days">
            {previousWeekDays.map(day => {
              const meals = historyData[day.dateKey] || { midi: null, soir: null };

              return (
                <DayCard
                  key={day.dateKey}
                  day={day}
                  meals={meals}
                  onMealAdd={onReuseRecipe ? (dayKey, mealType) => {
                    const meal = meals[mealType];
                    if (meal) {
                      onReuseRecipe(meal);
                    }
                  } : null}
                  onMealRemove={() => {}} // Pas de suppression dans l'historique
                  onMealDuplicate={null} // Pas de duplication directe
                  dragState={null}
                  isCompact={true}
                />
              );
            })}
          </div>

          {Object.keys(historyData).length === 0 && (
            <div className="history-timeline__empty">
              <span className="history-timeline__empty-icon">📅</span>
              <p className="history-timeline__empty-text">
                Aucun historique disponible pour la semaine dernière
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryTimeline;

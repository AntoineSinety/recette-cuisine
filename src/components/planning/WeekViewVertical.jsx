import React from 'react';
import MealCard from './MealCard';

const WeekViewVertical = ({
  weekDays,
  onMealClick,
  onMealRemove,
  onDrop
}) => {
  const [draggedMeal, setDraggedMeal] = React.useState(null);

  const handleDragStart = (e, meal, dateStr, mealType) => {
    if (!meal) return;
    setDraggedMeal({ meal, dateStr, mealType });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ meal, date: dateStr, mealType }));
  };

  const handleDragEnd = () => {
    setDraggedMeal(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('week-view-vertical__meal-content--drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('week-view-vertical__meal-content--drag-over');
  };

  const handleDrop = (e, dateStr, mealType) => {
    e.preventDefault();
    e.currentTarget.classList.remove('week-view-vertical__meal-content--drag-over');
    onDrop(e, dateStr, mealType);
    setDraggedMeal(null);
  };

  return (
    <div className="week-view-vertical">
      {weekDays.map((day) => {
        const dayDate = new Date(day.date);
        const isToday = dayDate.toDateString() === new Date().toDateString();
        const isPast = dayDate < new Date() && !isToday;

        return (
          <div
            key={day.dateStr}
            className={`week-view-vertical__day ${isToday ? 'week-view-vertical__day--today' : ''} ${isPast ? 'week-view-vertical__day--past' : ''}`}
          >
            <div className="week-view-vertical__day-header">
              <div className="week-view-vertical__day-info">
                <span className="week-view-vertical__day-name">{day.dayName}</span>
                <span className="week-view-vertical__day-date">{day.dayNumber}</span>
                <span className="week-view-vertical__day-month">
                  {new Date(day.date).toLocaleDateString('fr-FR', { month: 'short' })}
                </span>
              </div>
            </div>

            <div className="week-view-vertical__day-meals">
              {/* MIDI */}
              <div className="week-view-vertical__day-meal">
                <div className="week-view-vertical__meal-label">
                  <span className="week-view-vertical__meal-icon">🌞</span>
                  <span className="week-view-vertical__meal-text">Midi</span>
                </div>
                <div
                  className="week-view-vertical__meal-content"
                  onDragOver={!isPast ? handleDragOver : undefined}
                  onDragLeave={!isPast ? handleDragLeave : undefined}
                  onDrop={!isPast ? (e) => handleDrop(e, day.dateStr, 'midi') : undefined}
                >
                  {day.meals?.midi ? (
                    <MealCard
                      meal={day.meals.midi}
                      onRemove={!isPast ? () => onMealRemove(day.dateStr, 'midi') : undefined}
                      compact={false}
                      isPast={isPast}
                      onDragStart={(e) => handleDragStart(e, day.meals.midi, day.dateStr, 'midi')}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedMeal?.dateStr === day.dateStr && draggedMeal?.mealType === 'midi'}
                    />
                  ) : (
                    <button
                      className="week-view-vertical__meal-empty"
                      onClick={() => onMealClick(day.dateStr, 'midi')}
                      disabled={isPast}
                    >
                      <span className="week-view-vertical__meal-empty-icon">+</span>
                      <span className="week-view-vertical__meal-empty-text">Ajouter un repas</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SOIR */}
              <div className="week-view-vertical__day-meal">
                <div className="week-view-vertical__meal-label">
                  <span className="week-view-vertical__meal-icon">🌙</span>
                  <span className="week-view-vertical__meal-text">Soir</span>
                </div>
                <div
                  className="week-view-vertical__meal-content"
                  onDragOver={!isPast ? handleDragOver : undefined}
                  onDragLeave={!isPast ? handleDragLeave : undefined}
                  onDrop={!isPast ? (e) => handleDrop(e, day.dateStr, 'soir') : undefined}
                >
                  {day.meals?.soir ? (
                    <MealCard
                      meal={day.meals.soir}
                      onRemove={!isPast ? () => onMealRemove(day.dateStr, 'soir') : undefined}
                      compact={false}
                      isPast={isPast}
                      onDragStart={(e) => handleDragStart(e, day.meals.soir, day.dateStr, 'soir')}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedMeal?.dateStr === day.dateStr && draggedMeal?.mealType === 'soir'}
                    />
                  ) : (
                    <button
                      className="week-view-vertical__meal-empty"
                      onClick={() => onMealClick(day.dateStr, 'soir')}
                      disabled={isPast}
                    >
                      <span className="week-view-vertical__meal-empty-icon">+</span>
                      <span className="week-view-vertical__meal-empty-text">Ajouter un repas</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekViewVertical;

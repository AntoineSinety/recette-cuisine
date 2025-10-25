import React from 'react';

const CalendarMonthView = ({
  monthDays,
  weeklyMenu,
  onMealAdd,
  onMealRemove,
  dragState,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  // Regrouper les jours par semaine
  const weeks = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    weeks.push(monthDays.slice(i, i + 7));
  }

  const handleDragOver = (e, dayKey, mealType) => {
    e.preventDefault();
    onDragOver && onDragOver(dayKey, mealType);
  };

  const handleDrop = (e, dayKey, mealType) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop && onDrop(dayKey, mealType);
  };

  const renderMeal = (day, mealType) => {
    const meal = weeklyMenu[day.dateKey]?.[mealType];
    const isDropTarget = dragState?.target?.dayKey === day.dateKey && dragState?.target?.mealType === mealType;
    const isDragging = dragState?.source?.dayKey === day.dateKey && dragState?.source?.mealType === mealType;

    if (!meal) {
      return (
        <div
          className={`calendar-month__meal-slot calendar-month__meal-slot--empty ${isDropTarget ? 'calendar-month__meal-slot--drop-target' : ''}`}
          onClick={() => !day.isPast && onMealAdd(day.dateKey, mealType)}
          onDragOver={(e) => handleDragOver(e, day.dateKey, mealType)}
          onDragLeave={onDragLeave}
          onDrop={(e) => handleDrop(e, day.dateKey, mealType)}
        >
          <span className="calendar-month__meal-add">+</span>
        </div>
      );
    }

    return (
      <div
        className={`calendar-month__meal-slot calendar-month__meal-slot--filled ${isDragging ? 'calendar-month__meal-slot--dragging' : ''} ${isDropTarget ? 'calendar-month__meal-slot--drop-target' : ''}`}
        draggable={!day.isPast}
        onDragStart={(e) => onDragStart && onDragStart(e, day.dateKey, mealType)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => handleDragOver(e, day.dateKey, mealType)}
        onDragLeave={onDragLeave}
        onDrop={(e) => handleDrop(e, day.dateKey, mealType)}
        title={meal.title}
      >
        {meal.image && (
          <img src={meal.image} alt={meal.title} className="calendar-month__meal-image" />
        )}
        <span className="calendar-month__meal-title">{meal.title}</span>
        {!day.isPast && (
          <button
            className="calendar-month__meal-remove"
            onClick={(e) => {
              e.stopPropagation();
              onMealRemove(day.dateKey, mealType);
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // Obtenir le nom du mois à partir du premier jour du mois actuel
  const currentMonthName = monthDays.find(day => day.isCurrentMonth)?.monthName || '';
  const currentYear = monthDays.find(day => day.isCurrentMonth)?.year || new Date().getFullYear();

  return (
    <div className="calendar-month">
      {/* Titre du mois */}
      <div className="calendar-month__month-title">
        <span className="calendar-month__month-name">
          {currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} {currentYear}
        </span>
      </div>

      {/* En-têtes des jours */}
      <div className="calendar-month__header">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="calendar-month__header-day">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du mois */}
      <div className="calendar-month__grid">
        {monthDays.map(day => {
          const hasMeals = weeklyMenu[day.dateKey]?.midi || weeklyMenu[day.dateKey]?.soir;

          return (
            <div
              key={day.dateKey}
              className={`calendar-month__day ${!day.isCurrentMonth ? 'calendar-month__day--other-month' : ''} ${day.isToday ? 'calendar-month__day--today' : ''} ${day.isPast ? 'calendar-month__day--past' : ''}`}
            >
              <div className="calendar-month__day-header">
                <span className="calendar-month__day-number">{day.day}</span>
                {hasMeals && <span className="calendar-month__day-indicator">●</span>}
              </div>

              <div className="calendar-month__meals">
                <div className="calendar-month__meal">
                  <span className="calendar-month__meal-label">☀️</span>
                  {renderMeal(day, 'midi')}
                </div>
                <div className="calendar-month__meal">
                  <span className="calendar-month__meal-label">🌙</span>
                  {renderMeal(day, 'soir')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthView;

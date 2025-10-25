import React from 'react';
import MealCard from './MealCard';

const DayCard = ({
  day,
  meals,
  onMealAdd,
  onMealRemove,
  onMealDuplicate,
  dragState,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isCompact = false
}) => {
  const { midi, soir } = meals;

  const handleDragOver = (e, mealType) => {
    e.preventDefault();
    onDragOver && onDragOver(day.dateKey, mealType);
  };

  const handleDrop = (e, mealType) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop && onDrop(day.dateKey, mealType);
  };

  return (
    <div className={`day-card ${day.isToday ? 'day-card--today' : ''} ${day.isPast ? 'day-card--past' : ''} ${isCompact ? 'day-card--compact' : ''}`}>
      <div className="day-card__header">
        <div className="day-card__date-info">
          <span className="day-card__day-name">{day.dayNameLong}</span>
          <span className="day-card__date">{day.day}</span>
          {!isCompact && (
            <span className="day-card__month">{day.monthName}</span>
          )}
        </div>

        {day.isToday && (
          <span className="day-card__today-badge">Aujourd'hui</span>
        )}
      </div>

      <div className="day-card__meals">
        <div className="day-card__meal-slot">
          <div className="day-card__meal-label">
            <span className="day-card__meal-icon">☀️</span>
            <span className="day-card__meal-name">Midi</span>
          </div>
          <MealCard
            meal={midi}
            mealType="midi"
            dayKey={day.dateKey}
            onRemove={() => onMealRemove(day.dateKey, 'midi')}
            onEdit={() => onMealAdd(day.dateKey, 'midi')}
            onDuplicate={onMealDuplicate ? () => onMealDuplicate(day.dateKey, 'midi', midi) : null}
            isDragging={dragState?.source?.dayKey === day.dateKey && dragState?.source?.mealType === 'midi'}
            isDropTarget={dragState?.target?.dayKey === day.dateKey && dragState?.target?.mealType === 'midi'}
            onDragStart={(e) => onDragStart && onDragStart(e, day.dateKey, 'midi')}
            onDragEnd={onDragEnd}
            onDragOver={(e) => handleDragOver(e, 'midi')}
            onDragLeave={onDragLeave}
            onDrop={(e) => handleDrop(e, 'midi')}
            isPast={day.isPast}
          />
        </div>

        <div className="day-card__meal-slot">
          <div className="day-card__meal-label">
            <span className="day-card__meal-icon">🌙</span>
            <span className="day-card__meal-name">Soir</span>
          </div>
          <MealCard
            meal={soir}
            mealType="soir"
            dayKey={day.dateKey}
            onRemove={() => onMealRemove(day.dateKey, 'soir')}
            onEdit={() => onMealAdd(day.dateKey, 'soir')}
            onDuplicate={onMealDuplicate ? () => onMealDuplicate(day.dateKey, 'soir', soir) : null}
            isDragging={dragState?.source?.dayKey === day.dateKey && dragState?.source?.mealType === 'soir'}
            isDropTarget={dragState?.target?.dayKey === day.dateKey && dragState?.target?.mealType === 'soir'}
            onDragStart={(e) => onDragStart && onDragStart(e, day.dateKey, 'soir')}
            onDragEnd={onDragEnd}
            onDragOver={(e) => handleDragOver(e, 'soir')}
            onDragLeave={onDragLeave}
            onDrop={(e) => handleDrop(e, 'soir')}
            isPast={day.isPast}
          />
        </div>
      </div>
    </div>
  );
};

export default DayCard;

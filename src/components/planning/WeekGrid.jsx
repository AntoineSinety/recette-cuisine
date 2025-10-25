import React, { useState } from 'react';
import DayCard from './DayCard';

const WeekGrid = ({
  weekDays,
  weeklyMenu,
  onMealAdd,
  onMealRemove,
  onMealMove,
  onMealDuplicate
}) => {
  const [dragState, setDragState] = useState({
    source: null,
    target: null,
    isDragging: false
  });

  const handleDragStart = (e, dayKey, mealType) => {
    setDragState({
      source: { dayKey, mealType },
      target: null,
      isDragging: true
    });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragEnd = () => {
    setDragState({
      source: null,
      target: null,
      isDragging: false
    });
  };

  const handleDragOver = (dayKey, mealType) => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      target: { dayKey, mealType }
    }));
  };

  const handleDragLeave = () => {
    setDragState(prev => ({
      ...prev,
      target: null
    }));
  };

  const handleDrop = (targetDayKey, targetMealType) => {
    if (!dragState.source) return;

    const { dayKey: sourceDayKey, mealType: sourceMealType } = dragState.source;

    // Ne rien faire si on drop au même endroit
    if (sourceDayKey === targetDayKey && sourceMealType === targetMealType) {
      handleDragEnd();
      return;
    }

    // Déplacer le repas
    onMealMove && onMealMove(sourceDayKey, sourceMealType, targetDayKey, targetMealType);
    handleDragEnd();
  };

  return (
    <div className="week-grid">
      {weekDays.map(day => {
        const meals = weeklyMenu[day.dateKey] || { midi: null, soir: null };

        return (
          <DayCard
            key={day.dateKey}
            day={day}
            meals={meals}
            onMealAdd={onMealAdd}
            onMealRemove={onMealRemove}
            onMealDuplicate={onMealDuplicate}
            dragState={dragState}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
};

export default WeekGrid;

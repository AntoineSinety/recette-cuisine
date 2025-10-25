import React, { useState } from 'react';

const MealCard = ({
  meal,
  mealType,
  dayKey,
  onRemove,
  onEdit,
  onDuplicate,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isPast = false
}) => {
  const [showActions, setShowActions] = useState(false);

  if (!meal) {
    // Carte vide - slot disponible
    return (
      <div
        className={`meal-card meal-card--empty ${isDropTarget ? 'meal-card--drop-target' : ''} ${isPast ? 'meal-card--past' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <button
          className="meal-card__add-btn"
          onClick={onEdit}
          disabled={isPast}
        >
          <span className="meal-card__add-icon">+</span>
          <span className="meal-card__add-text">Ajouter</span>
        </button>
      </div>
    );
  }

  // Carte avec repas
  return (
    <div
      className={`meal-card ${isDragging ? 'meal-card--dragging' : ''} ${isDropTarget ? 'meal-card--drop-target' : ''} ${isPast ? 'meal-card--past' : ''}`}
      draggable={!isPast}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {meal.image && (
        <div className="meal-card__image-wrapper">
          <img
            src={meal.image}
            alt={meal.title}
            className="meal-card__image"
            loading="lazy"
          />
          {isPast && (
            <div className="meal-card__past-overlay">
              <span className="meal-card__checkmark">✓</span>
            </div>
          )}
        </div>
      )}

      <div className="meal-card__content">
        <h4 className="meal-card__title">{meal.title}</h4>

        {meal.category && (
          <span className="meal-card__category">{meal.category}</span>
        )}

        {meal.isCustomText && (
          <span className="meal-card__badge meal-card__badge--custom">
            Personnalisé
          </span>
        )}

        {meal.time && (
          <div className="meal-card__time">
            <span className="meal-card__time-icon">⏱</span>
            <span className="meal-card__time-text">{meal.time} min</span>
          </div>
        )}
      </div>

      {!isPast && (
        <div className={`meal-card__actions ${showActions ? 'meal-card__actions--visible' : ''}`}>
          <button
            className="meal-card__action meal-card__action--drag"
            title="Glisser pour déplacer"
          >
            <span className="meal-card__drag-handle">⋮⋮</span>
          </button>

          {onDuplicate && (
            <button
              className="meal-card__action meal-card__action--duplicate"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="Dupliquer"
            >
              📋
            </button>
          )}

          <button
            className="meal-card__action meal-card__action--remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Supprimer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default MealCard;

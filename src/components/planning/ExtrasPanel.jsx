import React from 'react';

const ExtrasPanel = ({
  extras = [],
  suggestions = [],
  weekStats,
  onAddExtra,
  onRemoveExtra,
  onSelectSuggestion
}) => {
  return (
    <div className="extras-panel">
      <div className="extras-panel__section">
        <h2 className="extras-panel__title">
          <span className="extras-panel__title-icon">⭐</span>
          Extras de la semaine
        </h2>
        <p className="extras-panel__subtitle">
          Desserts, goûters, plats à préparer...
        </p>

        {extras.length > 0 ? (
          <div className="extras-panel__list">
            {extras.map(extra => (
              <div key={extra.id} className="extras-panel__item">
                <div className="extras-panel__item-content">
                  {extra.recipe.image && (
                    <img
                      src={extra.recipe.image}
                      alt={extra.recipe.title}
                      className="extras-panel__item-image"
                    />
                  )}
                  <div className="extras-panel__item-info">
                    <span className="extras-panel__item-title">
                      {extra.customName || extra.recipe.title}
                    </span>
                    {extra.customName && extra.customName !== extra.recipe.title && (
                      <span className="extras-panel__item-subtitle">
                        ({extra.recipe.title})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="extras-panel__item-remove"
                  onClick={() => onRemoveExtra(extra.id)}
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="extras-panel__empty">
            <span className="extras-panel__empty-icon">📝</span>
            <p className="extras-panel__empty-text">
              Aucun extra pour cette semaine
            </p>
          </div>
        )}

        <button
          className="extras-panel__add-btn"
          onClick={onAddExtra}
        >
          <span className="extras-panel__add-icon">+</span>
          Ajouter un extra
        </button>
      </div>

      {weekStats && weekStats.plannedMeals < weekStats.totalMeals && (
        <div className="extras-panel__section extras-panel__section--stats">
          <h3 className="extras-panel__section-title">
            ⚠️ À compléter
          </h3>
          <div className="extras-panel__stat-simple">
            <p className="extras-panel__stat-simple-text">
              Il vous reste <strong>{weekStats.missingMeals} repas</strong> à planifier cette semaine
            </p>
          </div>
        </div>
      )}

      {weekStats && weekStats.completionRate === 100 && (
        <div className="extras-panel__section extras-panel__section--stats">
          <div className="extras-panel__celebration">
            🎉 Tous vos repas sont planifiés !
          </div>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="extras-panel__section extras-panel__section--suggestions">
          <h3 className="extras-panel__section-title">
            💡 Idées repas
          </h3>
          <p className="extras-panel__section-subtitle">
            Vos recettes récemment cuisinées
          </p>
          <div className="extras-panel__suggestions">
            {suggestions.slice(0, 4).map((recipe, index) => (
              <div
                key={recipe.id || index}
                className="extras-panel__suggestion"
                onClick={() => onSelectSuggestion && onSelectSuggestion(recipe)}
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="extras-panel__suggestion-image"
                  />
                )}
                <span className="extras-panel__suggestion-title">
                  {recipe.title}
                </span>
              </div>
            ))}
          </div>
          <p className="extras-panel__suggestions-help">
            💬 Ces suggestions viennent de votre historique des 2 dernières semaines
          </p>
        </div>
      )}
    </div>
  );
};

export default ExtrasPanel;

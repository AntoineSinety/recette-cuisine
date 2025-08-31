import React from 'react';
import useShoppingList from '../hooks/useShoppingList';
import useMenuPlanning from '../hooks/useMenuPlanning';

const ShoppingListPage = () => {
  const { shoppingList, checkedItems, loading, toggleIngredient, toggleAll, resetList, getStats } = useShoppingList();
  const { weeklyMenu } = useMenuPlanning();

  // Générer les 7 prochains jours pour le récap
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
        shortName: dayName.substring(0, 3).toUpperCase(),
        date: date
      });
    }
    return days;
  };

  const weekDays = generateWeekDays();

  if (loading) {
    return (
      <div className="shopping-list">
        <div className="shopping-list__header">
          <h1>Chargement de la liste de courses...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-list">
      <div className="shopping-list__header">
        <h1>Liste de courses</h1>
        <p>Basée sur votre menu de la semaine</p>
      </div>

      <div className="shopping-list__container">
        {/* Section principale - Liste des courses */}
        <div className="shopping-list__main">
          {/* Statistiques */}
          <div className="shopping-list__stats">
            <div className="shopping-list__stat">
              <span className="shopping-list__stat-number">{getStats.total}</span>
              <span className="shopping-list__stat-label">Ingrédients</span>
            </div>
            <div className="shopping-list__stat">
              <span className="shopping-list__stat-number">{getStats.checked}</span>
              <span className="shopping-list__stat-label">Cochés</span>
            </div>
            <div className="shopping-list__stat">
              <span className="shopping-list__stat-number">{getStats.remaining}</span>
              <span className="shopping-list__stat-label">Restants</span>
            </div>
          </div>

          {/* Actions */}
          <div className="shopping-list__actions">
            <button 
              className="shopping-list__btn shopping-list__btn--secondary"
              onClick={() => toggleAll(true)}
            >
              Tout cocher
            </button>
            <button 
              className="shopping-list__btn shopping-list__btn--secondary"
              onClick={() => toggleAll(false)}
            >
              Tout décocher
            </button>
            <button 
              className="shopping-list__btn shopping-list__btn--danger"
              onClick={resetList}
            >
              Réinitialiser
            </button>
          </div>

          {/* Liste des ingrédients */}
          <div className="shopping-list__items">
            {shoppingList.length === 0 ? (
              <div className="shopping-list__empty">
                <p>Aucun ingrédient dans votre liste de courses.</p>
                <p>Ajoutez des recettes à votre menu de la semaine pour générer automatiquement votre liste.</p>
              </div>
            ) : (
              shoppingList.map(ingredient => (
                <div 
                  key={ingredient.id} 
                  className={`shopping-list__item ${checkedItems[ingredient.id] ? 'shopping-list__item--checked' : ''}`}
                >
                  <label className="shopping-list__checkbox">
                    <input 
                      type="checkbox" 
                      checked={checkedItems[ingredient.id] || false}
                      onChange={() => toggleIngredient(ingredient.id)}
                    />
                    <span className="shopping-list__checkmark"></span>
                  </label>
                  
                  {ingredient.imageUrl && (
                    <img 
                      src={ingredient.imageUrl} 
                      alt={ingredient.name}
                      className="shopping-list__item-image"
                    />
                  )}
                  
                  <div className="shopping-list__item-content">
                    <span className="shopping-list__item-name">
                      {ingredient.name}
                    </span>
                    <div className="shopping-list__item-details">
                      <span className="shopping-list__item-quantity">
                        {ingredient.totalQuantity} {ingredient.unit}
                      </span>
                      
                      {/* Quantités alternatives si différentes unités */}
                      {ingredient.alternateQuantities && ingredient.alternateQuantities.length > 0 && (
                        <div className="shopping-list__alternate-quantities">
                          {ingredient.alternateQuantities.map((alt, index) => (
                            <span key={index} className="shopping-list__alt-quantity">
                              + {alt.quantity} {alt.unit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section récapitulatif du menu */}
        <div className="shopping-list__menu-recap">
          <h2 className="shopping-list__recap-title">Menu de la semaine</h2>
          
          <div className="shopping-list__week-grid">
            {weekDays.map(day => (
              <div key={day.key} className="shopping-list__day-summary">
                <h3 className="shopping-list__day-name">{day.shortName}</h3>
                
                {/* Repas du jour */}
                <div className="shopping-list__meals-summary">
                  {['midi', 'soir'].map(mealType => {
                    const recipe = weeklyMenu[day.key]?.[mealType];
                    return (
                      <div key={mealType} className="shopping-list__meal-summary">
                        <span className="shopping-list__meal-type">
                          {mealType === 'midi' ? '☀️' : '🌙'}
                        </span>
                        <span className="shopping-list__meal-name">
                          {recipe ? recipe.title : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Extras */}
          {weeklyMenu.extras && weeklyMenu.extras.length > 0 && (
            <div className="shopping-list__extras-summary">
              <h3 className="shopping-list__extras-title">Extras de la semaine</h3>
              <div className="shopping-list__extras-list">
                {weeklyMenu.extras.map(extra => (
                  <div key={extra.id} className="shopping-list__extra-item">
                    <span className="shopping-list__extra-icon">✨</span>
                    <span className="shopping-list__extra-name">
                      {extra.customName || extra.recipe.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPage;
import React from 'react';
import useShoppingList from '../hooks/useShoppingList';
import useMenuPlanning from '../hooks/useMenuPlanning';
import { formatQuantityWithBestUnit } from '../utils/unitConverter';
import { INGREDIENT_CATEGORIES, getCategoryInfo } from '../constants/ingredientCategories';

const ShoppingListPage = () => {
  const {
    shoppingList,
    customItems,
    checkedItems,
    loading,
    toggleIngredient,
    toggleAll,
    resetList,
    addCustomItem,
    removeCustomItem,
    getStats
  } = useShoppingList();
  const { weeklyMenu } = useMenuPlanning();
  const [newItemName, setNewItemName] = React.useState('');
  const [isAddingItem, setIsAddingItem] = React.useState(false);

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

  // Gérer l'ajout d'un article personnalisé
  const handleAddCustomItem = async () => {
    if (!newItemName.trim()) return;

    setIsAddingItem(true);
    try {
      await addCustomItem(newItemName);
      setNewItemName('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error);
      alert('Erreur lors de l\'ajout de l\'article');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Gérer la suppression d'un article personnalisé
  const handleRemoveCustomItem = async (itemId) => {
    try {
      await removeCustomItem(itemId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'article');
    }
  };

  // Grouper les ingrédients par catégorie
  const groupedIngredients = shoppingList.reduce((groups, ingredient) => {
    const category = ingredient.category || '';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(ingredient);
    return groups;
  }, {});

  // Ajouter les articles personnalisés à la catégorie "Autres"
  if (customItems.length > 0) {
    if (!groupedIngredients['autres']) {
      groupedIngredients['autres'] = [];
    }
    groupedIngredients['autres'].push(...customItems);
  }

  // Trier les catégories par ordre défini
  const sortedCategories = Object.keys(groupedIngredients).sort((a, b) => {
    const catA = getCategoryInfo(a);
    const catB = getCategoryInfo(b);
    return catA.order - catB.order;
  });

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

          {/* Formulaire d'ajout d'articles personnalisés */}
          <div className="shopping-list__add-custom">
            <div className="shopping-list__add-custom-header">
              <span className="shopping-list__add-custom-icon">🛒</span>
              <h3>Ajouter un article</h3>
              <p>PQ, Savon, Éponge, Shampoing, Sacs poubelle...</p>
            </div>
            <div className="shopping-list__add-custom-form">
              <input
                type="text"
                className="shopping-list__add-custom-input"
                placeholder="Ex: Papier toilette, Savon..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAddingItem) {
                    handleAddCustomItem();
                  }
                }}
                disabled={isAddingItem}
              />
              <button
                className="shopping-list__btn shopping-list__btn--primary"
                onClick={handleAddCustomItem}
                disabled={isAddingItem || !newItemName.trim()}
              >
                {isAddingItem ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>

          {/* Liste des ingrédients groupés par catégorie */}
          <div className="shopping-list__items">
            {shoppingList.length === 0 ? (
              <div className="shopping-list__empty">
                <p>Aucun ingrédient dans votre liste de courses.</p>
                <p>Ajoutez des recettes à votre menu de la semaine pour générer automatiquement votre liste.</p>
              </div>
            ) : (
              sortedCategories.map(categoryKey => {
                const categoryInfo = getCategoryInfo(categoryKey);
                const ingredients = groupedIngredients[categoryKey];

                return (
                  <div key={categoryKey} className="shopping-list__category-group">
                    <h3 className="shopping-list__category-title">
                      <span className="shopping-list__category-icon">{categoryInfo.icon}</span>
                      {categoryInfo.label}
                      <span className="shopping-list__category-count">
                        {ingredients.length}
                      </span>
                    </h3>
                    <div className="shopping-list__category-items">
                      {ingredients.map(ingredient => (
                        <div
                          key={ingredient.id}
                          className={`shopping-list__item ${checkedItems[ingredient.id] ? 'shopping-list__item--checked' : ''} ${ingredient.isCustom ? 'shopping-list__item--custom' : ''}`}
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
                            <div className="shopping-list__item-header">
                              <span className="shopping-list__item-name">
                                {ingredient.name}
                              </span>
                              {ingredient.isCustom && (
                                <span className="shopping-list__custom-badge">Personnalisé</span>
                              )}
                              {ingredient.sources && ingredient.sources.length > 0 && (
                                <div className="shopping-list__item-days">
                                  {ingredient.sources.map((source, idx) => {
                                    // Parser la source (format: "YYYY-MM-DD-midi" ou "extra-123")
                                    if (source.startsWith('extra-')) {
                                      return (
                                        <span key={idx} className="shopping-list__day-badge shopping-list__day-badge--extra">
                                          Extra
                                        </span>
                                      );
                                    }
                                    const [dateStr, mealType] = source.split('-').slice(0, 4).join('-').split('-').reduce((acc, val, i) => {
                                      if (i < 3) acc[0] += (i > 0 ? '-' : '') + val;
                                      else acc[1] = val;
                                      return acc;
                                    }, ['', '']);

                                    const date = new Date(dateStr);
                                    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                                    const mealIcon = mealType === 'midi' ? '☀️' : '🌙';

                                    return (
                                      <span key={idx} className="shopping-list__day-badge" title={`${dayName} ${mealType}`}>
                                        {dayName.substring(0, 3)} {mealIcon}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <div className="shopping-list__item-details">
                              {ingredient.totalQuantity && (
                                <span className="shopping-list__item-quantity">
                                  {formatQuantityWithBestUnit(ingredient.totalQuantity, ingredient.unit)}
                                </span>
                              )}

                              {/* Quantités alternatives si différentes unités */}
                              {ingredient.alternateQuantities && ingredient.alternateQuantities.length > 0 && (
                                <div className="shopping-list__alternate-quantities">
                                  {ingredient.alternateQuantities.map((alt, index) => (
                                    <span key={index} className="shopping-list__alt-quantity">
                                      + {formatQuantityWithBestUnit(alt.quantity, alt.unit)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bouton de suppression pour articles personnalisés */}
                          {ingredient.isCustom && (
                            <button
                              className="shopping-list__remove-btn"
                              onClick={() => handleRemoveCustomItem(ingredient.id)}
                              title="Supprimer cet article"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
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
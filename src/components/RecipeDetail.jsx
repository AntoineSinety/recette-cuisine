import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from '../context/NavigationContext';

const RecipeDetail = forwardRef(({ recipe, onClose }, ref) => {
  const detailRef = useRef(null);
  const overlayRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);
  const [servings, setServings] = useState(recipe.servings || 4);
  const [originalServings] = useState(recipe.servings || 4);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    open() {
      document.body.classList.add('no-scroll');
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.3,
      });
      gsap.to(detailRef.current, {
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    },
    close() {
      gsap.to(detailRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          document.body.classList.remove('no-scroll');
          onClose();
        }
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.3,
      });
    }
  }));

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      ref.current.close();
    }
  };

  const handleEdit = () => {
    if (recipe.id) {
      ref.current.close();
      navigate(`/edit/${recipe.id}`, { state: { recipe } });
    }
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      const ingredientsData = await Promise.all(
        recipe.ingredients.map(async (ingredientRef) => {
          const ingredientDocRef = doc(db, 'ingredients', ingredientRef.id);
          const ingredientDoc = await getDoc(ingredientDocRef);
          if (ingredientDoc.exists()) {
            return { ...ingredientDoc.data(), ...ingredientRef };
          }
          return null;
        })
      );
      setIngredients(ingredientsData.filter(ingredient => ingredient !== null));
    };

    if (recipe.ingredients) {
      fetchIngredients();
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [recipe]);

  // Calculer les quantités ajustées
  const getAdjustedQuantity = (quantity) => {
    return (quantity * servings / originalServings).toFixed(2).replace(/\.?0+$/, '');
  };

  const handleServingsChange = (delta) => {
    const newServings = Math.max(1, servings + delta);
    setServings(newServings);
  };

  if (!recipe) return null;

  return (
    <div className="recipe-detail-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="recipe-detail" ref={detailRef} onClick={e => e.stopPropagation()}>
        <div className="recipe-detail__actions">
          <button className="edit-button" onClick={handleEdit} title="Modifier la recette">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button className="close-button" onClick={() => ref.current.close()} title="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {recipe.image && (
          <div className="recipe-detail__hero">
            <img src={recipe.image} alt={recipe.title} />
          </div>
        )}

        <div className="recipe-detail__header">
          <h2 className="recipe-detail__title">{recipe.title}</h2>
          <div className="recipe-detail__meta">
            {recipe.time && (
              <div className="recipe-detail__meta-item">
                <span className="icon">⏱</span>
                <span>{recipe.time} min</span>
              </div>
            )}
            {recipe.category && (
              <div className="recipe-detail__meta-item category">
                {recipe.category}
              </div>
            )}
          </div>
        </div>

        <div className="recipe-detail__body">
          <div className="recipe-detail__instructions">
            <h3>Instructions</h3>
            {(recipe.instructions || recipe.steps) && (
              <div className="recipe-detail__steps">
                {/* Afficher les instructions en préservant les sauts de ligne */}
                {(recipe.instructions || recipe.steps)
                  .split('\n')
                  .map((line, index) => line.trim() && <p key={index}>{line.trim()}</p>)}
              </div>
            )}
          </div>

          {ingredients.length > 0 && (
            <aside className="recipe-detail__sidebar">
              <div className="recipe-detail__sidebar-inner">
                <div className="recipe-detail__sidebar-header">
                  <h3>Ingrédients</h3>
                  <div className="recipe-detail__servings-control">
                    <button
                      className="servings-btn"
                      onClick={() => handleServingsChange(-1)}
                      disabled={servings <= 1}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <div className="servings-display">
                      <span className="servings-number">{servings}</span>
                      <span className="servings-label">portions</span>
                    </div>
                    <button
                      className="servings-btn"
                      onClick={() => handleServingsChange(1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="recipe-detail__ingredients">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="recipe-detail__ingredient">
                      {ingredient.imageUrl && (
                        <div className="recipe-detail__ingredient-image">
                          <img src={ingredient.imageUrl} alt={ingredient.name} />
                        </div>
                      )}
                      <div className="recipe-detail__ingredient-content">
                        <div className="recipe-detail__ingredient-name">{ingredient.name}</div>
                        <div className="recipe-detail__ingredient-quantity">
                          {getAdjustedQuantity(ingredient.quantity)} {ingredient.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
});

export default RecipeDetail;

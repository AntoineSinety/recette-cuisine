import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from '../context/NavigationContext';

const RecipeDetail = forwardRef(({ recipe, onClose }, ref) => {
  const detailRef = useRef(null);
  const overlayRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);
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
            {recipe.steps && (
              <div className="recipe-detail__steps" dangerouslySetInnerHTML={{ __html: recipe.steps }} />
            )}
          </div>

          {ingredients.length > 0 && (
            <aside className="recipe-detail__sidebar">
              <div className="recipe-detail__sidebar-inner">
                <h3>Ingrédients</h3>
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
                          {ingredient.quantity} {ingredient.unit}
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

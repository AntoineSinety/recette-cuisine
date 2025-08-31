import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const RecipeDetail = forwardRef(({ recipe, onClose }, ref) => {
  const detailRef = useRef(null);
  const overlayRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);

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
        <button className="close-button" onClick={() => ref.current.close()}>Fermer</button>
        <h2>{recipe.title}</h2>
        {recipe.image && <img src={recipe.image} alt={recipe.title} />}
        <div className="recipe-detail__info">
          <span className="recipe-detail__time">
            <span className="recipe-detail__time-icon">⏱</span>
            {recipe.time} min
          </span>
          {recipe.category && (
            <span className="recipe-detail__category">{recipe.category}</span>
          )}
        </div>
        {ingredients.length > 0 && (
          <div className="recipe-detail__section">
            <h3 className="recipe-detail__section-title">Ingrédients</h3>
            <div className="recipe-detail__ingredients">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="recipe-detail__ingredient-card">
                  {ingredient.imageUrl && (
                    <img 
                      src={ingredient.imageUrl} 
                      alt={ingredient.name}
                      className="recipe-detail__ingredient-image"
                    />
                  )}
                  <div className="recipe-detail__ingredient-info">
                    <span className="recipe-detail__ingredient-name">{ingredient.name}</span>
                    <span className="recipe-detail__ingredient-quantity">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {recipe.steps && (
          <div className="recipe-detail__section">
            <h3 className="recipe-detail__section-title">Instructions</h3>
            <div className="recipe-detail__steps" dangerouslySetInnerHTML={{ __html: recipe.steps }} />
          </div>
        )}
      </div>
    </div>
  );
});

export default RecipeDetail;

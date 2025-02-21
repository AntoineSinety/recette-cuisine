// src/components/RecipeDetail.jsx
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import gsap from 'gsap';

const RecipeDetail = forwardRef(({ recipe, onClose }, ref) => {
  const detailRef = useRef(null);
  const overlayRef = useRef(null);

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
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  if (!recipe) return null;

  return (
    <div className="recipe-detail-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="recipe-detail" ref={detailRef} onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={() => ref.current.close()}>Fermer</button>
        <h2>{recipe.title}</h2>
        {recipe.image && <img src={recipe.image} alt={recipe.title} />}
        <p><strong>Temps de préparation:</strong> {recipe.prepTime} min</p>
        <p><strong>Temps de cuisson:</strong> {recipe.cookTime} min</p>
        <p><strong>Difficulté:</strong> {recipe.difficulty}</p>
        {recipe.ingredients && (
          <div>
            <h3>Ingrédients:</h3>
            <ul>
              {recipe.ingredients.map((ing, index) => (
                <li key={index}>{ing}</li>
              ))}
            </ul>
          </div>
        )}
        {recipe.steps && (
          <div>
            <h3>Instructions:</h3>
            <ol>
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        {recipe.categories && <p><strong>Catégories:</strong> {recipe.categories.join(', ')}</p>}
        {recipe.allergens && <p><strong>Allergènes:</strong> {recipe.allergens.join(', ')}</p>}
      </div>
    </div>
  );
});

export default RecipeDetail;

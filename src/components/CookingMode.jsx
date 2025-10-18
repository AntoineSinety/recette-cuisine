import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const CookingMode = ({ recipe, onClose, servings = 4 }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [ingredients, setIngredients] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Convertir les anciennes recettes (instructions texte) en étapes
  const parseStepsFromInstructions = (instructions) => {
    if (!instructions) return [];

    // Si c'est déjà un tableau d'étapes structurées
    if (Array.isArray(instructions)) return instructions;

    // Sinon, convertir le texte en étapes basiques
    const lines = instructions.split('\n').filter(line => line.trim());
    return lines.map((line, index) => ({
      number: index + 1,
      title: `Étape ${index + 1}`,
      ingredients: [], // Pas d'ingrédients spécifiques par étape pour les anciennes recettes
      instructions: line.replace(/<[^>]*>/g, '').trim(), // Nettoyer le HTML
      duration: null
    }));
  };

  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : parseStepsFromInstructions(recipe.instructions || recipe.steps);

  const originalServings = recipe.servings || 4;

  // Charger tous les ingrédients de la recette
  useEffect(() => {
    const fetchIngredients = async () => {
      if (!recipe.ingredients) return;

      const ingredientsData = await Promise.all(
        recipe.ingredients.map(async (ingredientRef) => {
          const ingredientDocRef = doc(db, 'ingredients', ingredientRef.id);
          const ingredientDoc = await getDoc(ingredientDocRef);
          if (ingredientDoc.exists()) {
            return {
              id: ingredientRef.id,
              ...ingredientDoc.data(),
              quantity: ingredientRef.quantity,
              unit: ingredientRef.unit
            };
          }
          return null;
        })
      );
      setIngredients(ingredientsData.filter(ing => ing !== null));
    };

    fetchIngredients();
  }, [recipe]);

  // Calculer les quantités ajustées
  const getAdjustedQuantity = (quantity) => {
    if (!quantity) return '';
    return (quantity * servings / originalServings).toFixed(2).replace(/\.?0+$/, '');
  };

  // Obtenir les ingrédients pour l'étape actuelle
  const getCurrentStepIngredients = () => {
    const step = steps[currentStep];
    if (!step || !step.ingredients || step.ingredients.length === 0) {
      return []; // Aucun ingrédient spécifique pour cette étape
    }

    // Mapper les IDs d'ingrédients de l'étape aux données complètes
    return step.ingredients.map(stepIng => {
      const fullIngredient = ingredients.find(ing => ing.id === stepIng.id);
      if (fullIngredient) {
        return {
          ...fullIngredient,
          quantity: stepIng.quantity,
          unit: stepIng.unit
        };
      }
      return null;
    }).filter(ing => ing !== null);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleStepComplete = () => {
    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(currentStep)) {
      newCompleted.delete(currentStep);
    } else {
      newCompleted.add(currentStep);
    }
    setCompletedSteps(newCompleted);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="cooking-mode">
        <div className="cooking-mode__empty">
          <p>Aucune étape disponible pour cette recette</p>
          <button onClick={onClose} className="cooking-mode__close-btn">Fermer</button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const stepIngredients = getCurrentStepIngredients();
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`cooking-mode ${isFullscreen ? 'cooking-mode--fullscreen' : ''}`}>
      {/* Header */}
      <div className="cooking-mode__header">
        <div className="cooking-mode__title">
          <h2>{recipe.title}</h2>
          <span className="cooking-mode__servings">{servings} portions</span>
        </div>
        <div className="cooking-mode__actions">
          <button
            onClick={toggleFullscreen}
            className="cooking-mode__fullscreen-btn"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? '⬜' : '⛶'}
          </button>
          <button onClick={onClose} className="cooking-mode__close-btn" title="Fermer">✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="cooking-mode__progress-bar">
        <div
          className="cooking-mode__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="cooking-mode__step-indicator">
        <span className="cooking-mode__step-number">
          Étape {currentStep + 1} / {steps.length}
        </span>
        {currentStepData.duration && (
          <span className="cooking-mode__step-duration">
            ⏱ {currentStepData.duration}
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="cooking-mode__content">
        {/* Step title */}
        <h3 className="cooking-mode__step-title">{currentStepData.title}</h3>

        {/* Step ingredients (if any) */}
        {stepIngredients.length > 0 && (
          <div className="cooking-mode__ingredients">
            <h4>Ingrédients nécessaires :</h4>
            <ul className="cooking-mode__ingredients-list">
              {stepIngredients.map((ing, index) => (
                <li key={index} className="cooking-mode__ingredient">
                  <span className="cooking-mode__ingredient-quantity">
                    {getAdjustedQuantity(ing.quantity)} {ing.unit}
                  </span>
                  <span className="cooking-mode__ingredient-name">{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step instructions */}
        <div className="cooking-mode__instructions">
          <p>{currentStepData.instructions}</p>
        </div>

        {/* Step image (if any) */}
        {currentStepData.image && (
          <div className="cooking-mode__step-image">
            <img src={currentStepData.image} alt={currentStepData.title} />
          </div>
        )}

        {/* Step completion checkbox */}
        <div className="cooking-mode__completion">
          <label className="cooking-mode__checkbox">
            <input
              type="checkbox"
              checked={completedSteps.has(currentStep)}
              onChange={toggleStepComplete}
            />
            <span>Étape terminée</span>
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="cooking-mode__navigation">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="cooking-mode__nav-btn cooking-mode__nav-btn--prev"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Précédent</span>
        </button>

        <div className="cooking-mode__nav-dots">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`cooking-mode__dot ${index === currentStep ? 'cooking-mode__dot--active' : ''} ${completedSteps.has(index) ? 'cooking-mode__dot--completed' : ''}`}
              title={`Étape ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="cooking-mode__nav-btn cooking-mode__nav-btn--next"
        >
          <span>Suivant</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Completion message */}
      {currentStep === steps.length - 1 && completedSteps.has(currentStep) && (
        <div className="cooking-mode__congrats">
          🎉 Félicitations ! Recette terminée !
        </div>
      )}
    </div>
  );
};

export default CookingMode;

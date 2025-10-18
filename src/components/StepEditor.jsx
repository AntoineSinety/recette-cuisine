import React, { useState } from 'react';

const StepEditor = ({ steps = [], onChange, recipeIngredients = [] }) => {
  const [expandedStep, setExpandedStep] = useState(0);

  const addStep = () => {
    const newStep = {
      number: steps.length + 1,
      title: `Étape ${steps.length + 1}`,
      ingredients: [],
      instructions: '',
      duration: ''
    };
    onChange([...steps, newStep]);
    setExpandedStep(steps.length);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, number: i + 1 }));
    onChange(newSteps);
    if (expandedStep >= newSteps.length) {
      setExpandedStep(Math.max(0, newSteps.length - 1));
    }
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onChange(newSteps);
  };

  const moveStep = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];

    // Renumber steps
    newSteps.forEach((step, i) => {
      step.number = i + 1;
    });

    onChange(newSteps);
    setExpandedStep(targetIndex);
  };

  const toggleIngredient = (stepIndex, ingredientRef) => {
    const step = steps[stepIndex];
    const ingredientIndex = step.ingredients.findIndex(ing => ing.id === ingredientRef.id);

    let newIngredients;
    if (ingredientIndex > -1) {
      // Remove ingredient
      newIngredients = step.ingredients.filter((_, i) => i !== ingredientIndex);
    } else {
      // Add ingredient
      newIngredients = [...step.ingredients, ingredientRef];
    }

    updateStep(stepIndex, 'ingredients', newIngredients);
  };

  const isIngredientSelected = (stepIndex, ingredientId) => {
    return steps[stepIndex]?.ingredients.some(ing => ing.id === ingredientId);
  };

  if (steps.length === 0) {
    return (
      <div className="step-editor">
        <div className="step-editor__empty">
          <p>Aucune étape ajoutée</p>
          <button onClick={addStep} className="step-editor__add-btn">
            ➕ Ajouter la première étape
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="step-editor">
      <div className="step-editor__list">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-editor__item ${expandedStep === index ? 'step-editor__item--expanded' : ''}`}
          >
            {/* Step Header */}
            <div
              className="step-editor__header"
              onClick={() => setExpandedStep(expandedStep === index ? -1 : index)}
            >
              <div className="step-editor__header-left">
                <span className="step-editor__number">{step.number}</span>
                <span className="step-editor__title-preview">{step.title || `Étape ${step.number}`}</span>
              </div>
              <div className="step-editor__header-right">
                {step.ingredients.length > 0 && (
                  <span className="step-editor__ingredient-count">
                    🥘 {step.ingredients.length}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveStep(index, 'up');
                  }}
                  disabled={index === 0}
                  className="step-editor__move-btn"
                  title="Monter"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveStep(index, 'down');
                  }}
                  disabled={index === steps.length - 1}
                  className="step-editor__move-btn"
                  title="Descendre"
                >
                  ▼
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStep(index);
                  }}
                  className="step-editor__remove-btn"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Step Content (expanded) */}
            {expandedStep === index && (
              <div className="step-editor__content">
                {/* Title */}
                <div className="step-editor__field">
                  <label>Titre de l'étape</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    placeholder={`Étape ${step.number}`}
                    className="step-editor__input"
                  />
                </div>

                {/* Duration */}
                <div className="step-editor__field">
                  <label>Durée (optionnel)</label>
                  <input
                    type="text"
                    value={step.duration}
                    onChange={(e) => updateStep(index, 'duration', e.target.value)}
                    placeholder="ex: 10 min, 2h, etc."
                    className="step-editor__input step-editor__input--small"
                  />
                </div>

                {/* Instructions */}
                <div className="step-editor__field">
                  <label>Instructions</label>
                  <textarea
                    value={step.instructions}
                    onChange={(e) => updateStep(index, 'instructions', e.target.value)}
                    placeholder="Décrivez les actions à réaliser pour cette étape..."
                    className="step-editor__textarea"
                    rows="5"
                  />
                </div>

                {/* Ingredients Selection */}
                {recipeIngredients.length > 0 && (
                  <div className="step-editor__field">
                    <label>Ingrédients nécessaires pour cette étape</label>
                    <div className="step-editor__ingredients">
                      {recipeIngredients.map((ingredientRef, i) => {
                        const isSelected = isIngredientSelected(index, ingredientRef.id);
                        return (
                          <label
                            key={i}
                            className={`step-editor__ingredient-checkbox ${isSelected ? 'step-editor__ingredient-checkbox--selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleIngredient(index, ingredientRef)}
                            />
                            <span className="step-editor__ingredient-name">
                              {ingredientRef.name || `Ingrédient ${i + 1}`}
                            </span>
                            <span className="step-editor__ingredient-quantity">
                              {ingredientRef.quantity} {ingredientRef.unit}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {recipeIngredients.length === 0 && (
                      <p className="step-editor__hint">
                        Ajoutez des ingrédients à votre recette pour pouvoir les associer aux étapes
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Step Button */}
      <button onClick={addStep} className="step-editor__add-btn step-editor__add-btn--bottom">
        ➕ Ajouter une étape
      </button>
    </div>
  );
};

export default StepEditor;

// src/components/RecipeForm.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useIngredients } from '../hooks/useIngredients';

const RecipeForm = ({ recipe = {}, onSubmit }) => {
  const initialFormState = {
    title: '',
    ingredients: [],
    steps: '',
    time: '',
    image: null,
  };

  const [formData, setFormData] = useState({ ...initialFormState, ...recipe });
  const { ingredients } = useIngredients();

  useEffect(() => {
    if (recipe && Object.keys(recipe).length > 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...recipe,
      }));
    }
  }, [recipe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleIngredientsChange = (selectedOptions) => {
    const newIngredients = selectedOptions.map(option => ({
      ingredient: option.value,
      quantity: '',
      unit: option.unit,
    }));
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: newIngredients,
    }));
  };

  const handleQuantityChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index].quantity = value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: newIngredients,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-form">
      <div className="form-group">
        <label>Titre</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Ingrédients</label>
        <Select
          isMulti
          name="ingredients"
          options={ingredients.map(ingredient => ({ value: ingredient.name, label: ingredient.name, unit: ingredient.unit }))}
          onChange={handleIngredientsChange}
          className="ingredients-select"
        />
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-item">
            <span>{ingredient.ingredient} ({ingredient.unit})</span>
            <input
              type="number"
              value={ingredient.quantity}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              placeholder="Quantité"
            />
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Étapes (séparées par des sauts de ligne)</label>
        <textarea name="steps" value={formData.steps} onChange={handleChange} required></textarea>
      </div>

      <div className="form-group">
        <label>Temps (en minutes)</label>
        <input type="number" name="time" value={formData.time} onChange={handleChange} required />
      </div>

      <button type="submit" className="submit-btn">Soumettre</button>
    </form>
  );
};

export default RecipeForm;

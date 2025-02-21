// src/components/RecipeForm.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useIngredients } from '../hooks/useIngredients';

const RecipeForm = ({ recipe = {}, onSubmit }) => {
  const initialFormState = {
    title: '',
    description: '',
    ingredients: [],
    steps: '',
    type: '',
    time: '',
    image: '',
    prepTime: '',
    cookTime: '',
    difficulty: '',
    categories: '',
    allergens: '',
  };

  const [formData, setFormData] = useState({ ...initialFormState, ...recipe });
  const ingredientsList = useIngredients();

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
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: selectedOptions.map(option => option.value),
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
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
      </div>

      <div className="form-group">
        <label>Ingrédients</label>
        <Select
          isMulti
          name="ingredients"
          options={ingredientsList.map(ingredient => ({ value: ingredient, label: ingredient }))}
          value={formData.ingredients.map(ingredient => ({ value: ingredient, label: ingredient }))}
          onChange={handleIngredientsChange}
          className="ingredients-select"
        />
      </div>

      <div className="form-group">
        <label>Étapes (séparées par des sauts de ligne)</label>
        <textarea name="steps" value={formData.steps} onChange={handleChange} required></textarea>
      </div>

      <div className="form-group">
        <label>Type</label>
        <input type="text" name="type" value={formData.type} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Temps (en minutes)</label>
        <input type="number" name="time" value={formData.time} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Image (URL)</label>
        <input type="text" name="image" value={formData.image} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Temps de Préparation (min)</label>
        <input type="number" name="prepTime" value={formData.prepTime} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Temps de Cuisson (min)</label>
        <input type="number" name="cookTime" value={formData.cookTime} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Difficulté</label>
        <input type="text" name="difficulty" value={formData.difficulty} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Catégories (séparées par des virgules)</label>
        <input type="text" name="categories" value={formData.categories} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Allergènes (séparés par des virgules)</label>
        <input type="text" name="allergens" value={formData.allergens} onChange={handleChange} />
      </div>

      <button type="submit" className="submit-btn">Soumettre</button>
    </form>
  );
};

export default RecipeForm;

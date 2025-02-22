// src/components/RecipeForm.jsx
import React, { useState, useEffect } from 'react';
import CreatableSelect  from 'react-select/creatable';
import { useIngredientsAndCategories } from '../hooks/useIngredientsAndCategories';
import MediaUploader from './MediaUploader';

const RecipeForm = ({ recipe = {}, onSubmit }) => {
  const initialFormState = {
    title: '',
    ingredients: [],
    steps: '',
    category: '',
    time: '',
    image: null,
  };

  const [formData, setFormData] = useState({ ...initialFormState, ...recipe });
  const { ingredients, addIngredient, categories, addCategory } = useIngredientsAndCategories();

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
    const newIngredients = selectedOptions.map(option => option.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: newIngredients,
    }));

    newIngredients.forEach(ingredient => {
      if (!ingredients.includes(ingredient)) {
        addIngredient(ingredient);
      }
    });
  };

  const handleCategoryChange = (selectedOption) => {
    const newCategory = selectedOption.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      category: newCategory,
    }));

    if (!categories.includes(newCategory)) {
      addCategory(newCategory);
    }
  };

  const handleMediaChange = (media) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: media,
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
        <CreatableSelect 
          isMulti
          name="ingredients"
          options={ingredients.map(ingredient => ({ value: ingredient, label: ingredient }))}
          className="ingredients-select"
        />
      </div>

      <div className="form-group">
        <label>Étapes (séparées par des sauts de ligne)</label>
        <textarea name="steps" value={formData.steps} onChange={handleChange} required></textarea>
      </div>

      <div className="form-group">
        <label>Catégorie</label>
        <CreatableSelect 
          name="category"
          options={categories.map(category => ({ value: category, label: category }))}
          className="category-select"
        />
      </div>

      <div className="form-group">
        <label>Temps (en minutes)</label>
        <input type="number" name="time" value={formData.time} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Image</label>
        <MediaUploader onMediaChange={handleMediaChange} />
      </div>

      <button type="submit" className="submit-btn">Soumettre</button>
    </form>
  );
};

export default RecipeForm;

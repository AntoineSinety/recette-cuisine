// src/components/RecipeForm.jsx
import React, { useState, useEffect } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import IngredientAutocomplete from './IngredientAutocomplete';
import IngredientPreview from './IngredientPreview';
import { Editor } from '@tinymce/tinymce-react';

const RecipeForm = ({ recipe = {}, onSubmit }) => {
  const initialFormState = {
    title: '',
    ingredients: [],
    steps: '',
    time: '',
    image: null,
  };

  const [formData, setFormData] = useState({ ...initialFormState, ...recipe });
  const { ingredients: allIngredients } = useIngredients();

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

  const handleSelectIngredient = (ingredient) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: [
        ...prevFormData.ingredients,
        {
          id: ingredient.id, // Utilisez l'ID de l'ingrédient
          name: ingredient.name,
          quantity: '',
          unit: ingredient.unit,
        },
      ],
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

  const handleRemoveIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: newIngredients,
    }));
  };

  const handleStepsChange = (content) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      steps: content,
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
        <input type="text" className="field-input" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Ingrédients</label>
        <IngredientAutocomplete
          ingredients={allIngredients}
          onSelectIngredient={handleSelectIngredient}
        />
        <div className="selected-ingredients">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-item">
              <IngredientPreview ingredient={ingredient} />
              <input
                type="number"
                className="field-input"
                value={ingredient.quantity}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                placeholder="Quantité"
              />
              <button type="button" onClick={() => handleRemoveIngredient(index)} className="remove-btn">
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Étapes</label>
        <Editor
          apiKey='n7ca9rt9c55rw2ov1ypquw5nbtnldtc9x7l9n57btzo3a0c2'
          value={formData.steps}
          onEditorChange={handleStepsChange}
          init={{
            height: 300,
            menubar: false,
            plugins: 'lists link image code',
            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
        />
      </div>

      <div className="form-group">
        <label>Temps (en minutes)</label>
        <input type="number" className="field-input" name="time" value={formData.time} onChange={handleChange} required />
      </div>

      <button type="submit" className="submit-btn">Soumettre</button>
    </form>
  );
};

export default RecipeForm;

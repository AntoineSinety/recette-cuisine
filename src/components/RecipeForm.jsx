// src/components/RecipeForm.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from '../context/NavigationContext';
import { useIngredients } from '../hooks/useIngredients';
import { useCategories } from '../hooks/useCategories';
import { addDoc, collection } from 'firebase/firestore';
import { useToast } from './ToastContainer';
import IngredientAutocomplete from './IngredientAutocomplete';
import IngredientCard from './IngredientCard';
import ImageUpload from './ImageUpload';
import { Editor } from '@tinymce/tinymce-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const RecipeForm = ({ recipe = {}, onSubmit }) => {
  const { id } = useParams();
  const location = useLocation();
  const { state } = location;
  const initialRecipe = state ? state.recipe : recipe;

  const initialFormState = {
    title: '',
    ingredients: [],
    steps: '',
    time: '',
    image: null,
    category: '',
  };

  const [formData, setFormData] = useState({ ...initialFormState, ...initialRecipe });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { ingredients: allIngredients } = useIngredients();
  const { categories, loading: categoriesLoading } = useCategories();
  const { showSuccess, showError, showLoading } = useToast();

  // Effet pour charger les données initiales de la recette
  useEffect(() => {
    if (initialRecipe && Object.keys(initialRecipe).length > 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...initialRecipe,
      }));
    }
  }, [initialRecipe]);

  // Effet pour récupérer les détails complets des ingrédients lors de l'édition
  useEffect(() => {
    const fetchIngredientsDetails = async () => {
      if (initialRecipe.ingredients && initialRecipe.ingredients.length > 0) {
        // Vérifier si les ingrédients ont besoin de leurs détails complets
        const needsDetails = initialRecipe.ingredients.some(ing => !ing.name || !ing.hasOwnProperty('imageUrl'));
        
        if (needsDetails) {
          try {
            const ingredientsWithDetails = await Promise.all(
              initialRecipe.ingredients.map(async (ingredientRef) => {
                if (ingredientRef.name && ingredientRef.hasOwnProperty('imageUrl')) {
                  return ingredientRef;
                }
                
                const ingredientDocRef = doc(db, 'ingredients', ingredientRef.id);
                const ingredientDoc = await getDoc(ingredientDocRef);
                if (ingredientDoc.exists()) {
                  const ingredientData = ingredientDoc.data();
                  return {
                    ...ingredientData,
                    ...ingredientRef, // Préserver quantity et autres propriétés spécifiques à la recette
                  };
                }
                return ingredientRef;
              })
            );
            
            setFormData(prev => ({
              ...prev,
              ingredients: ingredientsWithDetails
            }));
          } catch (error) {
            console.error('Error fetching ingredients details:', error);
          }
        }
      }
    };

    if (initialRecipe && Object.keys(initialRecipe).length > 0) {
      fetchIngredientsDetails();
    }
  }, [initialRecipe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si on sélectionne "Créer une nouvelle catégorie"
    if (name === 'category' && value === '__create_new__') {
      setShowNewCategoryInput(true);
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: '',
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showError('Le nom de la catégorie est obligatoire');
      return;
    }
    
    try {
      const loadingToastId = showLoading('Création de la catégorie en cours...');
      
      // Ajouter la catégorie à Firebase
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim()
      });
      
      // Mettre à jour le formulaire
      setFormData(prev => ({
        ...prev,
        category: newCategoryName.trim()
      }));
      
      // Reset et fermer l'input
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      
      showSuccess('Catégorie créée avec succès !');
      
      // Recharger les catégories (optionnel si vous avez un refetch)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      showError('Erreur lors de la création de la catégorie');
    }
  };
  
  const handleCancelNewCategory = () => {
    setNewCategoryName('');
    setShowNewCategoryInput(false);
    setFormData(prev => ({ ...prev, category: '' }));
  };

  const handleSelectIngredient = (ingredient) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: [
        ...prevFormData.ingredients,
        {
          id: ingredient.id,
          name: ingredient.name,
          quantity: '',
          unit: ingredient.unit,
          imageUrl: ingredient.imageUrl,
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

  const handleImageUpload = (imageUrl) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: imageUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Le titre de la recette est obligatoire');
      return;
    }
    
    if (!formData.ingredients.length) {
      showError('Veuillez ajouter au moins un ingrédient');
      return;
    }
    
    if (!formData.time) {
      showError('Le temps de préparation est obligatoire');
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoading('Enregistrement de la recette en cours...');
    
    try {
      await onSubmit(formData);
      showSuccess('Recette enregistrée avec succès !');
      
      // Reset du formulaire après succès (seulement pour l'ajout, pas la modification)
      if (!recipe.id) {
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Erreur lors de l\'enregistrement de la recette');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form">
        
        {/* Header Section */}
        <div className="form__header">
          <div className="form__section">
            <label className="form__label">
              <span className="form__label-text">Titre de la recette</span>
              <span className="form__required">*</span>
            </label>
            <input 
              type="text" 
              className="form__input" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Ex: Tarte aux pommes de grand-mère"
              required 
            />
          </div>

          <div className="form__section">
            <label className="form__label">
              <span className="form__label-text">Catégorie</span>
            </label>
            {!showNewCategoryInput ? (
              <select 
                className="form__select" 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
              >
                <option value="">Choisir une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                <option value="__create_new__">+ Créer une nouvelle catégorie</option>
              </select>
            ) : (
              <div className="form__new-category">
                <input
                  type="text"
                  className="form__input"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nom de la nouvelle catégorie..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    } else if (e.key === 'Escape') {
                      handleCancelNewCategory();
                    }
                  }}
                />
                <div className="form__category-actions">
                  <button
                    type="button"
                    className="form__category-btn form__category-btn--create"
                    onClick={handleCreateCategory}
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    className="form__category-btn form__category-btn--cancel"
                    onClick={handleCancelNewCategory}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form__section">
            <label className="form__label">
              <span className="form__label-text">Temps de préparation</span>
            </label>
            <div className="form__time">
              <input 
                type="number" 
                className="form__input form__input--time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange} 
                placeholder="45"
                min="1"
              />
              <span className="form__time-unit">minutes</span>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="form__section form__section--full">
          <label className="form__label">
            <span className="form__label-text">Photo de la recette</span>
          </label>
          <ImageUpload 
            onImageUpload={handleImageUpload}
            initialImage={formData.image}
            className="form__upload"
          />
        </div>

        {/* Ingredients Section */}
        <div className="form__section form__section--full form__section--ingredients">
          <label className="form__label">
            <span className="form__label-text">Ingrédients</span>
            <span className="form__required">*</span>
          </label>
          
          <div className="form__ingredients-add">
            <IngredientAutocomplete
              ingredients={allIngredients}
              onSelectIngredient={handleSelectIngredient}
            />
          </div>

          <div className="form__ingredients">
            {formData.ingredients.map((ingredient, index) => (
              <IngredientCard
                key={`${ingredient.id}-${index}`}
                ingredient={ingredient}
                onQuantityChange={(quantity) => handleQuantityChange(index, quantity)}
                onRemove={() => handleRemoveIngredient(index)}
              />
            ))}
            {formData.ingredients.length === 0 && (
              <div className="form__empty">
                <div className="form__empty-icon">🥄</div>
                <p>Commencez par ajouter des ingrédients à votre recette</p>
              </div>
            )}
          </div>
        </div>

        {/* Steps Section */}
        <div className="form__section form__section--full">
          <label className="form__label">
            <span className="form__label-text">Étapes de préparation</span>
            <span className="form__required">*</span>
          </label>
          <div className="form__editor">
            <Editor
              apiKey='n7ca9rt9c55rw2ov1ypquw5nbtnldtc9x7l9n57btzo3a0c2'
              value={formData.steps}
              onEditorChange={handleStepsChange}
              init={{
                height: window.innerWidth <= 768 ? 300 : 400,
                menubar: false,
                skin: 'oxide-dark',
                content_css: 'dark',
                mobile: {
                  theme: 'mobile',
                  toolbar: ['undo', 'redo', 'bold', 'italic', 'underline', 'bullist', 'numlist'],
                  plugins: ['lists', 'autolink']
                },
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'charmap',
                  'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'table', 'help', 'wordcount'
                ],
                toolbar: window.innerWidth <= 768 ? 
                  'undo redo | bold italic | bullist numlist | removeformat' :
                  'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                toolbar_mode: window.innerWidth <= 768 ? 'sliding' : 'floating',
                resize: window.innerWidth <= 768 ? false : true,
                branding: false,
                statusbar: window.innerWidth <= 768 ? false : true,
                content_style: `
                  body { 
                    font-family: Helvetica, Arial, sans-serif; 
                    font-size: ${window.innerWidth <= 768 ? '16px' : '14px'}; 
                    line-height: 1.6; 
                    background-color: rgba(30, 30, 30, 0.85); 
                    color: #fff;
                    padding: ${window.innerWidth <= 768 ? '12px' : '16px'};
                  }
                  p { margin-bottom: 12px; }
                  li { margin-bottom: 6px; }
                `,
                placeholder: 'Décrivez les étapes de votre recette...'
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form__submit">
          <button 
            type="submit" 
            className={`form__button ${isSubmitting ? 'form__button--loading' : ''}`}
            disabled={isSubmitting}
          >
            <span className="form__button-text">
              {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer la recette'}
            </span>
            <div className="form__spinner"></div>
          </button>
        </div>

      </form>
    </div>
  );
};

export default RecipeForm;

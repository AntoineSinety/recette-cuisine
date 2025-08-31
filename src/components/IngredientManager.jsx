import React, { useState, useEffect } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import { useToast } from './ToastContainer';
import IngredientPreview from './IngredientPreview';
import IngredientPopup from './IngredientPopup';
import IngredientMediaManager from './IngredientMediaManager';

const PLACEHOLDER_IMAGE = './src/assets/img/placeholder.jpg';

const IngredientManager = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useIngredients();
  const { showError, showSuccess } = useToast();
  const [newIngredient, setNewIngredient] = useState({ name: '', imageUrl: '', unit: '' });
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [nameError, setNameError] = useState('');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      [name]: value,
    }));

    // Validation en temps réel pour le nom
    if (name === 'name') {
      if (value.trim() === '') {
        setNameError('Le nom est obligatoire');
      } else if (checkIngredientExists(value, editingIngredient?.id)) {
        setNameError(`L'ingrédient "${value.trim()}" existe déjà`);
      } else {
        setNameError('');
      }
    }
  };

  const handleImageSelect = (imageUrl) => {
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      imageUrl: imageUrl,
    }));
    setIsMediaManagerOpen(false);
  };

  // Fonction pour vérifier si un ingrédient existe déjà
  const checkIngredientExists = (name, excludeId = null) => {
    const trimmedName = name.trim().toLowerCase();
    return ingredients.some(ingredient => 
      ingredient.name.trim().toLowerCase() === trimmedName && 
      ingredient.id !== excludeId
    );
  };

  // Validation des données de l'ingrédient
  const validateIngredient = (ingredient, excludeId = null) => {
    if (!ingredient.name || ingredient.name.trim() === '') {
      showError('Le nom de l\'ingrédient est obligatoire');
      return false;
    }

    if (checkIngredientExists(ingredient.name, excludeId)) {
      showError(`L'ingrédient "${ingredient.name.trim()}" existe déjà`);
      return false;
    }

    return true;
  };

  const handleAddIngredient = async () => {
    if (!validateIngredient(newIngredient)) {
      return; // Arrêter si la validation échoue
    }

    try {
      await addIngredient(newIngredient);
      showSuccess(`Ingrédient "${newIngredient.name.trim()}" ajouté avec succès`);
      closePopup();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'ingrédient:', error);
      showError('Erreur lors de l\'ajout de l\'ingrédient');
    }
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient(ingredient);
    setIsPopupOpen(true);
  };

  const handleUpdateIngredient = async () => {
    if (!validateIngredient(newIngredient, editingIngredient.id)) {
      return; // Arrêter si la validation échoue
    }

    try {
      await updateIngredient(editingIngredient.id, newIngredient);
      showSuccess(`Ingrédient "${newIngredient.name.trim()}" modifié avec succès`);
      closePopup();
    } catch (error) {
      console.error('Erreur lors de la modification de l\'ingrédient:', error);
      showError('Erreur lors de la modification de l\'ingrédient');
    }
  };

  const handleDeleteIngredient = async (id) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    const ingredientName = ingredient?.name || 'cet ingrédient';
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${ingredientName}" ?`)) {
      try {
        await deleteIngredient(id);
        showSuccess(`Ingrédient "${ingredientName}" supprimé avec succès`);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'ingrédient:', error);
        showError('Erreur lors de la suppression de l\'ingrédient');
      }
    }
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setEditingIngredient(null);
    setNewIngredient({ name: '', imageUrl: '', unit: '' });
    setNameError(''); // Réinitialiser l'erreur
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      closePopup();
    }
  };

  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);


  return (
    <div>
      <div className="ingredient-manager">
        <div className="ingredient-manager__header">
          <h1>Gestion des Ingrédients</h1>
          <button className="bouton" onClick={openPopup}>Ajouter un Ingrédient</button>
        </div>
        <div className="ingredient-list">
          {ingredients.map(ingredient => (
            <div
              key={ingredient.id}
              className="ingredient-item"
              onClick={() => handleEditIngredient(ingredient)}
              style={{ cursor: 'pointer' }}
            >
              <IngredientPreview
                ingredient={ingredient}
                onEdit={handleEditIngredient}
                onDelete={handleDeleteIngredient}
              />
            </div>
          ))}
        </div>
      </div>
      {isPopupOpen && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingIngredient ? 'Modifier' : 'Ajouter'} Ingrédient</h3>
            <div className="ingredient-form">
              <div style={{ marginBottom: '16px' }}>
                <input
                  className={`field-input ${nameError ? 'error' : ''}`}
                  type="text"
                  name="name"
                  value={newIngredient.name}
                  onChange={handleInputChange}
                  placeholder="Nom de l'ingrédient *"
                />
                {nameError && (
                  <div className="error-message" style={{
                    color: '#e74c3c',
                    fontSize: '0.85em',
                    marginTop: '4px',
                    fontWeight: '500'
                  }}>
                    {nameError}
                  </div>
                )}
              </div>
              {/* Gestionnaire de média */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <img
                  src={newIngredient.imageUrl || PLACEHOLDER_IMAGE}
                  alt="Prévisualisation"
                  style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 4, marginBottom: 6 }}
                />
                <button
                  type="button"
                  className="bouton"
                  style={{ marginBottom: 6 }}
                  onClick={() => setIsMediaManagerOpen(true)}
                >
                  Choisir une image
                </button>
              </div>
              <select
                className="field-select"
                name="unit"
                value={newIngredient.unit}
                onChange={handleInputChange}
              >
                <option value="">Sélectionner une unité</option>
                <option value="g">Grammes</option>
                <option value="kg">Kilogrammes</option>
                <option value="ml">Millilitres</option>
                <option value="l">Litres</option>
                <option value="cl">Centilitres</option>
                <option value="u">Unités</option>
                <option value="cc">CC</option>
                <option value="cs">CS</option>
              </select>
            </div>
            <div className="popup-actions">
              <button 
                className="bouton add edit" 
                onClick={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
                disabled={!!nameError || !newIngredient.name.trim()}
                style={{
                  opacity: (!!nameError || !newIngredient.name.trim()) ? 0.5 : 1,
                  cursor: (!!nameError || !newIngredient.name.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {editingIngredient ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button className="bouton delete" onClick={closePopup}>
                Annuler
              </button>
            </div>
          </div>
          {/* Media Manager */}
          <IngredientMediaManager
            isOpen={isMediaManagerOpen}
            onClose={() => setIsMediaManagerOpen(false)}
            onImageSelect={handleImageSelect}
            currentImageUrl={newIngredient.imageUrl}
          />
        </div>
      )}
    </div>
  );
};

export default IngredientManager;

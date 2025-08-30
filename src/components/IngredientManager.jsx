import React, { useState, useEffect } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import IngredientPreview from './IngredientPreview';
import IngredientPopup from './IngredientPopup';
import MediaUploader from './MediaUploader';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

const PLACEHOLDER_IMAGE = './src/assets/img/placeholder.jpg';

const IngredientManager = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, uploadImage } = useIngredients();
  const [newIngredient, setNewIngredient] = useState({ name: '', imageUrl: '', unit: '' });
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [storageImages, setStorageImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Récupère toutes les images depuis Firebase Storage
  useEffect(() => {
    if (isMediaManagerOpen) {
      setLoadingImages(true);
      const fetchImages = async () => {
        try {
          const storage = getStorage();
          const listRef = ref(storage, 'ingredients');
          const res = await listAll(listRef);
          const urls = await Promise.all(
            res.items.map(itemRef => getDownloadURL(itemRef))
          );
          setStorageImages(urls);
        } catch (e) {
          setStorageImages([]);
        }
        setLoadingImages(false);
      };
      fetchImages();
    }
  }, [isMediaManagerOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Upload dans le dossier 'ingredients'
    const imageUrl = await uploadImage(file, 'ingredients');
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      imageUrl: imageUrl,
    }));
    setIsMediaManagerOpen(false);
  };

  const handleSelectExistingImage = (url) => {
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      imageUrl: url,
    }));
    setIsMediaManagerOpen(false);
  };

  const handleSelectNoImage = () => {
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      imageUrl: '',
    }));
    setIsMediaManagerOpen(false);
  };

  const handleAddIngredient = async () => {
    await addIngredient(newIngredient);
    closePopup();
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient(ingredient);
    setIsPopupOpen(true);
  };

  const handleUpdateIngredient = async () => {
    await updateIngredient(editingIngredient.id, newIngredient);
    closePopup();
  };

  const handleDeleteIngredient = async (id) => {
    await deleteIngredient(id);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setEditingIngredient(null);
    setNewIngredient({ name: '', imageUrl: '', unit: '' });
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

  const handleMediaUpload = async (fileOrUrl) => {
    if (typeof fileOrUrl === 'string') {
      // C'est une image capturée par webcam (base64)
      const imageUrl = await uploadImage(fileOrUrl, 'ingredients', true);
      setNewIngredient((prevIngredient) => ({
        ...prevIngredient,
        imageUrl: imageUrl,
      }));
    } else {
      // C'est un fichier
      const imageUrl = await uploadImage(fileOrUrl, 'ingredients');
      setNewIngredient((prevIngredient) => ({
        ...prevIngredient,
        imageUrl: imageUrl,
      }));
    }
    setIsMediaManagerOpen(false);
  };

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
              <input
                className="field-input"
                type="text"
                name="name"
                value={newIngredient.name}
                onChange={handleInputChange}
                placeholder="Nom"
              />
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
              <button className="bouton add edit" onClick={editingIngredient ? handleUpdateIngredient : handleAddIngredient}>
                {editingIngredient ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button className="bouton delete" onClick={closePopup}>
                Annuler
              </button>
            </div>
          </div>
          {/* Media Manager Popup */}
          {isMediaManagerOpen && (
            <div
              className="popup-overlay"
              style={{ zIndex: 1100 }}
              onClick={() => setIsMediaManagerOpen(false)}
            >
              <div
                className="popup-content mediatheque"
                style={{ maxWidth: 540, minHeight: 340, display: 'flex', flexDirection: 'column', gap: 16 }}
                onClick={e => e.stopPropagation()}
              >
                <h4 style={{ marginBottom: 8 }}>Médiathèque des ingrédients</h4>
                <div style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>
                  <b>1.</b> Glissez-déposez ou sélectionnez une image pour l'ajouter au dossier.<br />
                  <b>2.</b> Cliquez sur une image pour l'utiliser.<br />
                  <b>3.</b> Vous pouvez aussi choisir "Pas d'image".
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Ajouter une image :</div>
                    <MediaUploader onMediaChange={handleMediaUpload} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Images du dossier "ingredients" :</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={handleSelectNoImage}
                      >
                        <img
                          src={PLACEHOLDER_IMAGE}
                          alt="Pas d'image"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'contain',
                            border: '2px solid #ccc',
                            borderRadius: 4,
                            background: '#fff'
                          }}
                        />
                        <span style={{ fontSize: 12, color: '#888' }}>Pas d'image</span>
                      </div>
                      {loadingImages && <span style={{ color: '#888' }}>Chargement...</span>}
                      {!loadingImages && storageImages.length === 0 && (
                        <span style={{ color: '#888' }}>Aucune image trouvée</span>
                      )}
                      {!loadingImages && storageImages.map(url => (
                        <img
                          key={url}
                          src={url}
                          alt="media"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'contain',
                            border: '2px solid #ccc',
                            borderRadius: 4,
                            cursor: 'pointer',
                            background: '#fff'
                          }}
                          onClick={() => handleSelectExistingImage(url)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="bouton"
                  style={{ marginTop: 12 }}
                  onClick={() => setIsMediaManagerOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientManager;

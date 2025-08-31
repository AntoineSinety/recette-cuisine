import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { useIngredients } from '../hooks/useIngredients';

const PLACEHOLDER_IMAGE = './src/assets/img/placeholder.jpg';

const IngredientMediaManager = ({ isOpen, onClose, onImageSelect, currentImageUrl = '' }) => {
  const { uploadImage } = useIngredients();
  const [storageImages, setStorageImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const IMAGES_PER_PAGE = 12;

  // Récupère toutes les images depuis Firebase Storage
  useEffect(() => {
    if (isOpen) {
      loadStorageImages();
    }
  }, [isOpen]);

  const loadStorageImages = async () => {
    setLoadingImages(true);
    try {
      const storage = getStorage();
      const listRef = ref(storage, 'ingredients');
      const res = await listAll(listRef);
      
      const imageData = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            url,
            name: itemRef.name,
            fullPath: itemRef.fullPath
          };
        })
      );
      
      setStorageImages(imageData);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      setStorageImages([]);
    }
    setLoadingImages(false);
  };

  // Gestion du drag & drop
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      await handleFileUpload(file);
    }
    setDragActive(false);
  }, []);

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'ingredients');
      onImageSelect(imageUrl);
      await loadStorageImages(); // Recharger la galerie
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
    setUploading(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setUploading(true);
    try {
      const imageUrl = await uploadImage(imageSrc, 'ingredients', true);
      onImageSelect(imageUrl);
      setCameraOpen(false);
      await loadStorageImages();
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
    }
    setUploading(false);
  }, [webcamRef, uploadImage, onImageSelect]);

  const handleImageSelect = (url) => {
    onImageSelect(url);
  };

  const handleNoImage = () => {
    onImageSelect('');
  };

  // Filtrage des images
  const filteredImages = storageImages.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
  const paginatedImages = filteredImages.slice(
    currentPage * IMAGES_PER_PAGE,
    (currentPage + 1) * IMAGES_PER_PAGE
  );

  if (!isOpen) return null;

  return (
    <div className="ingredient-media-manager__overlay" onClick={onClose}>
      <div className="ingredient-media-manager__modal" onClick={(e) => e.stopPropagation()}>
        <div className="ingredient-media-manager__header">
          <h3>Médiathèque des Ingrédients</h3>
          <button 
            className="ingredient-media-manager__close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="ingredient-media-manager__content">
          {/* Section d'ajout d'image */}
          <div className="ingredient-media-manager__upload-section">
            <div className="ingredient-media-manager__instructions">
              <h4>📤 Ajouter une nouvelle image</h4>
              <p>Glissez-déposez une image ou utilisez les options ci-dessous</p>
            </div>

            {/* Zone de drag & drop */}
            <div
              {...getRootProps()}
              className={`ingredient-media-manager__dropzone ${isDragActive ? 'active' : ''} ${dragActive ? 'drag-active' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="ingredient-media-manager__dropzone-content">
                <div className="ingredient-media-manager__dropzone-icon">📁</div>
                {isDragActive ? (
                  <p>Déposez l'image ici...</p>
                ) : (
                  <div>
                    <p><strong>Glissez-déposez une image ici</strong></p>
                    <p>ou utilisez les boutons ci-dessous</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="ingredient-media-manager__actions">
              <button 
                type="button" 
                className="ingredient-media-manager__btn ingredient-media-manager__btn--primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                📂 Choisir un fichier
              </button>
              <button 
                type="button" 
                className="ingredient-media-manager__btn ingredient-media-manager__btn--secondary"
                onClick={() => setCameraOpen(!cameraOpen)}
                disabled={uploading}
              >
                📷 {cameraOpen ? 'Fermer' : 'Prendre'} une photo
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*"
              disabled={uploading}
            />

            {/* Webcam */}
            {cameraOpen && (
              <div className="ingredient-media-manager__webcam">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="ingredient-media-manager__webcam-preview"
                />
                <div className="ingredient-media-manager__webcam-actions">
                  <button 
                    className="ingredient-media-manager__btn ingredient-media-manager__btn--primary"
                    onClick={capturePhoto}
                    disabled={uploading}
                  >
                    📸 Capturer
                  </button>
                  <button 
                    className="ingredient-media-manager__btn ingredient-media-manager__btn--secondary"
                    onClick={() => setCameraOpen(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {uploading && (
              <div className="ingredient-media-manager__uploading">
                <div className="ingredient-media-manager__loader"></div>
                <p>Téléchargement en cours...</p>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="ingredient-media-manager__separator">
            <div className="ingredient-media-manager__separator-line"></div>
            <span className="ingredient-media-manager__separator-text">OU CHOISIR UNE IMAGE EXISTANTE</span>
            <div className="ingredient-media-manager__separator-line"></div>
          </div>

          {/* Section galerie */}
          <div className="ingredient-media-manager__gallery-section">
            <div className="ingredient-media-manager__gallery-header">
              <h4>🖼️ Images disponibles ({storageImages.length})</h4>
              
              {/* Barre de recherche */}
              <div className="ingredient-media-manager__search">
                <input
                  type="text"
                  placeholder="Rechercher une image..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="ingredient-media-manager__search-input"
                />
                <span className="ingredient-media-manager__search-icon">🔍</span>
              </div>
            </div>

            {/* Galerie d'images */}
            <div className="ingredient-media-manager__gallery">
              {/* Option "Pas d'image" */}
              <div
                className={`ingredient-media-manager__image-item no-image ${!currentImageUrl ? 'selected' : ''}`}
                onClick={handleNoImage}
              >
                <img
                  src={PLACEHOLDER_IMAGE}
                  alt="Pas d'image"
                  className="ingredient-media-manager__image"
                />
                <div className="ingredient-media-manager__image-overlay">
                  <span>Pas d'image</span>
                </div>
              </div>

              {loadingImages ? (
                <div className="ingredient-media-manager__loading">
                  <div className="ingredient-media-manager__loader"></div>
                  <p>Chargement des images...</p>
                </div>
              ) : paginatedImages.length === 0 ? (
                <div className="ingredient-media-manager__empty">
                  <p>
                    {searchTerm ? 'Aucune image trouvée pour cette recherche' : 'Aucune image dans la galerie'}
                  </p>
                </div>
              ) : (
                paginatedImages.map((image) => (
                  <div
                    key={image.url}
                    className={`ingredient-media-manager__image-item ${currentImageUrl === image.url ? 'selected' : ''}`}
                    onClick={() => handleImageSelect(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="ingredient-media-manager__image"
                    />
                    <div className="ingredient-media-manager__image-overlay">
                      <span className="ingredient-media-manager__image-name">
                        {image.name.replace(/\.[^/.]+$/, '')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="ingredient-media-manager__pagination">
                <button
                  className="ingredient-media-manager__btn ingredient-media-manager__btn--secondary"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  ← Précédent
                </button>
                <span className="ingredient-media-manager__page-info">
                  Page {currentPage + 1} sur {totalPages}
                </span>
                <button
                  className="ingredient-media-manager__btn ingredient-media-manager__btn--secondary"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer avec preview de l'image sélectionnée */}
        {currentImageUrl && (
          <div className="ingredient-media-manager__footer">
            <div className="ingredient-media-manager__preview">
              <img
                src={currentImageUrl}
                alt="Aperçu"
                className="ingredient-media-manager__preview-image"
              />
              <span>Image sélectionnée</span>
            </div>
            <button 
              className="ingredient-media-manager__btn ingredient-media-manager__btn--primary"
              onClick={onClose}
            >
              Utiliser cette image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientMediaManager;
import React, { useState, useRef } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const ImageUpload = ({ onImageUpload, initialImage = null, className = "" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La taille du fichier ne peut pas dépasser 5 MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `recettes/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setPreview(downloadURL);
      onImageUpload(downloadURL);
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      setError('Erreur lors de l\'upload de l\'image.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (preview && preview.includes('firebase')) {
      try {
        const imageRef = ref(storage, preview);
        await deleteObject(imageRef);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
    
    setPreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`upload ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {!preview ? (
        <div className="upload__placeholder" onClick={triggerFileInput}>
          <div className="upload__icon">📷</div>
          <p>Cliquez pour ajouter une photo</p>
          <small>JPG, PNG, GIF (max 5MB)</small>
        </div>
      ) : (
        <div className="upload__preview">
          <img src={preview} alt="Aperçu" />
          <div className="upload__actions">
            <button type="button" onClick={triggerFileInput} className="upload__button">
              Changer
            </button>
            <button type="button" onClick={handleRemoveImage} className="upload__button upload__button--remove">
              Supprimer
            </button>
          </div>
        </div>
      )}
      
      {uploading && (
        <div className="upload__status">
          <div className="upload__spinner"></div>
          <p>Upload en cours...</p>
        </div>
      )}
      
      {error && (
        <div className="upload__error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
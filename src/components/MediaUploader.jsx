// src/components/MediaUploader.jsx
import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';

const MediaUploader = ({ onMediaChange }) => {
  const [media, setMedia] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setMedia(file);
    onMediaChange(file);
  }, [onMediaChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    onMediaChange(file);
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setMedia(imageSrc);
    onMediaChange(imageSrc);
  }, [webcamRef, onMediaChange]);

  return (
    <div className="media-uploader" style={{ width: '100%' }}>
      <div
        {...getRootProps({ className: 'dropzone' })}
        style={{
          border: '2px dashed #0074D9',
          borderRadius: 8,
          padding: 16,
          background: isDragActive ? '#2e2e2eff' : '#282828ff',
          textAlign: 'center',
          marginBottom: 8,
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive
          ? <p style={{ color: '#0074D9' }}>Déposez le fichier ici...</p>
          : <p>Glissez-déposez une image ici<br />ou cliquez pour sélectionner un fichier</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
        <button type="button" className="bouton" onClick={() => fileInputRef.current.click()}>
          Choisir un fichier
        </button>
        <button type="button" className="bouton" onClick={() => setCameraOpen(true)}>
          Prendre une photo
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      {media && (
        <div className="media-preview" style={{ marginTop: 8 }}>
          {typeof media === 'string' ? (
            <img src={media} alt="Preview" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 4 }} />
          ) : (
            <img src={URL.createObjectURL(media)} alt="Preview" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 4 }} />
          )}
        </div>
      )}
      {cameraOpen && (
        <div className="webcam-container" style={{ marginTop: 8 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: 180, borderRadius: 8 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
            <button className="bouton" onClick={capturePhoto}>Prendre une photo</button>
            <button className="bouton" onClick={() => setCameraOpen(false)}>Fermer la caméra</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;

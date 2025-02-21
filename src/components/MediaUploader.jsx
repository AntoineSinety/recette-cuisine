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
    <div className="media-uploader">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Déposez le fichier ici</p> : <p>Glissez-déposez un fichier ici, ou cliquez pour sélectionner un fichier</p>}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button type="button" onClick={() => fileInputRef.current.click()}>
        Choisir un fichier
      </button>
      <button type="button" onClick={() => setCameraOpen(true)}>
        Ouvrir la caméra
      </button>
      {media && (
        <div className="media-preview">
          {typeof media === 'string' ? (
            <img src={media} alt="Preview" />
          ) : (
            <video src={URL.createObjectURL(media)} controls />
          )}
        </div>
      )}
      {cameraOpen && (
        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
          <button onClick={capturePhoto}>Prendre une photo</button>
          <button onClick={() => setCameraOpen(false)}>Fermer la caméra</button>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;

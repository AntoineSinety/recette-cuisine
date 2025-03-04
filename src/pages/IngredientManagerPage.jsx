// src/pages/IngredientManagerPage.jsx
import React from 'react';
import IngredientManager from '../components/IngredientManager';

const IngredientManagerPage = () => {
  return (
    <div className='page'>
      <h1>Gestion des Ingrédients</h1>
      <IngredientManager />
    </div>
  );
};

export default IngredientManagerPage;

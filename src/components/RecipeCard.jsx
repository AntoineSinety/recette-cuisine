import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteRecipe } from '../hooks/useDeleteRecipe';

const RecipeCard = ({ recipe, onClick }) => {
  const navigate = useNavigate();
  const deleteRecipe = useDeleteRecipe();

  const handleEdit = () => {
    navigate(`/edit/${recipe.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      if (recipe.firestoreId) { // Vérifie que l'ID Firestore est présent
        await deleteRecipe(recipe.firestoreId);
      } else {
        console.error('Firestore ID manquant pour la recette:', recipe);
      }
    }
  };

  // Assurez-vous que recipe.ingredients est un tableau
  const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  return (
    <div className="recipe-card" onClick={(e) => {
      if (e.target.closest('.card-buttons')) return;
      onClick(recipe);
    }}>
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="recipe-image" />
      )}
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      <p><strong>Ingrédients:</strong> {ingredientsArray.join(', ')}</p>
      <p><strong>Temps:</strong> {recipe.time} min</p>
      <div className="card-buttons">
        <button onClick={handleEdit}>Modifier</button>
        <button onClick={handleDelete}>Supprimer</button>
      </div>
    </div>
  );
};

export default RecipeCard;

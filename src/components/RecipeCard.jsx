import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteRecipe } from '../hooks/useDeleteRecipe';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const RecipeCard = ({ recipe, onClick }) => {
  const navigate = useNavigate();
  const deleteRecipe = useDeleteRecipe();

  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      const ingredientsData = await Promise.all(
        recipe.ingredients.map(async (ingredientRef) => {
          const ingredientDocRef = doc(db, 'ingredients', ingredientRef.id);
          const ingredientDoc = await getDoc(ingredientDocRef);
          if (ingredientDoc.exists()) {
            return { ...ingredientDoc.data(), ...ingredientRef };
          }
          return null;
        })
      );
      setIngredients(ingredientsData.filter(ingredient => ingredient !== null));
    };

    if (recipe.ingredients) {
      fetchIngredients();
    }
  }, [recipe]);

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
      <p><strong>Ingrédients:</strong></p>
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.name} ({ingredient.quantity} {ingredient.unit})
          </li>
        ))}
      </ul>
      <p><strong>Temps:</strong> {recipe.time} min</p>
      <div className="card-buttons">
        <button onClick={handleEdit}>Modifier</button>
        <button onClick={handleDelete}>Supprimer</button>
      </div>
    </div>
  );
};

export default RecipeCard;

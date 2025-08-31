import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteRecipe } from '../hooks/useDeleteRecipe';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const RecipeCard = ({ recipe, onClick }) => {
  const navigate = useNavigate();
  const deleteRecipe = useDeleteRecipe();

  const [ingredients, setIngredients] = useState([]);
  const [visibleIngredients, setVisibleIngredients] = useState([]);
  const [hiddenCount, setHiddenCount] = useState(0);

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

  useEffect(() => {
    if (ingredients.length > 0) {
      // Limite à 6 ingrédients visibles (environ 2 lignes)
      const maxVisible = 6;
      if (ingredients.length > maxVisible) {
        setVisibleIngredients(ingredients.slice(0, maxVisible));
        setHiddenCount(ingredients.length - maxVisible);
      } else {
        setVisibleIngredients(ingredients);
        setHiddenCount(0);
      }
    }
  }, [ingredients]);

  const handleEdit = () => {
    // Assurez-vous que recipe.id est correctement défini
    if (recipe.id) {
      navigate(`/edit/${recipe.id}`, { state: { recipe } });
    } else {
      console.error('ID de recette manquant pour la navigation:', recipe);
    }
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
    <div className="card" onClick={(e) => {
      if (e.target.closest('.card__buttons')) return;
      onClick(recipe);
    }}>
      <figure>
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="card__image" />
        )}
        {recipe.category && (
            <div className="card__category">{recipe.category}</div>
          )}
      </figure>
      <div className="card__content">
        <h3 className="card__title">{recipe.title}</h3>
       
        <div className="card__ingredients">
          {visibleIngredients.map((ingredient, index) => (
            <span key={index} className="card__ingredient">
              {ingredient.name}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="card__ingredient card__ingredient--more">
              +{hiddenCount}
            </span>
          )}
        </div>
        <div className="card__time">
          <span className="card__time-icon">⏱</span>
          {recipe.time} min
        </div>
      </div>
      <div className="card__buttons">
        <button onClick={handleEdit}>Modifier</button>
        <button onClick={handleDelete}>Supprimer</button>
      </div>
    </div>
  );
};

export default RecipeCard;

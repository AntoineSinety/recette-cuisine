// src/pages/EditRecipePage.jsx
import React, { useState, useEffect } from 'react';
import RecipeForm from '../components/RecipeForm';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';
import { useParams } from '../context/NavigationContext';
import { getCookie } from '../utils/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const EditRecipePage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        // Essayer de récupérer depuis le cookie d'abord
        const savedData = getCookie('recette_edit_data');
        if (savedData) {
          try {
            const recipeData = JSON.parse(decodeURIComponent(savedData));
            setRecipe(recipeData);
            setLoading(false);
            return;
          } catch (jsonError) {
            console.warn('Cookie corrompu, chargement depuis Firestore:', jsonError);
            // Supprimer le cookie corrompu
            document.cookie = 'recette_edit_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        }

        // Sinon charger depuis Firestore avec l'ID
        if (id) {
          const docRef = doc(db, 'recipes', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setRecipe({ id, ...docSnap.data() });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la recette:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const updateRecipe = useUpdateRecipe();

  const handleSubmit = (formData) => {
    updateRecipe(formData);
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Modifier la Recette</h2>
      {recipe ? (
        <RecipeForm recipe={recipe} onSubmit={handleSubmit} />
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>⚠️ Recette non trouvée</h3>
          <p>La recette que vous essayez de modifier n'a pas pu être chargée.</p>
        </div>
      )}
    </div>
  );
};

export default EditRecipePage;

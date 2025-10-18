import React, { useState } from 'react';
import { importRecipe } from '../services/recipeImporter';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from '../context/NavigationContext';
import { PAGES } from '../utils/navigation';

const ImportRecipePage = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [ingredientMapping, setIngredientMapping] = useState({});

  // Charger les ingrédients existants
  const loadExistingIngredients = async () => {
    try {
      const ingredientsSnapshot = await getDocs(collection(db, 'ingredients'));
      const ingredients = ingredientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExistingIngredients(ingredients);
      return ingredients;
    } catch (err) {
      console.error('Erreur chargement ingrédients:', err);
      return [];
    }
  };

  // Suggérer un ingrédient existant basé sur le nom
  const suggestIngredient = (importedName, existingIngredients) => {
    const normalized = importedName.toLowerCase().trim();

    // Recherche exacte
    let match = existingIngredients.find(ing =>
      ing.name.toLowerCase().trim() === normalized
    );

    if (match) return match.id;

    // Recherche partielle
    match = existingIngredients.find(ing =>
      ing.name.toLowerCase().includes(normalized) ||
      normalized.includes(ing.name.toLowerCase())
    );

    return match ? match.id : 'create-new';
  };

  // Importer et prévisualiser
  const handleImport = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewRecipe(null);

    try {
      const recipe = await importRecipe(url.trim());

      // Charger les ingrédients existants
      const existing = await loadExistingIngredients();

      // Créer un mapping initial avec suggestions
      const initialMapping = {};
      recipe.ingredients.forEach((ing, index) => {
        initialMapping[index] = suggestIngredient(ing.name, existing);
      });

      setIngredientMapping(initialMapping);
      setPreviewRecipe(recipe);
    } catch (err) {
      console.error('Erreur import:', err);
      setError(err.message || 'Erreur lors de l\'import de la recette');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder la recette dans Firebase
  const handleSave = async () => {
    if (!previewRecipe) return;

    setSaving(true);
    setError(null);

    try {
      // Créer ou utiliser les ingrédients selon le mapping
      const ingredientsRefs = await Promise.all(
        previewRecipe.ingredients.map(async (ing, index) => {
          const mappedId = ingredientMapping[index];
          let ingredientId;

          if (mappedId && mappedId !== 'create-new') {
            // Utiliser l'ingrédient existant sélectionné
            ingredientId = mappedId;
          } else {
            // Créer un nouvel ingrédient
            const newIngredient = {
              name: ing.name,
              unit: ing.unit || '',
              category: '', // Catégorie par défaut
              createdAt: new Date(),
              fromImport: true
            };
            const docRef = await addDoc(collection(db, 'ingredients'), newIngredient);
            ingredientId = docRef.id;
          }

          return {
            id: ingredientId,
            quantity: parseFloat(ing.quantity) || null,
            unit: ing.unit || ''
          };
        })
      );

      // Transformer les données pour Firebase
      const recipeData = {
        title: previewRecipe.title,
        description: `Importé depuis ${previewRecipe.source}`,
        image: previewRecipe.image || null,
        time: previewRecipe.time || '',
        servings: parseInt(previewRecipe.servings) || 4,
        difficulty: previewRecipe.difficulty || 'Moyen',
        category: previewRecipe.category || 'Autre',
        ingredients: ingredientsRefs,
        // Convertir les steps en format structuré avec association d'ingrédients
        steps: previewRecipe.steps.map((step, index) => ({
          number: index + 1,
          title: step.title || `Étape ${index + 1}`,
          ingredients: [], // Pour l'instant vide, l'utilisateur peut les ajouter en éditant
          instructions: step.description || '',
          duration: step.duration || ''
        })),
        rating: previewRecipe.rating || null,
        sourceUrl: previewRecipe.sourceUrl,
        source: previewRecipe.source,
        createdAt: new Date(),
        importedAt: new Date()
      };

      // Sauvegarder dans Firestore
      const docRef = await addDoc(collection(db, 'recipes'), recipeData);

      console.log('Recette sauvegardée avec ID:', docRef.id);

      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError('Erreur lors de la sauvegarde: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Modifier un champ de la recette en prévisualisation
  const handleEditField = (field, value) => {
    setPreviewRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditIngredient = (index, field, value) => {
    setPreviewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const handleEditStep = (index, value) => {
    setPreviewRecipe(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, description: value } : step
      )
    }));
  };

  return (
    <div className="import-recipe">
      <div className="import-recipe__header">
        <h1>Importer une recette</h1>
        <p>Copiez-collez l'URL d'une recette depuis Marmiton ou d'autres sites supportés</p>
      </div>

      {/* Formulaire d'import */}
      <div className="import-recipe__form">
        <div className="import-recipe__input-group">
          <input
            type="url"
            className="import-recipe__input"
            placeholder="https://www.marmiton.org/recettes/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleImport();
              }
            }}
            disabled={loading}
          />
          <button
            className="import-recipe__btn import-recipe__btn--primary"
            onClick={handleImport}
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <span className="import-recipe__spinner"></span>
                Extraction...
              </>
            ) : (
              '🔍 Extraire la recette'
            )}
          </button>
        </div>

        <div className="import-recipe__supported">
          <strong>Sites supportés :</strong> Marmiton, Ricardo, AllRecipes, et tous les sites avec données structurées
        </div>

        {error && (
          <div className="import-recipe__error">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Prévisualisation de la recette */}
      {previewRecipe && (
        <div className="import-recipe__preview">
          <div className="import-recipe__preview-header">
            <h2>✅ Recette extraite avec succès !</h2>
            <p>Vérifiez et modifiez si nécessaire avant de sauvegarder</p>
          </div>

          <div className="import-recipe__preview-content">
            {/* Image et infos principales */}
            <div className="import-recipe__preview-main">
              {previewRecipe.image && (
                <div className="import-recipe__preview-image">
                  <img src={previewRecipe.image} alt={previewRecipe.title} />
                </div>
              )}

              <div className="import-recipe__preview-info">
                <div className="import-recipe__field">
                  <label>Titre</label>
                  <input
                    type="text"
                    value={previewRecipe.title}
                    onChange={(e) => handleEditField('title', e.target.value)}
                    className="import-recipe__edit-input"
                  />
                </div>

                <div className="import-recipe__field-row">
                  <div className="import-recipe__field">
                    <label>Temps</label>
                    <input
                      type="text"
                      value={previewRecipe.time || ''}
                      onChange={(e) => handleEditField('time', e.target.value)}
                      className="import-recipe__edit-input"
                      placeholder="Ex: 30 min"
                    />
                  </div>

                  <div className="import-recipe__field">
                    <label>Portions</label>
                    <input
                      type="text"
                      value={previewRecipe.servings || ''}
                      onChange={(e) => handleEditField('servings', e.target.value)}
                      className="import-recipe__edit-input"
                      placeholder="4"
                    />
                  </div>

                  <div className="import-recipe__field">
                    <label>Difficulté</label>
                    <input
                      type="text"
                      value={previewRecipe.difficulty || ''}
                      onChange={(e) => handleEditField('difficulty', e.target.value)}
                      className="import-recipe__edit-input"
                      placeholder="Moyen"
                    />
                  </div>
                </div>

                <div className="import-recipe__field">
                  <label>Catégorie</label>
                  <input
                    type="text"
                    value={previewRecipe.category || ''}
                    onChange={(e) => handleEditField('category', e.target.value)}
                    className="import-recipe__edit-input"
                    placeholder="Ex: Plat principal"
                  />
                </div>

                {previewRecipe.sourceUrl && (
                  <div className="import-recipe__source">
                    <label>Source</label>
                    <a href={previewRecipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {previewRecipe.source} →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Ingrédients */}
            <div className="import-recipe__section">
              <h3>Ingrédients ({previewRecipe.ingredients.length})</h3>
              <p className="import-recipe__section-hint">
                💡 Associez chaque ingrédient importé avec un ingrédient existant ou créez-en un nouveau
              </p>
              <div className="import-recipe__ingredients">
                {previewRecipe.ingredients.map((ing, index) => {
                  const mappedId = ingredientMapping[index];
                  const selectedIng = existingIngredients.find(e => e.id === mappedId);
                  const isNewIngredient = !mappedId || mappedId === 'create-new';

                  return (
                    <div key={index} className="import-recipe__ingredient-row">
                      <div className="import-recipe__ingredient-imported">
                        <input
                          type="number"
                          value={ing.quantity || ''}
                          onChange={(e) => handleEditIngredient(index, 'quantity', e.target.value)}
                          className="import-recipe__ingredient-qty"
                          placeholder="Qté"
                        />
                        <input
                          type="text"
                          value={ing.unit || ''}
                          onChange={(e) => handleEditIngredient(index, 'unit', e.target.value)}
                          className="import-recipe__ingredient-unit"
                          placeholder="Unité"
                        />
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => handleEditIngredient(index, 'name', e.target.value)}
                          className="import-recipe__ingredient-name"
                          placeholder="Nom de l'ingrédient"
                        />
                      </div>

                      <div className="import-recipe__ingredient-mapping">
                        <span className="import-recipe__mapping-arrow">→</span>
                        <select
                          className="import-recipe__ingredient-select"
                          value={mappedId || 'create-new'}
                          onChange={(e) => {
                            setIngredientMapping(prev => ({
                              ...prev,
                              [index]: e.target.value
                            }));
                          }}
                        >
                          <option value="create-new">✨ Créer nouvel ingrédient</option>
                          <optgroup label="Ingrédients existants">
                            {existingIngredients.map(existingIng => (
                              <option key={existingIng.id} value={existingIng.id}>
                                {existingIng.name}
                                {existingIng.category && ` (${existingIng.category})`}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        {selectedIng && (
                          <span className="import-recipe__mapping-match">
                            ✓ Correspondance trouvée
                          </span>
                        )}
                        {isNewIngredient && (
                          <span className="import-recipe__mapping-new">
                            ✨ Nouveau
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Étapes */}
            <div className="import-recipe__section">
              <h3>Préparation ({previewRecipe.steps.length} étapes)</h3>
              <div className="import-recipe__steps">
                {previewRecipe.steps.map((step, index) => (
                  <div key={index} className="import-recipe__step">
                    <span className="import-recipe__step-number">{step.number}</span>
                    <textarea
                      value={step.description}
                      onChange={(e) => handleEditStep(index, e.target.value)}
                      className="import-recipe__step-text"
                      rows="3"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="import-recipe__actions">
              <button
                className="import-recipe__btn import-recipe__btn--secondary"
                onClick={() => {
                  setPreviewRecipe(null);
                  setUrl('');
                }}
              >
                ❌ Annuler
              </button>
              <button
                className="import-recipe__btn import-recipe__btn--success"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="import-recipe__spinner"></span>
                    Sauvegarde...
                  </>
                ) : (
                  '✅ Sauvegarder la recette'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone vide avec exemples */}
      {!previewRecipe && !loading && (
        <div className="import-recipe__examples">
          <h3>💡 Comment ça marche ?</h3>
          <ol>
            <li>Trouvez une recette sur Marmiton ou un autre site supporté</li>
            <li>Copiez l'URL complète de la page</li>
            <li>Collez-la dans le champ ci-dessus et cliquez sur "Extraire"</li>
            <li>Vérifiez les informations extraites</li>
            <li>Modifiez si nécessaire et sauvegardez !</li>
          </ol>

          <div className="import-recipe__example-urls">
            <p><strong>Exemples d'URLs :</strong></p>
            <code>https://www.marmiton.org/recettes/recette_poulet-roti-au-four_31683.aspx</code>
            <code>https://www.ricardocuisine.com/recettes/5999-poulet-general-tao</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportRecipePage;

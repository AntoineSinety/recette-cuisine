// Service d'import de recettes depuis différents sites

/**
 * Parse une recette depuis Marmiton
 * @param {string} url - URL de la recette Marmiton
 * @returns {Promise<Object>} - Données de la recette
 */
const parseMarmiton = async (html, url) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extraire les données de la recette
  const recipe = {
    source: 'marmiton',
    sourceUrl: url,
    title: '',
    image: '',
    time: '',
    servings: '',
    difficulty: '',
    category: '',
    ingredients: [],
    steps: [],
    rating: null
  };

  try {
    // Titre
    const titleEl = doc.querySelector('h1.SHRD__Title, h1[itemprop="name"]');
    if (titleEl) recipe.title = titleEl.textContent.trim();

    // Image
    const imageEl = doc.querySelector('img.recipe-media__image, picture.recipe-media img, img[itemprop="image"]');
    if (imageEl) {
      let imageUrl = imageEl.src || imageEl.dataset.src || imageEl.dataset.lazy || imageEl.srcset;

      // Si c'est un srcset avec plusieurs URLs, prendre la première
      if (imageUrl && imageUrl.includes(',')) {
        imageUrl = imageUrl.split(',')[0].trim().split(' ')[0];
      }

      recipe.image = imageUrl;
    }

    // Temps de préparation
    const prepTimeEl = doc.querySelector('[itemprop="prepTime"], .recipe-infos__timmings__preparation .recipe-infos__timmings__value');
    if (prepTimeEl) {
      const timeText = prepTimeEl.textContent.trim();
      recipe.time = timeText.replace('PT', '').replace('M', ' min').replace('H', 'h');
    }

    // Temps de cuisson
    const cookTimeEl = doc.querySelector('[itemprop="cookTime"], .recipe-infos__timmings__cooking .recipe-infos__timmings__value');
    if (cookTimeEl) {
      const cookTime = cookTimeEl.textContent.trim();
      if (recipe.time) {
        recipe.time += ' + ' + cookTime;
      } else {
        recipe.time = cookTime;
      }
    }

    // Nombre de personnes
    const servingsEl = doc.querySelector('[itemprop="recipeYield"], .recipe-infos__quantity__value');
    if (servingsEl) {
      recipe.servings = servingsEl.textContent.trim().replace(/\D/g, '') || '4';
    }

    // Difficulté
    const difficultyEl = doc.querySelector('.recipe-infos__level, [data-level]');
    if (difficultyEl) {
      recipe.difficulty = difficultyEl.textContent.trim();
    }

    // Catégorie (depuis breadcrumb ou meta)
    const categoryEl = doc.querySelector('.breadcrumb li:nth-last-child(2) a, meta[property="article:section"]');
    if (categoryEl) {
      recipe.category = categoryEl.content || categoryEl.textContent.trim();
    }

    // Ingrédients
    const ingredientElements = doc.querySelectorAll(
      '[itemprop="recipeIngredient"], .card-ingredient, .recipe-ingredient-qt'
    );

    ingredientElements.forEach(el => {
      const text = el.textContent.trim();
      if (text && text.length > 0) {
        // Parser la quantité et l'ingrédient
        const parsed = parseIngredientLine(text);
        if (parsed) {
          recipe.ingredients.push(parsed);
        }
      }
    });

    // Si pas d'ingrédients trouvés avec la méthode ci-dessus
    if (recipe.ingredients.length === 0) {
      const ingredientList = doc.querySelectorAll('.recipe-ingredients__list li');
      ingredientList.forEach(li => {
        const text = li.textContent.trim();
        if (text) {
          const parsed = parseIngredientLine(text);
          if (parsed) {
            recipe.ingredients.push(parsed);
          }
        }
      });
    }

    // Étapes de préparation
    const stepElements = doc.querySelectorAll(
      '[itemprop="recipeInstructions"] p, .recipe-preparation__list__item, .recipe-step-list__container .recipe-step'
    );

    stepElements.forEach((el, index) => {
      const text = el.textContent.trim();
      if (text && text.length > 10) {
        recipe.steps.push({
          number: index + 1,
          description: text
        });
      }
    });

    // Note
    const ratingEl = doc.querySelector('[itemprop="ratingValue"], .recipe-header__rating__value');
    if (ratingEl) {
      recipe.rating = parseFloat(ratingEl.textContent.trim());
    }

  } catch (error) {
    console.error('Erreur lors du parsing Marmiton:', error);
    throw new Error('Impossible d\'extraire les données de la recette');
  }

  // Validation
  if (!recipe.title) {
    throw new Error('Titre de recette introuvable');
  }

  return recipe;
};

/**
 * Parse une ligne d'ingrédient pour extraire quantité, unité et nom
 * @param {string} line - Ligne d'ingrédient
 * @returns {Object|null} - {quantity, unit, name}
 */
const parseIngredientLine = (line) => {
  if (!line || line.length === 0) return null;

  // Pattern: "300 g de farine" ou "2 oeufs" ou "1 cuillère à soupe d'huile"
  const patterns = [
    /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l|cuillère(?:s)?\s+à\s+(?:soupe|café)|c\.\s*à\s*(?:s|c)|pincée(?:s)?|sachet(?:s)?)?(?:\s+(?:de|d'))?\s*(.+)$/i,
    /^(.+?)\s*:\s*(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l)?$/i,
    /^(.+)$/
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      if (match.length === 4) {
        // Pattern avec quantité au début
        return {
          quantity: parseFloat(match[1].replace(',', '.')),
          unit: match[2] ? match[2].trim() : '',
          name: match[3].trim()
        };
      } else if (match.length === 2) {
        // Pattern sans quantité (juste le nom)
        return {
          quantity: null,
          unit: '',
          name: match[1].trim()
        };
      }
    }
  }

  return {
    quantity: null,
    unit: '',
    name: line.trim()
  };
};

/**
 * Parse une recette depuis JSON-LD (Schema.org)
 * @param {string} html - HTML de la page
 * @returns {Object|null} - Données de la recette ou null
 */
const parseJsonLd = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');

  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent);

      // Peut être un tableau
      const recipes = Array.isArray(data) ? data : [data];

      for (const item of recipes) {
        if (item['@type'] === 'Recipe') {
          // Gérer les différents formats d'image
          let imageUrl = null;
          if (item.image) {
            if (typeof item.image === 'string') {
              imageUrl = item.image;
            } else if (item.image.url) {
              imageUrl = item.image.url;
            } else if (Array.isArray(item.image) && item.image.length > 0) {
              imageUrl = typeof item.image[0] === 'string' ? item.image[0] : item.image[0].url;
            }
          }

          return {
            title: item.name,
            image: imageUrl,
            time: item.totalTime || item.prepTime,
            servings: item.recipeYield,
            category: item.recipeCategory || item.recipeCuisine,
            ingredients: Array.isArray(item.recipeIngredient)
              ? item.recipeIngredient.map(ing => parseIngredientLine(ing))
              : [],
            steps: Array.isArray(item.recipeInstructions)
              ? item.recipeInstructions.map((step, idx) => ({
                  number: idx + 1,
                  description: typeof step === 'string' ? step : step.text
                }))
              : [],
            rating: item.aggregateRating?.ratingValue
          };
        }
      }
    } catch (e) {
      console.log('Erreur parsing JSON-LD:', e);
    }
  }

  return null;
};

/**
 * Détecte le type de site depuis l'URL
 * @param {string} url - URL de la recette
 * @returns {string} - Type de site ('marmiton', '750g', 'jsonld', 'unknown')
 */
const detectSite = (url) => {
  if (url.includes('marmiton.org')) return 'marmiton';
  if (url.includes('750g.com')) return '750g';
  if (url.includes('ricardocuisine.com')) return 'jsonld';
  return 'unknown';
};

/**
 * Recherche une image depuis Unsplash
 * @param {string} query - Terme de recherche (titre de la recette)
 * @returns {Promise<string|null>} - URL de l'image ou null
 */
const getFallbackImage = async (query) => {
  try {
    // Utiliser l'API Unsplash (pas besoin de clé pour les requêtes basiques via source.unsplash.com)
    // On utilise une URL qui retourne directement une image aléatoire basée sur la recherche
    const searchTerm = encodeURIComponent(query + ' food');
    const imageUrl = `https://source.unsplash.com/800x600/?${searchTerm}`;

    return imageUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image de secours:', error);
    // Image par défaut si Unsplash échoue
    return 'https://source.unsplash.com/800x600/?food,recipe';
  }
};

/**
 * Importe une recette depuis une URL
 * @param {string} url - URL de la recette
 * @returns {Promise<Object>} - Données de la recette
 */
export const importRecipe = async (url) => {
  if (!url || !url.startsWith('http')) {
    throw new Error('URL invalide');
  }

  const siteType = detectSite(url);

  try {
    // Utiliser un proxy CORS pour éviter les erreurs CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const html = await response.text();

    let recipe;

    // Essayer JSON-LD d'abord (universel)
    const jsonLdData = parseJsonLd(html);
    if (jsonLdData && jsonLdData.title) {
      recipe = { ...jsonLdData, source: siteType, sourceUrl: url };
    } else {
      // Parser spécifique selon le site
      switch (siteType) {
        case 'marmiton':
          recipe = await parseMarmiton(html, url);
          break;

        case '750g':
          // TODO: Implémenter parser 750g
          throw new Error('Import depuis 750g pas encore implémenté');

        default:
          throw new Error('Site non supporté. Supportés: Marmiton, sites avec JSON-LD');
      }
    }

    // Si pas d'image, utiliser une banque d'images
    if (!recipe.image || recipe.image === '') {
      console.log('Pas d\'image trouvée, utilisation d\'une image de secours...');
      recipe.image = await getFallbackImage(recipe.title);
    }

    return recipe;

  } catch (error) {
    console.error('Erreur import recette:', error);
    throw error;
  }
};

export default { importRecipe };

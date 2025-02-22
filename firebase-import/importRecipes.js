// firebase-import/importRecipes.js
const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://recette-cuisine-4919f.firebaseio.com"
});

const db = admin.firestore();

const recipes = [
  {
    "title": "Pancakes",
    "ingredients": ["farine", "lait", "œufs", "sucre"],
    "steps": ["Mélanger les ingrédients secs.", "Ajouter les ingrédients humides.", "Cuire les pancakes."],
    "type": "Petit-déjeuner",
    "time": 20,
    "image": "https://placehold.co/600x400?text=Pancakes",
  },
  {
    "title": "Salade César",
    "ingredients": ["laitue", "poulet", "parmesan", "croutons"],
    "steps": ["Laver et couper la laitue.", "Ajouter le poulet grillé.", "Mélanger avec la vinaigrette."],
    "type": "Déjeuner",
    "time": 30,
    "image": "https://placehold.co/600x400?text=Salade+César",
  },
  {
    "title": "Spaghetti Bolognaise",
    "ingredients": ["spaghetti", "viande hachée", "tomates", "oignons", "ail"],
    "steps": ["Cuire les spaghetti.", "Préparer la sauce bolognaise.", "Mélanger les spaghetti avec la sauce."],
    "type": "Dîner",
    "time": 45,
    "image": "https://placehold.co/600x400?text=Spaghetti+Bolognaise",
  },
  {
    "title": "Cheesecake",
    "ingredients": ["crème fraîche", "sucre", "œufs", "biscuits écrasés", "beurre"],
    "steps": ["Préparer la base avec des biscuits écrasés.", "Mélanger les ingrédients pour la garniture.", "Cuire au four."],
    "type": "Dessert",
    "time": 60,
    "image": "https://placehold.co/600x400?text=Cheesecake",
  },
  {
    "title": "Soupe de Tomate",
    "ingredients": ["tomates", "oignons", "ail", "bouillon de légumes", "crème"],
    "steps": ["Faire revenir les oignons et l'ail.", "Ajouter les tomates et le bouillon.", "Mixer et ajouter la crème."],
    "type": "Soupe",
    "time": 35,
    "image": "https://placehold.co/600x400?text=Soupe+de+Tomate",
  }
];

const importRecipes = async () => {
  try {
    for (const recipe of recipes) {
      await db.collection('recipes').add(recipe);
      console.log('Recipe added:', recipe.title);
    }
    console.log('All recipes imported successfully.');
  } catch (error) {
    console.error('Error importing recipes:', error);
  }
};

importRecipes();

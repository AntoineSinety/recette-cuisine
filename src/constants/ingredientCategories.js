// Catégories d'ingrédients par rayon de magasin
export const INGREDIENT_CATEGORIES = [
  { value: '', label: 'Non catégorisé', icon: '📦', order: 99 },
  { value: 'fruits-legumes', label: 'Fruits & Légumes', icon: '🥕', order: 1 },
  { value: 'boucherie', label: 'Boucherie / Viande', icon: '🥩', order: 2 },
  { value: 'poissonnerie', label: 'Poissonnerie', icon: '🐟', order: 3 },
  { value: 'produits-frais', label: 'Produits frais / Crèmerie', icon: '🧀', order: 4 },
  { value: 'boulangerie', label: 'Boulangerie / Pain', icon: '🥖', order: 5 },
  { value: 'epicerie-salee', label: 'Épicerie salée', icon: '🥫', order: 6 },
  { value: 'epicerie-sucree', label: 'Épicerie sucrée', icon: '🍪', order: 7 },
  { value: 'condiments', label: 'Condiments / Sauces', icon: '🧂', order: 8 },
  { value: 'surgeles', label: 'Surgelés', icon: '❄️', order: 9 },
  { value: 'boissons', label: 'Boissons', icon: '🥤', order: 10 },
  { value: 'autres', label: 'Autres', icon: '📦', order: 11 }
];

// Fonction helper pour obtenir les infos d'une catégorie
export const getCategoryInfo = (categoryValue) => {
  return INGREDIENT_CATEGORIES.find(cat => cat.value === categoryValue)
    || INGREDIENT_CATEGORIES.find(cat => cat.value === '');
};

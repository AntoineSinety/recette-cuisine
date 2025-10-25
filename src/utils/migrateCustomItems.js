import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Script de migration pour déplacer les custom items de toutes les semaines
 * vers le document global 'globalCustomItems'
 */
export const migrateCustomItemsToGlobal = async () => {
  try {
    console.log('Début de la migration des custom items...');

    // Récupérer tous les documents de shoppingLists
    const shoppingListsRef = collection(db, 'shoppingLists');
    const querySnapshot = await getDocs(shoppingListsRef);

    // Collecter tous les custom items de toutes les semaines
    const allCustomItems = [];
    const seenIds = new Set();

    querySnapshot.forEach((docSnap) => {
      if (docSnap.id === 'globalCustomItems') {
        // Ignorer le document global si il existe déjà
        return;
      }

      const data = docSnap.data();
      const customItems = data.customItems || [];

      console.log(`Semaine ${docSnap.id}: ${customItems.length} custom items trouvés`);

      // Ajouter uniquement les items uniques (éviter les doublons)
      customItems.forEach(item => {
        if (!seenIds.has(item.id)) {
          allCustomItems.push(item);
          seenIds.add(item.id);
        }
      });
    });

    console.log(`Total: ${allCustomItems.length} custom items uniques trouvés`);

    // Vérifier si le document global existe déjà
    const globalDocRef = doc(db, 'shoppingLists', 'globalCustomItems');
    const globalDocSnap = await getDoc(globalDocRef);

    let existingItems = [];
    if (globalDocSnap.exists()) {
      existingItems = globalDocSnap.data().customItems || [];
      console.log(`${existingItems.length} items déjà présents dans globalCustomItems`);
    }

    // Fusionner avec les items existants (éviter les doublons)
    const existingIds = new Set(existingItems.map(item => item.id));
    const newItems = allCustomItems.filter(item => !existingIds.has(item.id));

    const mergedItems = [...existingItems, ...newItems];

    // Sauvegarder dans le document global
    await setDoc(globalDocRef, {
      customItems: mergedItems,
      lastUpdated: new Date(),
      migratedAt: new Date().toISOString()
    });

    console.log(`Migration terminée: ${mergedItems.length} custom items au total`);
    console.log(`- ${existingItems.length} items existants`);
    console.log(`- ${newItems.length} nouveaux items migrés`);

    return {
      success: true,
      total: mergedItems.length,
      existing: existingItems.length,
      migrated: newItems.length,
      items: mergedItems
    };
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    throw error;
  }
};

// Pour une utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  window.migrateCustomItems = migrateCustomItemsToGlobal;
}

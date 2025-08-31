/**
 * Utilitaire pour convertir et formater les unités d'ingrédients
 */

// Types d'unités supportées
export const UNIT_TYPES = {
  WEIGHT: 'weight',
  VOLUME: 'volume',
  PIECE: 'piece'
};

// Configuration des unités
export const UNITS_CONFIG = {
  // Poids
  'g': { type: UNIT_TYPES.WEIGHT, name: 'gramme', plural: 'grammes', baseUnit: 'g', factor: 1 },
  'gramme': { type: UNIT_TYPES.WEIGHT, name: 'gramme', plural: 'grammes', baseUnit: 'g', factor: 1 },
  'grammes': { type: UNIT_TYPES.WEIGHT, name: 'gramme', plural: 'grammes', baseUnit: 'g', factor: 1 },
  'kg': { type: UNIT_TYPES.WEIGHT, name: 'kilogramme', plural: 'kilogrammes', baseUnit: 'g', factor: 1000 },
  'kilogramme': { type: UNIT_TYPES.WEIGHT, name: 'kilogramme', plural: 'kilogrammes', baseUnit: 'g', factor: 1000 },
  'kilogrammes': { type: UNIT_TYPES.WEIGHT, name: 'kilogramme', plural: 'kilogrammes', baseUnit: 'g', factor: 1000 },

  // Volume
  'ml': { type: UNIT_TYPES.VOLUME, name: 'millilitre', plural: 'millilitres', baseUnit: 'ml', factor: 1 },
  'millilitre': { type: UNIT_TYPES.VOLUME, name: 'millilitre', plural: 'millilitres', baseUnit: 'ml', factor: 1 },
  'millilitres': { type: UNIT_TYPES.VOLUME, name: 'millilitre', plural: 'millilitres', baseUnit: 'ml', factor: 1 },
  'cl': { type: UNIT_TYPES.VOLUME, name: 'centilitre', plural: 'centilitres', baseUnit: 'ml', factor: 10 },
  'centilitre': { type: UNIT_TYPES.VOLUME, name: 'centilitre', plural: 'centilitres', baseUnit: 'ml', factor: 10 },
  'centilitres': { type: UNIT_TYPES.VOLUME, name: 'centilitre', plural: 'centilitres', baseUnit: 'ml', factor: 10 },
  'l': { type: UNIT_TYPES.VOLUME, name: 'litre', plural: 'litres', baseUnit: 'ml', factor: 1000 },
  'litre': { type: UNIT_TYPES.VOLUME, name: 'litre', plural: 'litres', baseUnit: 'ml', factor: 1000 },
  'litres': { type: UNIT_TYPES.VOLUME, name: 'litre', plural: 'litres', baseUnit: 'ml', factor: 1000 },

  // Unités de mesure courantes
  'cuillère à café': { type: UNIT_TYPES.VOLUME, name: 'cuillère à café', plural: 'cuillères à café', baseUnit: 'ml', factor: 5 },
  'cuillères à café': { type: UNIT_TYPES.VOLUME, name: 'cuillère à café', plural: 'cuillères à café', baseUnit: 'ml', factor: 5 },
  'c. à café': { type: UNIT_TYPES.VOLUME, name: 'cuillère à café', plural: 'cuillères à café', baseUnit: 'ml', factor: 5 },
  'cuillère à soupe': { type: UNIT_TYPES.VOLUME, name: 'cuillère à soupe', plural: 'cuillères à soupe', baseUnit: 'ml', factor: 15 },
  'cuillères à soupe': { type: UNIT_TYPES.VOLUME, name: 'cuillère à soupe', plural: 'cuillères à soupe', baseUnit: 'ml', factor: 15 },
  'c. à soupe': { type: UNIT_TYPES.VOLUME, name: 'cuillère à soupe', plural: 'cuillères à soupe', baseUnit: 'ml', factor: 15 },
  'tasse': { type: UNIT_TYPES.VOLUME, name: 'tasse', plural: 'tasses', baseUnit: 'ml', factor: 250 },
  'tasses': { type: UNIT_TYPES.VOLUME, name: 'tasse', plural: 'tasses', baseUnit: 'ml', factor: 250 },
  'verre': { type: UNIT_TYPES.VOLUME, name: 'verre', plural: 'verres', baseUnit: 'ml', factor: 200 },
  'verres': { type: UNIT_TYPES.VOLUME, name: 'verre', plural: 'verres', baseUnit: 'ml', factor: 200 },

  // Unités (pièces)
  'unité': { type: UNIT_TYPES.PIECE, name: 'unité', plural: 'unités', baseUnit: 'unité', factor: 1 },
  'unités': { type: UNIT_TYPES.PIECE, name: 'unité', plural: 'unités', baseUnit: 'unité', factor: 1 },
  'pièce': { type: UNIT_TYPES.PIECE, name: 'pièce', plural: 'pièces', baseUnit: 'unité', factor: 1 },
  'pièces': { type: UNIT_TYPES.PIECE, name: 'pièce', plural: 'pièces', baseUnit: 'unité', factor: 1 },
  '': { type: UNIT_TYPES.PIECE, name: 'unité', plural: 'unités', baseUnit: 'unité', factor: 1 }
};

/**
 * Normalise une unité (enlève les espaces, met en minuscule)
 */
export const normalizeUnit = (unit) => {
  if (!unit) return '';
  return unit.toString().toLowerCase().trim();
};

/**
 * Récupère la configuration d'une unité
 */
export const getUnitConfig = (unit) => {
  const normalizedUnit = normalizeUnit(unit);
  return UNITS_CONFIG[normalizedUnit] || UNITS_CONFIG[''];
};

/**
 * Convertit une quantité vers l'unité de base
 */
export const convertToBaseUnit = (quantity, unit) => {
  const config = getUnitConfig(unit);
  return quantity * config.factor;
};

/**
 * Formate une quantité avec la meilleure unité pour l'affichage
 */
export const formatQuantityWithBestUnit = (quantity, unit) => {
  const config = getUnitConfig(unit);
  
  if (config.type === UNIT_TYPES.WEIGHT) {
    // Conversion automatique g -> kg
    if (config.baseUnit === 'g') {
      const totalGrams = quantity * config.factor;
      
      if (totalGrams >= 1000) {
        const kg = totalGrams / 1000;
        if (kg % 1 === 0) {
          return `${kg} kg`;
        } else {
          return `${kg.toFixed(kg < 10 ? 1 : 0)} kg`;
        }
      } else {
        return `${totalGrams} g`;
      }
    }
  } else if (config.type === UNIT_TYPES.VOLUME) {
    // Conversion automatique ml -> cl -> l
    if (config.baseUnit === 'ml') {
      const totalMl = quantity * config.factor;
      
      if (totalMl >= 1000) {
        const liters = totalMl / 1000;
        if (liters % 1 === 0) {
          return `${liters} l`;
        } else {
          return `${liters.toFixed(liters < 10 ? 1 : 0)} l`;
        }
      } else if (totalMl >= 100 && totalMl % 10 === 0) {
        const cl = totalMl / 10;
        return `${cl} cl`;
      } else {
        return `${totalMl} ml`;
      }
    }
  }
  
  // Pour les unités normales ou non convertibles
  const displayUnit = quantity > 1 ? config.plural : config.name;
  
  // Format de la quantité
  let formattedQuantity;
  if (quantity % 1 === 0) {
    formattedQuantity = quantity.toString();
  } else if (quantity < 1) {
    formattedQuantity = quantity.toFixed(2).replace(/\.?0+$/, '');
  } else {
    formattedQuantity = quantity.toFixed(1).replace(/\.0$/, '');
  }
  
  return `${formattedQuantity} ${displayUnit}`;
};

/**
 * Vérifie si deux unités sont du même type et peuvent être additionnées
 */
export const canCombineUnits = (unit1, unit2) => {
  const config1 = getUnitConfig(unit1);
  const config2 = getUnitConfig(unit2);
  
  return config1.type === config2.type && config1.baseUnit === config2.baseUnit;
};

/**
 * Combine deux quantités avec leurs unités si possible
 */
export const combineQuantities = (quantity1, unit1, quantity2, unit2) => {
  if (!canCombineUnits(unit1, unit2)) {
    return null; // Ne peuvent pas être combinées
  }
  
  const baseQuantity1 = convertToBaseUnit(quantity1, unit1);
  const baseQuantity2 = convertToBaseUnit(quantity2, unit2);
  const totalBaseQuantity = baseQuantity1 + baseQuantity2;
  
  // Retourner avec la meilleure unité d'affichage
  const config1 = getUnitConfig(unit1);
  return {
    quantity: totalBaseQuantity / config1.factor,
    unit: unit1,
    formattedDisplay: formatQuantityWithBestUnit(totalBaseQuantity / config1.factor, unit1)
  };
};
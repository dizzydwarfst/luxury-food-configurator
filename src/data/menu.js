/**
 * Menu Brain: Stations, items, and Bitmask logic for variant IDs.
 */
const ingredient = (id, name, bitValue) => ({ id, name, bitValue })

export const STATIONS = [
  { id: 'pan-fry', name: 'Pan Fry' },
  { id: 'apps', name: 'Apps' },
  { id: 'entree', name: 'Entree' },
  { id: 'salads', name: 'Salads' },
  { id: 'ovens', name: 'Ovens' },
  { id: 'drinks-bar', name: 'Drinks & Bar' },
]

/**
 * Each item has a baseId and ingredients with bitValues.
 * Variant ID = baseId + sum(bitValue for each active ingredient).
 * Example: Pizza (100) + Plate (1) + Pizza (2) = 103.
 */
export const MENU_ITEMS = [
  // Pan Fry
  {
    id: 'garlic-butter-shrimp',
    name: 'Garlic Butter Shrimp',
    stationId: 'pan-fry',
    baseId: 50,
    modelType: 'placeholder',
    placeholderShape: 'sphere',
    ingredients: [
      ingredient('shrimp', 'Shrimp', 1),
      ingredient('garlic', 'Garlic', 2),
      ingredient('butter', 'Butter', 4),
    ],
  },
  // Apps
  {
    id: 'truffle-fries',
    name: 'Truffle Fries',
    stationId: 'apps',
    baseId: 75,
    modelType: 'placeholder',
    placeholderShape: 'cylinder',
    ingredients: [
      ingredient('fries', 'Fries', 1),
      ingredient('truffle', 'Truffle', 2),
      ingredient('parmesan', 'Parmesan', 4),
    ],
  },
  // Entree
  {
    id: 'filet-mignon',
    name: 'Filet Mignon',
    stationId: 'entree',
    baseId: 90,
    modelType: 'placeholder',
    placeholderShape: 'sphere',
    ingredients: [
      ingredient('steak', 'Steak', 1),
      ingredient('pepper-sauce', 'Pepper Sauce', 2),
      ingredient('herb-butter', 'Herb Butter', 4),
    ],
  },
  // Ovens
  {
    id: 'pizza',
    name: 'Signature Pizza',
    stationId: 'ovens',
    baseId: 100,
    modelType: 'pizza',
    ingredients: [
      ingredient('plate', 'Plate', 1),
      ingredient('pizza', 'Pizza', 2),
      ingredient('steam', 'Steam', 4),
    ],
  },
  // Salads
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    stationId: 'salads',
    baseId: 200,
    modelType: 'placeholder',
    placeholderShape: 'sphere',
    ingredients: [
      ingredient('lettuce', 'Lettuce', 1),
      ingredient('croutons', 'Croutons', 2),
      ingredient('parmesan', 'Parmesan', 4),
    ],
  },
  // Drinks & Bar
  {
    id: 'mojito',
    name: 'Mojito',
    stationId: 'drinks-bar',
    baseId: 300,
    modelType: 'placeholder',
    placeholderShape: 'cylinder',
    ingredients: [
      ingredient('mint', 'Mint', 1),
      ingredient('lime', 'Lime', 2),
      ingredient('rum', 'Rum', 4),
    ],
  },
]

/**
 * Get all items for a station.
 */
export function getItemsByStation(stationId) {
  return MENU_ITEMS.filter((item) => item.stationId === stationId)
}

/**
 * Get a single menu item by id.
 */
export function getMenuItem(itemId) {
  return MENU_ITEMS.find((item) => item.id === itemId) ?? null
}

/**
 * Get station name by id.
 */
export function getStationName(stationId) {
  return STATIONS.find((station) => station.id === stationId)?.name ?? stationId
}

/**
 * Compute variant ID from baseId and active ingredients.
 * activeIngredients: { [ingredientId]: true | false }
 * Returns baseId + sum(bitValue for each active ingredient).
 */
export function calculateVariantID(baseId, activeIngredients, ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return baseId
  const sum = ingredients.reduce(
    (acc, ing) => acc + (activeIngredients?.[ing.id] ? ing.bitValue : 0),
    0
  )
  return baseId + sum
}

/**
 * Menu Brain: Stations, items, and Bitmask logic for variant IDs.
 */

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
  // Ovens
  {
    id: 'pizza',
    name: 'Signature Pizza',
    stationId: 'ovens',
    baseId: 100,
    modelType: 'pizza',
    ingredients: [
      { id: 'plate', name: 'Plate', bitValue: 1 },
      { id: 'pizza', name: 'Pizza', bitValue: 2 },
      { id: 'steam', name: 'Steam', bitValue: 4 },
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
      { id: 'lettuce', name: 'Lettuce', bitValue: 1 },
      { id: 'croutons', name: 'Croutons', bitValue: 2 },
      { id: 'parmesan', name: 'Parmesan', bitValue: 4 },
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
      { id: 'mint', name: 'Mint', bitValue: 1 },
      { id: 'lime', name: 'Lime', bitValue: 2 },
      { id: 'rum', name: 'Rum', bitValue: 4 },
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
 * Compute variant ID from baseId and active ingredients.
 * activeIngredients: { [ingredientId]: true | false }
 * Returns baseId + sum(bitValue for each active ingredient).
 */
export function calculateVariantID(baseId, activeIngredients, ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return baseId
  const sum = ingredients.reduce((acc, ing) => {
    if (activeIngredients[ing.id]) return acc + ing.bitValue
    return acc
  }, 0)
  return baseId + sum
}

import axios from 'axios';
/**
 * ACTION TYPES
 */
const ADD_RESULTS = 'ADD_RESULTS';
const CLEAR_RESULTS = 'CLEAR_RESULTS';

/**
 * INITIAL STATE
 */
const INITIAL_STATE = [];

/**
 * ACTION CREATORS
 */
const addResultsAction = bannedItemsFound => ({
  type: ADD_RESULTS,
  bannedItemsFound,
});

export const clearResultsAction = () => ({ type: CLEAR_RESULTS });

/**
 * THUNK CREATORS
 */

export const addResults = (barCode, selectedItems) => async dispatch => {
  try {
    let bannedItemsFound = [];
    const { data } = await axios(
      `https://world.openfoodfacts.org/api/v0/product/${barCode}.json`
    );
    console.log('---------------------->', data);
    if (
      !data.product ||
      !data.product.ingredients ||
      !data.product.ingredients.length
    ) {
      bannedItemsFound.push('Sorry, product was not found.');
    } else {
      const ingredients = data.product.ingredients;
      //check if item ingredients includes banned items
      for (let i = 0; i < ingredients.length; i++) {
        for (let j = 0; j < selectedItems.length; j++) {
          const currentIngredient = ingredients[i].text.toLowerCase();
          const bannedItem = selectedItems[j].toLowerCase();
          console.log("CURRENT", currentIngredient)
          if (currentIngredient.includes(bannedItem)) {
            if (!bannedItemsFound.includes(bannedItem))
              bannedItemsFound.push(bannedItem);
            //  console.log("--------------> Found a banned item", ingredients[i].text, selectedItems[j])
          }
        }
      }
      //check for gluten
      if (selectedItems.includes('Gluten') && data.product.allergens_tags) {
        data.product.allergens_tags.forEach(allergen => {
          if (allergen.includes('gluten')) {
            bannedItemsFound.push('Gluten');
          }
        });
      }
    }
    if (!bannedItemsFound.length) bannedItemsFound.push('No banned items!');
    dispatch(addResultsAction(bannedItemsFound));
  } catch (error) {
    console.log('Results not found');
    console.error(error);
  }
};

/**
 * REDUCER
 */
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_RESULTS:
      return action.bannedItemsFound;
    case CLEAR_RESULTS:
      return [];
    default:
      return state;
  }
}

// === api.js ===
const API_KEY = "65232507";
const BASE_URL = `https://www.themealdb.com/api/json/v2/${API_KEY}`;

async function fetchMealsByIngredient(ingredient) {
  const response = await fetch(`${BASE_URL}/filter.php?i=${ingredient}`);
  const data = await response.json();
  return data.meals || [];
}

async function fetchMealById(id) {
  const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await response.json();
  return data.meals ? data.meals[0] : null;
}

async function fetchMealsByIngredients(ingredients) {
    if (ingredients.length === 0) return [];
  
    const results = await Promise.all(
      ingredients.map(ing => fetchMealsByIngredient(ing))
    );
  
    const matchCount = {};
    const mealData = {};
  
    results.forEach(meals => {
      meals.forEach(meal => {
        if (!matchCount[meal.idMeal]) {
          matchCount[meal.idMeal] = 0;
          mealData[meal.idMeal] = meal;
        }
        matchCount[meal.idMeal]++;
      });
    });
  
    const sorted = Object.values(mealData).sort((a, b) =>
      matchCount[b.idMeal] - matchCount[a.idMeal]
    );
  
    // Attach match info directly to each meal object
    sorted.forEach(meal => {
      meal._matchCount = matchCount[meal.idMeal];
      meal._totalIngredients = ingredients.length;
    });
  
    return sorted.slice(0, 16);
  }
// Fetch meals by category from API
async function fetchMealsByCategory(category) {
  const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
  const data = await response.json();
  return data.meals || [];
}

async function searchIngredients(query) {
  if (!query || query.length < 2) return [];
  const response = await fetch(`${BASE_URL}/list.php?i=list`);
  const data = await response.json();
  if (!data.meals) return [];
  
  // Filter the full ingredient list locally by the query
  return data.meals.filter(ing =>
    ing.strIngredient.toLowerCase().startsWith(query.toLowerCase())
  );
}
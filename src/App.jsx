import React from "react";

import { useState } from "react";

import "./App.css";

function formatNutrition(value) {

  if (value === null || value === undefined || value === "") {

    return "N/A";

  }

  const number = Number(value);

  return Number.isFinite(number) ? number.toFixed(1) : "N/A";

}

function App() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [ingredients, setIngredients] = useState("");

  const [recipes, setRecipes] = useState([]);

  const [allRecipes, setAllRecipes] = useState([]);

  const [hasSearched, setHasSearched] = useState(false);

  const [maxCookingTime, setMaxCookingTime] = useState("any");

  const [dietaryFilter, setDietaryFilter] = useState("all");

  const [sortBy, setSortBy] = useState("match");

  const [showAuth, setShowAuth] = useState(false);

const [authMode, setAuthMode] = useState("login");

const [userEmail, setUserEmail] = useState("");

const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");

const [welcomeType, setWelcomeType] = useState(() => localStorage.getItem("welcomeType") || "back");

const [userPassword, setUserPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [recipeIngredients, setRecipeIngredients] = useState([]);

  const [missingIngredients, setMissingIngredients] = useState([]); 

  const [nutrition, setNutrition] = useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [showFavorites, setShowFavorites] = useState(false);

  const [favorites, setFavorites] = useState([]);

  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [showShoppingList, setShowShoppingList] = useState(false);

  const [shoppingList, setShoppingList] = useState([]);

  const [shoppingLoading, setShoppingLoading] = useState(false);

  const [showMealPlanner, setShowMealPlanner] = useState(false);

const [mealPlans, setMealPlans] = useState([]);

const [mealPlanLoading, setMealPlanLoading] = useState(false);

const [planStartDate, setPlanStartDate] = useState(() => {

  const today = new Date();

  const day = today.getDay();

  const mondayOffset = day === 0 ? -6 : 1 - day;

  today.setDate(today.getDate() + mondayOffset);

  return today.toISOString().split("T")[0];

});

const [planDate, setPlanDate] = useState(

  new Date().toISOString().split("T")[0]

);

const [planMealType, setPlanMealType] = useState("breakfast");

const [planRecipeId, setPlanRecipeId] = useState("");

const [showMealForm, setShowMealForm] = useState(false);

const [showCookingHistory, setShowCookingHistory] = useState(false);

const [cookingHistory, setCookingHistory] = useState([]);

const [cookingHistoryLoading, setCookingHistoryLoading] = useState(false);

  const [authMessage, setAuthMessageState] = useState("");

  const [appMessage, setAppMessageState] = useState("");

  // Clear screen state that belongs to the previous signed-in session.
  // The public recipe catalogue (allRecipes) is intentionally preserved.
  const clearAccountSessionData = () => {
    setIngredients("");
    setRecipes([]);
    setHasSearched(false);
    setMaxCookingTime("any");
    setDietaryFilter("all");
    setSortBy("match");
    setFavorites([]);
    setShoppingList([]);
    setMealPlans([]);
    setCookingHistory([]);
    setSelectedRecipe(null);
    setRecipeIngredients([]);
    setMissingIngredients([]);
    setNutrition(null);
    setShowFavorites(false);
    setShowShoppingList(false);
    setShowMealPlanner(false);
    setShowCookingHistory(false);
    setShowMealForm(false);
    setPlanRecipeId("");
    setMobileMenuOpen(false);
  };

  // Keep notification timers in one place so older timers cannot clear newer messages.
  const appMessageTimer = React.useRef(null);
  const authMessageTimer = React.useRef(null);

  const setAppMessage = (message, duration) => {
    if (appMessageTimer.current) {
      clearTimeout(appMessageTimer.current);
      appMessageTimer.current = null;
    }

    setAppMessageState(message);
    if (!message) return;

    const messageText = String(message);
    const isError = /could not|couldn.t|failed|error|expired|not authorized|unable|unavailable|something went wrong/i.test(messageText);
    const displayDuration = duration ?? (isError ? 5000 : 3000);

    appMessageTimer.current = setTimeout(() => {
      setAppMessageState("");
      appMessageTimer.current = null;
    }, displayDuration);
  };

  // Login/register form messages stay visible for 2 seconds.
  const setAuthMessage = (message, duration = 2000) => {
    if (authMessageTimer.current) {
      clearTimeout(authMessageTimer.current);
      authMessageTimer.current = null;
    }

    setAuthMessageState(message);
    if (!message) return;

    authMessageTimer.current = setTimeout(() => {
      setAuthMessageState("");
      authMessageTimer.current = null;
    }, duration);
  };

const handleLogout = () => {

  clearAccountSessionData();

  localStorage.removeItem("token");

  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

  setUserEmail("");

  setUserPassword("");

  setFavorites([]);

  setShoppingList([]);

  setSelectedRecipe(null);

  setRecipeIngredients([]);

  setNutrition(null);

  setShowFavorites(false);

  setShowShoppingList(false);

  setShowMealPlanner(false);

  setMealPlans([]);

  setCookingHistory([]);

  setShowCookingHistory(false);

  setShowAuth(false);

  setAppMessage("You have logged out successfully.");

};

const loadAllRecipes = async () => {

  try {

    const response = await fetch("https://plan-your-plate-backend.onrender.com/api/recipes");

    if (!response.ok) {

      throw new Error("Could not load recipes.");

    }

    const data = await response.json();

    setAllRecipes(data);

  } catch (error) {

    setAppMessage(error.message || "Could not load recipes.");

  }

};

React.useEffect(() => {

  loadAllRecipes();

}, []);

const loadCookingHistory = async () => {

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to view your Cooking History.");

    setAuthMode("login");

    setShowAuth(true);

    return;

  }

  setCookingHistoryLoading(true);

  try {

    const response = await fetch("https://plan-your-plate-backend.onrender.com/api/cooking-history", {

      headers: { Authorization: `Bearer ${token}` },

    });

    if (response.status === 401 || response.status === 403) {

      localStorage.removeItem("token");

      localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

      setCookingHistory([]);

      setAppMessage("Your session may have expired. Please log in again.");

      setAuthMode("login");

      setShowAuth(true);

      setShowCookingHistory(false);

      return;

    }

    if (!response.ok) throw new Error("Could not load Cooking History.");

    setCookingHistory(await response.json());

  } catch (error) {

    setAppMessage(error.message || "Could not load Cooking History.");

  } finally {

    setCookingHistoryLoading(false);

  }

};

const markRecipeAsCooked = async () => {

  if (!selectedRecipe) return;

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to record a cooked recipe.");

    setAuthMode("login");

    setShowAuth(true);

    return;

  }

  try {

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/cooking-history?recipeId=${selectedRecipe.id}`,

      {

        method: "POST",

        headers: { Authorization: `Bearer ${token}` },

      }

    );

    if (response.status === 401 || response.status === 403) {

      throw new Error("Your session may have expired. Please log in again.");

    }

    if (!response.ok) throw new Error("Could not record this recipe as cooked.");

    setAppMessage("Recipe added to your Cooking History! 🍳");

    await loadCookingHistory();

  } catch (error) {

    setAppMessage(error.message || "Could not update Cooking History.");

  }

};

const openCookingHistory = async () => {

  setSelectedRecipe(null);

  setRecipeIngredients([]);

  setNutrition(null);

  setShowFavorites(false);

  setShowShoppingList(false);

  setShowMealPlanner(false);

  setShowCookingHistory(true);

  await loadCookingHistory();

};

const loadMealPlans = async () => {

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to use the meal planner.");

    setShowAuth(true);

    setAuthMode("login");

    return;

  }

  try {

    setMealPlanLoading(true);

    const start = new Date(`${planStartDate}T12:00:00`);

    const end = new Date(start);

    end.setDate(end.getDate() + 6);

    const formatDate = (date) => {

      const year = date.getFullYear();

      const month = String(date.getMonth() + 1).padStart(2, "0");

      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;

    };

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/meal-plans?startDate=${planStartDate}&endDate=${formatDate(end)}`,

      {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    if (!response.ok) {

      throw new Error("Could not load meal plans.");

    }

    setMealPlans(await response.json());

  } catch (error) {

    setAppMessage(error.message || "Could not load meal plans.");

  } finally {

    setMealPlanLoading(false);

  }

};

const openMealPlanner = () => {

  setShowCookingHistory(false);

  setShowFavorites(false);

  setShowShoppingList(false);

  setShowMealPlanner(true);

  loadAllRecipes();

  loadMealPlans();

};

const addMealPlan = async () => {

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to add a meal.");

    setShowAuth(true);

    setAuthMode("login");

    return;

  }

  if (!planRecipeId || !planDate || !planMealType) {

    setAppMessage("Please select a recipe, date, and meal type.");

    return;

  }

  try {

    setMealPlanLoading(true);

    const params = new URLSearchParams({

      recipeId: planRecipeId,

      planDate,

      mealType: planMealType,

    });

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/meal-plans?${params.toString()}`,

      {

        method: "POST",

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    if (!response.ok) {

      throw new Error("Could not add this meal to your plan.");

    }

    setAppMessage("Meal added to your weekly plan!");

    await loadMealPlans();

  } catch (error) {

    setAppMessage(error.message || "Could not add meal.");

  } finally {

    setMealPlanLoading(false);

  }

};

const removeMealPlan = async (id) => {

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to manage your meal plan.");

    return;

  }

  try {

    setMealPlanLoading(true);

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/meal-plans/${id}`,

      {

        method: "DELETE",

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    if (!response.ok) {

      throw new Error("Could not remove this planned meal.");

    }

    setAppMessage("Meal removed from your plan.");

    await loadMealPlans();

  } catch (error) {

    setAppMessage(error.message || "Could not remove meal.");

  } finally {

    setMealPlanLoading(false);

  }

};

  // ==============================

  // FIND RECIPES

  // ==============================

  const findRecipes = async () => {
    if (!ingredients.trim()) {
      setAppMessage("Please enter at least one ingredient.");
      return;
    }

    setLoading(true);
    setAppMessage("");

    try {
      const response = await fetch(
        `https://plan-your-plate-backend.onrender.com/api/recommendations?ingredients=${encodeURIComponent(ingredients)}`
      );

      if (!response.ok) {
        throw new Error("Could not get recommendations");
      }

      const recommendationData = await response.json();
      const recommendations = Array.isArray(recommendationData)
        ? recommendationData.map((recipe) => ({
            ...recipe,
            recipeId: recipe.recipeId ?? recipe.id,
            recipeName: recipe.recipeName ?? recipe.name,
            isRecommendation: true,
          }))
        : [];

      // Load the complete catalogue as well as the matching recommendations.
      const allRecipesResponse = await fetch("https://plan-your-plate-backend.onrender.com/api/recipes");

      if (!allRecipesResponse.ok) {
        throw new Error("Could not load the complete recipe list.");
      }

      const catalogue = await allRecipesResponse.json();
      const safeCatalogue = Array.isArray(catalogue) ? catalogue : [];
      setAllRecipes(safeCatalogue);

      // Keep the recommended recipes first, then add catalogue recipes that
      // were not returned by the recommendation endpoint.
      const recommendedIds = new Set(
        recommendations
          .map((recipe) => Number(recipe.recipeId ?? recipe.id))
          .filter(Number.isFinite)
      );

      const remainingRecipes = safeCatalogue
        .filter((recipe) => !recommendedIds.has(Number(recipe.id)))
        .map((recipe) => ({
          recipeId: recipe.id,
          recipeName: recipe.name,
          matchPercentage: 0,
          missingIngredients: [],
          isRecommendation: false,
        }));

      setRecipes([...recommendations, ...remainingRecipes]);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      setRecipes([]);
      setHasSearched(true);
      setAppMessage(
        error.message ||
          "Couldn't connect to the server. Please make sure the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };

const handleAuth = async (e) => {

  e.preventDefault();

  setAuthMessage("");

  const endpoint = authMode === "login" ? "login" : "register";

  try {

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/auth/${endpoint}`,

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          name: document.getElementById("auth-name")?.value || "",

          email: userEmail,

          password: userPassword,

        }),

      }

    );

    let data = await response.json();

    if (!response.ok) {

      setAuthMessage(

        typeof data === "string"

          ? data

          : data.message || "Something went wrong. Please try again."

      );

      return;

    }

    // Registration creates the account, but the backend does not issue a JWT
    // from /register. Log the new user in immediately so Favorites and other
    // authenticated features work without asking them to log in again.
    if (authMode === "register") {
      const loginResponse = await fetch("https://plan-your-plate-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: userPassword }),
      });
      const loginData = await loginResponse.json();

      if (!loginResponse.ok || !loginData.token) {
        setAuthMessage(
          "Registration succeeded, but automatic login failed. Please log in with your new account."
        );
        setAuthMode("login");
        return;
      }

      data = loginData;
    }

    const accountEmail = (data.email || userEmail).trim().toLowerCase();
    const accountName = (data.name || document.getElementById("auth-name")?.value || "").trim()
      || accountEmail.split("@")[0]
      || "there";
    const firstLoginKey = `hasLoggedInBefore:${accountEmail}`;

    // Start each account with a clean UI so data from the previous account
    // is not left visible while the new account's data is loaded.
    clearAccountSessionData();

    if (authMode === "login") {

      const hasLoggedInBefore = localStorage.getItem(firstLoginKey) === "true";
      const nextWelcomeType = hasLoggedInBefore ? "back" : "welcome";

      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email || userEmail);
      localStorage.setItem("userName", accountName);
      localStorage.setItem("welcomeType", nextWelcomeType);
      localStorage.setItem(firstLoginKey, "true");
      setUserName(accountName);
      setWelcomeType(nextWelcomeType);

    } else {

      // Registration automatically logs the new user in and shows a first-time greeting.
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email || userEmail);
      localStorage.setItem("userName", accountName);
      localStorage.setItem("welcomeType", "welcome");
      localStorage.setItem(firstLoginKey, "true");
      setUserName(accountName);
      setWelcomeType("welcome");

    }

    setUserEmail("");

setUserPassword("");

setShowAuth(false);

setAuthMessage("");

setAppMessage(

  authMode === "login"

    ? "Login successful! 🎉 Welcome back!"

    : "Registration successful! 🎉 Welcome!",
  2000

);

  } catch (error) {

    console.error(error);

    setAuthMessage("Could not connect to the server. Please try again.");

  }

};

  // ==============================

  // VIEW RECIPE

  // ==============================

const viewRecipe = async (recipeId, missing = []) => {

  setAppMessage("");

  setDetailsLoading(true);

  setShowFavorites(false);

  setShowShoppingList(false);

  setSelectedRecipe(null);

  setRecipeIngredients([]);

  setMissingIngredients(missing);

  setNutrition(null);

  try {

    // Recipe details are essential.

    const recipeResponse = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/recipes/${recipeId}`

    );

    if (!recipeResponse.ok) {

      throw new Error("Could not load recipe details.");

    }

    const recipe = await recipeResponse.json();

    setSelectedRecipe(recipe);

    // Ingredients and nutrition are loaded separately.

    // Missing data should not prevent the recipe from opening.

    const [ingredientsResult, nutritionResult] =

      await Promise.allSettled([

        fetch("https://plan-your-plate-backend.onrender.com/api/recipe-ingredients"),

        fetch(`https://plan-your-plate-backend.onrender.com/api/nutrition/${recipeId}`)

      ]);

    if (

      ingredientsResult.status === "fulfilled" &&

      ingredientsResult.value.ok

    ) {

      const allIngredients =

        await ingredientsResult.value.json();

      const ingredientsForRecipe = allIngredients.filter(

        (item) =>

          Number(item.recipe?.id) === Number(recipeId)

      );

      setRecipeIngredients(ingredientsForRecipe);

    } else {

      setRecipeIngredients([]);

    }

    if (

      nutritionResult.status === "fulfilled" &&

      nutritionResult.value.ok

    ) {

      setNutrition(await nutritionResult.value.json());

    } else {

      setNutrition(null);

    }

    if (

      ingredientsResult.status !== "fulfilled" ||

      !ingredientsResult.value.ok ||

      nutritionResult.status !== "fulfilled" ||

      !nutritionResult.value.ok

    ) {

      setAppMessage(

        "Some recipe details are unavailable. Please check the recipe's ingredient and nutrition records."

      );

    }

  } catch (error) {

    console.error(error);

    setAppMessage(

      error.message || "Could not load recipe details."

    );

  } finally {

    setDetailsLoading(false);

  }

};

  // ==============================

  // GO HOME

  // ==============================

  const goBack = () => {

    setAppMessage("");

    setSelectedRecipe(null);

    setRecipeIngredients([]);

    setNutrition(null);

    setShowFavorites(false);

    setShowShoppingList(false);

  };

  // ==============================

  // ADD FAVORITE

  // ==============================

const addFavorite = async () => {

  if (!selectedRecipe) {

    return;

  }

  const token = localStorage.getItem("token");

  if (!token) {

  setAppMessage("Please log in to add recipes to Favorites.");

  setAuthMode("login");

  setShowAuth(true);

  return;

}

try {

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/favorites/${selectedRecipe.id}`,

      {

        method: "POST",

        headers: {

          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",

        },

      }

    );

if (response.status === 401 || response.status === 403) {

  setAppMessage("Your session may have expired. Please log in again.");

  localStorage.removeItem("token");

  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

  setAuthMode("login");

  setShowAuth(true);

  return;

}

if (!response.ok) {

  throw new Error("Could not add favorite");

}

    setAppMessage("Recipe added to Favorites! ❤️");

    await loadFavorites();

  } catch(error) {

    console.error(error);

    setAppMessage("Could not add recipe to Favorites.");

  }

};

  // ==============================

  // LOAD FAVORITES

  // ==============================

const loadFavorites = async () => {

  const token = localStorage.getItem("token");

  if (!token) {

    setFavorites([]);

    setAppMessage("Please log in to view your Favorites.");

    setAuthMode("login");

    setShowAuth(true);

    setShowFavorites(false);

    return;

  }

  setFavoritesLoading(true);

  try {

    const response = await fetch(

      "https://plan-your-plate-backend.onrender.com/api/favorites",

      {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    if (response.status === 401 || response.status === 403) {

      localStorage.removeItem("token");

      localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

      setFavorites([]);

      setShowFavorites(false);

      setAuthMode("login");

      setShowAuth(true);

      setAppMessage("Please log in again to view your Favorites.");

      return;

    }

    if (!response.ok) {

      throw new Error("Could not load favorites");

    }

    const data = await response.json();

    setFavorites(data);

  } catch (error) {

    console.error(error);

    setAppMessage("Could not load Favorites.");

  } finally {

    setFavoritesLoading(false);

  }

};

  // ==============================

  // OPEN FAVORITES

  // ==============================

  const openFavorites = async () => {

    setShowCookingHistory(false);

    setSelectedRecipe(null);

    setRecipeIngredients([]);

    setNutrition(null);

    setShowShoppingList(false);

    setShowFavorites(true);

    await loadFavorites();

  };

  // ==============================

  // REMOVE FAVORITE

  // ==============================

const removeFavorite = async (favoriteId) => {

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to remove a favorite.");

    setAuthMode("login");

    setShowAuth(true);

    return;

  }

  try {

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/favorites/${favoriteId}`,

      {

        method: "DELETE",

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    if (response.status === 401 || response.status === 403) {

      setAppMessage("You are not authorized. Please log in again.");

      localStorage.removeItem("token");

      localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

      setFavorites([]);

      setShowFavorites(false);

      setAuthMode("login");

      setShowAuth(true);

      return;

    }

    if (!response.ok) {

      throw new Error("Could not remove favorite");

    }

    setFavorites((previousFavorites) =>

      previousFavorites.filter(

        (favorite) => favorite.id !== favoriteId

      )

    );

    setAppMessage("Recipe removed from Favorites.");

  } catch (error) {

    console.error(error);

    setAppMessage("Could not remove recipe from Favorites.");

  }

};

  // ==============================

  // LOAD SHOPPING LIST

  // ==============================

const loadShoppingList = async () => {

  const token = localStorage.getItem("token");

  if (!token) {

    setShoppingList([]);

    setAppMessage("Please log in to view your Shopping List.");

    setAuthMode("login");

    setShowAuth(true);

    setShowShoppingList(false);

    return;

  }

  setShoppingLoading(true);

  try {

    const response = await fetch(

      "https://plan-your-plate-backend.onrender.com/api/shopping-list",

      {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    if (response.status === 401 || response.status === 403) {

      localStorage.removeItem("token");

      localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

      setShoppingList([]);

      setShowShoppingList(false);

      setAuthMode("login");

      setShowAuth(true);

      setAppMessage("Please log in again to view your Shopping List.");

      return;

    }

    if (!response.ok) {

      throw new Error("Could not load shopping list");

    }

    const data = await response.json();

    setShoppingList(data);

  } catch (error) {

    console.error(error);

    setAppMessage("Could not load Shopping List.");

  } finally {

    setShoppingLoading(false);

  }

};

  // ==============================

  // OPEN SHOPPING LIST

  // ==============================

  const openShoppingList = async () => {

    setShowCookingHistory(false);

    setSelectedRecipe(null);

    setRecipeIngredients([]);

    setNutrition(null);

    setShowFavorites(false);

    setShowShoppingList(true);

    await loadShoppingList();

  };

  // ==============================

  // REMOVE SHOPPING ITEM

  // ==============================

const addRecipeToShoppingList = async () => {

  if (missingIngredients.length === 0) {

    setAppMessage("You already have all the ingredients for this recipe.");

    return;

  }

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to add ingredients to your Shopping List.");

    setAuthMode("login");

    setShowAuth(true);

    return;

  }

  try {

    for (const item of recipeIngredients) {

      const isMissing = missingIngredients.some(

        (name) =>

          name.toLowerCase() === item.ingredient.name.toLowerCase()

      );

      if (!isMissing) continue;

      const shoppingItem = {

        ingredientName: item.ingredient.name,

      };

      const response = await fetch(

        "https://plan-your-plate-backend.onrender.com/api/shopping-list",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,

          },

          body: JSON.stringify(shoppingItem),

        }

      );

      if (response.status === 401 || response.status === 403) {

        localStorage.removeItem("token");

        localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

        setAppMessage("Please log in again to use your Shopping List.");

        setAuthMode("login");

        setShowAuth(true);

        return;

      }

      if (!response.ok) {

        throw new Error(`Could not add ${item.ingredient.name}`);

      }

    }

    setAppMessage("Missing ingredients added to Shopping List! 🛒");

    await loadShoppingList();

  } catch (error) {

    console.error(error);

    setAppMessage("Could not add ingredients to Shopping List.");

  }

};

const removeShoppingItem = async (itemId) => {

  const token = localStorage.getItem("token");

  if (!token) {

    setAppMessage("Please log in to remove shopping list items.");

    setAuthMode("login");

    setShowAuth(true);

    return;

  }

  try {

    const response = await fetch(

      `https://plan-your-plate-backend.onrender.com/api/shopping-list/${itemId}`,

      {

        method: "DELETE",

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    if (response.status === 401 || response.status === 403) {

      localStorage.removeItem("token");

      localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("welcomeType");
  setUserName("");
  setWelcomeType("back");

      setShoppingList([]);

      setShowShoppingList(false);

      setAuthMode("login");

      setShowAuth(true);

      setAppMessage("Please log in again to use your Shopping List.");

      return;

    }

    if (!response.ok) {

      throw new Error("Could not remove shopping item");

    }

    setShoppingList((previousItems) =>

      previousItems.filter((item) => item.id !== itemId)

    );

  } catch (error) {

    console.error(error);

    setAppMessage("Could not remove shopping item.");

  }

};

  // Filter recommendations using the full recipe records from the backend.

  const filteredRecipes = recipes

    .filter((recommendation) => {

      const fullRecipe = allRecipes.find(

        (item) => Number(item.id) === Number(recommendation.recipeId)

      );

      if (!fullRecipe) {

        // Keep recommendations visible when full recipe metadata is unavailable,

        // but don't pretend they match a specific filter.

        return maxCookingTime === "any" && dietaryFilter === "all";

      }

      const totalTime = Number(fullRecipe.preparationTime || 0) + Number(fullRecipe.cookingTime || 0);

      if (maxCookingTime !== "any" && totalTime > Number(maxCookingTime)) {

        return false;

      }

      if (dietaryFilter !== "all") {

        const preference = String(fullRecipe.dietaryPreference || "")

          .trim()

          .toLowerCase()

          .replace(/[_–—]/g, "-");

        if (!preference) return false;

        const isNonVegetarian = preference.includes("non-vegetarian") ||

          preference.includes("non vegetarian") || preference.includes("nonvegetarian") ||

          preference.includes("non-veg") || preference === "nonveg";

        const isVegetarian = !isNonVegetarian && (

          preference === "vegetarian" || preference === "veg" || preference.includes("vegetarian")

        );

        if (dietaryFilter === "vegetarian" && !isVegetarian) return false;

        if (dietaryFilter === "non-vegetarian" && !isNonVegetarian) return false;

      }

      return true;

    })

    .sort((a, b) => {

      if (sortBy === "time") {

        const recipeA = allRecipes.find((item) => Number(item.id) === Number(a.recipeId));

        const recipeB = allRecipes.find((item) => Number(item.id) === Number(b.recipeId));

        const timeA = recipeA ? Number(recipeA.preparationTime || 0) + Number(recipeA.cookingTime || 0) : Infinity;

        const timeB = recipeB ? Number(recipeB.preparationTime || 0) + Number(recipeB.cookingTime || 0) : Infinity;

        return timeA - timeB;

      }

      return Number(b.matchPercentage || 0) - Number(a.matchPercentage || 0);

    });

  // Filter all recipes displayed on the home page before searching.

  // ==============================

  // COOKING HISTORY PAGE

  // ==============================

  if (showCookingHistory) {

    return (

      <div className="app">

        <header className="navbar">

          <div className="logo">🍳 Plan Your Plate</div>

          <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={mobileMenuOpen ? "mobile-menu-open" : ""} onClick={() => setMobileMenuOpen(false)}>

            <a href="#" onClick={(e) => { e.preventDefault(); setShowCookingHistory(false); goBack(); }}>Home</a>

            <a href="#" onClick={(e) => { e.preventDefault(); openFavorites(); }}>Favorites</a>

            <a href="#" onClick={(e) => { e.preventDefault(); openShoppingList(); }}>Shopping List</a>

            <button onClick={openMealPlanner}>Weekly Meal Planner</button>

            <button className="auth-nav-button" onClick={handleLogout}>Log Out</button>

          </nav>

        </header>

        <main className="recommendations">

          <div className="section-heading">

            <div>

              <p className="small-title">YOUR COOKING JOURNEY</p>

              <h2>Cooking History 🍳</h2>

            </div>

            <button className="view-button" onClick={loadCookingHistory} disabled={cookingHistoryLoading}>

              {cookingHistoryLoading ? "Refreshing..." : "Refresh History"}

            </button>

          </div>

          {cookingHistoryLoading ? (

            <div className="empty-state"><h3>Loading your Cooking History...</h3></div>

          ) : cookingHistory.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">🥘</div>

              <h3>No cooked recipes recorded yet</h3>

              <p>Open a recipe and select “Mark as Cooked” after making it.</p>

            </div>

          ) : (

            <div className="recipe-grid">

              {cookingHistory.map((entry) => (

                <div className="recipe-card" key={entry.id}>

                  <div className="recipe-image"><span className="recipe-decoration">✿</span></div>

                  <div className="recipe-content">

                    <h3>{entry.recipe?.name || "Recipe"}</h3>

                    <p>

                      Cooked on: {entry.cookedAt

                        ? new Date(entry.cookedAt).toLocaleString("en-IN")

                        : "Date unavailable"}

                    </p>

                    {entry.recipe?.id && (

                      <button className="view-button" onClick={() => {

                        setShowCookingHistory(false);

                        viewRecipe(entry.recipe.id);

                      }}>

                        View Recipe

                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </main>

        <footer><p>🍳 Plan Your Plate</p><span>Personalized recipes made simple.</span></footer>

      </div>

    );

  }

  // ==============================

  // SHOPPING LIST PAGE

  // ==============================

  if (showShoppingList) {

    return (

      <div className="app">

        <header className="navbar">

          <div className="logo">

            🍳 Plan Your Plate

          </div>

          <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={mobileMenuOpen ? "mobile-menu-open" : ""} onClick={() => setMobileMenuOpen(false)}>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                goBack();

              }}

            >

              Home

            </a>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                openFavorites();

              }}

            >

              Favorites

            </a>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                openShoppingList();

              }}

            >

              Shopping List

            </a>

          </nav>

        </header>

        <main className="recommendations">

          <div className="section-heading">

            <div>

              <p className="small-title">

                YOUR SHOPPING

              </p>

              <h2>

                Shopping List 🛒

              </h2>

            </div>

          </div>

          {shoppingLoading ? (

            <div className="empty-state">

              <div className="empty-icon">

                🛒

              </div>

              <h3>

                Loading Shopping List...

              </h3>

            </div>

          ) : shoppingList.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">

                🛒

              </div>

              <h3>

                Your shopping list is empty

              </h3>

              <p>

                Ingredients you need to buy will appear here.

              </p>

            </div>

          ) : (

            <div className="details-card">

              <h2>

                Items to Buy

              </h2>

              <div className="ingredient-list">

                {shoppingList.map((item) => (

                  <div

                    className="ingredient-row"

                    key={item.id}

                  >

                    <span>

                      🛒 {item.ingredientName}

                    </span>

                    <button

                      className="favorite-button"

                      onClick={() =>

                        removeShoppingItem(item.id)

                      }

                    >

                      Remove

                    </button>

                  </div>

                ))}

              </div>

            </div>

          )}

        </main>

        <footer>

          <p>

            🍳 Plan Your Plate

          </p>

          <span>

            Personalized recipes made simple.

          </span>

        </footer>

      </div>

    );

  }

  // ==============================

  // FAVORITES PAGE

  // ==============================

if (showMealPlanner) {

  const formatPlannerDate = (date) => {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

  };

  const weekStart = new Date(`${planStartDate}T12:00:00`);

  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekEnd.getDate() + 6);

  return (

    <div className="meal-planner planner-page">

      <header className="planner-header">

        <div>

          <p className="planner-eyebrow">YOUR PERSONAL MEAL SCHEDULE</p>

          <h1>Weekly Meal Planner</h1>

          <p>Plan your meals, one day at a time.</p>

        </div>

        <button className="planner-back-button" onClick={() => setShowMealPlanner(false)}>

          Back to Home

        </button>

      </header>

      <div className="planner-week-controls">

        <label htmlFor="weekStart">Week starting</label>

        <input

          id="weekStart"

          type="date"

          value={planStartDate}

          onChange={(event) => {

            setPlanStartDate(event.target.value);

            setShowMealForm(false);

          }}

        />

        <button onClick={loadMealPlans} disabled={mealPlanLoading}>

          {mealPlanLoading ? "Loading..." : "Load week"}

        </button>

        <span className="planner-date-range">

          {weekStart.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}

          {" — "}

          {weekEnd.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}

        </span>

      </div>

      {mealPlanLoading && <p className="planner-loading">Loading your planned meals...</p>}

      <section className="weekly-timetable">

        <div className="weekly-grid">

          <div className="weekly-corner">Day</div>

          <div className="weekly-header breakfast">Breakfast</div>

          <div className="weekly-header lunch">Lunch</div>

          <div className="weekly-header dinner">Dinner</div>

          {Array.from({ length: 7 }, (_, index) => {

            const date = new Date(`${planStartDate}T12:00:00`);

            date.setDate(date.getDate() + index);

            const dateKey = formatPlannerDate(date);

            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

            return (

              <React.Fragment key={dateKey}>

                <div className="weekly-day">

                  <span>{dayName}</span>

                  <small>{date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</small>

                </div>

                {["breakfast", "lunch", "dinner"].map((mealType) => {

                  const mealsForCell = mealPlans.filter(

                    (meal) => meal.planDate === dateKey && meal.mealType?.toLowerCase() === mealType

                  );

                  const isAddingHere = showMealForm && planDate === dateKey && planMealType === mealType;

                  return (

                    <div className={`weekly-cell ${mealType}-cell`} key={`${dateKey}-${mealType}`}>

                      {mealsForCell.map((meal) => (

                        <div className="weekly-recipe" key={meal.id}>

                          <strong>{meal.recipe?.name || "Recipe"}</strong>

                          <button

                            className="remove-planned-meal"

                            type="button"

                            onClick={() => removeMealPlan(meal.id)}

                            disabled={mealPlanLoading}

                          >

                            Remove

                          </button>

                        </div>

                      ))}

                      {isAddingHere ? (

                        <div className="cell-meal-form">

                          <label htmlFor={`recipe-${dateKey}-${mealType}`}>Choose recipe</label>

                          <select

                            id={`recipe-${dateKey}-${mealType}`}

                            value={planRecipeId}

                            onChange={(event) => setPlanRecipeId(event.target.value)}

                          >

                            <option value="">Select a recipe</option>

                            {allRecipes.map((recipe) => (

                              <option key={recipe.id} value={recipe.id}>{recipe.name}</option>

                            ))}

                          </select>

                          <button

                            type="button"

                            onClick={async () => {

                              await addMealPlan();

                              setShowMealForm(false);

                            }}

                            disabled={mealPlanLoading || allRecipes.length === 0 || !planRecipeId}

                          >

                            Save meal

                          </button>

                          <button type="button" className="cancel-meal-button" onClick={() => setShowMealForm(false)}>

                            Cancel

                          </button>

                        </div>

                      ) : (

                        <button

                          type="button"

                          className="add-meal-cell-button"

                          onClick={() => {

                            setPlanDate(dateKey);

                            setPlanMealType(mealType);

                            setPlanRecipeId("");

                            setShowMealForm(true);

                            if (allRecipes.length === 0) loadAllRecipes();

                          }}

                        >

                          <span aria-hidden="true">＋</span> Add meal

                        </button>

                      )}

                    </div>

                  );

                })}

              </React.Fragment>

            );

          })}

        </div>

        {mealPlans.length === 0 && !mealPlanLoading && (

          <p className="planner-empty-message">Your week is clear. Select <strong>+ Add meal</strong> in any slot to get started.</p>

        )}

      </section>

    </div>

  );

}

  if (showFavorites) {

    return (

      <div className="app">

        <header className="navbar">

          <div className="logo">

            🍳 Plan Your Plate

          </div>

          <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={mobileMenuOpen ? "mobile-menu-open" : ""} onClick={() => setMobileMenuOpen(false)}>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                goBack();

              }}

            >

              Home

            </a>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                openFavorites();

              }}

            >

              Favorites

            </a>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                openShoppingList();

              }}

            >

              Shopping List

            </a>

          </nav>

        </header>

        <main className="recommendations">

          <div className="section-heading">

            <div>

              <p className="small-title">

                SAVED RECIPES

              </p>

              <h2>

                My Favorites ❤️

              </h2>

            </div>

          </div>

          {favoritesLoading ? (

            <div className="empty-state">

              <div className="empty-icon">

                ❤️

              </div>

              <h3>

                Loading Favorites...

              </h3>

            </div>

          ) : favorites.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">

                ❤️

              </div>

              <h3>

                No favorite recipes yet

              </h3>

              <p>

                Open a recipe and click "Add to Favorites".

              </p>

            </div>

          ) : (

            <div className="recipe-grid">

{favorites.map((favorite) => {

  const recipe = favorite.recipe;

  if (!recipe) {

    return null;

  }

  return (

    <div className="recipe-card" key={favorite.id}>

      <div className="recipe-image">

        <span className="recipe-decoration">✿</span>

        <span className="favorite-card-label">Your favorite</span>

      </div>

      <div className="recipe-content">

        <h3>{recipe.name}</h3>

        {recipe.description && (

          <p className="favorite-description">

            {recipe.description}

          </p>

        )}

        <button

          type="button"

          className="view-button"

          onClick={() => viewRecipe(recipe.id)}

        >

          View Recipe

        </button>

        <button

          type="button"

          className="remove-favorite-button"

          onClick={() => removeFavorite(favorite.id)}

        >

          Remove from Favorites

        </button>

      </div>

    </div>

  );

})}

            </div>

          )}

        </main>

        <footer>

          <p>

            🍳 Plan Your Plate

          </p>

          <span>

            Personalized recipes made simple.

          </span>

        </footer>

      </div>

    );

  }

  // ==============================

  // RECIPE DETAILS PAGE

  // ==============================

  if (selectedRecipe) {

    return (

      <div className="app">

        <header className="navbar">

          <div className="logo">

            🍳 Plan Your Plate

          </div>

          <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={mobileMenuOpen ? "mobile-menu-open" : ""} onClick={() => setMobileMenuOpen(false)}>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                goBack();

              }}

            >

              Home

            </a>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                openFavorites();

              }}

            >

              Favorites

            </a>

            <a

              href="#"

              onClick={(e) => {

                e.preventDefault();

                openShoppingList();

              }}

            >

              Shopping List

            </a>

<button onClick={openMealPlanner}>

  Weekly Meal Planner

</button>

          </nav>

        </header>

        <main className="details-page">

          <button

            className="back-button"

            onClick={goBack}

          >

            ← Back to Recipes

          </button>

          <section className="details-header">

            <div className="details-image">

              🍳

            </div>

            <div className="details-info">

              <p className="small-title">

                RECIPE DETAILS

              </p>

              <h1>

                {selectedRecipe.name}

              </h1>

              <p className="details-description">

                {selectedRecipe.description}

              </p>

              <div className="recipe-meta">

                <div>

                  <strong>

                    {Number(selectedRecipe.preparationTime || 0) +

                      Number(selectedRecipe.cookingTime || 0)}

                  </strong>

                  <span>

                    Minutes

                  </span>

                </div>

                <div>

                  <strong>

                    {selectedRecipe.servings}

                  </strong>

                  <span>

                    Servings

                  </span>

                </div>

                <div>

                  <strong>

                    {selectedRecipe.difficulty}

                  </strong>

                  <span>

                    Difficulty

                  </span>

                </div>

              </div>

              <button

                className="favorite-button"

                onClick={addFavorite}

              >

                ❤️ Add to Favorites

              </button>

              <button

  className="favorite-button"

  onClick={addRecipeToShoppingList}

>

  🛒 Add Ingredients to Shopping List

</button>

<button

  type="button"

  className="favorite-button"

  onClick={markRecipeAsCooked}

>

  🍳 Mark as Cooked

</button>

{appMessage && (

  <div className="app-message" role="status">

    {appMessage}

  </div>

)}

            </div>

          </section>

          <section className="details-grid">

            <div className="details-card">

              <h2>

                Ingredients

              </h2>

              <div className="ingredient-list">

                {recipeIngredients.length > 0 ? (

                  recipeIngredients.map((item, index) => (

                    <div className="ingredient-row" key={item.id ?? index}>

                      <span>{item.ingredient?.name || "Ingredient name unavailable"}</span>

                      <strong>{item.quantity ?? ""} {item.unit || ""}</strong>

                    </div>

                  ))

                ) : (

                  <p>Ingredient details are not available for this recipe yet.</p>

                )}

              </div>

            </div>

            <div className="details-card nutrition-card">

              <h2>

                Nutrition

              </h2>

              {nutrition ? (

                <div className="nutrition-grid">

                  <div>

                    <strong>

                      {formatNutrition(nutrition.calories)}

                    </strong>

                    <span>

                      Calories

                    </span>

                  </div>

                  <div>

                    <strong>

                      {formatNutrition(nutrition.protein)}g

                    </strong>

                    <span>

                      Protein

                    </span>

                  </div>

                  <div>

                    <strong>

                      {formatNutrition(nutrition.carbohydrates)}g

                    </strong>

                    <span>

                      Carbs

                    </span>

                  </div>

                  <div>

                    <strong>

                      {formatNutrition(nutrition.fat)}g

                    </strong>

                    <span>

                      Fat

                    </span>

                  </div>

                  <div>

                    <strong>

                      {formatNutrition(nutrition.fiber)}g

                    </strong>

                    <span>

                      Fiber

                    </span>

                  </div>

                </div>

              ) : (

                <p>Nutrition information is not available for this recipe yet.</p>

              )}

            </div>

          </section>

          <section className="instructions-card">

            <p className="small-title">

              HOW TO MAKE IT

            </p>

            <h2>

              Instructions

            </h2>

            <div className="instructions">

              {(selectedRecipe.instructions || "Instructions are not available for this recipe yet.")
                // Split instructions on new lines, semicolons, or punctuation before a numbered step.
                .split(/\n+|;\s*|,\s*(?=\d+\.\s*)|\.\s+(?=\d+\.\s*)/)
                .map((step) => step.trim().replace(/[;,\s]+$/, ""))
                .filter((step) => step.length > 0)
                .map((step, index) => (
                  <div
                    className="instruction-step"
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      width: "100%",
                      marginBottom: "12px"
                    }}
                  >
                    <div className="step-number" style={{ flexShrink: 0 }}>
                      {index + 1}
                    </div>
                    <p style={{ margin: 0, flex: 1, lineHeight: 1.6 }}>
                      {step.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}

            </div>

          </section>

        </main>

        <footer>

          <p>

            🍳 Plan Your Plate

          </p>

          <span>

            Personalized recipes made simple.

          </span>

        </footer>

      </div>

    );

  }

  // ==============================

  // HOME PAGE

  // ==============================

  return (

    <div className="app">

      {showAuth && (

  <div className="auth-container">

    <h2>{authMode === "login" ? "Login" : "Register"}</h2>

    <form onSubmit={handleAuth} autoComplete="off">

      {authMode === "register" && (

        <input

          type="text"

          placeholder="Your name"

          required

          id="auth-name"

        />

      )}

      <input

        type="email"

        placeholder="Email"

        name={authMode === "register" ? "new-register-email" : "login-email"}

        autoComplete={authMode === "register" ? "off" : "username"}

        value={userEmail}

        onChange={(e) => setUserEmail(e.target.value)}

        required

      />

      <input

        type="password"

        placeholder="Password"

        name={authMode === "register" ? "new-register-password" : "login-password"}

        autoComplete={authMode === "register" ? "new-password" : "current-password"}

        value={userPassword}

        onChange={(e) => setUserPassword(e.target.value)}

        required

      />

      <button type="submit">

        {authMode === "login" ? "Login" : "Register"}

      </button>

    </form>

    <button

      onClick={() => {

        const nextMode = authMode === "login" ? "register" : "login";
        setAuthMode(nextMode);
        setUserEmail("");
        setUserPassword("");
        setAuthMessage("");

      }}

    >

      {authMode === "login"

        ? "Create an account"

        : "Already have an account? Login"}

    </button>

    <button onClick={() => setShowAuth(false)}>Close</button>

    {authMessage && (

  <div className="auth-message" role="status">

    {authMessage}

  </div>

)}

  </div>

)}

      <header className="navbar">

        <div className="logo" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>

          <span>🍳 Plan Your Plate</span>
          <span className="small-title" style={{ margin: 0 }}>PERSONALIZED MEAL PLANNER</span>

        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={mobileMenuOpen ? "mobile-menu-open" : ""} onClick={() => setMobileMenuOpen(false)}>

          <a

            href="#"

            onClick={(e) => {

              e.preventDefault();

              goBack();

            }}

          >

            Home

          </a>

          <a

            href="#"

            onClick={(e) => {

              e.preventDefault();

              openFavorites();

            }}

          >

            Favorites

          </a>

          <a

            href="#"

            onClick={(e) => {

              e.preventDefault();

              openShoppingList();

            }}

          >

            Shopping List

          </a>

 <button onClick={openMealPlanner}>

  Weekly Meal Planner

</button>

<button onClick={openCookingHistory}>

  Cooking History

</button>       

{localStorage.getItem("token") ? (

  <button className="auth-nav-button" onClick={handleLogout}>

    Log Out

  </button>

) : (

  <>

    <button
      className="auth-nav-button"
      onClick={() => {

        setAuthMode("login");

        setShowAuth(true);

        setAuthMessage("");

      }}

    >

      Login

    </button>

    <button
className="auth-nav-button"
onClick={() => {

  setAuthMode("register");

  setUserEmail("");

  setUserPassword("");

  setAuthMessage("");

  setShowAuth(true);

}}

    >

      Register

    </button>

  </>

)}

        </nav>

      </header>

    {appMessage && (

  <div className="app-message" role="status">

    {appMessage}

  </div>

)}

      <section className="hero">

  <div className="hero-content">

          {userName && (
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "16px" }}>
              {welcomeType === "welcome" ? "Welcome" : "Welcome back"}, {userName}! 👋
            </div>
          )}

          <h1>

            What's in your

            <span> kitchen?</span>

          </h1>

          <p className="subtitle">

            Tell us what ingredients you have and we'll

            find delicious recipes you can make.

          </p>

          <div className="search-box">

            <input

              type="text"

              placeholder="Example: Egg, Rice, Onion, Capsicum"

              value={ingredients}

              onChange={(e) =>

                setIngredients(e.target.value)

              }

              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  findRecipes();

                }

              }}

            />

            <button onClick={findRecipes}>

              {loading

                ? "Finding..."

                : "Find Recipes"}

            </button>

          </div>


        </div>

        <div className="hero-food">

          🍳

        </div>

      </section>

      <section className="recommendations">

        <div className="section-heading">

          <div>

            <p className="small-title">

              YOUR RESULTS

            </p>

            <h2>

              Recommended Recipes

            </h2>

          </div>

          {recipes.length > 0 && (

            <span className="result-count">

              {filteredRecipes.length} of {recipes.length} recipes

            </span>

          )}

        </div>

        <div className="recipe-filters">

          <label>

            <span>Cooking time</span>

            <select value={maxCookingTime} onChange={(event) => setMaxCookingTime(event.target.value)}>

              <option value="any">Any time</option>

              <option value="15">15 minutes or less</option>

              <option value="30">30 minutes or less</option>

              <option value="45">45 minutes or less</option>

            </select>

          </label>

          <label>

            <span>Dietary preference</span>

            <select value={dietaryFilter} onChange={(event) => setDietaryFilter(event.target.value)}>

              <option value="all">All recipes</option>

              <option value="vegetarian">Vegetarian</option>

              <option value="non-vegetarian">Non-vegetarian</option>

            </select>

          </label>

          <label>

            <span>Sort by</span>

            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>

              <option value="match">Best match</option>

              <option value="time">Shortest cooking time</option>

            </select>

          </label>

          <button type="button" className="filter-reset-button" onClick={() => {

            setMaxCookingTime("any");

            setDietaryFilter("all");

            setSortBy("match");

          }}>Reset filters</button>

        </div>

        {recipes.length === 0 && !loading && (

          <div className="empty-state">

            <div className="empty-icon">

              🥗

            </div>

            <h3>

              Ready to discover something delicious?

            </h3>

            <p>

              Enter the ingredients you have above and

              we'll find recipes for you.

            </p>

          </div>

        )}

        {recipes.length > 0 && filteredRecipes.length === 0 && !loading && (

          <div className="empty-state filter-empty-state">

            <div className="empty-icon">🔎</div>

            <h3>No recipes match these filters</h3>

            <p>Try a longer cooking time, another dietary preference, or reset your filters.</p>

          </div>

        )}

        {hasSearched && (

          <div className="recipe-grid">

  {filteredRecipes.map((recipe) => {

    const recipeId = recipe.recipeId;

    const recipeName = recipe.recipeName;

    const missingIngredients = recipe.missingIngredients || [];

    return (

      <div className="recipe-card" key={recipeId}>

        <div className="recipe-image">

          <span className="recipe-decoration">✿</span>

          <div className="match-badge">

            {`${recipe.matchPercentage ?? 0}% Match`}

          </div>

        </div>

        <div className="recipe-content">

          <h3>{recipeName}</h3>

          {hasSearched && (
            recipe.isRecommendation === false ? (
              <p className="missing">
                Not a direct ingredient match — explore this recipe too.
              </p>
            ) : missingIngredients.length === 0 ? (
              <p className="available">
                ✓ You have all the ingredients
              </p>
            ) : (
              <div className="missing">
                <strong>Missing:</strong>
                <span>{missingIngredients.join(", ")}</span>
              </div>
            )
          )}

          {!hasSearched && recipe.description && (

            <p>{recipe.description}</p>

          )}

          <button

            className="view-button"

            onClick={() => viewRecipe(recipeId, missingIngredients)}

          >

            {detailsLoading ? "Loading..." : "View Recipe →"}

          </button>

        </div>

      </div>

    );

  })}

          </div>

        )}

      </section>

      <footer>

        <p>

          🍳 Plan Your Plate

        </p>

        <span>

          Personalized recipes made simple.

        </span>

      </footer>

    </div>

  );

}

export default App;
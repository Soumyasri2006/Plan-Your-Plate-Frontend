import { useState } from "react";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingLoading, setShoppingLoading] = useState(false);

  // ==============================
  // FIND RECIPES
  // ==============================
  const findRecipes = async () => {
    if (!ingredients.trim()) {
      alert("Please enter at least one ingredient.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/recommendations?ingredients=${encodeURIComponent(
          ingredients
        )}`
      );

      if (!response.ok) {
        throw new Error("Could not get recommendations");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error(error);
      alert("Could not connect to the backend.");
    }

    setLoading(false);
  };

  // ==============================
  // VIEW RECIPE
  // ==============================
  const viewRecipe = async (recipeId) => {
    setDetailsLoading(true);
    setShowFavorites(false);
    setShowShoppingList(false);

    try {
      const recipeResponse = await fetch(
        `http://localhost:8080/api/recipes/${recipeId}`
      );

      const ingredientsResponse = await fetch(
        "http://localhost:8080/api/recipe-ingredients"
      );

      const nutritionResponse = await fetch(
        `http://localhost:8080/api/nutrition/${recipeId}`
      );

      if (
        !recipeResponse.ok ||
        !ingredientsResponse.ok ||
        !nutritionResponse.ok
      ) {
        throw new Error("Could not load recipe");
      }

      const recipe = await recipeResponse.json();
      const allIngredients = await ingredientsResponse.json();
      const nutritionData = await nutritionResponse.json();

      const ingredientsForRecipe = allIngredients.filter(
        (item) => item.recipe.id === recipeId
      );

      setSelectedRecipe(recipe);
      setRecipeIngredients(ingredientsForRecipe);
      setNutrition(nutritionData);
    } catch (error) {
      console.error(error);
      alert("Could not load recipe details.");
    }

    setDetailsLoading(false);
  };

  // ==============================
  // GO HOME
  // ==============================
  const goBack = () => {
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

    try {
      const response = await fetch(
        `http://localhost:8080/api/favorites/${selectedRecipe.id}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Could not add favorite");
      }

      alert("Recipe added to Favorites! ❤️");

      loadFavorites();
    } catch (error) {
      console.error(error);
      alert("Could not add recipe to Favorites.");
    }
  };

  // ==============================
  // LOAD FAVORITES
  // ==============================
  const loadFavorites = async () => {
    setFavoritesLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/favorites"
      );

      if (!response.ok) {
        throw new Error("Could not load favorites");
      }

      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error(error);
      alert("Could not load Favorites.");
    }

    setFavoritesLoading(false);
  };

  // ==============================
  // OPEN FAVORITES
  // ==============================
  const openFavorites = async () => {
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
    try {
      const response = await fetch(
        `http://localhost:8080/api/favorites/${favoriteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not remove favorite");
      }

      setFavorites(
        favorites.filter(
          (favorite) => favorite.id !== favoriteId
        )
      );

      alert("Recipe removed from Favorites.");
    } catch (error) {
      console.error(error);
      alert("Could not remove recipe from Favorites.");
    }
  };

  // ==============================
  // LOAD SHOPPING LIST
  // ==============================
  const loadShoppingList = async () => {
    setShoppingLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/shopping-list"
      );

      if (!response.ok) {
        throw new Error("Could not load shopping list");
      }

      const data = await response.json();
      setShoppingList(data);
    } catch (error) {
      console.error(error);
      alert("Could not load Shopping List.");
    }

    setShoppingLoading(false);
  };

  // ==============================
  // OPEN SHOPPING LIST
  // ==============================
  const openShoppingList = async () => {
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
  if (recipeIngredients.length === 0) {
    alert("No ingredients found for this recipe.");
    return;
  }

  try {
    for (const item of recipeIngredients) {
      const shoppingItem = {
        ingredientName: item.ingredient.name,
        quantity: item.quantity,
        unit: item.unit,
      };

      const response = await fetch(
        "http://localhost:8080/api/shopping-list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shoppingItem),
        }
      );

      if (!response.ok) {
        throw new Error("Could not add ingredient");
      }
    }

    alert("Recipe ingredients added to Shopping List! 🛒");
  } catch (error) {
    console.error(error);
    alert("Could not add ingredients to Shopping List.");
  }
};
  const removeShoppingItem = async (itemId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/shopping-list/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not remove shopping item");
      }

      setShoppingList(
        shoppingList.filter(
          (item) => item.id !== itemId
        )
      );
    } catch (error) {
      console.error(error);
      alert("Could not remove shopping item.");
    }
  };

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

          <nav>

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

                    <strong>
                      {item.quantity} {item.unit}
                    </strong>

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
  if (showFavorites) {
    return (
      <div className="app">

        <header className="navbar">

          <div className="logo">
            🍳 Plan Your Plate
          </div>

          <nav>

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

              {favorites.map((favorite) => (

                <div
                  className="recipe-card"
                  key={favorite.id}
                >

                  <div className="recipe-image">
                    🍳
                  </div>

                  <div className="recipe-content">

                    <h3>
                      {favorite.recipe.name}
                    </h3>

                    <p>
                      {favorite.recipe.description}
                    </p>

                    <button
                      className="view-button"
                      onClick={() =>
                        viewRecipe(favorite.recipe.id)
                      }
                    >
                      View Recipe →
                    </button>

                    <button
                      className="favorite-button"
                      onClick={() =>
                        removeFavorite(favorite.id)
                      }
                    >
                      Remove Favorite
                    </button>

                  </div>

                </div>

              ))}

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

          <nav>

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
                    {selectedRecipe.preparationTime +
                      selectedRecipe.cookingTime}
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

            </div>

          </section>

          <section className="details-grid">

            <div className="details-card">

              <h2>
                Ingredients
              </h2>

              <div className="ingredient-list">

                {recipeIngredients.map((item) => (

                  <div
                    className="ingredient-row"
                    key={item.id}
                  >

                    <span>
                      {item.ingredient.name}
                    </span>

                    <strong>
                      {item.quantity} {item.unit}
                    </strong>

                  </div>

                ))}

              </div>

            </div>

            <div className="details-card nutrition-card">

              <h2>
                Nutrition
              </h2>

              {nutrition && (

                <div className="nutrition-grid">

                  <div>
                    <strong>
                      {nutrition.calories.toFixed(1)}
                    </strong>

                    <span>
                      Calories
                    </span>
                  </div>

                  <div>
                    <strong>
                      {nutrition.protein.toFixed(1)}g
                    </strong>

                    <span>
                      Protein
                    </span>
                  </div>

                  <div>
                    <strong>
                      {nutrition.carbohydrates.toFixed(1)}g
                    </strong>

                    <span>
                      Carbs
                    </span>
                  </div>

                  <div>
                    <strong>
                      {nutrition.fat.toFixed(1)}g
                    </strong>

                    <span>
                      Fat
                    </span>
                  </div>

                  <div>
                    <strong>
                      {nutrition.fiber.toFixed(1)}g
                    </strong>

                    <span>
                      Fiber
                    </span>
                  </div>

                </div>

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

              {selectedRecipe.instructions
                .split("\n")
                .map((step, index) => (

                  <div
                    className="instruction-step"
                    key={index}
                  >

                    <div className="step-number">
                      {index + 1}
                    </div>

                    <p>
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

      <header className="navbar">

        <div className="logo">
          🍳 Plan Your Plate
        </div>

        <nav>

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

      <section className="hero">

        <div className="hero-content">

          <p className="small-title">
            PERSONALIZED MEAL PLANNER
          </p>

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

          <p className="hint">
            Separate ingredients with commas
          </p>

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
              {recipes.length} recipes found
            </span>

          )}

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

        <div className="recipe-grid">

          {recipes.map((recipe) => (

            <div
              className="recipe-card"
              key={recipe.recipeId}
            >

              <div className="recipe-image">

                🍳

                <div className="match-badge">
                  {recipe.matchPercentage}% Match
                </div>

              </div>

              <div className="recipe-content">

                <h3>
                  {recipe.recipeName}
                </h3>

                {recipe.missingIngredients.length === 0 ? (

                  <p className="available">
                    ✓ You have all the ingredients
                  </p>

                ) : (

                  <div className="missing">

                    <strong>
                      Missing:
                    </strong>

                    <span>
                      {recipe.missingIngredients.join(", ")}
                    </span>

                  </div>

                )}

                <button
                  className="view-button"
                  onClick={() =>
                    viewRecipe(recipe.recipeId)
                  }
                >
                  {detailsLoading
                    ? "Loading..."
                    : "View Recipe →"}
                </button>

              </div>

            </div>

          ))}

        </div>

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
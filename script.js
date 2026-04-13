const cocktailContainer = document.getElementById("cocktailContainer");
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalIngredients = document.getElementById("modalIngredients");
const modalInstructions = document.getElementById("modalInstructions");
const favBtn = document.getElementById("favBtn");
const favoritesLink = document.getElementById("favoritesLink");
const homeLink = document.getElementById("homeLink");
const aboutLink = document.getElementById("aboutLink");
const aboutSection = document.getElementById("aboutSection");
const favoritesSection = document.getElementById("favoritesSection");
const favoritesContainer = document.getElementById("favoritesContainer");
const darkToggle = document.getElementById("darkToggle");

let cocktails = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentCocktail = null;

/* 🌙 Dark Mode */
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  darkToggle.textContent = "Light Mode";
} else {
  darkToggle.textContent = "Dark Mode";
}
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    darkToggle.textContent = "Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    darkToggle.textContent = "Dark Mode";
  }
});

/* 🔍 Search */
searchBtn.addEventListener("click", () => {
  const letter = searchBox.value.trim().toLowerCase();
  if (!letter || letter.length !== 1) {
    alert("Please enter a single letter (a-z).");
    return;
  }
  fetchCocktails(letter);
});

async function fetchCocktails(letter) {
  cocktailContainer.innerHTML = `<div class="spinner"></div>`;
  try {
    const res = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`
    );
    const data = await res.json();
    cocktails = data.drinks || [];
    renderCocktails(cocktails);
  } catch {
    cocktailContainer.innerHTML = `<p class="text-center text-red-500">Error fetching data.</p>`;
  }
}

function renderCocktails(list) {
  if (list.length === 0) {
    cocktailContainer.innerHTML = `<p class="text-center">No cocktails found.</p>`;
    return;
  }
  cocktailContainer.innerHTML = list.map(drink => `
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg cursor-pointer transition p-3" data-id="${drink.idDrink}">
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="rounded mb-2">
      <h3 class="text-lg font-semibold">${drink.strDrink}</h3>
    </div>
  `).join("");

  document.querySelectorAll("[data-id]").forEach(card =>
    card.addEventListener("click", () => openModal(card.dataset.id))
  );
}

function openModal(id) {
  currentCocktail =
    cocktails.find(d => d.idDrink === id) ||
    favorites.find(d => d.idDrink === id);
  if (!currentCocktail) return;

  modalImg.src = currentCocktail.strDrinkThumb;
  modalName.textContent = currentCocktail.strDrink;
  modalInstructions.textContent = currentCocktail.strInstructions;

  modalIngredients.innerHTML = "";
  for (let i = 1; i <= 15; i++) {
    const ingredient = currentCocktail[`strIngredient${i}`];
    const measure = currentCocktail[`strMeasure${i}`];
    if (ingredient) {
      modalIngredients.innerHTML += `<li>${ingredient} - ${measure || ""}</li>`;
    }
  }

  const isFav = favorites.some(d => d.idDrink === currentCocktail.idDrink);
  favBtn.textContent = isFav ? "Remove from Favorites" : "Add to Favorites";

  modal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

/* ⭐ Add/Remove Favorites */
favBtn.addEventListener("click", () => {
  const exists = favorites.find(d => d.idDrink === currentCocktail.idDrink);
  if (exists) {
    favorites = favorites.filter(d => d.idDrink !== currentCocktail.idDrink);
    favBtn.textContent = "Add to Favorites";
  } else {
    favorites.push(currentCocktail);
    favBtn.textContent = "Remove from Favorites";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
});

/* ❤️ Render Favorites */
function renderFavorites() {
  if (favorites.length === 0) {
    favoritesContainer.innerHTML = `<p class="text-center">No favorites yet.</p>`;
    return;
  }
  favoritesContainer.innerHTML = favorites.map(drink => `
    <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-3">
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="rounded mb-2">
      <h3 class="text-lg font-semibold">${drink.strDrink}</h3>
      <button class="mt-2 px-3 py-1 bg-red-500 text-white rounded removeFavBtn" data-id="${drink.idDrink}">Remove</button>
    </div>
  `).join("");

  document.querySelectorAll(".removeFavBtn").forEach(btn =>
    btn.addEventListener("click", () => {
      favorites = favorites.filter(d => d.idDrink !== btn.dataset.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    })
  );
}

/* 📌 Navbar Links */
homeLink.addEventListener("click", () => {
  cocktailContainer.classList.remove("hidden");
  favoritesSection.classList.add("hidden");
  aboutSection.classList.add("hidden");
  renderCocktails(cocktails);
});

favoritesLink.addEventListener("click", () => {
  cocktailContainer.classList.add("hidden");
  aboutSection.classList.add("hidden");
  favoritesSection.classList.remove("hidden");
  renderFavorites();
});

aboutLink.addEventListener("click", () => {
  cocktailContainer.classList.add("hidden");
  favoritesSection.classList.add("hidden");
  aboutSection.classList.remove("hidden");
});

/* ✅ Load existing favorites on startup */
renderFavorites();

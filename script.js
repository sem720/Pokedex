const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let offset = 0;
const limit = 20;
let pokemons = [];
let debounceTimeout = null;

async function init() {
  await renderCards();
}

async function renderCards() {
  const contentRef = document.getElementById("renderPokemons");
  contentRef.innerHTML = "";
  pokemons = [];
  offset = 0;
  showLoader();
  try {
    await loadPokemons(offset, limit);
  } finally {
    hideLoader();
  }
}

function toggleOverlay(event, index = null) {
  const overlay = document.getElementById("overlay");
  const body = document.body;

  overlay.classList.toggle("d_none");

  if (!overlay.classList.contains("d_none")) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "";
  }

  if (index !== null) {
    currentPokemonIndex = index;
    displayPokemonDetails(index);
  }

  event.stopPropagation();
}

async function loadPokemons(offset, limit) {
  const contentRef = document.getElementById("renderPokemons");
  try {
    showLoader();
    const data = await fetchJSON(`${BASE_URL}?offset=${offset}&limit=${limit}`);
    for (let pokemon of data.results) await addPokemonCard(pokemon);
  } catch (error) {
    displayError(error);
  } finally {
    hideLoader();
  }
}
async function addPokemonCard(pokemon) {
  const details = await fetchJSON(pokemon.url);

  // Prüfen, ob Pokémon bereits in der Liste ist
  if (pokemons.some((p) => p.name === pokemon.name)) return;

  const pokemonCardData = {
    name: pokemon.name,
    image: details.sprites.front_default,
    height: (details.height / 10).toFixed(2),
    weight: (details.weight / 10).toFixed(2),
    category: details.species.name,
    abilities: details.abilities.map((a) => a.ability.name).join(", "),
    type: details.types[0]?.type.name || "normal",
    stats: {
      hp: details.stats[0]?.base_stat || 0,
      attack: details.stats[1]?.base_stat || 0,
      defense: details.stats[2]?.base_stat || 0,
      speed: details.stats[5]?.base_stat || 0,
    },
  };

  pokemons.push(pokemonCardData);
  document.getElementById("renderPokemons").innerHTML += cardTemplate(
    pokemonCardData,
    pokemons.length - 1
  );
}

async function loadMorePokemons() {
  const loadMoreButton = document.getElementById("loadMoreButton");
  const query = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  loadMoreButton.disabled = true;
  loadMoreButton.innerHTML = '<div class="loader"></div>';

  offset += limit;
  try {
    query.length < 3
      ? await loadPokemons(offset, limit)
      : await searchPokemons(query);
  } finally {
    loadMoreButton.disabled = false;
    loadMoreButton.innerHTML = "Load more..";
  }
}

function searchPokemons(query) {
  if (debounceTimeout) clearTimeout(debounceTimeout);

  if (query.length < 3) {
    return;
  }

  debounceTimeout = setTimeout(async () => {
    const contentRef = document.getElementById("renderPokemons");
    pokemons = [];

    try {
      showLoader();
      const data = await fetchJSON(`${BASE_URL}?limit=200`);
      const matches = data.results.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
      if (matches.length) {
        await renderMatchedPokemons(matches);
      } else {
        displayNoResults(query);
      }
    } catch (error) {
      displayError(error);
    } finally {
      hideLoader();
    }
  }, 300);
}

async function renderMatchedPokemons(matches) {
  const contentRef = document.getElementById("renderPokemons");
  contentRef.innerHTML = "";
  for (let pokemon of matches) await addPokemonCard(pokemon);
}

function displayError(error) {
  document.getElementById(
    "renderPokemons"
  ).innerHTML = `<p>Fehler beim Laden der Pokémon-Daten: ${error.message}</p>`;
}

function displayNoResults(query) {
  document.getElementById("renderPokemons").innerHTML = `
        <div class="no-find">
            <p>Kein Pokémon gefunden, das mit "${query}" übereinstimmt.</p>
            <img height="150px" width="150px" src="./imgs/not-found.png" alt="not-found">
        </div>`;
}

function updateLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  button.disabled = false;
  button.innerHTML = "Load more..";
}

function showLoader() {
  document.getElementById("spinning-loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("spinning-loader").style.display = "none";
}

async function fetchJSON(url) {
  const response = await fetch(url);
  return response.json();
}

function displayPokemonDetails(index) {
  const pokemon = pokemons[index];
  if (!pokemon) return;

  document.getElementById("pokemon-title").textContent =
    pokemon.name.toUpperCase();
  document.getElementById("pokemon-image").src =
    pokemon.image || "./imgs/not-found.png";
  document.getElementById("pokemon-hp").textContent = `HP: ${pokemon.stats.hp}`;
  document.getElementById(
    "pokemon-attack"
  ).textContent = `Attack: ${pokemon.stats.attack}`;
  document.getElementById(
    "pokemon-defense"
  ).textContent = `Defense: ${pokemon.stats.defense}`;
  document.getElementById(
    "pokemon-speed"
  ).textContent = `Speed: ${pokemon.stats.speed}`;
}

function showNextPokemon() {
  currentPokemonIndex = (currentPokemonIndex + 1) % pokemons.length;
  displayPokemonDetails(currentPokemonIndex);
}

function showPreviousPokemon() {
  currentPokemonIndex =
    (currentPokemonIndex - 1 + pokemons.length) % pokemons.length;
  displayPokemonDetails(currentPokemonIndex);
}

function resetToStartPage() {
  offset = 0;
  renderCards();
}

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", (event) => {
  if (event.target.value === "") {
    resetToStartPage();
  }
});

searchInput.addEventListener("searchInput", (event) => {
  const query = event.target.value.trim().toLowerCase();

  if (query === "") {
    resetToStartPage();
  } else if (query.length >= 3) {
    searchPokemons(query);
  }
});

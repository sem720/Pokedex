const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let offset = 0;
const limit = 20;

async function init() {
  console.log("Loading successful...");
  await renderCards();
}

function cardTemplate(pokemon) {
  return `
            <div class="card">
                <div class="card-inner">
                    <div class="card-front">
                        <img height="120px" src="${pokemon.image}" alt="${
    pokemon.name
  }">
                        <span>${pokemon.name.toUpperCase()}</span>
                    </div>
                    <div class="card-back ${pokemon.type}">
                        <p><strong>Size</strong><br> ${pokemon.height} m</p>
                        <p><strong>Weight</strong><br> ${pokemon.weight} kg</p>
                        <p><strong>Category</strong><br> ${pokemon.category}</p>
                        <p><strong>Abilities:</strong><br> ${
                          pokemon.abilities
                        }</p>
                    </div>
                </div>
            </div>`;
}

async function renderCards() {
  const contentRef = document.getElementById("renderPokemons");
  contentRef.innerHTML = "";
  showLoader();
  try {
    await loadPokemons(offset, limit);
  } finally {
    hideLoader();
  }
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
  const pokemonCardData = {
    name: pokemon.name,
    image: details.sprites.front_default,
    height: (details.height / 10).toFixed(2),
    weight: (details.weight / 10).toFixed(2),
    category: details.species.name,
    abilities: details.abilities.map((a) => a.ability.name).join(", "),
    type: details.types[0]?.type.name || "normal",
  };
  document.getElementById("renderPokemons").innerHTML +=
    cardTemplate(pokemonCardData);
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

async function searchPokemons(query) {
  const contentRef = document.getElementById("renderPokemons");
  if (query.length < 3) return renderCards();
  try {
    showLoader();
    const data = await fetchJSON(`${BASE_URL}?limit=50`);
    const matches = data.results.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
    matches.length
      ? await renderMatchedPokemons(matches)
      : displayNoResults(query);
  } catch (error) {
    displayError(error);
  } finally {
    hideLoader();
  }
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

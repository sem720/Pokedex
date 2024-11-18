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
                    <img height="120px" src="${pokemon.image}" alt="${pokemon.name}">
                    <span>${pokemon.name.toUpperCase()}</span>
                </div>
                <div class="card-back ${pokemon.type}">
                    <p><strong>Size</strong><br> ${pokemon.height} m</p>
                    <p><strong>Weight</strong><br> ${pokemon.weight} kg</p>
                    <p><strong>Category</strong><br> ${pokemon.category}</p>
                    <p><strong>Abilities:</strong><br> ${pokemon.abilities}</p>
                </div>
            </div>
        </div>`;
}

async function renderCards() {
    let contentRef = document.getElementById('renderPokemons');
    contentRef.innerHTML = ""; 

    showLoader(); 
    await loadPokemons(offset, limit);
    hideLoader(); 
}


async function loadPokemons(offset, limit) {
    let contentRef = document.getElementById('renderPokemons');
    const loadMoreButton = document.getElementById('loadMoreButton');

    try {
        showLoader(); 

        const response = await fetch(`${BASE_URL}?offset=${offset}&limit=${limit}`);
        const data = await response.json();

        for (let pokemon of data.results) {
            const pokemonDetails = await fetch(pokemon.url);
            const detailsData = await pokemonDetails.json();

            const pokemonCardData = {
                name: pokemon.name,
                image: detailsData.sprites.front_default,
                height: (detailsData.height / 10).toFixed(2),
                weight: (detailsData.weight / 10).toFixed(2),
                category: detailsData.species.name,
                abilities: detailsData.abilities.map(a => a.ability.name).join(', '),
                type: detailsData.types[0] ? detailsData.types[0].type.name : 'normal', 
            };

            contentRef.innerHTML += cardTemplate(pokemonCardData);
        }
    } catch (error) {
        contentRef.innerHTML += `<p>Fehler beim Laden der Pokémon-Daten: ${error.message}</p>`;
    } finally {
        hideLoader(); 
        if (loadMoreButton) {
            loadMoreButton.disabled = false;
            loadMoreButton.innerHTML = 'Load more';
        }
    }
}



async function loadMorePokemons() {
    const loadMoreButton = document.getElementById('loadMoreButton');

    loadMoreButton.disabled = true;
    loadMoreButton.innerHTML = '<div class="loader"></div>';

    offset += limit;

    
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();

    if (searchQuery.length < 3) {
        
        await loadPokemons(offset, limit);
    } else {
        
        await searchPokemons(searchQuery);
    }
}

async function searchPokemons(query) {
    let contentRef = document.getElementById('renderPokemons');
    contentRef.innerHTML = ""; 

    const searchQuery = query.trim().toLowerCase();

    
    if (searchQuery.length >= 3) {
        try {
            showLoader(); 

            const response = await fetch(`${BASE_URL}?limit=50`);
            const data = await response.json();

            const filteredPokemons = data.results.filter(pokemon =>
                pokemon.name.toLowerCase().includes(searchQuery)
            );

            if (filteredPokemons.length === 0) {
                contentRef.innerHTML = `<div class="no-find"><p>Kein Pokémon gefunden, das mit "${searchQuery}" übereinstimmt.</p><img height="150px" width="150px" src="./imgs/not-found.png" alt="not-found"></div>`;
            } else {
                
                for (let pokemon of filteredPokemons) {
                    const pokemonDetails = await fetch(pokemon.url);
                    const detailsData = await pokemonDetails.json();

                    
                    const pokemonType = detailsData.types[0] ? detailsData.types[0].type.name : 'normal';

                    const pokemonCardData = {
                        name: pokemon.name,
                        image: detailsData.sprites.front_default,
                        height: (detailsData.height / 10).toFixed(2),
                        weight: (detailsData.weight / 10).toFixed(2),
                        category: detailsData.species.name,
                        abilities: detailsData.abilities.map(a => a.ability.name).join(', '),
                        type: pokemonType 
                    };

                    contentRef.innerHTML += cardTemplate(pokemonCardData);
                }
            }
        } catch (error) {
            contentRef.innerHTML = `<p>Fehler beim Laden der Pokémon-Daten: ${error.message}</p>`;
        } finally {
            hideLoader();
        }
    } else {
        
        renderCards();
    }
}



function showLoader() {
    document.getElementById('spinning-loader').style.display = 'flex';
}


function hideLoader() {
    document.getElementById('spinning-loader').style.display = 'none';
}
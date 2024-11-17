const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

async function init() {
    
    console.log("Loading sucessfull...");
    await renderCards();
}

function cardTemplate(pokemon) {
    return `
        <div class="card">
            <div class="first-content">
                <img height="120px" src="${pokemon.image}" alt="${pokemon.name}">
                <span>${pokemon.name.toUpperCase()}</span>
            </div>
            <div class="second-content">
                <p><strong>Size</strong><br> ${pokemon.height} m</p>
                <p><strong>Weight</strong><br> ${pokemon.weight} kg</p>
                <p><strong>Category</strong><br> ${pokemon.category}</p>
                <p><strong>Abilities:</strong><br> ${pokemon.abilities}</p>
            </div>
        </div>`;
}



async function renderCards() {
    let contentRef = document.getElementById('renderPokemons');
    contentRef.innerHTML = ""; // reset div

    try {
        // API
        const response = await fetch(`${BASE_URL}?limit=20`); // Limit: 20 Pokémon
        const data = await response.json();

        
        for (let pokemon of data.results) {
            const pokemonDetails = await fetch(pokemon.url);
            const detailsData = await pokemonDetails.json();

            
            const pokemonCardData = {
                name: pokemon.name,
                image: detailsData.sprites.front_default,
                height: (detailsData.height / 10).toFixed(2), // Size
                weight: (detailsData.weight / 10).toFixed(2), // Weight
                category: detailsData.species.name, // Category
                abilities: detailsData.abilities.map(a => a.ability.name).join(', '), // Abilities
            };

            
            contentRef.innerHTML += cardTemplate(pokemonCardData);
        }
    } catch (error) {
        contentRef.innerHTML = `<p>Fehler beim Laden der Pokémon-Daten: ${error.message}</p>`;
    }
}



async function searchPokemons(query) {
    let contentRef = document.getElementById('renderPokemons');
    contentRef.innerHTML = ""; // Inhalte zurücksetzen

    // query trim and lowercase
    const searchQuery = query.trim().toLowerCase();

    if (searchQuery.length >= 3) { // Wenn die Eingabe mindestens 3 Buchstaben hat
        try {
            // limit 50
            const response = await fetch(`${BASE_URL}?limit=50`);
            const data = await response.json();

            // Filter Pokemons
            const filteredPokemons = data.results.filter(pokemon =>
                pokemon.name.toLowerCase().includes(searchQuery)
            );

            
            for (let pokemon of filteredPokemons) {
                const pokemonDetails = await fetch(pokemon.url);
                const detailsData = await pokemonDetails.json();

                
                const pokemonCardData = {
                    name: pokemon.name,
                    image: detailsData.sprites.front_default,
                    height: (detailsData.height / 10).toFixed(2), 
                    weight: (detailsData.weight / 10).toFixed(2), 
                    category: detailsData.species.name, 
                    abilities: detailsData.abilities.map(a => a.ability.name).join(', '), 
                };

                
                contentRef.innerHTML += cardTemplate(pokemonCardData);
            }

            // No Findings
            if (filteredPokemons.length === 0) {
                contentRef.innerHTML = `<div class="no-find"><p>Kein Pokémon gefunden, das mit "${searchQuery}" übereinstimmt.</p><img height="150px" width="150px" src="./imgs/not-found.png" alt="not-found"></div>`;
            }
        } catch (error) {
            contentRef.innerHTML = `<p>Fehler beim Laden der Pokémon-Daten: ${error.message}</p>`;
        }
    } else {
        renderCards();  // Display all Pokemon
    }
}
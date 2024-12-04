function cardTemplate(pokemon, index) {
  return `
      <div class="card" onclick="toggleOverlay(event, ${index})">
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
                  <p><strong>Abilities:</strong><br> ${pokemon.abilities}</p>
              </div>
          </div>
      </div>`;
}

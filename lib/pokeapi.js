const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

/**
 * Fetch Pokemon by name or ID
 */
export async function getPokemon(nameOrId) {
  try {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${nameOrId.toLowerCase()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return null;
  }
}

/**
 * Fetch Pokemon species data (includes evolution chain URL)
 */
export async function getPokemonSpecies(nameOrId) {
  try {
    const res = await fetch(`${POKEAPI_BASE}/pokemon-species/${nameOrId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching Pokemon species:', error);
    return null;
  }
}

/**
 * Fetch evolution chain by URL or ID
 */
export async function getEvolutionChain(urlOrId) {
  try {
    const url = typeof urlOrId === 'string' && urlOrId.includes('http')
      ? urlOrId
      : `${POKEAPI_BASE}/evolution-chain/${urlOrId}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
}

/**
 * Fetch Pokemon encounter locations
 */
export async function getPokemonLocations(nameOrId) {
  try {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${nameOrId}/encounters`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching Pokemon locations:', error);
    return [];
  }
}

/**
 * Parse evolution chain into a flat array
 */
export function parseEvolutionChain(chain) {
  const evolutions = [];
  
  function traverse(node) {
    if (!node) return;
    
    const speciesName = node.species.name;
    const id = node.species.url.split('/').filter(Boolean).pop();
    
    evolutions.push({
      name: speciesName,
      id: parseInt(id),
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    });
    
    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach(evolution => traverse(evolution));
    }
  }
  
  traverse(chain);
  return evolutions;
}

/**
 * Format stat name for display
 */
export function formatStatName(statName) {
  const statNames = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Attack',
    'special-defense': 'Sp. Defense',
    'speed': 'Speed'
  };
  return statNames[statName] || statName;
}

/**
 * Get CSS class for stat bar
 */
export function getStatClass(statName) {
  return `stat-${statName}`;
}

/**
 * Format location name for display
 */
export function formatLocationName(name) {
  return name.replace(/-/g, ' ');
}

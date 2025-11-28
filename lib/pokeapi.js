const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Cache for Pokemon list
let pokemonListCache = null;

/**
 * Fetch list of all Pokemon names for autocomplete
 */
export async function getAllPokemonNames() {
  if (pokemonListCache) {
    return pokemonListCache;
  }
  
  try {
    const res = await fetch(`${POKEAPI_BASE}/pokemon?limit=1025`);
    if (!res.ok) return [];
    const data = await res.json();
    pokemonListCache = data.results.map((p) => {
      const id = parseInt(p.url.split('/').filter(Boolean).pop());
      return {
        name: p.name,
        id: id,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
      };
    });
    return pokemonListCache;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    return [];
  }
}

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
 * Parse evolution chain into a flat array with evolution details
 */
export function parseEvolutionChain(chain) {
  const evolutions = [];
  
  function getEvolutionDetails(evolutionDetails) {
    if (!evolutionDetails || evolutionDetails.length === 0) return null;
    
    const details = evolutionDetails[0];
    const result = {
      trigger: details.trigger?.name || null,
      minLevel: details.min_level,
      item: details.item?.name?.replace(/-/g, ' '),
      heldItem: details.held_item?.name?.replace(/-/g, ' '),
      timeOfDay: details.time_of_day || null,
      minHappiness: details.min_happiness,
      minAffection: details.min_affection,
      minBeauty: details.min_beauty,
      knownMove: details.known_move?.name?.replace(/-/g, ' '),
      knownMoveType: details.known_move_type?.name,
      location: details.location?.name?.replace(/-/g, ' '),
      gender: details.gender !== null ? (details.gender === 1 ? 'female' : 'male') : null,
      needsOverworldRain: details.needs_overworld_rain,
      turnUpsideDown: details.turn_upside_down,
    };
    
    return result;
  }
  
  function formatEvolutionMethod(details) {
    if (!details) return null;
    
    const parts = [];
    
    if (details.trigger === 'level-up') {
      if (details.minLevel) {
        parts.push(`Level ${details.minLevel}`);
      } else if (details.minHappiness) {
        parts.push(`High friendship`);
      } else if (details.minBeauty) {
        parts.push(`High beauty`);
      } else if (details.knownMove) {
        parts.push(`Knowing ${details.knownMove}`);
      } else if (details.knownMoveType) {
        parts.push(`Knowing ${details.knownMoveType} move`);
      } else if (details.location) {
        parts.push(`At ${details.location}`);
      } else {
        parts.push('Level up');
      }
    } else if (details.trigger === 'use-item') {
      if (details.item) {
        parts.push(`Use ${details.item}`);
      }
    } else if (details.trigger === 'trade') {
      parts.push('Trade');
      if (details.heldItem) {
        parts.push(`holding ${details.heldItem}`);
      }
    } else if (details.trigger === 'shed') {
      parts.push('Level 20, empty slot, Poké Ball');
    } else if (details.trigger) {
      parts.push(details.trigger.replace(/-/g, ' '));
    }
    
    if (details.timeOfDay) {
      parts.push(`(${details.timeOfDay})`);
    }
    
    if (details.gender) {
      parts.push(`(${details.gender})`);
    }
    
    if (details.needsOverworldRain) {
      parts.push('(while raining)');
    }
    
    if (details.turnUpsideDown) {
      parts.push('(hold device upside down)');
    }
    
    return parts.length > 0 ? parts.join(' ') : null;
  }
  
  function traverse(node, evolutionDetails = null) {
    if (!node) return;
    
    const speciesName = node.species.name;
    const id = node.species.url.split('/').filter(Boolean).pop();
    const details = getEvolutionDetails(evolutionDetails);
    
    evolutions.push({
      name: speciesName,
      id: parseInt(id),
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      evolutionDetails: details,
      evolutionMethod: formatEvolutionMethod(details)
    });
    
    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach(evolution => {
        traverse(evolution, evolution.evolution_details);
      });
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

/**
 * Get mega evolutions from species data
 * Returns array of mega evolution forms with their sprites and required items
 */
export function getMegaEvolutions(species, basePokemonName) {
  if (!species || !species.varieties) return [];
  
  const megaEvolutions = species.varieties
    .filter(variety => variety.pokemon.name.includes('-mega'))
    .map(variety => {
      const name = variety.pokemon.name;
      const id = variety.pokemon.url.split('/').filter(Boolean).pop();
      
      // Determine the mega stone name based on the Pokemon name
      let megaStoneName = '';
      if (name.includes('-mega-x')) {
        megaStoneName = `${basePokemonName}ite X`;
      } else if (name.includes('-mega-y')) {
        megaStoneName = `${basePokemonName}ite Y`;
      } else {
        megaStoneName = `${basePokemonName}ite`;
      }
      
      // Format display name
      let displayName = name.replace(basePokemonName + '-', '').replace(/-/g, ' ');
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      
      return {
        name: name,
        displayName: `Mega ${basePokemonName.charAt(0).toUpperCase() + basePokemonName.slice(1)}${name.includes('-x') ? ' X' : name.includes('-y') ? ' Y' : ''}`,
        id: parseInt(id),
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        megaStone: megaStoneName,
        megaStoneSprite: getMegaStoneSprite(basePokemonName, name)
      };
    });
  
  return megaEvolutions;
}

/**
 * Get mega stone sprite URL
 */
function getMegaStoneSprite(baseName, megaName) {
  // Map Pokemon names to their mega stone item IDs
  const megaStoneIds = {
    'venusaur': 659,
    'charizard': megaName.includes('-x') ? 660 : 661,
    'blastoise': 662,
    'alakazam': 679,
    'gengar': 656,
    'kangaskhan': 675,
    'pinsir': 671,
    'gyarados': 676,
    'aerodactyl': 672,
    'mewtwo': megaName.includes('-x') ? 663 : 664,
    'ampharos': 658,
    'scizor': 670,
    'heracross': 680,
    'houndoom': 666,
    'tyranitar': 669,
    'blaziken': 664,
    'gardevoir': 657,
    'mawile': 681,
    'aggron': 667,
    'medicham': 665,
    'manectric': 682,
    'banette': 668,
    'absol': 677,
    'garchomp': 683,
    'lucario': 673,
    'abomasnow': 674,
    'beedrill': 770,
    'pidgeot': 762,
    'slowbro': 760,
    'steelix': 761,
    'sceptile': 753,
    'swampert': 752,
    'sableye': 754,
    'sharpedo': 759,
    'camerupt': 767,
    'altaria': 755,
    'glalie': 763,
    'salamence': 769,
    'metagross': 758,
    'latias': 684,
    'latios': 685,
    'rayquaza': null, // No mega stone needed
    'lopunny': 768,
    'gallade': 756,
    'audino': 757,
    'diancie': 764
  };
  
  const itemId = megaStoneIds[baseName];
  if (itemId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mega-stone.png`;
  }
  return null;
}

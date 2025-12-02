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
 * Fetch type data for a given type name
 */
export async function getTypeData(typeName) {
  try {
    const res = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching type data:', error);
    return null;
  }
}

/**
 * Calculate type effectiveness (weaknesses and resistances) for a Pokemon
 * based on its types. Returns an object with:
 * - weaknesses: types that deal 2x or 4x damage
 * - resistances: types that deal 0.5x or 0.25x damage
 * - immunities: types that deal 0x damage
 */
export async function getTypeEffectiveness(types) {
  if (!types || types.length === 0) return { weaknesses: [], resistances: [], immunities: [] };
  
  try {
    // Fetch damage relations for each type
    const typeDataPromises = types.map(type => getTypeData(type));
    const typeDataResults = await Promise.all(typeDataPromises);
    
    // Calculate multipliers for each attacking type
    const multipliers = {};
    
    for (const typeData of typeDataResults) {
      if (!typeData || !typeData.damage_relations) continue;
      
      const relations = typeData.damage_relations;
      
      // Types that deal double damage to this type
      relations.double_damage_from.forEach(t => {
        multipliers[t.name] = (multipliers[t.name] || 1) * 2;
      });
      
      // Types that deal half damage to this type
      relations.half_damage_from.forEach(t => {
        multipliers[t.name] = (multipliers[t.name] || 1) * 0.5;
      });
      
      // Types that deal no damage to this type
      relations.no_damage_from.forEach(t => {
        multipliers[t.name] = 0;
      });
    }
    
    // Categorize based on final multiplier
    const weaknesses = [];
    const resistances = [];
    const immunities = [];
    
    for (const [type, multiplier] of Object.entries(multipliers)) {
      if (multiplier === 0) {
        immunities.push({ type, multiplier: 0 });
      } else if (multiplier > 1) {
        weaknesses.push({ type, multiplier });
      } else if (multiplier < 1) {
        resistances.push({ type, multiplier });
      }
    }
    
    // Sort by multiplier (highest weakness first, lowest resistance first)
    weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    resistances.sort((a, b) => a.multiplier - b.multiplier);
    
    return { weaknesses, resistances, immunities };
  } catch (error) {
    console.error('Error calculating type effectiveness:', error);
    return { weaknesses: [], resistances: [], immunities: [] };
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

/**
 * Get regional forms from species data
 * Returns array of regional variants with their sprites
 */
export function getRegionalForms(species, basePokemonName) {
  if (!species || !species.varieties) return [];
  
  const regionalPatterns = ['-alola', '-galar', '-hisui', '-paldea'];
  
  const regionalForms = species.varieties
    .filter(variety => {
      const name = variety.pokemon.name;
      return regionalPatterns.some(pattern => name.includes(pattern));
    })
    .map(variety => {
      const name = variety.pokemon.name;
      const id = variety.pokemon.url.split('/').filter(Boolean).pop();
      
      // Determine the region
      let region = '';
      let regionEmoji = '';
      if (name.includes('-alola')) {
        region = 'Alolan';
        regionEmoji = '🌴';
      } else if (name.includes('-galar')) {
        region = 'Galarian';
        regionEmoji = '🏰';
      } else if (name.includes('-hisui')) {
        region = 'Hisuian';
        regionEmoji = '⛩️';
      } else if (name.includes('-paldea')) {
        region = 'Paldean';
        regionEmoji = '🌺';
      }
      
      const displayName = `${region} ${basePokemonName.charAt(0).toUpperCase() + basePokemonName.slice(1)}`;
      
      return {
        name: name,
        displayName: displayName,
        region: region,
        regionEmoji: regionEmoji,
        id: parseInt(id),
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        types: [] // Will be fetched separately
      };
    });
  
  return regionalForms;
}

/**
 * Fetch Pokemon data for regional forms to get their types
 */
export async function fetchRegionalFormTypes(regionalForms) {
  if (!regionalForms || regionalForms.length === 0) return [];
  
  const formsWithTypes = await Promise.all(
    regionalForms.map(async (form) => {
      try {
        const res = await fetch(`${POKEAPI_BASE}/pokemon/${form.name}`);
        if (!res.ok) return form;
        const data = await res.json();
        return {
          ...form,
          types: data.types.map(t => t.type.name)
        };
      } catch (error) {
        console.error(`Error fetching types for ${form.name}:`, error);
        return form;
      }
    })
  );
  
  return formsWithTypes;
}

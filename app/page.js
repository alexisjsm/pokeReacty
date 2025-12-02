'use client';

import { useState, useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import PokemonCard from '../components/PokemonCard';
import { getPokemon, getPokemonSpecies, getEvolutionChain, getPokemonLocations, parseEvolutionChain, getRegionalForms, fetchRegionalFormTypes, getTypeEffectiveness } from '../lib/pokeapi';

export default function Home() {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [regionalForms, setRegionalForms] = useState([]);
  const [typeEffectiveness, setTypeEffectiveness] = useState({ weaknesses: [], resistances: [], immunities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearch, setCurrentSearch] = useState('');

  const searchPokemon = async (query) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);
    setCurrentSearch(query);
    
    try {
      // Fetch basic Pokemon data
      const pokemonData = await getPokemon(query);
      
      if (!pokemonData) {
        setError(`Pokémon "${query}" not found`);
        setPokemon(null);
        setSpecies(null);
        setEvolutions([]);
        setLocations([]);
        setRegionalForms([]);
        setTypeEffectiveness({ weaknesses: [], resistances: [], immunities: [] });
        setLoading(false);
        return;
      }
      
      setPokemon(pokemonData);
      
      // Fetch type effectiveness (weaknesses/resistances)
      const types = pokemonData.types.map(t => t.type.name);
      const effectiveness = await getTypeEffectiveness(types);
      setTypeEffectiveness(effectiveness);
      
      // Fetch species data for evolution chain
      const speciesData = await getPokemonSpecies(pokemonData.species.name);
      setSpecies(speciesData);
      
      // Fetch evolution chain
      if (speciesData && speciesData.evolution_chain) {
        const evolutionData = await getEvolutionChain(speciesData.evolution_chain.url);
        if (evolutionData) {
          const parsedEvolutions = parseEvolutionChain(evolutionData.chain);
          setEvolutions(parsedEvolutions);
        }
      }
      
      // Get regional forms and fetch their types
      if (speciesData) {
        const forms = getRegionalForms(speciesData, pokemonData.species.name);
        const formsWithTypes = await fetchRegionalFormTypes(forms);
        setRegionalForms(formsWithTypes);
      }
      
      // Fetch locations
      const locationData = await getPokemonLocations(pokemonData.id);
      setLocations(locationData);
      
    } catch (err) {
      console.error('Error searching Pokemon:', err);
      setError('An error occurred while searching');
    }
    
    setLoading(false);
  };

  // Load a default Pokemon on mount
  useEffect(() => {
    searchPokemon('pikachu');
  }, []);

  const handlePokemonClick = (name) => {
    searchPokemon(name);
  };

  return (
    <main className="container">
      <h1 className="title">PokeReacty</h1>
      <p className="subtitle">Search for any Pokémon to see stats, evolutions, and locations!</p>
      
      <SearchForm onSearch={searchPokemon} initialValue={currentSearch} />
      
      {loading && (
        <div className="loading">
          <p>Searching for Pokémon</p>
        </div>
      )}
      
      {error && !loading && (
        <div className="error-message">
          <h2>Not Found</h2>
          <p>{error}</p>
        </div>
      )}
      
      {pokemon && !loading && !error && (
        <PokemonCard 
          pokemon={pokemon}
          species={species}
          evolutions={evolutions}
          locations={locations}
          regionalForms={regionalForms}
          typeEffectiveness={typeEffectiveness}
          onPokemonClick={handlePokemonClick}
        />
      )}
    </main>
  );
}

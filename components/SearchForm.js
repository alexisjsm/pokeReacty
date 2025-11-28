'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAllPokemonNames } from '../lib/pokeapi';

export default function SearchForm({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load all Pokemon names on mount
  useEffect(() => {
    const loadPokemon = async () => {
      const pokemon = await getAllPokemonNames();
      setAllPokemon(pokemon);
    };
    loadPokemon();
  }, []);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim().length > 0 && allPokemon.length > 0) {
      const filtered = allPokemon.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toString() === query.trim()
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, allPokemon]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (pokemon) => {
    setQuery(pokemon.name);
    setShowSuggestions(false);
    onSearch(pokemon.name);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim().toLowerCase());
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search Pokémon by name or ID..."
            className="search-input"
            aria-label="Search Pokemon"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul ref={suggestionsRef} className="suggestions-list">
              {suggestions.map((pokemon, index) => (
                <li
                  key={pokemon.id}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelect(pokemon)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    width={40}
                    height={40}
                    className="suggestion-sprite"
                    unoptimized
                  />
                  <span className="suggestion-name">{pokemon.name}</span>
                  <span className="suggestion-id">#{String(pokemon.id).padStart(4, '0')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
}

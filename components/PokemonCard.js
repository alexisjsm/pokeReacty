'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getMegaEvolutions } from '../lib/pokeapi';

export default function PokemonCard({ pokemon, species, evolutions, locations, regionalForms, typeEffectiveness, onPokemonClick }) {
  const [showShiny, setShowShiny] = useState(false);
  
  if (!pokemon) return null;
  
  const sprite = showShiny 
    ? pokemon.sprites.front_shiny 
    : pokemon.sprites.front_default;
  
  const stats = pokemon.stats;
  const maxStat = 255; // Max possible stat value in Pokemon
  
  // Get the English description from species data
  const getDescription = () => {
    if (!species || !species.flavor_text_entries) return null;
    
    // Find English flavor text, preferring newer games
    const englishEntries = species.flavor_text_entries
      .filter(entry => entry.language.name === 'en');
    
    if (englishEntries.length === 0) return null;
    
    // Get the most recent entry and clean it up
    const text = englishEntries[englishEntries.length - 1].flavor_text;
    // Replace newlines and form feeds with spaces
    return text.replace(/[\n\f]/g, ' ').replace(/\s+/g, ' ').trim();
  };
  
  const description = getDescription();
  
  // Get mega evolutions if available
  const megaEvolutions = getMegaEvolutions(species, pokemon.name);
  
  return (
    <div className="pokemon-card">
      {/* Header Section */}
      <div className="pokemon-header">
        <div className="pokemon-image-container">
          <Image 
            src={sprite || pokemon.sprites.front_default} 
            alt={pokemon.name}
            className="pokemon-image"
            width={180}
            height={180}
            unoptimized
          />
          <label className="shiny-toggle">
            <input 
              type="checkbox" 
              checked={showShiny}
              onChange={(e) => setShowShiny(e.target.checked)}
            />
            Shiny
          </label>
        </div>
        
        <div className="pokemon-info">
          <div className="pokemon-id">#{String(pokemon.id).padStart(4, '0')}</div>
          <h1 className="pokemon-name">{pokemon.name}</h1>
          
          <div className="pokemon-types">
            {pokemon.types.map((typeInfo) => (
              <span 
                key={typeInfo.type.name}
                className={`type-badge type-${typeInfo.type.name}`}
              >
                {typeInfo.type.name}
              </span>
            ))}
          </div>
          
          <div className="pokemon-physical">
            <div className="physical-stat">
              <span className="physical-stat-label">Height</span>
              <span className="physical-stat-value">{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div className="physical-stat">
              <span className="physical-stat-label">Weight</span>
              <span className="physical-stat-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Description Section */}
      {description && (
        <div className="section">
          <h2 className="section-title">📖 Description</h2>
          <p className="pokemon-description">{description}</p>
        </div>
      )}
      
      {/* Stats Section */}
      <div className="section">
        <h2 className="section-title">📊 Base Stats</h2>
        <div className="stats-grid">
          {stats.map((statInfo) => {
            const statName = statInfo.stat.name;
            const statValue = statInfo.base_stat;
            const percentage = (statValue / maxStat) * 100;
            
            const statDisplayNames = {
              'hp': 'HP',
              'attack': 'Attack',
              'defense': 'Defense',
              'special-attack': 'Sp. Attack',
              'special-defense': 'Sp. Defense',
              'speed': 'Speed'
            };
            
            return (
              <div key={statName} className="stat-row">
                <span className="stat-name">{statDisplayNames[statName] || statName}</span>
                <span className="stat-value">{statValue}</span>
                <div className="stat-bar-container">
                  <div 
                    className={`stat-bar stat-${statName}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Total Stats */}
        <div className="stat-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
          <span className="stat-name" style={{ fontWeight: 600 }}>Total</span>
          <span className="stat-value" style={{ fontWeight: 700 }}>
            {stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
          </span>
          <div></div>
        </div>
      </div>
      
      {/* Type Effectiveness Section */}
      {typeEffectiveness && (typeEffectiveness.weaknesses?.length > 0 || typeEffectiveness.resistances?.length > 0 || typeEffectiveness.immunities?.length > 0) && (
        <div className="section">
          <h2 className="section-title">⚔️ Type Effectiveness</h2>
          <div className="type-effectiveness-container">
            {/* Weaknesses */}
            {typeEffectiveness.weaknesses?.length > 0 && (
              <div className="effectiveness-group">
                <h3 className="effectiveness-label weakness-label">Weak Against</h3>
                <div className="effectiveness-types">
                  {typeEffectiveness.weaknesses.map(({ type, multiplier }) => (
                    <div key={type} className="effectiveness-item">
                      <span className={`type-badge type-${type}`}>{type}</span>
                      <span className="multiplier weakness-multiplier">×{multiplier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Resistances */}
            {typeEffectiveness.resistances?.length > 0 && (
              <div className="effectiveness-group">
                <h3 className="effectiveness-label resistance-label">Resistant To</h3>
                <div className="effectiveness-types">
                  {typeEffectiveness.resistances.map(({ type, multiplier }) => (
                    <div key={type} className="effectiveness-item">
                      <span className={`type-badge type-${type}`}>{type}</span>
                      <span className="multiplier resistance-multiplier">×{multiplier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Immunities */}
            {typeEffectiveness.immunities?.length > 0 && (
              <div className="effectiveness-group">
                <h3 className="effectiveness-label immunity-label">Immune To</h3>
                <div className="effectiveness-types">
                  {typeEffectiveness.immunities.map(({ type }) => (
                    <div key={type} className="effectiveness-item">
                      <span className={`type-badge type-${type}`}>{type}</span>
                      <span className="multiplier immunity-multiplier">×0</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Evolution Chain Section */}
      {evolutions && evolutions.length > 1 && (
        <div className="section">
          <h2 className="section-title">🔄 Evolution Chain</h2>
          <div className="evolution-chain">
            {evolutions.map((evo, index) => (
              <div key={evo.id} className="evolution-step">
                {index > 0 && (
                  <div className="evolution-arrow-container">
                    <span className="evolution-arrow">→</span>
                    {evo.evolutionMethod && (
                      <span className="evolution-method">{evo.evolutionMethod}</span>
                    )}
                  </div>
                )}
                <button 
                  className={`evolution-pokemon ${evo.id === pokemon.id ? 'current' : ''}`}
                  onClick={() => onPokemonClick && onPokemonClick(evo.name)}
                  style={{ border: 'none' }}
                >
                  <Image 
                    src={evo.sprite} 
                    alt={evo.name}
                    className="evolution-image"
                    width={80}
                    height={80}
                    unoptimized
                  />
                  <span className="evolution-name">{evo.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mega Evolution Section */}
      {megaEvolutions && megaEvolutions.length > 0 && (
        <div className="section">
          <h2 className="section-title">💎 Mega Evolution</h2>
          <div className="mega-evolution-grid">
            {megaEvolutions.map((mega) => (
              <div key={mega.id} className="mega-evolution-card">
                <div className="mega-pokemon-container">
                  <Image 
                    src={mega.sprite} 
                    alt={mega.displayName}
                    className="mega-pokemon-image"
                    width={120}
                    height={120}
                    unoptimized
                  />
                  <span className="mega-pokemon-name">{mega.displayName}</span>
                </div>
                <div className="mega-stone-container">
                  <div className="mega-stone-icon">💎</div>
                  <span className="mega-stone-name">{mega.megaStone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Regional Forms Section */}
      {regionalForms && regionalForms.length > 0 && (
        <div className="section">
          <h2 className="section-title">🌍 Regional Forms</h2>
          <div className="regional-forms-grid">
            {regionalForms.map((form) => (
              <div key={form.id} className="regional-form-card">
                <div className="regional-form-header">
                  <span className="regional-emoji">{form.regionEmoji}</span>
                  <span className="regional-name">{form.displayName}</span>
                </div>
                <Image 
                  src={form.sprite} 
                  alt={form.displayName}
                  className="regional-form-image"
                  width={100}
                  height={100}
                  unoptimized
                />
                <div className="regional-types">
                  {form.types && form.types.map((type) => (
                    <span 
                      key={type}
                      className={`type-badge type-${type}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Locations Section */}
      <div className="section">
        <h2 className="section-title">📍 Locations</h2>
        {locations && locations.length > 0 ? (
          <div className="locations-grid">
            {locations.slice(0, 12).map((location, index) => (
              <div key={index} className="location-card">
                <div className="location-name">
                  {location.location_area.name.replace(/-/g, ' ')}
                </div>
                {location.version_details.length > 0 && (
                  <div className="location-details">
                    <div className="location-game">
                      {location.version_details.map(v => v.version.name).slice(0, 3).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-locations">
            This Pokémon cannot be encountered in the wild. It may be obtained through evolution, 
            trading, or special events.
          </p>
        )}
      </div>
    </div>
  );
}

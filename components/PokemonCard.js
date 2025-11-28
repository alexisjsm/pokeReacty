'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function PokemonCard({ pokemon, species, evolutions, locations, onPokemonClick }) {
  const [showShiny, setShowShiny] = useState(false);
  
  if (!pokemon) return null;
  
  const sprite = showShiny 
    ? pokemon.sprites.front_shiny 
    : pokemon.sprites.front_default;
  
  const stats = pokemon.stats;
  const maxStat = 255; // Max possible stat value in Pokemon
  
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
      
      {/* Evolution Chain Section */}
      {evolutions && evolutions.length > 1 && (
        <div className="section">
          <h2 className="section-title">🔄 Evolution Chain</h2>
          <div className="evolution-chain">
            {evolutions.map((evo, index) => (
              <div key={evo.id} style={{ display: 'flex', alignItems: 'center' }}>
                {index > 0 && <span className="evolution-arrow">→</span>}
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

'use client';

import { useState } from 'react';

export default function SearchForm({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim().toLowerCase());
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Pokémon by name or ID..."
          className="search-input"
          aria-label="Search Pokemon"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
}

# PokeReacty

A modern Pokédex built with Next.js that allows you to search for Pokémon and view their stats, evolution chains, and locations.

![PokeReacty Screenshot](https://github.com/user-attachments/assets/b2e81665-932b-4b15-bc8f-0ba24daa706f)

## Features

- 🔍 **Pokemon Search**: Search for any Pokémon by name or ID
- 📊 **Base Stats**: View detailed base statistics with visual progress bars
- 🔄 **Evolution Chain**: See the complete evolution chain with clickable sprites
- 📍 **Locations**: Discover where to find each Pokémon in the wild
- ✨ **Shiny Toggle**: Toggle between normal and shiny sprites
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [PokeAPI](https://pokeapi.co/) - RESTful Pokémon API
- CSS3 - Custom styling with CSS variables

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alexisjsm/pokeReacty.git
cd pokeReacty
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
pokeReacty/
├── app/
│   ├── globals.css    # Global styles
│   ├── layout.js      # Root layout
│   └── page.js        # Home page
├── components/
│   ├── PokemonCard.js # Pokemon display component
│   └── SearchForm.js  # Search input component
├── lib/
│   └── pokeapi.js     # PokeAPI utility functions
└── public/            # Static assets
```

## API Integration

This project uses the [PokeAPI](https://pokeapi.co/) to fetch:
- Basic Pokémon data (stats, types, sprites)
- Species data (for evolution chain)
- Evolution chain data
- Encounter locations

## License

MIT


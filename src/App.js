import { useEffect, useState, React } from 'react'
import './App.css'
import PokeApi from './PokeApi'


const title = <h1>PokeReacty</h1>

function App () {
  const [pokemon, setPokemon] = useState([])

  useEffect(() => {
  PokeApi({keyword: 'charizard'}).then(res => setPokemon(res))
  },[])
  console.log(pokemon)

  return (
    <div className="App">
      <header>
        {title}
      </header>
      <p><strong>pokedex number:</strong> {pokemon.id}</p>
       <p><strong>name:</strong> {pokemon.name}</p>    </div> 
  )
}

export default App

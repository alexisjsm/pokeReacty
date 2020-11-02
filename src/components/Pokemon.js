import { useEffect, useState, React } from 'react'
import PokeApi from '../PokeApi'


export default function Pokemon (keyword) {

  const [pokemon, setPokemon] = useState([])

  useEffect(() => {
    (
      async () => {
        const getPokemon = await PokeApi(keyword)
        setPokemon(getPokemon)
      }
    )()

  },[keyword])

  if (pokemon.sprites) {

    // eslint-disable-next-line no-unused-vars
    const {other, versions, ...spritesData } = pokemon.sprites
    pokemon.sprites = spritesData
  }


  if (!keyword.keyword){
    return null
  }

  if (pokemon === 'Not found') {
    return (
    <div id="pokemon">
      <div className="error">
            <p>Not found</p> 
        </div>
    </div>
    )
  }
  
  return(
    <div id='pokemon'>
      <div className="data">
          <p><strong>Pokedex number:</strong> {pokemon.id}</p>
          <p><strong>Name:</strong> {pokemon.name}</p>
          <p><strong>Height: </strong>{pokemon.height / 10} m</p>
          <p><strong>Weight: </strong>{pokemon.weight / 10} kg</p>
          {pokemon.types && pokemon.types.map((el, index) => <p key={index}><strong>Type:</strong> {el.type.name}</p>)}
        <div className="default">
          {pokemon.sprites && Object.entries(pokemon.sprites).map(([key, val]) => {
            if((key === 'front_default' || key === 'back_default') && val !== null) {
              return <img key={key} src={val} alt={key}/>
            }
          })}
        </div>
        <div className="shiny">
          {pokemon.sprites && Object.entries(pokemon.sprites).map(([key, val]) => {
            if((key === 'front_shiny' || key === 'back_shiny') && val !== null) {
              return <img key={key} src={val} alt={key}/>
            }
          })}
        </div>
      </div> 
    </div>
  )
}

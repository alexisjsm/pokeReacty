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
  const {keyword: text} = keyword
 
  if (pokemon.sprites) {

    // eslint-disable-next-line no-unused-vars
    const {other, versions, ...spritesData } = pokemon.sprites
    pokemon.sprites = spritesData
  }
  
  return(
    <div id='pokemon'>
      {pokemon === 'Not found' || text.length <= 0
      
      ? <div className="error">
        <p>Not found</p>
       </div>

       
      :  <div className="data">
          <p><strong>pokedex number:</strong> {pokemon.id}</p>
          <p><strong>name:</strong> {pokemon.name}</p>
          <p><strong>height: </strong>{pokemon.height / 10} m</p>
          <p><strong>weight: </strong>{pokemon.weight / 10} kg</p>
          {pokemon.types && pokemon.types.map((el, index) => <p key={index}><strong>Type:</strong> {el.type.name}</p>)}
        <div className="sprites">
          {pokemon.sprites && Object.entries(pokemon.sprites).map(([key, val]) => {
            if(val !== null) return <img key={key} src={val} alt={key}/>
          })}
        </div>
      </div> 
    }
    </div>
  )
}

import {React} from 'react'

function Pokemon (pokemon) {
  console.log(pokemon)
  return(
    <div>
       <p><strong>pokedex number:</strong> {pokemon.id}</p>
       <p><strong>name:</strong> {pokemon.name}</p>
    </div>
  )
}

export default Pokemon
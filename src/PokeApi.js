export default async function PokeApi ({ keyword = 'pikachu'}) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${keyword}`)
    const response = await res.json()
    return response
    
  } catch (err) {
    if (err instanceof SyntaxError) {
      return 'Not found'
    }
  }
}
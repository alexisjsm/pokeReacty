export default function PokeApi ({ keyword = 'pikachu'}) {
  try {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${keyword}`)
    .then(res => res.json())
    .then(res => {
      if (res) return res
    })
  } catch (err) {
    return err;
  }
}
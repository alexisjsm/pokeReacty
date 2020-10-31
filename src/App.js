import { useState, React } from 'react'
import Pokemon from './components/Pokemon'
import './styles/App.css'


const title = <h1>PokeReacty</h1>

function App () {
  const [keyword, setKeyword] = useState('rowlet')

  return (
    <div className="App">
      <header className="title">
        {title}
      </header>
      
      <Pokemon keyword={keyword}/>
    <form>
      <input type="search" placeholder="search pokemon by id or name" onChange={(ev) => {
        ev.preventDefault()
        setKeyword(ev.target.value)}}>
          
        </input>
    </form>
    </div> 
  )
}

export default App

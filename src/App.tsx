import { useState } from 'react';
import './App.css'
import { Autosuggest } from './components/Autosuggest/Autosuggest'

function App() {

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  return (
    <>
      <div className="text-3xl font-bold underline">
        Hello What3Words!
      </div>
      <Autosuggest onSelect={(value) => setSelectedAddress(value)}></Autosuggest>
      <p>Selected Address: {selectedAddress}</p>
    </>
  )
}

export default App

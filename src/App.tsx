import { useState } from 'react';
import './App.css'
import Autosuggest from './components/Autosuggest/Autosuggest'
const apiKey = import.meta.env.VITE_W3W_API_KEY;
function App() {

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  return (
    <>
      <div className='flex flex-row justify-center'>
        <div className=''>
          <div className="text-3xl font-bold underline">
            Hello What3Words!
          </div>
          <label>what3words address:</label>
          <Autosuggest apiKey={apiKey} onSelect={(value) => setSelectedAddress(value)}></Autosuggest>
          <p>Selected Address: {selectedAddress}</p>
        </div>
      </div>
    </>
  )
}

export default App

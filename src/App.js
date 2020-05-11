import React, { useState, useRef } from 'react'
import './App.scss';
import Nonogram from './components/Nonogram';

function App() {
  const input = useRef(null)
  const [imgSrc, setImgSrc] = useState("")

  const handleUpload = e => {
    console.log(e.target.files)
    const url = URL.createObjectURL(e.target.files[0])
    setImgSrc(url)
  }

  const puzzleData = {
    rows: 10,
    cols: 12,
    backgroundColor: '#ffffff'
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Nonogram Generator/Solver</h1>
      </header>
      <input onChange={handleUpload} type="file" id="img" name="img" accept="image/*" />
      <img src={imgSrc} visibility="hidden" alt="Uploaded file" />

      <Nonogram puzzleData={puzzleData}/>
    </div>
  )
}

export default App;

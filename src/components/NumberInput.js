import React, { useState } from 'react'

function Palette(props) {
  const [inputVal, setInputVal] = useState(props.value)

  // need three functions here because react onChange and number inputs are broken
  const handleInputValChange = e => {
    setInputVal(e.target.value)
    if (e.target.value >= props.min && e.target.value <= props.max) {
      updateVal(e)
    }
  }

  const handleInputKeyDown = e => {
    if (e.key === 'Enter') {
      props.onChange(e)
    }
  }

  const updateVal = e => {
    const min = Number(props.min)
    const max = Number(props.max)
    if (e.target.value < min) {
      e.target.value = min
    }
    if (e.target.value > max) {
      e.target.value = max
    }
    setInputVal(e.target.value)
    props.onChange(e)
  }

  return (
    <input type="number" name={props.name} value={inputVal} min={props.min} max={props.max}
        onChange={handleInputValChange} onBlur={updateVal} onKeyDown={handleInputKeyDown} />
  )
}

export default Palette
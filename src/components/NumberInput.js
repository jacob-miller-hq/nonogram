import React, { useState } from 'react'

function Palette(props) {
  const [inputVal, setInputVal] = useState(props.value)

  // need three functions here because react onChange and number inputs are broken
  const handleInputValChange = e => {
    console.log('change', e.target.value)
    setInputVal(e.target.value)
    if (e.target.value >= props.min && e.target.value <= props.max) {
      updateVal(e)
    }
  }

  const handleInputKeyDown = e => {
    console.log('keydown', e.target.value, e.key)
    if (e.key === 'Enter') {
      props.onChange(e)
    }
  }

  const updateVal = e => {
    const min = Number(props.min)
    const max = Number(props.max)
    console.log('blur', e.target.value)
    if (e.target.value < min) {
      console.log(e.target.value, '->', min)
      e.target.value = min
    }
    if (e.target.value > max) {
      console.log(e.target.value, '->', max)
      e.target.value = max
    }
    console.log('setting:', e.target.value)
    setInputVal(e.target.value)
    props.onChange(e)
  }

  return (
    <input type="number" name={props.name} value={inputVal} min={props.min} max={props.max}
        onInput={handleInputValChange} onBlur={updateVal} onKeyDown={handleInputKeyDown} />
  )
}

export default Palette
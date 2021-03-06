import React from 'react'

function ColorPicker(props) {

  return (
    <div className="color-picker">
      <input type="color" value={props.color} onChange={props.onChange} />
      <label>{props.color}</label>
    </div>
  )
}

export default ColorPicker
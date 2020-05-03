import React, { useState } from 'react'
import NumberInput from './NumberInput'
import ColorPicker from './ColorPicker'

const DEFAULT_PALETTE = [
  '#ffffff',
  '#00003f',
  '#ff0000',
  '#00ff7f',
  '#ffdf00',
  '#3f00ff',
  '#804d20',
  '#ff7fff',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
]

function Palette(props) {
  const [paletteSize, setPaletteSize] = useState(2)
  const [palette, setPalette] = useState(DEFAULT_PALETTE)

  // need three functions here because react onChange and number inputs are broken
  const handlePaletteSizeChange = e => {
    setPaletteSize(e.target.value)
  }

  const pickers = palette.slice(0, paletteSize).map((color, i) => {
    const handleColorIChange = e => {
      setPalette([
        ...palette.slice(0, i),
        e.target.value,
        ...palette.slice(i+1)
      ])
    }
    return (
      <ColorPicker key={i} color={color} onChange={handleColorIChange}/>
    )
  })

  return (
    <div>
      <NumberInput type="number" name="paletteSize" value={paletteSize} min={2} max={16}
          onChange={handlePaletteSizeChange} />

      {pickers}
    </div>
  )
}

export default Palette
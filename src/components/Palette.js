import React, { useState } from 'react'
import NumberInput from './NumberInput'
import ColorPicker from './ColorPicker'

// TODO: [BUG] changing the first color updates second?
// reproduce: start with 2 default colors (different from DEFAULT_PALETTE), open editor and change first color.
// second color should update to default to DEFAULT_PALETTE value
const DEFAULT_PALETTE = [
  '#00003f',
  '#ff0000',
  '#00ff7f',
  '#ffdf00',
  '#3f00ff',
  '#804d20',
  '#ff7fff',
  '#7f7f7f'
]

function Palette(props) {
  const {palette=DEFAULT_PALETTE.slice(0, 1), updatePalette} = props
  const [_palette, set_palette] = useState(DEFAULT_PALETTE)

  // need three functions here because react onChange and number inputs are broken
  const handlePaletteSizeChange = e => {
    updatePalette(_palette.slice(0, e.target.value))
  }

  const pickers = palette.map((color, i) => {
    const handleColorIChange = e => {
      const newPalette = [
        ..._palette.slice(0, i),
        e.target.value,
        ..._palette.slice(i+1)
      ]
      set_palette(newPalette)
      updatePalette(newPalette.slice(0, palette.length))
    }
    return (
      <ColorPicker key={i} color={color} onChange={handleColorIChange}/>
    )
  })

  const handleCloseClick = e => {
    props.onClose()
  }

  return (
    props.hidden ? null :
    <div className="modal">
      <div className="modal-window">
        <button className="modal-close" onClick={handleCloseClick}>x</button>
        <h2>Edit Palette</h2>
        <NumberInput type="number" name="paletteSize" value={palette.length} min={1} max={8}
            onChange={handlePaletteSizeChange} />
        <div className="picker-container">
          {pickers}
        </div>
      </div>
    </div>
  )
}

Palette.defualtProps = {
  palette: DEFAULT_PALETTE.slice(0, 2)
}

export default Palette
import React, { useState, useRef, useEffect } from 'react'
import Palette from './Palette'

function getCursorPos(cvs, e) {
  const rect = cvs.getBoundingClientRect()
  const x = Math.floor(e.clientX - rect.left)
  const y = Math.floor(e.clientY - rect.top)
  return {x, y}
}

function contains({x, y}, {left, top, right, bottom}) {
  return left < x && x < right
      && top < y && y < bottom
}

function bound({x, y}, {left, top, right, bottom}) {
  return {
    x: Math.max(left, Math.min(x, right-1)),
    y: Math.max(top, Math.min(y, bottom-1))
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function Nonogram(props) {
  const {puzzleData} = props
  const {rows, cols, backgroundColor, rowClues, colClues} = 
      puzzleData ? puzzleData : {rows: 1, cols: 1, backgroundColor: '#000000', rowClues: [[]], colClues: [[]]}

  const canvasRef = useRef(null)

  const [canvasDims, setCanvasDims] = useState({width: 0, height: 0})
  const [palette, setPalette] = useState(['#00003f'])
  const [selectedVal, setSelectedVal] = useState(0)
  const [showEditPalette, setShowEditPalette] = useState(false)
  const [grid, setGrid] = useState([])
  const [gridDims, setGridDims] = useState({left:0, top:0, right:0, bottom:0, cluesLeft:0, cluesTop:0, cellSize:0})
  const [paletteDims, setPaletteDims] = useState({left:0, top:0, right:0, bottom:0})
  const [pressed, setPressed] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragIndexes, setDragIndexes] = useState([])
  const [drawVal, setDrawVal] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      setCanvasDims(canvasRef.current.getBoundingClientRect())
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return _ => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // empty dependency array means it only runs on load

  // do this outside the resize handler to prevent flickering
  useEffect(() => {
    const cvs = canvasRef.current
    cvs.width = canvasDims.width
    cvs.height = canvasDims.height
  }, [canvasDims])

  useEffect(() => {
    setGrid(Array(rows * cols).fill(0))
  }, [rows, cols])

  useEffect(() => {
    if (selectedVal >= palette.length) {
      setSelectedVal(palette.length - 1)
    }

    const handleKeyDown = e => {
      const val = e.keyCode - 48
      if (0 <= val && val <= palette.length) {
        setSelectedVal(val !== 0 ? val-1 : 9)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return _ => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [palette, selectedVal])

  useEffect(() => {
    // TODO: this probably needs some work, very messy
    const margin = Math.min(canvasDims.width, canvasDims.height) * 0.05
    const maxLength = (max, clue) => clue.length > max ? clue.length : max
    const maxColClues = colClues.reduce(maxLength, 0)
    const maxRowClues = rowClues.reduce(maxLength, 0)
    const cellSize = Math.min(
        (canvasDims.width  - 1 - 2*margin) / (cols + maxRowClues),
        (canvasDims.height - 1 - 2*margin) / (rows + maxColClues))

    const paletteLeft = margin
    const paletteTop = margin
    const paletteRight = paletteLeft + cellSize
    const paletteBottom = paletteTop + palette.length * cellSize
    setPaletteDims({
      left: paletteLeft,
      top: paletteTop,
      right: paletteRight,
      bottom: paletteBottom,
      cellSize: cellSize
    })

    const gridRight = (canvasDims.width - 1) - margin
    const gridBottom = (canvasDims.height - 1) - margin
    const gridLeft = gridRight - (cellSize * cols)
    const gridTop = gridBottom - (cellSize * rows)
    const cluesLeft = gridLeft - (cellSize * maxRowClues)
    const cluesTop = gridTop - (cellSize * maxColClues) 
    setGridDims({
      left: gridLeft,
      top: gridTop,
      right: gridRight,
      bottom: gridBottom,
      cluesLeft,
      cluesTop,
      cellSize
    })
  }, [canvasDims, cols, rows, palette, rowClues, colClues])

  useEffect(() => {
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const {width, height} = canvasDims
    const {left, top, right, bottom, cluesLeft, cluesTop, cellSize} = gridDims

    // clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // draw palette
    const cellTop = i => paletteDims.top + i * paletteDims.cellSize
    palette.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.fillRect(paletteDims.left, cellTop(i), paletteDims.cellSize, paletteDims.cellSize)
    })

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.rect(paletteDims.left, cellTop(selectedVal), paletteDims.cellSize, paletteDims.cellSize)
    ctx.stroke()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.rect(paletteDims.left, cellTop(selectedVal), paletteDims.cellSize, paletteDims.cellSize)
    ctx.stroke()

    const fillCell = (i, val, isPending) => {
      const r = Math.floor(i / cols)
      const c = i % cols
      const x = c * cellSize
      const y = r * cellSize
      const margin = isPending ? cellSize * 0.2 : 0
  
      ctx.fillStyle = val > 0 ? palette[val-1] : backgroundColor
      ctx.fillRect(left + x + margin, top + y + margin, cellSize - 2*margin, cellSize - 2*margin)
      if (val === -1) {
        const cellLeft = left + x + margin
        const cellTop = top + y + margin
        const cellRight = left + x + cellSize - margin
        const cellBottom = top + y + cellSize - margin
  
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cellLeft, cellTop)
        ctx.lineTo(cellRight, cellBottom)
        ctx.moveTo(cellRight, cellTop)
        ctx.lineTo(cellLeft, cellBottom)
        ctx.stroke()
      }
    }

    // fill grid
    grid.forEach((cell, i) => fillCell(i, cell, false))

    // draw to-be-filled cells
    if (pressed) {
      dragIndexes.forEach(i => fillCell(i, drawVal, true))
    }

    // draw clues
    const drawClue = (clue, x, y) => {
      // draw color
      const color = palette[clue.c - 1]
      ctx.fillStyle = color
      ctx.fillRect(x, y, cellSize, cellSize)
      // draw number
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${0.5 * cellSize}px Arial`
      const rgb = hexToRgb(color)
      ctx.fillStyle = rgb.r*.3 + rgb.g*.5 + rgb.b*.2 > 110 ? '#000000' : '#ffffff'
      ctx.fillText(clue.n, x + cellSize * 0.5, y + cellSize * 0.5)
    }

    for(let i = 0; i < cols; i++) {
      const x = left + i * cellSize
      for(let j = 0; j < colClues[i].length; j++) {
        const y = top - j * cellSize - cellSize
        drawClue(colClues[i][j], x, y)
      }
    }

    for(let i = 0; i < rows; i++) {
      const y = top + i * cellSize
      for(let j = 0; j < rowClues[i].length; j++) {
        const x = left - j * cellSize - cellSize
        drawClue(rowClues[i][j], x, y)
      }
    }

    // outline grid
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cluesLeft, bottom)
    ctx.lineTo(right, bottom)
    ctx.lineTo(right, cluesTop)
    // draw cols
    for(let i = 0; i < cols; i++) {
      const x = left + i * cellSize
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
      // clues
      ctx.moveTo(x, top)
      ctx.lineTo(x, cluesTop)
    }
    // draw rows
    for(let i = 0; i < rows; i++) {
      const y = top + i * cellSize
      ctx.moveTo(left, y)
      ctx.lineTo(right, y)
      // clues
      ctx.moveTo(left, y)
      ctx.lineTo(cluesLeft, y)
    }
    ctx.stroke()
    // TODO: split this up so it doesn't have so many dependencies
  }, [grid, rows, cols, backgroundColor, dragStart, dragIndexes,
    drawVal, pressed, palette, gridDims, paletteDims, canvasDims,
    selectedVal, colClues, rowClues])

  const handleClick = e => {
    const pos = getCursorPos(canvasRef.current, e)
    if(contains(pos, paletteDims)) {
      const newVal = Math.floor((pos.y - paletteDims.top) / paletteDims.cellSize)
      setSelectedVal(newVal) 
    }
  }

  const handleMouseDown = e => {
    if (pressed) {
      // whoops, must have missed a mouseUp, don't set new dragStart or drawVal
      return
    }
    const pos = getCursorPos(canvasRef.current, e)
    if (contains(pos, gridDims)) {
      setPressed(true)
      setDragStart(pos)
      const idx = posToGridIdx(pos, gridDims)
      if (e.button === 0) {
        if (grid[idx] === selectedVal+1) {
          setDrawVal(0)
        } else {
          setDrawVal(selectedVal+1)
        }
      } else if (e.button === 2) {
        if (grid[idx] === -1) {
          setDrawVal(0)
        } else {
          setDrawVal(-1)
        }
      } else {
        return // ignore middle button
      }
      // add just this cell to the ones pending change without waiting for drag
      setDragIndexes(getIndexesBetween(pos, pos))
    }
  }

  const handleMouseMove = e => {
    const pos = getCursorPos(canvasRef.current, e)
    if (pressed) {
      if (!e.buttons) {
        // somehow button release was not recognized
        setPressed(false)
        return
      }
      // only allow lines along an axis
      const isHorizontal = Math.abs(pos.x - dragStart.x) > Math.abs(pos.y - dragStart.y)
      const dragEnd = isHorizontal ?
          {x: pos.x, y: dragStart.y} :
          {x: dragStart.x, y: pos.y}
      
      const boundedEnd = bound(dragEnd, gridDims)
      
      // TODO: consider preventing erase action from erasing other colors/non-x's/etc
      const indexesBetween = getIndexesBetween(dragStart, boundedEnd)
      if (drawVal > 0 && indexesBetween.length > 1) {
        // prevent dragged color from drawing over x's
        const filteredIndexesBetween = indexesBetween.filter(idx => grid[idx] !== -1)
        setDragIndexes(filteredIndexesBetween)
      } else {
        setDragIndexes(indexesBetween)
      }
    }
  }

  const handleMouseUp = e => {
    const pos = getCursorPos(canvasRef.current, e)
    if (pressed && contains(pos, gridDims)) {
      setPressed(false)
      setGridIndexes(dragIndexes, drawVal)
    }
  }

  const handleContextMenu = e => {
    e.preventDefault()
  }

  const getIndexesBetween = (pos1, pos2) => {
    // could calculate how many cells are actually covered, but for now it's faster/easier
    // to just make sure we can cover the max situation and work backwards
    const maxCellsToFill = Math.max(rows, cols)
    const indexes = []
    for (let i = 0; i < maxCellsToFill; i++) {
      const alpha = i / (maxCellsToFill - 1)
      const pos = {
        x: pos2.x * alpha + pos1.x * (1 - alpha),
        y: pos2.y * alpha + pos1.y * (1 - alpha),
      }
      const idx = posToGridIdx(pos, gridDims)
      indexes.push(idx)
    }
    // return only unique indexes
    return indexes.filter((val, i, arr) => arr.indexOf(val) === i)
  }

  const setGridIndexes = (indexes, val) => {
    const newGrid = grid.slice(0)
    indexes.forEach(idx => {
      newGrid[idx] = val
    })
    setGrid(newGrid)
  }

  const posToGridIdx = (pos, gridRect) => {
    const {left, top, right, bottom} = gridRect
    const r = Math.floor((pos.y - top) / (bottom - top) * rows)
    const c = Math.floor((pos.x - left) / (right - left) * cols)
    return r * cols + c
  }

  const handleOpenPalette = () => {
    setShowEditPalette(true)
  }

  const handleClosePalette = () => {
    setShowEditPalette(false)
  }

  const handleUpdatePalette = (newPalette) => {
    setPalette(newPalette)
  }

  return (
    <div className='nonogram'>
      <button onClick={handleOpenPalette}>Edit Palette</button>
      <canvas ref={canvasRef} onClick={handleClick}
          onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove} onContextMenu={handleContextMenu} />

      <Palette palette={palette} updatePalette={handleUpdatePalette} onClose={handleClosePalette} hidden={!showEditPalette} />
    </div>
  )
}

export default Nonogram
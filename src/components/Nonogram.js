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

function Nonogram(props) {
  const {puzzleData} = props
  const {rows, cols, backgroundColor} = 
      puzzleData ? puzzleData : {rows: 10, cols: 10, backgroundColor: '#000000'}

  const canvasRef = useRef(null)

  const [canvasRect, setCanvasRect] = useState({width: 0, height: 0})
  const [palette, setPalette] = useState(['#00003f'])
  const [showEditPalette, setShowEditPalette] = useState(false)
  const [grid, setGrid] = useState([])
  const [gridRect, setGridRect] = useState({left:0, top:0, right:0, bottom:0})
  const [pressed, setPressed] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragIndexes, setDragIndexes] = useState([])
  const [drawVal, setDrawVal] = useState(null)

  useEffect(() => {
    console.log('resize effect')
    const handleResize = () => {
      setCanvasRect(canvasRef.current.getBoundingClientRect())
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
    cvs.width = canvasRect.width
    cvs.height = canvasRect.height
  }, [canvasRect])

  useEffect(() => {
    setGrid(Array(rows * cols).fill(0))
  }, [rows, cols])

  useEffect(() => {
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const {width, height} = canvasRect

    // TODO: this probably needs some work
    const margin = 5
    const cellSize = Math.min((width - 1 - 2*margin) / cols, (height - 1 - 2*margin) / rows)
    const gridRight = (width - 1) - margin
    const gridBottom = (height - 1) - margin
    const gridLeft = gridRight - (cellSize * cols)
    const gridTop = gridBottom - (cellSize * rows)
    setGridRect({
      left: gridLeft,
      top: gridTop,
      right: gridRight,
      bottom: gridBottom
    })

    // clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    const fillCell = (i, val, isPending) => {
      const r = Math.floor(i / cols)
      const c = i % cols
      const x = c * cellSize
      const y = r * cellSize
      const margin = isPending ? cellSize * 0.2 : 0
  
      ctx.fillStyle = val > 0 ? palette[val-1] : backgroundColor
      ctx.fillRect(gridLeft + x + margin, gridTop + y + margin, cellSize - 2*margin, cellSize - 2*margin)
      if (val === -1) {
        const cellLeft = gridLeft + x + margin
        const cellTop = gridTop + y + margin
        const cellRight = gridLeft + x + cellSize - margin
        const cellBottom = gridTop + y + cellSize - margin
  
        ctx.strokeStyle = '#000000'
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

    // outline grid
    ctx.strokeStyle = '#111111'
    ctx.beginPath()
    ctx.moveTo(gridLeft, gridBottom)
    ctx.lineTo(gridRight, gridBottom)
    ctx.lineTo(gridRight, gridTop)
    for(let i = 0; i < cols; i++) {
      let x = gridLeft + i * cellSize
      ctx.moveTo(x, gridTop)
      ctx.lineTo(x, gridBottom)
    }
    for(let i = 0; i < rows; i++) {
      let y = gridTop + i * cellSize
      ctx.moveTo(gridLeft, y)
      ctx.lineTo(gridRight, y)
    }
    ctx.stroke()
    
  }, [grid, rows, cols, backgroundColor, dragStart, dragIndexes, drawVal, pressed, palette, canvasRect])

  const handleMouseDown = e => {
    if (pressed) {
      // whoops, must have missed a mouseUp, don't set new dragStart or drawVal
      return
    }
    const pos = getCursorPos(canvasRef.current, e)
    if (contains(pos, gridRect)) {
      setPressed(true)
      setDragStart(pos)
      if (e.button === 0) {
        const idx = posToGridIdx(pos, gridRect)
        if (grid[idx] === 1) {
          setDrawVal(0)
        } else {
          setDrawVal(1)
        }
      } else if (e.button === 2) {
        setDrawVal(-1)
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
      
      const boundedEnd = bound(dragEnd, gridRect)
      
      setDragIndexes(getIndexesBetween(dragStart, boundedEnd))
    }
  }

  const handleMouseUp = e => {
    const pos = getCursorPos(canvasRef.current, e)
    if (pressed && contains(pos, gridRect)) {
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
      const idx = posToGridIdx(pos, gridRect)
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
      <canvas ref={canvasRef}
          onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove} onContextMenu={handleContextMenu} />

      <Palette palette={palette} updatePalette={handleUpdatePalette} onClose={handleClosePalette} hidden={!showEditPalette} />
    </div>
  )
}

export default Nonogram
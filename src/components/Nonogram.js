import React, { useState, useRef, useEffect } from 'react'

function getCursorPos(cvs, e) {
  const rect = cvs.getBoundingClientRect()
  const x = Math.floor(e.clientX - rect.left)
  const y = Math.floor(e.clientY - rect.top)
  return {x, y}
}

function Nonogram(props) {
  const {puzzleData} = props
  const {rows, cols} = puzzleData ? puzzleData : {rows: 10, cols: 10}

  const canvasRef = useRef(null)

  const [grid, setGrid] = useState([])
  const [gridRect, setGridRect] = useState({left:0, top:0, right:0, bottom:0})

  useEffect(() => {
    setGrid(Array(rows * cols).fill(0))
  }, [rows, cols])

  useEffect(() => {
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const w = cvs.width
    const h = cvs.height

    // TODO: this probably needs some work
    const margin = 5
    const cellSize = Math.min((w - 1 - 2*margin) / cols, (h - 1 - 2*margin) / rows)
    const gridRight = (w - 1) - margin
    const gridBottom = (h - 1) - margin
    const gridLeft = gridRight - (cellSize * cols)
    const gridTop = gridBottom - (cellSize * rows)
    setGridRect({
      left: gridLeft,
      top: gridTop,
      right: gridRight,
      bottom: gridBottom
    })

    // clear canvas
    ctx.fillStyle = '#dddddd'
    ctx.fillRect(0, 0, w, h)

    // fill grid
    grid.forEach((cell, i) => {
      if (cell) {
        let r = Math.floor(i / cols)
        let c = i % cols
        let x = c * cellSize
        let y = r * cellSize

        ctx.fillStyle = "#11dd11"
        ctx.fillRect(gridLeft + x, gridTop + y, cellSize, cellSize)
      }
    })

    // outline grid
    ctx.strokeStyle = '#000000'
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
    
  }, [grid, rows, cols])

  const handleClick = e => {
    const pos = getCursorPos(canvasRef.current, e)
    const i = posToGridIdx(pos, gridRect)
    console.log(grid[i])
    setGrid([
      ...grid.slice(0, i),
      !grid[i],
      ...grid.slice(i+1)
    ])
  }

  const posToGridIdx = (pos, gridRect) => {
    const {left, top, right, bottom} = gridRect
    const r = Math.floor((pos.y - top) / (bottom - top) * rows)
    const c = Math.floor((pos.x - left) / (right - left) * cols)
    return r * cols + c
  }

  return (
    <canvas ref={canvasRef} onClick={handleClick}/>
  )
}

export default Nonogram
import React, { useState, useRef, useEffect } from 'react'

function Nonogram(props) {
  const canvasRef = useRef(null)

  const [gridSize, setGridSize] = useState(10)
  const [grid, setGrid] = useState([])

  useEffect(() => {
    setGrid(Array(gridSize * gridSize).fill(0))
  }, [gridSize])

  useEffect(() => {
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const w = cvs.width
    const h = cvs.height

    // clear canvas
    ctx.fillStyle = '#dddddd'
    ctx.fillRect(0, 0, w, h)

    let colW = (w-1) / gridSize
    let rowH = (h-1) / gridSize
    // fill grid
    grid.forEach((cell, i) => {
      if (cell !== 0) {
        let r = Math.floor(i / gridSize)
        let c = i % gridSize
        let x = c * colW
        let y = r * rowH

        ctx.fillStyle = "#11dd11"
        ctx.fillRect(x, y, colW, rowH)
      }
    })

    // outline grid
    ctx.strokeStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(0, h-1)
    ctx.lineTo(w-1, h-1)
    ctx.lineTo(w-1, 0)
    for(let i = 0; i < gridSize; i++) {
      let y = i * rowH
      let x = i * colW
      ctx.moveTo(0, y)
      ctx.lineTo(w-1, y)
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h-1)
    }
    ctx.stroke()

    
  }, [grid, gridSize])

  const handleClick = e => {
    const pos = getCursorPos(canvasRef.current, e)
    const i = posToGridIdx(pos)
    setGrid([
      ...grid.slice(0, i),
      !grid[i],
      ...grid.slice(i+1)
    ])
  }

  const posToGridIdx = (pos) => {
    const w = canvasRef.current.width
    const h = canvasRef.current.height
    const r = Math.floor(pos.y / h * gridSize)
    const c = Math.floor(pos.x / w * gridSize)
    return r * gridSize + c
  }

  return (
    <canvas ref={canvasRef} onClick={handleClick}/>
  )
}

function getCursorPos(cvs, e) {
  const rect = cvs.getBoundingClientRect()
  const x = Math.floor(e.clientX - rect.left)
  const y = Math.floor(e.clientY - rect.top)
  return {x, y}
}

export default Nonogram
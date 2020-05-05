import React, { useState, useRef, useEffect } from 'react'

function Nonogram(props) {
  const {puzzleData} = props

  const canvasRef = useRef(null)

  const [grid, setGrid] = useState([])

  useEffect(() => {
    setGrid(Array(puzzleData.rows * puzzleData.cols).fill(0))
  }, [puzzleData.rows, puzzleData.cols])

  useEffect(() => {
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const w = cvs.width
    const h = cvs.height

    // clear canvas
    ctx.fillStyle = '#dddddd'
    ctx.fillRect(0, 0, w, h)

    let colW = (w-1) / puzzleData.cols
    let rowH = (h-1) / puzzleData.rows
    // fill grid
    grid.forEach((cell, i) => {
      if (cell !== 0) {
        let r = Math.floor(i / puzzleData.cols)
        let c = i % puzzleData.cols
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
    for(let i = 0; i < puzzleData.rows; i++) {
      let y = i * rowH
      ctx.moveTo(0, y)
      ctx.lineTo(w-1, y)
    }
    for(let i = 0; i < puzzleData.cols; i++) {
      let x = i * colW
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h-1)
    }
    ctx.stroke()

    
  }, [grid, puzzleData])

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
    const r = Math.floor(pos.y / h * puzzleData.rows)
    const c = Math.floor(pos.x / w * puzzleData.cols)
    return r * puzzleData.cols + c
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
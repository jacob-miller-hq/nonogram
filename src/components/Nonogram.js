import React, { useState, useRef, useEffect } from 'react'

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

function Nonogram(props) {
  const canvas = useRef(null)

  useEffect(() => {
    const cvs = canvas.current
    console.log(cvs)
    const ctx = cvs.getContext('2d')
    ctx.fillStyle = '#dddddd'
    ctx.fillRect(0, 0, cvs.width, cvs.height)
  })

  return (
    <canvas ref={canvas}/>
  )
}

export default Nonogram
import React, { useRef, useEffect, useState } from 'react';

export default function Squares({
  direction = 'Right',
  speed = 1,
  borderColor = '#e5e7eb',
  squareSize = 40,
  hoverFillColor = '#f3f4f6',
}) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const numSquaresX = useRef(0);
  const numSquaresY = useRef(0);
  const drawOffset = useRef({ x: 0, y: 0 });
  const hoveredSquareRef = useRef(null);

  const [hoveredSquare, setHoveredSquare] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(drawOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(drawOffset.current.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (drawOffset.current.x % squareSize);
          const squareY = y - (drawOffset.current.y % squareSize);

          if (
            hoveredSquareRef.current &&
            Math.floor(x / squareSize) === hoveredSquareRef.current.x &&
            Math.floor(y / squareSize) === hoveredSquareRef.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'Right':
          drawOffset.current.x -= effectiveSpeed;
          break;
        case 'Left':
          drawOffset.current.x += effectiveSpeed;
          break;
        case 'Up':
          drawOffset.current.y += effectiveSpeed;
          break;
        case 'Down':
          drawOffset.current.y -= effectiveSpeed;
          break;
        case 'Diagonal':
          drawOffset.current.x -= effectiveSpeed;
          drawOffset.current.y -= effectiveSpeed;
          break;
        default:
          break;
      }
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(drawOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(drawOffset.current.y / squareSize) * squareSize;

      const hoveredX = Math.floor(
        (mouseX + drawOffset.current.x % squareSize) / squareSize
      );
      const hoveredY = Math.floor(
        (mouseY + drawOffset.current.y % squareSize) / squareSize
      );

      setHoveredSquare({ x: hoveredX, y: hoveredY });
    };

    const handleMouseLeave = () => {
      setHoveredSquare(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  useEffect(() => {
    hoveredSquareRef.current = hoveredSquare;
  }, [hoveredSquare]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}

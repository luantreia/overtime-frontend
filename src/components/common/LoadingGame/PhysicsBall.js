import React, { useEffect, useRef, useState } from 'react';

export default function PhysicsBall() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isTouchDevice = useRef(false);

  const ball = useRef({
    x: 100,
    y: 100,
    radius: 15,
    vx: 0,
    vy: 0,
    ay: 0.6,
  });

  const drag = useRef({
    dragging: false,
    start: null,
    current: null,
  });

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function updateSize() {
      if (!containerRef.current) return;
      const maxWidth = containerRef.current.clientWidth;
      const width = Math.min(600, maxWidth, window.innerWidth * 0.95);
      const height = Math.min(window.innerHeight * 0.65, width * 0.9);
      setCanvasSize({ width, height });

      ball.current.radius = isTouchDevice.current ? Math.max(16, width / 25) : Math.max(12, width / 40);
      ball.current.x = width / 6;
      ball.current.y = height / 4;
      ball.current.vx = 0;
      ball.current.vy = 0;
    }

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const createTarget = () => {
    const margin = 50;
    const radius = isTouchDevice.current ? Math.max(14, canvasSize.width / 35) : Math.max(10, canvasSize.width / 50);
    return {
      x: margin + Math.random() * (canvasSize.width - 2 * margin),
      y: margin + Math.random() * (canvasSize.height - 2 * margin),
      radius,
    };
  };

  useEffect(() => {
    if (!gameOver) {
      const initialTargets = [];
      for (let i = 0; i < 5; i++) initialTargets.push(createTarget());
      setTargets(initialTargets);
      setTimeLeft(isTouchDevice.current ? 15 : 10);
    }
  }, [canvasSize, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const spawnInterval = setInterval(() => {
      setTargets((prev) => {
        if (prev.length < 5) return [...prev, createTarget()];
        return prev;
      });
    }, 5000);
    return () => clearInterval(spawnInterval);
  }, [gameOver, canvasSize]);

  useEffect(() => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function draw() {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      ctx.beginPath();
      ctx.fillStyle = '#e53935';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      if (drag.current.dragging && drag.current.start && drag.current.current) {
        ctx.beginPath();
        ctx.strokeStyle = '#1e88e5';
        ctx.lineWidth = 3;
        ctx.moveTo(drag.current.start.x, drag.current.start.y);
        ctx.lineTo(drag.current.current.x, drag.current.current.y);
        ctx.stroke();
      }

      targets.forEach(({ x, y, radius }) => {
        ctx.beginPath();
        ctx.fillStyle = '#43a047';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 6;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      });

      const fontSize = Math.max(14, canvasSize.width / 25);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = '#333';
      ctx.fillText(`Puntaje: ${score}`, 10, 30);
      ctx.fillText(`Tiempo: ${timeLeft}s`, 10, 60);
    }

    function updatePhysics() {
      if (drag.current.dragging) return;

      ball.current.vy += ball.current.ay;
      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;

      const r = ball.current.radius;
      const w = canvasSize.width;
      const h = canvasSize.height;

      const bounceFactor = 0.7;
      const friction = 0.98;

      if (ball.current.y + r > h) {
        ball.current.y = h - r;
        ball.current.vy = -ball.current.vy * bounceFactor;
        ball.current.vx *= friction;
      }
      if (ball.current.y - r < 0) {
        ball.current.y = r;
        ball.current.vy = -ball.current.vy * bounceFactor;
      }
      if (ball.current.x + r > w) {
        ball.current.x = w - r;
        ball.current.vx = -ball.current.vx * bounceFactor;
      }
      if (ball.current.x - r < 0) {
        ball.current.x = r;
        ball.current.vx = -ball.current.vx * bounceFactor;
      }

      if (Math.abs(ball.current.vx) < 0.05) ball.current.vx = 0;
      if (Math.abs(ball.current.vy) < 0.05) ball.current.vy = 0;

      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        const dist = Math.hypot(ball.current.x - t.x, ball.current.y - t.y);
        if (dist < r + t.radius) {
          setScore((prev) => prev + 1);
          setTimeLeft((prev) => prev + 4);
          setTargets((prev) => prev.filter((_, idx) => idx !== i));

          ball.current.vx = -ball.current.vx * 0.8;
          ball.current.vy = -ball.current.vy * 0.8;
          break;
        }
      }
    }

    let animationId;
    function loop() {
      updatePhysics();
      draw();
      animationId = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(animationId);
  }, [targets, score, timeLeft, gameOver, canvasSize]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleDown = (e) => {
    if (gameOver) return;
    e.preventDefault();
    const pos = getPos(e);
    const dist = Math.hypot(pos.x - ball.current.x, pos.y - ball.current.y);
    if (dist <= ball.current.radius) {
      drag.current.dragging = true;
      drag.current.start = { x: ball.current.x, y: ball.current.y };
      drag.current.current = pos;
      ball.current.vx = 0;
      ball.current.vy = 0;
      setIsDragging(true);
    }
  };

  const handleMove = (e) => {
    if (!drag.current.dragging || gameOver) return;
    e.preventDefault();
    drag.current.current = getPos(e);
  };

  const handleUp = (e) => {
    if (!drag.current.dragging || gameOver) return;
    e.preventDefault();

    const dx = drag.current.current.x - drag.current.start.x;
    const dy = drag.current.current.y - drag.current.start.y;

    const forceScale = canvasSize.width / 16000;
    ball.current.vx = dx * 2 * forceScale;
    ball.current.vy = dy * 2 * forceScale;

    drag.current.dragging = false;
    drag.current.start = null;
    drag.current.current = null;
    setIsDragging(false);
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setTimeLeft(isTouchDevice.current ? 15 : 10);
    ball.current = {
      x: canvasSize.width / 6,
      y: canvasSize.height / 4,
      radius: isTouchDevice.current ? Math.max(16, canvasSize.width / 25) : Math.max(12, canvasSize.width / 40),
      vx: 0,
      vy: 0,
      ay: 0.6,
    };
    const initialTargets = [];
    for (let i = 0; i < 5; i++) initialTargets.push(createTarget());
    setTargets(initialTargets);
  };

  return (
    <div
      ref={containerRef}
      style={{ maxWidth: 600, margin: 'auto', userSelect: 'none', padding: 10, textAlign: 'center' }}
    >
      <h2 style={{ fontSize: Math.max(18, canvasSize.width / 20) }}>Lanza la pelota y golpea los objetivos</h2>
      <p style={{ marginTop: 8, fontStyle: 'italic', color: '#555' }}>
        Los jugadores se están cargando, jugá mientras esperás...
      </p>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          border: '2px solid #333',
          borderRadius: 12,
          backgroundColor: '#f5f5f5',
          cursor: isDragging ? 'grabbing' : gameOver ? 'not-allowed' : 'grab',
          width: '100%',
          height: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          touchAction: 'none',
        }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
        onTouchCancel={handleUp}
      />

      {gameOver && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 'bold' }}>¡Juego terminado!</p>
          <p style={{ fontSize: 16 }}>Puntaje final: {score}</p>
          <button
            onClick={resetGame}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#1e88e5',
              color: '#fff',
              cursor: 'pointer',
              marginTop: 10,
            }}
          >
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

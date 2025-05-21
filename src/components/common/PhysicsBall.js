import React, { useRef, useEffect, useState } from 'react';

export default function PhysicsBall() {
  const canvasRef = useRef(null);
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const ball = useRef({
    x: 100,
    y: 100,
    radius: 15,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0.6,
  });

  const drag = useRef({
    isDragging: false,
    dragStart: null,
    dragEnd: null,
  });

  const canvasWidth = 600;
  const canvasHeight = 400;

  const generateTarget = () => ({
    x: 50 + Math.random() * (canvasWidth - 100),
    y: 50 + Math.random() * (canvasHeight - 150),
    radius: 12,
  });

  const initTargets = () => {
    const newTargets = [];
    for (let i = 0; i < 5; i++) {
      newTargets.push(generateTarget());
    }
    setTargets(newTargets);
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(10);
    setGameOver(false);
    ball.current = { x: 100, y: 100, radius: 15, vx: 0, vy: 0, ax: 0, ay: 0.6 };
    initTargets();
  };

  useEffect(() => {
    initTargets();
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const spawnTimer = setInterval(() => {
      setTargets((prev) => {
        if (prev.length < 5) {
          return [...prev, generateTarget()];
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(spawnTimer);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function draw() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Pelota
      ctx.beginPath();
      ctx.fillStyle = '#d32f2f';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      // Línea de lanzamiento
      if (drag.current.isDragging && drag.current.dragStart && drag.current.dragEnd) {
        ctx.beginPath();
        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 3;
        ctx.moveTo(drag.current.dragStart.x, drag.current.dragStart.y);
        ctx.lineTo(drag.current.dragEnd.x, drag.current.dragEnd.y);
        ctx.stroke();
      }

      // Objetivos
      targets.forEach((t) => {
        ctx.beginPath();
        ctx.fillStyle = '#2e7d32';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 5;
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      });

      // Puntaje y tiempo
      ctx.font = '18px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(`Puntaje: ${score}`, 10, 25);
      ctx.fillText(`Tiempo: ${timeLeft}s`, 10, 50);
    }

    function updatePhysics() {
      if (drag.current.isDragging) return;

      const b = ball.current;
      b.vx += b.ax;
      b.vy += b.ay;

      b.x += b.vx;
      b.y += b.vy;

      const restitution = 0.7;
      const friction = 0.98;

      if (b.y + b.radius > canvasHeight) {
        b.y = canvasHeight - b.radius;
        b.vy = -b.vy * restitution;
        b.vx *= friction;
      }
      if (b.y - b.radius < 0) {
        b.y = b.radius;
        b.vy = -b.vy * restitution;
      }
      if (b.x + b.radius > canvasWidth) {
        b.x = canvasWidth - b.radius;
        b.vx = -b.vx * restitution;
      }
      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx = -b.vx * restitution;
      }

      if (Math.abs(b.vx) < 0.05) b.vx = 0;
      if (Math.abs(b.vy) < 0.05) b.vy = 0;

      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        const dist = Math.hypot(b.x - t.x, b.y - t.y);
        if (dist < b.radius + t.radius) {
          setScore((s) => s + 1);
          setTimeLeft((t) => t + 5);
          setTargets((ts) => ts.filter((_, idx) => idx !== i));
          b.vx = -b.vx * 0.8;
          b.vy = -b.vy * 0.8;
          break;
        }
      }
    }

    let animationFrameId;

    function loop() {
      updatePhysics();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [targets, score, timeLeft, gameOver]);

  const handleMouseDown = (e) => {
    if (gameOver) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const b = ball.current;
    const dist = Math.hypot(mouseX - b.x, mouseY - b.y);
    if (dist <= b.radius) {
      drag.current.isDragging = true;
      drag.current.dragStart = { x: b.x, y: b.y };
      drag.current.dragEnd = { x: mouseX, y: mouseY };
      b.vx = 0;
      b.vy = 0;
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!drag.current.isDragging || gameOver) return;
    const rect = canvasRef.current.getBoundingClientRect();
    drag.current.dragEnd = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseUp = () => {
    if (!drag.current.isDragging || gameOver) return;

    const dx = drag.current.dragStart.x - drag.current.dragEnd.x;
    const dy = drag.current.dragStart.y - drag.current.dragEnd.y;

    const force = 2.0;
    ball.current.vx = dx * force;
    ball.current.vy = dy * force;

    drag.current.isDragging = false;
    drag.current.dragStart = null;
    drag.current.dragEnd = null;
    setIsDragging(false);
  };

  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }} className='overlay'>
      <h2>Lanza la pelota - ¡Golpea los objetivos!</h2>
        <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#555' }}>
        Los jugadores se están cargando, jugá mientras esperás...
        </p>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '2px solid #333',
          backgroundColor: '#f0f0f0',
          cursor: isDragging ? 'grabbing' : gameOver ? 'not-allowed' : 'grab',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          borderRadius: 12,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {gameOver && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>¡Juego terminado!</strong></p>
          <p>Puntaje final: {score}</p>
          <button
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#1976d2',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
            }}
          >
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

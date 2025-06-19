// src/components/common/PhysicsBall2D.js
import React, { useState, useRef, useEffect } from 'react';

export default function PhysicsBall2D() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [targets, setTargets] = useState([]);

  const ball = useRef({
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    radius: 20,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    color: 'red',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = performance.now();

    const gravity = 0.4;
    const friction = 0.99;
    const bounce = 0.7;

    const update = (dt) => {
      const b = ball.current;
      if (!b.isDragging) {
        b.vy += gravity;
        b.vx *= friction;
        b.vy *= friction;

        b.x += b.vx;
        b.y += b.vy;

        if (b.x + b.radius > canvas.width) {
          b.x = canvas.width - b.radius;
          b.vx *= -bounce;
        }
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx *= -bounce;
        }
        if (b.y + b.radius > canvas.height) {
          b.y = canvas.height - b.radius;
          b.vy *= -bounce;
        }
        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy *= -bounce;
        }
      }

      // Check for collision with targets
      const newTargets = [];
      targets.forEach(t => {
        const dx = b.x - t.x;
        const dy = b.y - t.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < b.radius + t.radius) {
          setScore(s => s + 1);
          setTimeLeft(t => t + 10); // add 10 seconds per target
        } else {
          newTargets.push(t);
        }
      });
      setTargets(newTargets);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ball
      const b = ball.current;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.closePath();

      // Draw targets
      targets.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();
        ctx.closePath();
      });

      // Draw HUD
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(`Puntos: ${score}`, 10, 20);
      ctx.fillText(`Tiempo: ${timeLeft}s`, 10, 40);
    };

    const loop = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      if (!gameOver) {
        update(dt);
        draw();
        animationFrameId = requestAnimationFrame(loop);
      } else {
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.fillText(`¡Juego terminado! Puntos: ${score}`, canvas.width / 2 - 100, canvas.height / 2);
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targets, gameOver]);

  // Time handler
  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, gameOver]);

  // Target spawner
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setTargets(ts => {
        if (ts.length < 5) {
          const newTarget = {
            x: Math.random() * 300 + 50,
            y: Math.random() * 200 + 50,
            radius: 15,
            color: 'blue',
          };
          return [...ts, newTarget];
        }
        return ts;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [targets, gameOver]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const b = ball.current;

    const dx = x - b.x;
    const dy = y - b.y;
    if (Math.sqrt(dx * dx + dy * dy) < b.radius) {
      b.isDragging = true;
      b.dragStart = { x, y };
    }
  };

  const handleMouseUp = (e) => {
    const b = ball.current;
    if (b.isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      b.vx = (b.dragStart.x - x) * 0.2;
      b.vy = (b.dragStart.y - y) * 0.2;
      b.isDragging = false;
    }
  };

  const handleMouseMove = (e) => {
    const b = ball.current;
    if (b.isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      b.x = e.clientX - rect.left;
      b.y = e.clientY - rect.top;
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        style={{ border: '2px solid #000', background: '#f0f0f0' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}

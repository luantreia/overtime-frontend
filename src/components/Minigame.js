import { useEffect, useRef, useState } from "react";

const Minigame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("waiting");
  const [lastWinner, setLastWinner] = useState(null);

  const width = 400;
  const height = 600;
  const paddleWidth = 80;
  const paddleHeight = 20;
  const ballSize = 20;
  const paddleSpeed = 5;
  const ballSpeed = 6;
  const cooldownTime = 500; // ms

  const player1Ref = useRef({ x: width / 2 - paddleWidth / 2, lastShot: 0 });
  const player2Ref = useRef({ x: width / 2 - paddleWidth / 2, lastShot: 0 });
  const keysRef = useRef({});
  const ballsRef = useRef(
    Array.from({ length: 6 }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      active: false,
      owner: null, // "player1" or "player2"
    }))
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;

      const now = Date.now();

      if (e.key === "s" && now - player1Ref.current.lastShot >= cooldownTime) {
        const availableBall = ballsRef.current.find(
          (b) =>
            !b.active &&
            (b.owner === "player1" || b.owner === null || b.y < height / 2)
        );
        if (availableBall) {
          availableBall.x = player1Ref.current.x + paddleWidth / 2 - ballSize / 2;
          availableBall.y = paddleHeight + 5;
          availableBall.vx = 0;
          availableBall.vy = ballSpeed;
          availableBall.active = true;
          availableBall.owner = "player1";
          player1Ref.current.lastShot = now;
          setGameState("running");
        }
      }

      if (e.key === "ArrowUp" && now - player2Ref.current.lastShot >= cooldownTime) {
        const availableBall = ballsRef.current.find(
          (b) =>
            !b.active &&
            (b.owner === "player2" || b.owner === null || b.y > height / 2)
        );
        if (availableBall) {
          availableBall.x = player2Ref.current.x + paddleWidth / 2 - ballSize / 2;
          availableBall.y = height - paddleHeight - ballSize - 5;
          availableBall.vx = 0;
          availableBall.vy = -ballSpeed;
          availableBall.active = true;
          availableBall.owner = "player2";
          player2Ref.current.lastShot = now;
          setGameState("running");
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Movimiento de jugadores
      if (keysRef.current["a"]) player1Ref.current.x -= paddleSpeed;
      if (keysRef.current["d"]) player1Ref.current.x += paddleSpeed;
      if (keysRef.current["ArrowLeft"]) player2Ref.current.x -= paddleSpeed;
      if (keysRef.current["ArrowRight"]) player2Ref.current.x += paddleSpeed;

      // Clamping
      player1Ref.current.x = Math.max(0, Math.min(width - paddleWidth, player1Ref.current.x));
      player2Ref.current.x = Math.max(0, Math.min(width - paddleWidth, player2Ref.current.x));

      // Dibujar paletas
      ctx.fillStyle = "blue";
      ctx.fillRect(player1Ref.current.x, 0, paddleWidth, paddleHeight);
      ctx.fillStyle = "green";
      ctx.fillRect(player2Ref.current.x, height - paddleHeight, paddleWidth, paddleHeight);

      // Dibujar y mover pelotas
      ballsRef.current.forEach((ball) => {
        if (ball.active) {
          ball.x += ball.vx;
          ball.y += ball.vy;
        }

        ctx.beginPath();
        ctx.arc(ball.x + ballSize / 2, ball.y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = ball.active
          ? ball.owner === "player1"
            ? "blue"
            : "green"
          : "#999";
        ctx.fill();
        ctx.closePath();

        // Colisión con jugador 1
        if (
          ball.active &&
          ball.vy < 0 &&
          ball.y <= paddleHeight &&
          ball.x + ballSize >= player1Ref.current.x &&
          ball.x <= player1Ref.current.x + paddleWidth
        ) {
          ball.active = false;
          ball.vx = 0;
          ball.vy = 0;
          ball.owner = "player2";
          setGameState("hit");
          setLastWinner("Player 2");
        }

        // Colisión con jugador 2
        if (
          ball.active &&
          ball.vy > 0 &&
          ball.y + ballSize >= height - paddleHeight &&
          ball.x + ballSize >= player2Ref.current.x &&
          ball.x <= player2Ref.current.x + paddleWidth
        ) {
          ball.active = false;
          ball.vx = 0;
          ball.vy = 0;
          ball.owner = "player1";
          setGameState("hit");
          setLastWinner("Player 1");
        }

        // Fuera del campo
        if (ball.active && (ball.y < -ballSize || ball.y > height + ballSize)) {
          ball.active = false;
          ball.vx = 0;
          ball.vy = 0;
          ball.owner = ball.y < height / 2 ? "player1" : "player2";
          setGameState("miss");
          setLastWinner(null);
        }
      });

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "1px solid #ccc", borderRadius: "8px", background: "#fff" }}
      />
      <div style={{ marginTop: "0.5rem" }}>
        {gameState === "waiting" && <p>Presioná W o ↑ para lanzar una pelota</p>}
        {gameState === "hit" && <p style={{ color: "green" }}>{lastWinner} acertó al oponente 🏆</p>}
        {gameState === "miss" && <p style={{ color: "red" }}>¡Pelota fallida!</p>}
      </div>
    </div>
  );
};

export default Minigame;

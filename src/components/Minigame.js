import { useEffect, useRef, useState } from "react";

const Minigame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("waiting"); // "waiting", "running", "hit", "miss"
  const [lastWinner, setLastWinner] = useState(null);

  const width = 400;
  const height = 600;
  const paddleWidth = 80;
  const paddleHeight = 20;
  const ballSize = 10;
  const paddleSpeed = 5;
  const ballSpeed = 6;

  const player1Ref = useRef({ x: width / 2 - paddleWidth / 2 });
  const player2Ref = useRef({ x: width / 2 - paddleWidth / 2 });
  const ballRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, active: false });
  const keysRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;

      if (!ballRef.current.active) {
        if (e.key === "w") {
          ballRef.current = {
            x: player1Ref.current.x + paddleWidth / 2 - ballSize / 2,
            y: paddleHeight + 5,
            vx: 0,
            vy: ballSpeed,
            active: true,
          };
          setGameState("running");
        } else if (e.key === "ArrowUp") {
          ballRef.current = {
            x: player2Ref.current.x + paddleWidth / 2 - ballSize / 2,
            y: height - paddleHeight - ballSize - 5,
            vx: 0,
            vy: -ballSpeed,
            active: true,
          };
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

      if (keysRef.current["a"]) player1Ref.current.x -= paddleSpeed;
      if (keysRef.current["d"]) player1Ref.current.x += paddleSpeed;
      if (keysRef.current["ArrowLeft"]) player2Ref.current.x -= paddleSpeed;
      if (keysRef.current["ArrowRight"]) player2Ref.current.x += paddleSpeed;

      player1Ref.current.x = Math.max(0, Math.min(width - paddleWidth, player1Ref.current.x));
      player2Ref.current.x = Math.max(0, Math.min(width - paddleWidth, player2Ref.current.x));

      // Draw paddles
      ctx.fillStyle = "blue";
      ctx.fillRect(player1Ref.current.x, 0, paddleWidth, paddleHeight);
      ctx.fillStyle = "green";
      ctx.fillRect(player2Ref.current.x, height - paddleHeight, paddleWidth, paddleHeight);

      // Ball logic
      if (ballRef.current.active) {
        ballRef.current.x += ballRef.current.vx;
        ballRef.current.y += ballRef.current.vy;

        ctx.fillStyle = "red";
        ctx.fillRect(ballRef.current.x, ballRef.current.y, ballSize, ballSize);

        if (
          ballRef.current.vy < 0 &&
          ballRef.current.y <= paddleHeight &&
          ballRef.current.x + ballSize >= player1Ref.current.x &&
          ballRef.current.x <= player1Ref.current.x + paddleWidth
        ) {
          ballRef.current.active = false;
          setGameState("hit");
          setLastWinner("Player 2");
        }

        if (
          ballRef.current.vy > 0 &&
          ballRef.current.y + ballSize >= height - paddleHeight &&
          ballRef.current.x + ballSize >= player2Ref.current.x &&
          ballRef.current.x <= player2Ref.current.x + paddleWidth
        ) {
          ballRef.current.active = false;
          setGameState("hit");
          setLastWinner("Player 1");
        }

        if (ballRef.current.y < -ballSize || ballRef.current.y > height + ballSize) {
          ballRef.current.active = false;
          setGameState("miss");
          setLastWinner(null);
        }
      }

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
        {gameState === "waiting" && <p>Presioná W o ↑ para lanzar la pelota</p>}
        {gameState === "hit" && <p style={{ color: "green" }}>{lastWinner} acertó al oponente 🏆</p>}
        {gameState === "miss" && <p style={{ color: "red" }}>¡La pelota falló! 😅</p>}
      </div>
    </div>
  );
};

export default Minigame;

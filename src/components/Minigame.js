import { useEffect, useRef, useState } from "react";

const Minigame = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const baseWidth = 400;
  const baseHeight = 600;

  const paddleWidth = 80;
  const paddleHeight = 20;
  const ballSize = 20;
  const paddleSpeed = 5;
  const ballSpeed = 10; // pelota más rápida
  const cooldownTime = 500;

  const player1Ref = useRef({ x: baseWidth / 2 - paddleWidth / 2, lastShot: 0 });
  const player2Ref = useRef({ x: baseWidth / 2 - paddleWidth / 2, lastShot: 0 });

  const keysRef = useRef({});
  const ballsRef = useRef(
    Array.from({ length: 6 }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      active: false,
      owner: null,
    }))
  );

  const [scale, setScale] = useState(1);
  const [gameState, setGameState] = useState("waiting");
  const [lastWinner, setLastWinner] = useState(null);

  // Actualiza la escala según el ancho del contenedor
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const newScale = containerWidth / baseWidth;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = baseWidth;
    canvas.height = baseHeight;
    canvas.style.width = `${baseWidth * scale}px`;
    canvas.style.height = `${baseHeight * scale}px`;

    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;

      const now = Date.now();

      if (e.key === "s" && now - player1Ref.current.lastShot >= cooldownTime) {
        const availableBall = ballsRef.current.find(
          (b) =>
            !b.active &&
            (b.owner === "player1" || b.owner === null || b.y < baseHeight / 2)
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
            (b.owner === "player2" || b.owner === null || b.y > baseHeight / 2)
        );
        if (availableBall) {
          availableBall.x = player2Ref.current.x + paddleWidth / 2 - ballSize / 2;
          availableBall.y = baseHeight - paddleHeight - ballSize - 5;
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
      ctx.clearRect(0, 0, baseWidth, baseHeight);

      // Movimiento paletas con teclado o controles táctiles
      if (keysRef.current["a"]) player1Ref.current.x -= paddleSpeed;
      if (keysRef.current["d"]) player1Ref.current.x += paddleSpeed;
      if (keysRef.current["ArrowLeft"]) player2Ref.current.x -= paddleSpeed;
      if (keysRef.current["ArrowRight"]) player2Ref.current.x += paddleSpeed;

      player1Ref.current.x = Math.max(0, Math.min(baseWidth - paddleWidth, player1Ref.current.x));
      player2Ref.current.x = Math.max(0, Math.min(baseWidth - paddleWidth, player2Ref.current.x));

      // Dibuja paletas
      ctx.fillStyle = "blue";
      ctx.fillRect(player1Ref.current.x, 0, paddleWidth, paddleHeight);
      ctx.fillStyle = "green";
      ctx.fillRect(player2Ref.current.x, baseHeight - paddleHeight, paddleWidth, paddleHeight);

      // Mueve y dibuja pelotas
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

        // Colisiones con paletas
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

        if (
          ball.active &&
          ball.vy > 0 &&
          ball.y + ballSize >= baseHeight - paddleHeight &&
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

        // Pelotas fuera de pantalla
        if (ball.active && (ball.y < -ballSize || ball.y > baseHeight + ballSize)) {
          ball.active = false;
          ball.vx = 0;
          ball.vy = 0;
          ball.owner = ball.y < baseHeight / 2 ? "player1" : "player2";
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
  }, [scale]);

  // Controles táctiles jugador 1
  const movePlayer1Left = () => {
    player1Ref.current.x = Math.max(0, player1Ref.current.x - paddleSpeed);
  };
  const movePlayer1Right = () => {
    player1Ref.current.x = Math.min(baseWidth - paddleWidth, player1Ref.current.x + paddleSpeed);
  };
  const player1Shoot = () => {
    const now = Date.now();
    if (now - player1Ref.current.lastShot < cooldownTime) return;

    const availableBall = ballsRef.current.find(
      (b) =>
        !b.active &&
        (b.owner === "player1" || b.owner === null || b.y < baseHeight / 2)
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
  };

  // Controles táctiles jugador 2
  const movePlayer2Left = () => {
    player2Ref.current.x = Math.max(0, player2Ref.current.x - paddleSpeed);
  };
  const movePlayer2Right = () => {
    player2Ref.current.x = Math.min(baseWidth - paddleWidth, player2Ref.current.x + paddleSpeed);
  };
  const player2Shoot = () => {
    const now = Date.now();
    if (now - player2Ref.current.lastShot < cooldownTime) return;

    const availableBall = ballsRef.current.find(
      (b) =>
        !b.active &&
        (b.owner === "player2" || b.owner === null || b.y > baseHeight / 2)
    );
    if (availableBall) {
      availableBall.x = player2Ref.current.x + paddleWidth / 2 - ballSize / 2;
      availableBall.y = baseHeight - paddleHeight - ballSize - 5;
      availableBall.vx = 0;
      availableBall.vy = -ballSpeed;
      availableBall.active = true;
      availableBall.owner = "player2";
      player2Ref.current.lastShot = now;
      setGameState("running");
    }
  };

  return (
    <div ref={containerRef} style={{ maxWidth: "400px", margin: "auto" }}>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", borderRadius: "8px", background: "#fff", touchAction: "none" }}
      />
      <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
        {gameState === "waiting" && <p>Presioná S o ↑ para lanzaruna pelota</p>}
        {gameState === "hit" && <p style={{ color: "green" }}>{lastWinner} acertó al oponente 🏆</p>}
        {gameState === "miss" && <p style={{ color: "red" }}>¡Pelota fallida!</p>}
      </div>
  
  {/* Controles táctiles para jugador 1 */}
  <div style={{ marginTop: "10px", textAlign: "center" }}>
    <button onTouchStart={movePlayer1Left} style={{ marginRight: "10px" }}>
      ◀️
    </button>
    <button onTouchStart={movePlayer1Right} style={{ marginRight: "10px" }}>
      ▶️
    </button>
    <button onTouchStart={player1Shoot}>Lanzar</button>
  </div>

  {/* Controles táctiles para jugador 2 */}
  <div style={{ marginTop: "10px", textAlign: "center" }}>
    <button onTouchStart={movePlayer2Left} style={{ marginRight: "10px" }}>
      ◀️
    </button>
    <button onTouchStart={movePlayer2Right} style={{ marginRight: "10px" }}>
      ▶️
    </button>
    <button onTouchStart={player2Shoot}>Lanzar</button>
  </div>
</div>
);
};
export default Minigame;
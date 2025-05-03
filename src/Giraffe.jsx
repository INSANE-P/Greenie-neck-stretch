import { useEffect, useRef, useState } from "react";
import giraffeImage from "./giraffe.png";
import goalBell from "./Goal_Bell.mp3";

const Giraffe = () => {
  const [backgroundOffset, setBackgroundOffset] = useState(2500);
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [particles, setParticles] = useState([]);
  const [remainingTime, setRemainingTime] = useState(15.0);

  const audioRef = useRef(null);
  const startTimeRef = useRef(null);

  const MAX_OFFSET = 2500;
  const MIN_OFFSET = 0;
  const SPACEBAR_GOAL_COUNT = 100;

  const PARTICLE_STAGE_1_START = 51;
  const PARTICLE_STAGE_2_START = 61;
  const PARTICLE_STAGE_3_START = 71;

  // 🌟 파티클 N개 생성 (40~60% 제외)
  const createParticles = (count) => {
    const width = window.innerWidth;
    const forbiddenStart = width * 0.4;
    const forbiddenEnd = width * 0.6;

    const newParticles = Array.from({ length: count }).map(() => {
      let x;
      while (true) {
        const candidate = Math.random() * width;
        if (candidate < forbiddenStart || candidate > forbiddenEnd) {
          x = candidate;
          break;
        }
      }

      return {
        id: Date.now() + Math.random(),
        x,
        y: 100 + Math.random() * 200,
        lifetime: 0,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  };

  // 파티클 애니메이션
  useEffect(() => {
    let animationFrame;

    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, lifetime: p.lifetime + 0.02 }))
          .filter((p) => p.lifetime < 1)
      );
      animationFrame = requestAnimationFrame(updateParticles);
    };

    animationFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // 타이머 애니메이션
  useEffect(() => {
    let animationFrame;

    const updateTime = () => {
      if (startTimeRef.current !== null) {
        const now = performance.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        const remaining = Math.max(15 - elapsed, 0);
        setRemainingTime(remaining);
      }
      animationFrame = requestAnimationFrame(updateTime);
    };

    animationFrame = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // 키 입력 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !isKeyPressed && !isGameOver) {
        if (startTimeRef.current === null) {
          startTimeRef.current = performance.now(); // 타이머 시작
        }

        setBackgroundOffset((prev) => Math.max(prev - 100, MIN_OFFSET));
        setPressCount((prev) => {
          const nextCount = prev + 1;

          if (nextCount >= SPACEBAR_GOAL_COUNT) {
            setIsGameOver(true);
            if (audioRef.current) {
              audioRef.current.play();
            }
          }

          if (nextCount >= PARTICLE_STAGE_1_START) {
            if (nextCount < PARTICLE_STAGE_2_START) {
              createParticles(1);
            } else if (nextCount < PARTICLE_STAGE_3_START) {
              createParticles(2);
            } else {
              createParticles(3);
            }
          }

          return nextCount;
        });

        setIsKeyPressed(true);
      }

      if (e.key === "r" || e.key === "R") {
        setIsGameOver(false);
        setPressCount(0);
        setBackgroundOffset(MAX_OFFSET);
        setRemainingTime(15.0);
        startTimeRef.current = null;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isKeyPressed, isGameOver]);

  return (
    <div style={{ position: "relative", overflow: "hidden", height: "100vh" }}>
      {/* 오디오 */}
      <audio ref={audioRef} src={goalBell} />

      {/* 배경 */}
      <div
        style={{
          position: "absolute",
          top: `-${backgroundOffset}px`,
          width: "100%",
          height: "3000px",
          background:
            "linear-gradient(to bottom, #000000, #1a1a80, #3399ff, #66ccff, #99cc66)",
          transition: "top 0.3s ease-out",
        }}
      />

      {/* 타이머 */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "18px",
          zIndex: 30,
        }}
      >
        Timer: {remainingTime.toFixed(2)}s
      </div>

      {/* 스페이스바 카운트 표시 */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          fontSize: "14px",
          zIndex: 30,
        }}
      >
        Spacebar Count: {pressCount}
      </div>

      {/* 파티클 */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}px`,
            top: `${p.y + p.lifetime * 100}px`,
            opacity: 1 - p.lifetime,
            color: "black",
            fontSize: "24px",
            pointerEvents: "none",
            zIndex: 25,
          }}
        >
          🌟
        </div>
      ))}

      {/* 기린 */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
        }}
      >
        <img
          src={giraffeImage}
          alt="Giraffe"
          style={{
            width: "300px",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
};

export default Giraffe;

import { useEffect, useState } from "react";
import giraffeImage from "./giraffe.png";

const Giraffe = () => {
  const [backgroundOffset, setBackgroundOffset] = useState(2500);
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false); // 게임 종료 상태

  const MAX_OFFSET = 2500;
  const MIN_OFFSET = 0;
  const SPACEBAR_GOAL_COUNT = 70;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !isKeyPressed && !isGameOver) {
        setBackgroundOffset((prev) => Math.max(prev - 100, MIN_OFFSET));
        setPressCount((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= SPACEBAR_GOAL_COUNT) {
            setIsGameOver(true);
          }
          return nextCount;
        });
        setIsKeyPressed(true);
      }

      if (isGameOver && (e.key === "r" || e.key === "R")) {
        setIsGameOver(false);
        setPressCount(0);
        setBackgroundOffset(MAX_OFFSET); // 자연스럽게 내려가도록 transition 유지
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
      {/* 배경 */}
      <div
        style={{
          position: "absolute",
          top: `-${backgroundOffset}px`,
          width: "100%",
          height: "3000px",
          background:
            "linear-gradient(to bottom, #000000, #1a1a80, #3399ff, #66ccff, #99cc66)",
          transition: "top 0.3s ease-out", // 자연스러운 복귀
        }}
      />

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

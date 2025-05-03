import { useEffect, useState } from "react";
import giraffeImage from "./giraffe.png";

const Giraffe = () => {
  const [backgroundOffset, setBackgroundOffset] = useState(2500);
  const [isKeyPressed, setIsKeyPressed] = useState(false); // 눌림 추적

  const MAX_OFFSET = 2500;
  const MIN_OFFSET = 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !isKeyPressed) {
        setBackgroundOffset((prev) => Math.max(prev - 100, MIN_OFFSET));
        setIsKeyPressed(true);
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
  }, [isKeyPressed]);

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
          transition: "top 0.3s ease-out",
        }}
      />

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

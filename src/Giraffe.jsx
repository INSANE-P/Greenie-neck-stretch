import { useEffect, useRef, useState } from "react";
import giraffeImage from "./giraffe.png";
import giraffeImage2 from "./closeEye.png";
import giraffeImage3 from "./smileGreenie.png";
import brick from "./brick.png";
import goalBell from "./Goal_Bell.mp3";
import { v4 as uuidv4 } from "uuid";

const Giraffe = () => {
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const idCounter = useRef(0);

  const MAX_NECK_OFFSET = 0;
  const MAX_OFFSET = 10000;
  const MIN_OFFSET = 0;
  const SPACEBAR_GOAL_COUNT = 100;

  const PARTICLE_STAGE_1_START = 51;
  const PARTICLE_STAGE_2_START = 61;
  const PARTICLE_STAGE_3_START = 71;

  const [backgroundOffset, setBackgroundOffset] = useState(MAX_OFFSET);
  const [backgroundHeight, setBackgroundHeight] = useState(MAX_OFFSET);
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [particles, setParticles] = useState([]);
  const [remainingTime, setRemainingTime] = useState(15.0);
  const [ranking, setRanking] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [neckOffset, setNeckOffset] = useState(-400);
  const [giraffeFrame, setGiraffeFrame] = useState(0);

  //이름 제출버튼 클릭시 점수를 저장하고 리더보드 모달을 띄우는 이벤트 핸들러러
  const onSubmitButtonClick = (e) => {
    e.preventDefault();
    if (isSubmitted) return;
    const clearTime = 15 - remainingTime;
    const playerId = uuidv4();
    const newPlayer = { name: playerName, score: clearTime, id: playerId };
    console.log(newPlayer);
    setRanking((prevRanking) =>
      [...prevRanking, newPlayer].sort((a, b) => a.score - b.score).slice(0, 5)
    );
    setIsSubmitted(true);
    setPlayerName("");
    e.target.name.blur();
  };

  //이름 인풋 이벤트 핸들러
  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (/\s/.test(newName)) return;
    setPlayerName(newName);
    setNameError(validateId(newName));
  };

  //id 규칙 검사 함수
  const validateId = (name) => {
    if (!/^\d+$/.test(name)) {
      return "숫자만을 입력해주세요.";
    }

    if (name.length !== 4) {
      return "4자리의 id를 입력해주세요.";
    }
    if (/\s/.test(name)) {
      return "공백 없이 입력해주세요.";
    }
    return "";
  };

  useEffect(() => {
    setBackgroundHeight(MAX_OFFSET + window.innerHeight);
  }, []);

  const createParticles = (count) => {
    const width = window.innerWidth;
    const forbiddenStart = width * 0.3;
    const forbiddenEnd = width * 0.7;
    const yMax = count === 1 ? 300 : count === 2 ? 400 : 600;

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
        id: idCounter.current++,
        x,
        y: 100 + Math.random() * (yMax - 100),
        angle: Math.random() * 360,
        lifetime: 0,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  };

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

  useEffect(() => {
    if (isGameOver && !isTimeOver) {
      const input = document.querySelector('input[name="name"]');
      if (input) input.focus();
    }
  }, [isGameOver, isTimeOver]);

  useEffect(() => {
    if (remainingTime === 0 && !isGameOver) {
      setIsTimeOver(true);
      setIsGameOver(true);
      startTimeRef.current = null;
    }
  }, [remainingTime, isGameOver]);

  useEffect(() => {
    if (isGameOver && !isTimeOver) {
      setIsShaking(true);
      const target = document.getElementById("game-container");
      const shakeInterval = setInterval(() => {
        const x = Math.random() * 30 - 15;
        const y = Math.random() * 30 - 15;
        const z = Math.random() * 6 - 3;
        target.style.transform = `translate(${x}px, ${y}px) rotateZ(${z}deg)`;
      }, 16);

      setTimeout(() => {
        clearInterval(shakeInterval);
        target.style.transform = "none";
        setIsShaking(false);
      }, 500);
    }
  }, [isGameOver, isTimeOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !isKeyPressed && !isGameOver) {
        if (startTimeRef.current === null) {
          startTimeRef.current = performance.now();
        }

        setNeckOffset((prev) => {
          if (prev + 10 >= MAX_NECK_OFFSET) {
            return MAX_NECK_OFFSET;
          }
          return prev + 40;
        });
        setBackgroundOffset((prev) => Math.max(prev - 100, MIN_OFFSET));
        setPressCount((prev) => {
          const nextCount = prev + 1;

          if (nextCount >= SPACEBAR_GOAL_COUNT) {
            setIsTimeOver(false);
            setIsGameOver(true);
            startTimeRef.current = null;
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
        setIsTimeOver(false);
        setPressCount(0);
        setIsSubmitted(false);
        setBackgroundOffset(MAX_OFFSET);
        setRemainingTime(15.0);
        setNeckOffset(-400);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setGiraffeFrame((prev) => (prev === 0 ? 1 : 0));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="game-container"
      style={{ position: "relative", overflow: "hidden", height: "100vh" }}
    >
      <style>{`
        @keyframes growCircle {
          0% {
            clip-path: circle(0% at center);
          }
          100% {
            clip-path: circle(150% at center);
          }
        }
      `}</style>

      <audio ref={audioRef} src={goalBell} />

      {/* 배경 */}
      <div
        style={{
          position: "absolute",
          top: `-${backgroundOffset}px`,
          width: "100%",
          height: `${backgroundHeight}px`,
          background:
            "linear-gradient(to bottom, #000000, #1a1a80, #3399ff, #66ccff, #99cc66)",
          transition: "top 0.3s ease-out",
        }}
      />

      {/* 타이머 */}
      <div
        style={{
          position: "absolute",
          top: `10px`,
          left: "50%",
          transform: "translateX(-50%)",
          color: remainingTime <= 5 ? "red" : "white",
          fontSize: remainingTime <= 5 ? "60px" : "45px",
          zIndex: 30,
          fontFamily: "'Luckiest Guy', cursive",
        }}
      >
        {remainingTime.toFixed(2)}s
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

      {/* 오른쪽 진행 게이지 + 종 아이콘 */}
      <div
        style={{
          position: "fixed",
          right: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "30px",
          height: "80%",
          backgroundColor: "#000",
          borderRadius: "15px",
          overflow: "hidden",
          zIndex: 50,
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 종 아이콘 */}
        <div
          style={{
            position: "absolute",
            fontSize: "20px",
            color: "white",
            margin: "8px 0",
            zIndex: 25,
          }}
        >
          🔔
        </div>

        {/* 게이지 바 */}
        <div
          style={{
            flexGrow: 1,
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              height: `${(pressCount / SPACEBAR_GOAL_COUNT) * 100}%`,
              backgroundColor: "#00ff00",
              transition: "height 0.2s ease",
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          />
        </div>
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
      {/*벽돌돌*/}
      <div
        style={{
          position: "absolute",
          top: `-${backgroundOffset}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "35%",
          transition: "top 0.3s ease-out",
          height: "11000px",
          zIndex: 10,
        }}
      >
        <img
          src={brick}
          alt="Brick Background"
          style={{
            width: "100%",
            height: "100%",
          }}
        ></img>
      </div>

      {/* 기린 이미지 */}
      <div
        style={{
          position: "fixed",
          bottom: `${neckOffset}px`,
          transition: "bottom 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
        }}
      >
        <img
          src={giraffeFrame === 0 ? giraffeImage : giraffeImage2}
          alt="Giraffe"
          style={{
            width: "300px",
            height: "auto",
          }}
        />
      </div>

      {/* 모달 */}
      {isGameOver && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 100,
            clipPath: "circle(0% at center)",
            animation: "growCircle 0.6s ease-out forwards",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              color: "white",
            }}
          >
            {isTimeOver ? (
              <div style={{ fontSize: "70px" }}>⏱ 시간 종료!</div>
            ) : (
              <>
                <div style={{ fontSize: "70px" }}>🎉 성공!</div>
                <div style={{ fontSize: "50px", marginTop: "10px" }}>
                  ⏱ {(15 - remainingTime).toFixed(2)}초
                </div>
              </>
            )}
            {/*플레이어 이름 입력*/}
            {!isTimeOver && (
              <form onSubmit={onSubmitButtonClick}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="text"
                    name="name"
                    value={playerName}
                    onChange={handleNameChange}
                    required
                    style={{ width: "300px", height: "50px" }}
                  />
                  <button
                    type="submit"
                    disabled={!!nameError || !playerName}
                    style={{ width: "100px", height: "55px" }}
                  >
                    입력
                  </button>
                </div>
                {/* 에러 메시지는 고정 높이로 아래 표시 */}
                <div style={{ height: "20px", marginTop: "5px" }}>
                  {nameError && (
                    <div style={{ color: "red", fontSize: "14px" }}>
                      {nameError}
                    </div>
                  )}
                </div>
              </form>
            )}

            <h2 style={{ color: "white" }}>🏆 랭킹</h2>
            <table
              style={{
                color: "white",
                fontSize: "25px",
                margin: "0 auto",
                borderCollapse: "collapse",
                border: "2px solid white",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: "150px",
                      padding: "8px",
                      border: "1px solid white",
                    }}
                  >
                    순위
                  </th>
                  <th
                    style={{
                      width: "150px",
                      padding: "8px",
                      border: "1px solid white",
                    }}
                  >
                    이름
                  </th>
                  <th
                    style={{
                      width: "400px",
                      padding: "8px",
                      border: "1px solid white",
                    }}
                  >
                    기록
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => {
                  let color = "white";
                  if (i === 0) color = "gold";
                  else if (i === 1) color = "silver";
                  else if (i === 2) color = "#cd7f32"; // 동색
                  return (
                    <tr key={i} style={{ color }}>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          border: "1px solid white",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          border: "1px solid white",
                        }}
                      >
                        {r.name}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          border: "1px solid white",
                        }}
                      >
                        {r.score.toFixed(2)}초
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ color: "white", fontSize: "30px" }}>
              R키를 눌러 재시작
            </div>
          </div>
        </div>
      )}
      {/*리더보드 모달 기능*/}
    </div>
  );
};
export default Giraffe;

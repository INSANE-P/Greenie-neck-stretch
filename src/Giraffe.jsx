import { useEffect, useRef, useState } from "react";
import giraffeImage1 from "./party1.png";
import giraffeImage2 from "./party2.png";
import giraffeImage3 from "./space1.png";
import giraffeImage4 from "./space2.png";
import brick from "./brick.png";
import changeCloud from "./changeCloud.png";
import goalBell from "./Goal_Bell.mp3";
import { v4 as uuidv4 } from "uuid";
import bell from "./bell.png";
import planet1 from "./jjang.png";
import planet2 from "./himne.png";
import planet3 from "./cando.png";
import moon from "./moon1.png";
import rocket from "./rocket.png";
import cloud1 from "./10.png";
import cloud2 from "./20.png";
import cloud3 from "./30.png";
import cloud4 from "./40.png";
import clock from "./clock.png";
import fireworks from "./balloon.png";
import trophy from "./trophy1.png";
import "./App.css";


const Giraffe = () => {
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const idCounter = useRef(0);

  const MAX_NECK_OFFSET = -60;
  const MIN_NECK_OFFSET = -280;
  const MAX_OFFSET = 10000;
  const MIN_OFFSET = 0;
  const SPACEBAR_GOAL_COUNT = 100;

  const PARTICLE_STAGE_1_START = 51;
  const PARTICLE_STAGE_2_START = 61;
  const PARTICLE_STAGE_3_START = 71;
  const towerWidthRatio = 35;
  const towerHeight = 11000;
  const giraffeWidth = 300;
  const bgTransitionSec = 0.2;
  const towerTransitionSec = 0.2;
  const giraffeTransitionSec = 0.8;

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
  const [isGreenieUp, setIsGreenieUp] = useState(true);
  const [isStartModalOpen, setIsStartModalOpen] = useState(true);
  const [finalClearTime, setFinalClearTime] = useState(null);

  const  submittedRef = useRef(false);
  
  useEffect(() => {
    if (isStartModalOpen) {
      setTimeout(() => {
        const input = document.querySelector('input[name="name"]');
        if (input) input.focus();
      }, 0);
    }
  }, [isStartModalOpen]);
  //이름 제출버튼 클릭시 점수를 저장하고 리더보드 모달을 띄우는 이벤트 핸들러러
  const handlePlayerSubmit = (e) => {
    e.preventDefault();
    if (!playerName || nameError) return;
    setIsStartModalOpen(false);
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
    if (isGameOver && !isTimeOver && isStartModalOpen) {
      const input = document.querySelector('input[name="name"]');
      if (input) input.focus();
    }
  }, [isGameOver, isTimeOver, isStartModalOpen]);

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
      if (
        e.code === "Space" && 
        !isKeyPressed && 
        !isGameOver && 
        !isStartModalOpen
      ) {
        if (startTimeRef.current === null) {
          startTimeRef.current = performance.now();
          setIsStartModalOpen(false);
        }
        if (isGreenieUp) {
          setNeckOffset((prev) => {
            if (prev + 30 >= MAX_NECK_OFFSET) {
              setIsGreenieUp(false);
              return MAX_NECK_OFFSET;
            }
            return prev + 30;
          });
        } else {
          setNeckOffset((prev) => {
            if (prev - 30 <= MIN_NECK_OFFSET) {
              setIsGreenieUp(true);
              return MIN_NECK_OFFSET;
            }
            return prev - 30;
          });
        }
        setBackgroundOffset((prev) => Math.max(prev - 100, MIN_OFFSET));
        setPressCount((prev) => {
          const nextCount = prev + 1;

          if (nextCount >= SPACEBAR_GOAL_COUNT) {
            if (submittedRef.current) return;
            submittedRef.current = true;
            setIsTimeOver(false);
            setIsGameOver(true);
            startTimeRef.current = null;
            setIsSubmitted(true);

            const clearTime = 15 - remainingTime;
            setFinalClearTime(clearTime);
            const playerId = uuidv4();
            const newPlayer = {
              name: playerName,
              score: clearTime,
              id: playerId,
            };

            setRanking((prevRanking) =>
              [...prevRanking, newPlayer]
                .sort((a, b) => a.score - b.score)
                .slice(0, 5)
            );

            setIsSubmitted(true);
            setPlayerName("");

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
        setIsStartModalOpen(true);
        submittedRef.current = false;
        setIsSubmitted(false);
        setPlayerName("");
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
  }, [isKeyPressed, isGameOver, isStartModalOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGiraffeFrame((prev) => (prev === 0 ? 1 : 0));
    }, 400);

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
          transition: `top ${bgTransitionSec}s ease-out`,
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
          fontFamily: 'LOTTERIACHAB',
        }}
      >
        {remainingTime.toFixed(2)}s
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
      {/*벽돌*/}
      <div
        style={{
          position: "absolute",
          top: `-${backgroundOffset}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${towerWidthRatio}%`,
          height: `${towerHeight}px`,
          backgroundImage: `url(${brick})`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% auto",
          transition: `all ${towerTransitionSec}s ease`,
          zIndex: 10,
        }}
      />
      {/*바뀌는 구름 이미지 */}
      <div style={{
        position: "fixed",
        top:`${5000 - backgroundOffset}px`, 
        left: "50%",
        transform: "translateX(-50%)",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 25,}}
      >
        <img src={changeCloud} alt="cloud" style={{
            width: "900px",
            height: "auto",
          }}/>
      </div>
      <div
      style={{
        position: "fixed",
        top:`-${100+backgroundOffset}px`, 
        left: "50%",
        transform: "translateX(-50%)",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 27,
        }}>
          <img src={bell} alt="bell" style={{width:"500px", height:"auto"}}/>
        </div>
      <div
        style={{
          position: "fixed",
          bottom: `${neckOffset}px`,
          transition: `bottom ${giraffeTransitionSec}s cubic-bezier(0.25, 1, 0.5, 1)`,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
        }}
      >
        <img
          src={pressCount > 50
              ? (giraffeFrame === 0 ? giraffeImage3 : giraffeImage4)
              : (giraffeFrame === 0 ? giraffeImage1 : giraffeImage2)
            }
          alt="Giraffe"
          style={{
            width: `${giraffeWidth}px`,
            height: "auto",
          }}
        />
      {/*배경 오브젝트 */}
      {/*행성 1*/}
      </div>
      <div style={{
        position: "fixed",
        top:`${-backgroundOffset}px`, 
        left: "20%",
        transform: "translateX(-50%)",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={planet1} alt="planet" style={{
            width: "400px",
            height: "auto",
          }}/>
      </div>
      {/*로켓*/}
      <div style={{
        position: "fixed",
        top:`${1000 - backgroundOffset}px`, 
        right: "0%",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={rocket} alt="rocket" style={{
            width: "400px",
            height: "auto",
          }}/>
      </div>
      <div style={{
        position: "fixed",
        top:`${2000 - backgroundOffset}px`, 
        left: "20%",
        transform: "translateX(-50%)",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={planet2} alt="planet" style={{
            width: "400px",
            height: "auto",
          }}/>
      </div>
      {/*행성 3*/}
      <div style={{
        position: "fixed",
        top:`${3000 - backgroundOffset}px`, 
        right: "0%",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={planet3} alt="planet2" style={{
            width: "400px",
            height: "auto",
          }}/>
      </div>
      {/*행성 4*/}
      <div style={{
        position: "fixed",
        top:`${4000 - backgroundOffset}px`, 
        left: "20%",
        transform: "translateX(-50%)",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={moon} alt="planet2" style={{
            width: "400px",
            height: "auto",
          }}/>
      </div>

      {/*구름 1*/}
      <div style={{
        position: "fixed",
        top:`${6000 - backgroundOffset}px`, 
        left: "20%",
        transform: "translateX(-50%)",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={cloud4} alt="rocket" style={{
            width: "450px",
            height: "auto",
          }}/>
      </div>
      <div style={{
        position: "fixed",
        top:`${7000 - backgroundOffset}px`, 
        right: "0%",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={cloud3} alt="planet" style={{
            width: "450px",
            height: "auto",
          }}/>
      </div>
      {/*구름 2*/}
      <div style={{
        position: "fixed",
        top:`${8000 - backgroundOffset}px`, 
        left: "20%",
        transform: "translateX(-50%)",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={cloud2} alt="planet2" style={{
            width: "450px",
            height: "auto",
          }}/>
      </div>
      {/*구름 3*/}
      <div style={{
        position: "fixed",
        top:`${9000 - backgroundOffset}px`, 
        right: "0%",
        transition: `top 0.8s cubic-bezier(0.25, 1, 0.5, 1)`,
        zIndex: 7,}}
      >
        <img src={cloud1} alt="planet2" style={{
            width: "450px",
            height: "auto",
          }}/>
      </div>

      {isStartModalOpen && (
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/*배경 이미지 */}
          <div
            style={{
              position: "relative",
              width: "80%",
              height: "70%",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "2px solid white",
              borderRadius: "20px",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "white",
            }}
          >
            {/* 제목 - 상단 중앙 고정 */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "50px",
                fontWeight: "bold",
                color: "lightgreen",
                fontFamily: 'YOnepickTTF-Bold',
              }}
            >
              그린이 목늘리기!
            </div>

            {/* 본문 내용 */}
            <div
              style={{ marginTop: "80px", fontSize: "24px", lineHeight: "1.6", fontFamily: 'YOnepickTTF-Bold', }}
            >
              <br />
              세종대학교 시계탑 안에
              <br />
              진짜 기린이 살고 있다는 소문, 들어봤나요?
              <br />
              <br />
              <span style={{ color: "lightgreen" }}>
                스페이스바를 연타해서
              </span>{" "}
              그린이의 목을 길~게 늘려
              <br />
              세종대학교 시계탑 꼭대기의 종을 울려주세요!
              <br />
              <br />
              {/*플레이어 이름 입력*/}
              <form onSubmit={handlePlayerSubmit}>
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
                    autoComplete="off"
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
              <br />
              <span style={{ fontSize: "18px", color: "#ccc" }}>
                스페이스바를 눌러 게임을 시작하세요.
              </span>
            </div>
          </div>
        </div>
      )}

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
              <div
              style={{
                display: "flex",
                alignItems: "center",        
                justifyContent: "center",
                }}
              >
                <img
                  src={clock}
                  alt="timer"
                  style={{ width: "60px", height: "60px", marginRight: "10px" }}
                  />
                <div style={{ fontSize: "60px",fontFamily: 'YOnepickTTF-Bold', }}>시간 종료!</div>
              </div>
            ) : (
              <div>
                <div
                style={{
                display: "flex",
                alignItems: "center",        
                justifyContent: "center",
                }}
                >
                  <img 
                  src={fireworks} 
                  alt="fireworks"
                  style={{ width: "60px", height: "60px", marginRight: "10px" }}
                  />
                  <div style={{ color:"#7CFF8D", fontSize: "60px", fontFamily: 'YOnepickTTF-Bold' }}>성공</div>
                  <img 
                  src={fireworks} 
                  alt="fireworks"
                  style={{ width: "60px", height: "60px", marginRight: "10px" }}
                  />
                </div>
              <div
              style={{
                display: "flex",
                alignItems: "center",        
                justifyContent: "center",
                }}
                >
                  <img
                  src={clock}
                  alt="timer"
                  style={{ width: "35px", height: "35px", marginRight: "10px" }}
                  />
                  <div
                  style={{
                    color: "#1e90ff",
                    fontSize: "35px",
                    fontFamily: 'YOnepickTTF-Bold',
                  }}
                  >
                    {finalClearTime?.toFixed(2)}초
                    </div>
                    <img
                  src={clock}
                  alt="timer"
                  style={{ width: "40px", height: "40px", marginRight: "10px" }}
                  />
                  </div>
                  </div>
            )}
            <div
            style={{
                display: "flex",
                alignItems: "center",        
                justifyContent: "center",
                }}
            >
              <img 
              src={trophy} 
              alt="trophy"
              style={{ 
                width: "35px",
                height: "35px", 
              }} 
              />
              <h2 
            style={{ 
              fontSize:"40px",
              fontWeight: "bold",
              color: "#FFC107", 
              fontFamily: 'YOnepickTTF-Bold',
              margin: "20px", 
              }}
              >
                랭킹
              </h2>
              <img 
              src={trophy} 
              alt="trophy"
              style={{ 
                width: "35px",
                height: "35px", 
              }} 
              />
            </div>
            <table 
              style={{
                color: "white",
                fontSize: "25px",
                margin: "0 auto",
                borderCollapse: "collapse",
                border: "2px solid white",
                fontFamily: 'YOnepickTTF-Bold',
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
                      border: "1px solid white"
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
                          fontWeight: "bold" ,
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          border: "1px solid white",
                          fontWeight: "bold" ,
                        }}
                      >
                        {r.name}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          border: "1px solid white",
                          fontWeight: "bold" ,
                        }}
                      >
                        {r.score.toFixed(2)}초
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ color: "white", fontSize: "25px", fontFamily: 'YOnepickTTF-Bold', }}>
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

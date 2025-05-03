import { useEffect, useRef, useState } from 'react';
import giraffeImage from './giraffe.png'; 

const Giraffe = () => {
  const [backgroundOffset, setBackgroundOffset] = useState(2500);
  const [blockX, setBlockX] = useState(0);
  const speedRef = useRef(5);

  const CENTER = 150;
  const TOLERANCE = 60;
  const MAX_OFFSET = 2500;
  const MIN_OFFSET = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockX((prevX) => {
        let nextX = prevX + speedRef.current;
        if (nextX > 300 || nextX < 0) {
          speedRef.current = -speedRef.current;
        }
        return nextX;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        if (blockX > CENTER - TOLERANCE && blockX < CENTER + TOLERANCE) {
          setBackgroundOffset((prev) => Math.max(prev - 100, MIN_OFFSET)); 
        } else {
          setBackgroundOffset((prev) => Math.min(prev + 30, MAX_OFFSET)); 
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blockX]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}>

      <div
        style={{
          position: 'absolute',
          top: `-${backgroundOffset}px`,
          width: '100%',
          height: '3000px',
          background: 'linear-gradient(to bottom, #000000, #1a1a80, #3399ff, #66ccff, #99cc66)',
          transition: 'top 0.3s ease-out',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: `${blockX}px`,
          width: '40px',
          height: '20px',
          backgroundColor: '#00ff00',    
          border: '3px solid white',       
          borderRadius: '6px',
          boxShadow: '0 0 10px white',
          zIndex: 10,
        }}
      />

      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
        }}
      >
        <img
          src={giraffeImage}
          alt="Giraffe"
          style={{
            width: '300px',
            height: 'auto',
          }}
        />
      </div>

    </div>
  );
};

export default Giraffe;

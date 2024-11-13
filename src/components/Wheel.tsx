import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './css/Wheel.css';
import { Button, Grid as Grid2 } from '@mui/material';
import { WheelItem } from './class/Interface';

type WheelProps = {
  items: WheelItem[];
  onSpinEnd: any;
  onStartSession: any;
  disable: boolean;
};

const getRandomNumber = (): number => {
  const min = 4;
  const max = 20;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const Wheel: React.FC<WheelProps> = ({ items, onSpinEnd, onStartSession, disable }) => {
  const [angle, setAngle] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [recoil, setRecoil] = useState<boolean>(false);
  
  // Carica il suono delle palette
  const paddleNoise = useMemo(() => new Audio('./assets/music/paddleNoise.mp3'), []);
  
  // Imposta il volume iniziale
  useEffect(() => {
    paddleNoise.volume = 0.5; // Imposta un volume che puoi regolare
  }, [paddleNoise]);

  const spinWheel = useCallback(() => {
    const totalDuration = 5000; // Durata complessiva della rotazione
    const initialSpeed = getRandomNumber();
    let currentAngle = angle;
    let startTime = Date.now();

    setSpinning(true);
    onStartSession(false);

    // Avvia la riproduzione del suono all'inizio della rotazione
    paddleNoise.play();

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / totalDuration;

      if (progress >= 1) {
        clearInterval(interval);
        setSpinning(false);
        paddleNoise.pause(); // Pausa il suono quando la ruota si ferma
        paddleNoise.currentTime = 0; // Resetta il suono

        const normalizedAngle = currentAngle % 360;
        const index = Math.floor((360 - normalizedAngle) / (360 / items.length)) % items.length;
        onSpinEnd(items[index]);
      } else {
        const speed = initialSpeed * (1 - progress);
        currentAngle += speed;
        setAngle(currentAngle);

        // Calcola il volume in base alla velocità della rotazione
        const volume = Math.max(0, Math.min(1, speed / initialSpeed));
        paddleNoise.volume = volume;

        // Simula il movimento della ruota e il battito delle palette
        if (Math.floor(currentAngle) % (360 / items.length) === 0) {
          setRecoil(true);
          setTimeout(() => setRecoil(false), 100);
        }
      }
    }, 16);
  }, [angle, items, onSpinEnd, onStartSession, paddleNoise]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ControlLeft' && !spinning) {
        spinWheel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [spinning, spinWheel]);

  return (
    <>
      <div className="wheel-container">
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          style={{
            transform: `rotate(${angle}deg)`,
          }}
        >
          <circle cx="150" cy="150" r="145" fill="lightgray" />
          {items.map((item, index) => {
            const numberOfItems = items.length;
            const anglePerItem = 360 / numberOfItems;
            const rotateAngle = index * anglePerItem;
            const largeArcFlag = anglePerItem > 180 ? 1 : 0;

            const x1 = 150 + 145 * Math.cos((rotateAngle - 90) * (Math.PI / 180));
            const y1 = 150 + 145 * Math.sin((rotateAngle - 90) * (Math.PI / 180));

            const x2 = 150 + 145 * Math.cos((rotateAngle + anglePerItem - 90) * (Math.PI / 180));
            const y2 = 150 + 145 * Math.sin((rotateAngle + anglePerItem - 90) * (Math.PI / 180));

            const textDistance = 120;

            return (
              <g key={index}>
                {/* Aggiungi i tre pallini per ogni spicchio */}
                {[0, 1, 2].map((i) => {
                  const angleOffset = (i / 3) * anglePerItem; // Dividi lo spicchio in 3 parti
                  const x = 150 + 145 * Math.cos((rotateAngle + angleOffset - 90) * (Math.PI / 180));
                  const y = 150 + 145 * Math.sin((rotateAngle + angleOffset - 90) * (Math.PI / 180));
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3" // Pallini più piccoli
                      fill="black" // Colore del pallino
                      stroke="white" // Contorno bianco per evidenziare
                      strokeWidth="0.5"
                      style={{ zIndex: 2 }} // Porta i pallini in primo piano
                    />
                  );
                })}
                <path
                  id={`path-${index}`}
                  d={`M150,150 L${x1},${y1} A145,145 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                  fill={`url(#gradient-${index})`}
                  stroke="black"
                  style={{
                    filter: `drop-shadow(2px 2px 4px ${item.bgcolor})`, // Ombra per effetto 3D
                  }}
                />
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: item.bgcolor, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'black', stopOpacity: 0.1 }} />
                  </linearGradient>
                </defs>
                {item.value.split('').map((char, charIndex) => {
                  const charDistance = textDistance - (charIndex * (textDistance - 50)) / (item.value.length - 1);
                  const charX = 150 + charDistance * Math.cos((rotateAngle + anglePerItem / 2 - 90) * (Math.PI / 180));
                  const charY = 150 + charDistance * Math.sin((rotateAngle + anglePerItem / 2 - 90) * (Math.PI / 180));

                  return (
                    <text
                      key={charIndex}
                      fontSize="16"
                      fill={item.color}
                      fontWeight="bold"
                      stroke="black"
                      strokeWidth="1.2"
                      x={charX}
                      y={charY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${rotateAngle + anglePerItem / 2} ${charX} ${charY})`}
                    >
                      {char}
                    </text>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <div className={`perno ${recoil ? 'recoil' : ''}`} />
      </div>
      <Grid2 container>
        <Grid2 item xs={12} md={12} width={"100%"} padding={1}>
          <Button onClick={spinWheel} disabled={disable || spinning} variant={"contained"} fullWidth>
            Gira
          </Button>
        </Grid2>
      </Grid2>
    </>
  );
};

export default Wheel;

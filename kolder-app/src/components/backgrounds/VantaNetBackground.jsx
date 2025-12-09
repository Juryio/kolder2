import React, { useState, useEffect, useRef } from 'react';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';

const VantaNetBackground = ({ backgroundColor, lineColor, isPaused }) => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      window.THREE = THREE; // Vanta expects THREE to be on the window object
      setVantaEffect(
        NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: lineColor || 0xffffff, // Default to white
          backgroundColor: backgroundColor || 0x0, // Default to black
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  useEffect(() => {
    if (vantaEffect) {
      vantaEffect.setOptions({
        color: lineColor || 0xffffff,
        backgroundColor: backgroundColor || 0x0,
      });
    }
  }, [backgroundColor, lineColor, vantaEffect]);

  useEffect(() => {
    if (vantaEffect) {
      if (isPaused) {
        vantaEffect.pause();
      } else {
        vantaEffect.play();
      }
    }
  }, [isPaused, vantaEffect]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
      }}
    />
  );
};

export default VantaNetBackground;

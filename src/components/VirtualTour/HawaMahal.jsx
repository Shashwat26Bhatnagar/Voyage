import React, { useEffect, useRef } from "react";
import "aframe";

const HawaMahal = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = document.querySelector("#museumVideo");
    videoRef.current = videoEl;

    if (videoEl) {
      videoEl.play().catch((e) => {
        console.warn("Autoplay prevented:", e);
      });
    }
  }, []);

  return (
    <a-scene embedded vr-mode-ui="enabled: false">
      <a-assets>
        <video
          id="museumVideo"
          src="/models/hawa-mahal.mp4"
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
        ></video>
      </a-assets>

      <a-videosphere src="#museumVideo"></a-videosphere>

      <a-camera position="0 1.6 0">
        <a-cursor></a-cursor>
      </a-camera>
    </a-scene>
  );
};

export default HawaMahal;

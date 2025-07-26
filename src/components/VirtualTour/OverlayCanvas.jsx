import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useLocation } from "react-router-dom";

function getScriptChunk(time) {
  const chunks = ["0_15", "15_30", "30_45", "45_60"];
  return chunks[Math.floor(time / 15) % chunks.length];
}

function VideoBackground({ videoRef, screenStream, monumentName }) {
  const [videoTexture, setVideoTexture] = useState(null);

  useEffect(() => {
    const video = document.createElement("video");

    if (screenStream) {
      const track = screenStream.getVideoTracks()[0];
      const stream = new MediaStream([track]);
      Object.assign(video, {
        srcObject: stream,
        muted: true,
        playsInline: true,
        autoplay: true,
      });
    } else {
      let videoPath = "/models/hawa-mahal.mp4";
      if (monumentName === "Taj Mahal") videoPath = "/models/taj-mahal.mp4";
      else if (monumentName === "Red Fort") videoPath = "/models/red-fort.mp4";

      video.src = videoPath;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
    }

    video.oncanplay = () => {
      const texture = new THREE.VideoTexture(video);
      texture.encoding = THREE.sRGBEncoding;
      setVideoTexture(texture);
      video.play();
    };

    videoRef.current = video;
    return () => video.pause();
  }, [screenStream, monumentName]);

  if (!videoTexture) return null;

  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial map={videoTexture} side={THREE.BackSide} />
    </mesh>
  );
}

function SetInitialCameraRotation() {
  const { camera } = useThree();
  useEffect(() => {
    const yaw = THREE.MathUtils.degToRad(-160);
    const quat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 1),
      yaw
    );
    camera.quaternion.premultiply(quat);
  }, [camera]);
  return null;
}

function FloatingAvatar({ videoRef, currentScript }) {
  const ref = useRef();
  const { camera } = useThree();

  useFrame(() => {
    const offset = new THREE.Vector3(-4.5, -1.8, -4);
    const position = camera.position.clone().add(offset.applyQuaternion(camera.quaternion));
    ref.current.position.copy(position);

    const targetQuat = camera.quaternion.clone();
    const rotateRight = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      THREE.MathUtils.degToRad(75)
    );
    targetQuat.multiply(rotateRight);
    ref.current.quaternion.copy(targetQuat);
  });

  return (
    <group ref={ref} scale={1}>
      <Avatar videoRef={videoRef} currentScript={currentScript} />
    </group>
  );
}

export default function OverlayApp() {
  const videoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const narrationAudioRef = useRef(null);
  const narrationIntervalRef = useRef(null);
  const askTimeoutRef = useRef(null);
  const location = useLocation();
  const selectedMonument = location.state?.monument || "hawa-mahal";

  const [currentScript, setCurrentScript] = useState("0_15");
  const [narrationStarted, setNarrationStarted] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [videoTime, setVideoTime] = useState(0);
  const [screenStream, setScreenStream] = useState(null);
  const [error, setError] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isNarrationPaused, setIsNarrationPaused] = useState(false);

useEffect(() => {
  const interval = setInterval(() => {
    const currentTime = screenVideoRef.current?.currentTime || videoRef.current?.currentTime || 0;
    const roundedTime = Math.floor(currentTime);
    setVideoTime(roundedTime);

    const chunk = getScriptChunk(currentTime);
    if (chunk !== currentScript) setCurrentScript(chunk);

    if (!isNarrationPaused) {
      fetchNarrationAudio(roundedTime); // Automatic fetch every 5s
    }
  }, 15000); // Fetch every 5 seconds

  return () => clearInterval(interval);
}, [currentScript, isNarrationPaused, screenStream]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (narrationIntervalRef.current) {
        clearInterval(narrationIntervalRef.current);
      }
      if (askTimeoutRef.current) {
        clearTimeout(askTimeoutRef.current);
      }
      if (narrationAudioRef.current) {
        narrationAudioRef.current.pause();
      }
    };
  }, []);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      screenVideoRef.current = video;
      setScreenStream(stream);
    } catch {
      setError("Screen sharing failed.");
    }
  };

  const stopScreenShare = () => {
    screenStream?.getTracks().forEach(track => track.stop());
    setScreenStream(null);
  };

const fetchNarrationAudio = async (timestamp) => {
  try {
    const response = await fetch("http://localhost:8000/virtual-tour/narrate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monument: selectedMonument,
        timestamp: timestamp,
        source: screenStream ? "screen" : "video", // Pass source field for backend routing
      }),
    });

    const data = await response.json();

    if (data.audio_base64) {
      if (narrationAudioRef.current) {
        narrationAudioRef.current.pause();
        narrationAudioRef.current = null;
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      narrationAudioRef.current = audio;

      if (!isNarrationPaused) {
        audio.play().catch((err) => console.error("Audio play error:", err));
      }

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } else {
      console.warn("No audio received from backend for:", selectedMonument, "@", timestamp);
    }
  } catch (err) {
    console.error("Narration fetch error:", err);
  }
};


const handleNarration = () => {
  if (narrationStarted) {
    setNarrationStarted(false);

    if (narrationIntervalRef.current) {
      clearInterval(narrationIntervalRef.current);
      narrationIntervalRef.current = null;
    }
    if (narrationAudioRef.current) {
      narrationAudioRef.current.pause();
      narrationAudioRef.current = null;
    }
  } else {
    setNarrationStarted(true);

    fetchNarrationAudio(videoTime); // Send first narration

    narrationIntervalRef.current = setInterval(() => {
      const currentTime = screenVideoRef.current?.currentTime || videoRef.current?.currentTime || 0;
      fetchNarrationAudio(Math.floor(currentTime));
    }, 5000); // Send every 5 seconds
  }
};


const pauseNarrationForAsk = (duration = 28000) => {
  setIsNarrationPaused(true);

  // Stop narration audio if it's currently playing
  if (narrationAudioRef.current) {
    narrationAudioRef.current.pause();
    narrationAudioRef.current = null;
  }

  // Clear any previous pause timers
  if (askTimeoutRef.current) {
    clearTimeout(askTimeoutRef.current);
  }

  // Resume narration after `duration` (17 seconds default)
  askTimeoutRef.current = setTimeout(() => {
    setIsNarrationPaused(false);

    // Resume narration only if narration is still active
    if (narrationStarted) {
      const currentTime = screenVideoRef.current?.currentTime || videoRef.current?.currentTime || 0;
      fetchNarrationAudio(Math.floor(currentTime));
    }
  }, duration);
};

const handleAsk = async () => {
  if (!videoRef.current && !screenVideoRef.current) return;

  // Stop and pause narration for 17 seconds when asking
  pauseNarrationForAsk(17000);

  const video = screenVideoRef.current || videoRef.current;
  video.pause();

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const formData = new FormData();
    formData.append("monument", selectedMonument);
    formData.append("question", userQuery);
    formData.append("image", blob, "screenshot.png");

    try {
      const response = await fetch("http://localhost:8000/virtual-tour/ask", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const base64Audio = data.audio_base64;
      if (base64Audio) {
        // Stop any narration audio *before* playing Ask audio
        if (narrationAudioRef.current) {
          narrationAudioRef.current.pause();
          narrationAudioRef.current = null;
        }

        const audioBlob = new Blob(
          [Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.play().catch(err => console.error("Ask audio play error:", err));

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        console.error("No audio received from backend for user question");
      }

    } catch (err) {
      console.error("Ask error:", err);
    } finally {
      setUserQuery("");
      video.play();
    }
  });
};


  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        onPointerDown={() => setHasInteracted(true)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <VideoBackground videoRef={videoRef} screenStream={screenStream} monumentName={selectedMonument} />
          <FloatingAvatar videoRef={screenVideoRef.current || videoRef} currentScript={currentScript} />
          <OrbitControls enableZoom={false} enablePan={false} enableDamping={true} dampingFactor={0.1} />
          <SetInitialCameraRotation />
        </Suspense>
      </Canvas>

      {!hasInteracted && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          zIndex: 20, display: "grid", placeItems: "center", pointerEvents: "none", fontSize: "32px", color: "white"
        }}>
          <div style={{ display: "flex", justifyContent: "center" }}><span>⬆️</span></div>
          <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
            <span>⬅️</span><span>🖱️ Move</span><span>➡️</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}><span>⬇️</span></div>
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
        background: "#000a", padding: 20, borderRadius: 12, color: "white", zIndex: 10
      }}>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button onClick={screenStream ? stopScreenShare : startScreenShare}>
            {screenStream ? "🛑 Stop Sharing" : "🖥️ Share Screen"}
          </button>
          <button onClick={handleNarration}>
            {narrationStarted ? "🔇 Stop Narration" : "🔊 Start Narration"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask..."
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              width: "280px",
              fontSize: "14px",
              color: "black",
              backgroundColor: "white"
            }}
          />

          <button
            onClick={handleAsk}
            disabled={!userQuery.trim()}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: userQuery.trim() ? "#ff9800" : "#666",
              color: "white",
              cursor: userQuery.trim() ? "pointer" : "not-allowed"
            }}
          >
            Ask
          </button>
        </div>

        <div style={{ fontSize: "12px", color: "#ccc", textAlign: "center", marginTop: 8 }}>
          {screenStream ? "Screen Sharing" : "Video Background"} • Time: {videoTime}s
          {narrationStarted && (
            <span style={{ marginLeft: 10 }}>
              • 🎙️ {isNarrationPaused ? "Paused" : "Narrating"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
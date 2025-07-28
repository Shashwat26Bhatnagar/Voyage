import { Environment, OrbitControls } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Experience() {
  const [videoTexture, setVideoTexture] = useState(null);
  const avatarRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/hawa-mahal.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video.oncanplay = () => {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      texture.encoding = THREE.sRGBEncoding;
      setVideoTexture(texture);
      video.play();
    };

    return () => {
      video.pause();
    };
  }, []);

  useFrame(() => {
    if (avatarRef.current) {
      const offset = new THREE.Vector3(1.5, -1.2, -2.5);
      offset.applyQuaternion(camera.quaternion);
      offset.add(camera.position);
      avatarRef.current.position.copy(offset);

      const targetQuat = new THREE.Quaternion().copy(camera.quaternion);
      const extraRotation = new THREE.Quaternion();
      extraRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(15));
      targetQuat.multiply(extraRotation);
      avatarRef.current.quaternion.copy(targetQuat);
    }
  });

  if (!videoTexture) return null;

  return (
    <>
      <OrbitControls enableZoom={false} enablePan={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={videoTexture} side={THREE.BackSide} />
      </mesh>

      <group ref={avatarRef} scale={1}>
        <Avatar />
      </group>

      <Environment preset="sunset" background />
    </>
  );
}

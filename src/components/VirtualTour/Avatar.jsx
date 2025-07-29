import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useFBX, useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { useLipsyncData } from "./useLipsyncData";

const getMorphTargetFromViseme = (v) => {
  const map = {
    A: "viseme_aa",
    B: "viseme_b",
    C: "viseme_CH",
    D: "viseme_d",
    E: "viseme_e",
    F: "viseme_f",
    G: "viseme_g",
    H: "viseme_h",
    X: "viseme_rest",
  };
  return map[v] || "viseme_rest";
};

export function Avatar({ videoRef, currentScript }) {
  const { scene } = useGLTF('https://virtuvoyage.onrender.com/models/685d7a165ed79261d6e44ff6.glb');
  const filename = 'Idle (1).fbx';
  const url = `https://virtuvoyage.onrender.com/animations/${encodeURIComponent(filename)}`;
  const { animations } = useFBX(url);

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clonedScene);
  const group = useRef();

  animations[0].name = "Idle";
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions["Idle"]) {
      actions["Idle"].reset().fadeIn(0.5).play();
    }
    return () => {
      if (actions["Idle"]) actions["Idle"].fadeOut(0.5);
    };
  }, [actions]);

  useEffect(() => {
    const smileAmount = 0.6;
    const head = nodes.Wolf3D_Head;
    const teeth = nodes.Wolf3D_Teeth;

    const headSmileIndex = head?.morphTargetDictionary?.mouthSmile || head?.morphTargetDictionary?.mouthSmileLeft;
    const teethSmileIndex = teeth?.morphTargetDictionary?.mouthSmile || teeth?.morphTargetDictionary?.mouthSmileLeft;

    if (headSmileIndex !== undefined) head.morphTargetInfluences[headSmileIndex] = smileAmount;
    if (teethSmileIndex !== undefined) teeth.morphTargetInfluences[teethSmileIndex] = smileAmount;
  }, [nodes]);

  const mouthCues = useLipsyncData(currentScript);

  useFrame(() => {
    if (!videoRef?.current || !mouthCues.length) return;
    const time = videoRef.current.currentTime;
    const cue = mouthCues.find(c => time >= c.start && time < c.end);
    const head = nodes.Wolf3D_Head;
    if (!head || !cue) return;

    Object.keys(head.morphTargetDictionary).forEach(key => {
      const idx = head.morphTargetDictionary[key];
      head.morphTargetInfluences[idx] = 0;
    });

    const visemeKey = getMorphTargetFromViseme(cue.value);
    const idx = head.morphTargetDictionary[visemeKey];
    if (idx !== undefined) head.morphTargetInfluences[idx] = 1;
  });

  const audio = useMemo(() => {
    const el = new Audio(`/audios/${currentScript}.ogg`);
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    return el;
  }, [currentScript]);

  useEffect(() => {
    if (!videoRef?.current) return;
    const video = videoRef.current;

    const syncAudioToVideo = () => {
      if (!audio || !video) return;
      const drift = Math.abs(audio.currentTime - video.currentTime);
      if (drift > 0.1) audio.currentTime = video.currentTime;

      if (video.paused && !audio.paused) {
        audio.pause();
      } else if (!video.paused && audio.paused) {
        audio.play().catch((e) => console.warn("Audio play failed:", e));
      }
    };

    video.addEventListener("timeupdate", syncAudioToVideo);
    video.addEventListener("play", syncAudioToVideo);
    video.addEventListener("pause", syncAudioToVideo);
    video.addEventListener("seeked", syncAudioToVideo);

    return () => {
      video.removeEventListener("timeupdate", syncAudioToVideo);
      video.removeEventListener("play", syncAudioToVideo);
      video.removeEventListener("pause", syncAudioToVideo);
      video.removeEventListener("seeked", syncAudioToVideo);
    };
  }, [audio, videoRef]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
      <skinnedMesh geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
    </group>
  );
}

useGLTF.preload('https://virtuvoyage.onrender.com/models/685d7a165ed79261d6e44ff6.glb');
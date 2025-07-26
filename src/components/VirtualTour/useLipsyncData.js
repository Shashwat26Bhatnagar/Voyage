// src/useLipsyncData.js
import { useEffect, useState } from "react";

export function useLipsyncData(scriptChunk) {
  const [cues, setCues] = useState([]);

  useEffect(() => {
    if (!scriptChunk) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/lipsync/${scriptChunk}.json`);
        if (!response.ok) throw new Error("Lip sync JSON not found");
        const data = await response.json();

        // Rhubarb-style JSON parsing
        const parsed = data.mouthCues.map((cue) => ({
          start: cue.start,
          end: cue.end,
          value: cue.value,
        }));
        setCues(parsed);
      } catch (err) {
        console.error(`Failed to load lipsync for ${scriptChunk}`, err);
        setCues([]);
      }
    };

    fetchData();
  }, [scriptChunk]);

  return cues;
}

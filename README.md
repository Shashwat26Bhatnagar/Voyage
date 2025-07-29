# VirtuVoyage  
**Tagline: Smart trips. Seamless days.**

📌 *Submission for the Google Maps Platform Hackathon on Devpost.*

VirtuVoyage was developed to simplify and personalize the way people plan their trips and explore monuments. The application revolves around two core features: intelligent itinerary generation and immersive virtual tours. The goal was to reduce the manual effort typically involved in organizing day-wise schedules across cities while enhancing how people interact with historical information.

To start, users select monuments they are interested in visiting, and VirtuVoyage takes care of generating a complete itinerary. We categorized each day of the trip into one of three types: full-day monument visits, intra-city travel with multiple locations, and inter-city travel. A custom clustering algorithm combining K-Means and DBSCAN was designed to group monuments based on proximity and visit time while flagging potential outliers. To optimize the order of visits within each cluster, we applied Dijkstra’s algorithm to determine the shortest and most efficient route. The resulting schedule is then passed to Gemini Pro 2.5, which converts the raw sequence into a coherent, user-friendly itinerary in natural language.

The second major feature of VirtuVoyage focuses on interactive virtual tours. These tours are built using 360-degree panoramic images of monuments, guided by a conversational assistant that offers both narration and live Q&A. The assistant is powered by Retrieval-Augmented Generation (RAG) using Gemini Flash 2.5, ensuring responses are accurate and grounded in real-world facts. To create lifelike narration, we used ElevenLabs to generate voices with specific tones and accents. The script for each monument tour was generated using Gemini 3 (12B multimodal), allowing for rich descriptions that match the visual content. For fast and contextually accurate search within the assistant, we utilized Faiss as a vector database for semantic search.

Currently, the platform features tours for three major monuments, but we built the backend to support rapid expansion. We designed it with modularity and scalability in mind, making it easy to add new content and features in the future.

Throughout development, we faced challenges such as tuning clustering algorithms for mixed travel patterns, maintaining factual accuracy across AI responses, and integrating various third-party services smoothly. Despite the technical complexity, VirtuVoyage reflects a vision where AI not only simplifies decision-making but also makes cultural exploration more engaging, educational, and accessible.

---

## Features

- AI-powered itinerary generation using Gemini 2.5
- K-Means clustering for landmark grouping
- Path optimization via Google Maps Directions API
- 360° immersive monument viewer
- Voice narration with mute/unmute toggle
- Natural language Q&A with Gemini and Faiss vector search
- Firebase authentication and Firestore-based user data
- WebRTC screen sharing for collaborative trip planning

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Three Fiber, Firebase Auth
- **Backend:** FastAPI, Faiss, Gemini API, Firebase Firestore
- **APIs & Tools:** Google Maps API, Gemini Pro 2.5, ElevenLabs, WebRTC

---

## 🔧 Installation

### Frontend Setup

```bash
npm install
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🏃 Run Project

### Start Backend Server

```bash
uvicorn main:app --reload --port 8000
```

### Start Frontend Dev Server

```bash
npm run dev
```

---

##  Learnings & Challenges

- Fine-tuned Faiss for low-latency semantic search over multiple monument descriptions.
- Integrated Gemini's streaming and grounding modes for better Q&A responses.
- Optimized Three.js rendering for smooth 360° playback.
- Worked around API token limits by batching queries and introducing client-side retries.

---

##  License

MIT License

---

##  Acknowledgements

- [Google Maps Platform](https://developers.google.com/maps)
- [Gemini API by Google](https://deepmind.google/technologies/gemini/)
- [ElevenLabs Voice API](https://www.elevenlabs.io/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [Firebase](https://firebase.google.com/)

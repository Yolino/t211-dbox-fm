import React, { useState } from "react";
import Header from "../components/Header.tsx";
import TileMain from "../components/TileMain.tsx";
import AudioPlayer from "../components/AudioPlayer.tsx";

const HomePage = () => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const handlePlayAudio = (audioId) => {
    setCurrentAudio(audioId);
  }

  return (
    <div className="App">
      <Header />
      <main className="p-6">
        <TileMain onPlayAudio={handlePlayAudio} />
      </main>
      <AudioPlayer audioId={currentAudio} />
    </div>
  );
};

export default HomePage

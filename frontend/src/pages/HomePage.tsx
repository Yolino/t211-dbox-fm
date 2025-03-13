import React, { useState } from "react";
import Header from "../components/Header.tsx";
import TileMain from "../components/TileMain.tsx";
import PublishMain from "../components/PublishMain.tsx";
import AudioPlayer from "../components/AudioPlayer.tsx";

const HomePage = () => {
  const [currentPage, setCurrentPage] = useState("tiles");

  const [currentAudio, setCurrentAudio] = useState(null);
  const handlePlayAudio = (audioId) => {
    setCurrentAudio(audioId);
  }

  return (
    <div className="App">
      <Header onSwitchPage={setCurrentPage} />
      <main className="p-6">
        {currentPage === "tiles" && <TileMain onPlayAudio={handlePlayAudio} />}
        {currentPage === "publish" && <PublishMain />}
      </main>
      <AudioPlayer audioId={currentAudio} />
    </div>
  );
};

export default HomePage

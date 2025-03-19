import React, { useState } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../components/Header.tsx";
import TileMain from "../components/TileMain.tsx";
import PublishMain from "../components/PublishMain.tsx";
import ProfileMain from "../components/ProfileMain.tsx";
import FmMain from "../components/FmMain.tsx";
import ModerationMain from "../components/ModerationMain.tsx";
import AudioPlayer from "../components/AudioPlayer.tsx";

const ProfileWrapper = () => {
  const { username } = useParams();
  return <ProfileMain username={username} />;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [currentAudio, setCurrentAudio] = useState(null);
  const handlePlayAudio = (audioId) => {
    setCurrentAudio(audioId);
  }
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="App">
      <Header onSwitchPage={(page) => navigate(page)} />
      <main className="p-6">
        {message && <p className="text-green">{message}</p>}
        <Routes>
          <Route path="/" element={<TileMain onPlayAudio={handlePlayAudio} />} />
          <Route path="/publish" element={<PublishMain />} />
          <Route path="/profile" element={<ProfileWrapper />} />
          <Route path="/profile/:username" element={<ProfileWrapper />} />
          <Route path="/fm" element={<FmMain />} />
          <Route path="/moderation" element={<ModerationMain />} />
        </Routes> 
      </main>
      <AudioPlayer audioId={currentAudio} />
    </div>
  );
};

export default HomePage

import React from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../components/header/Header.tsx";
import TileMain from "../components/tiles/TileMain.tsx";
import PublishMain from "../components/PublishMain.tsx";
import ProfileMain from "../components/profile/ProfileMain.tsx";
import FmMain from "../components/fm/FmMain.tsx";
import ModerationMain from "../components/moderation/ModerationMain.tsx";

const ProfileWrapper = ({ onPlayAudio }) => {
  const { username } = useParams();
  return <ProfileMain username={username} onPlayAudio={onPlayAudio} />;
};

const HomePage = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="App">
      <Header onSwitchPage={(page) => navigate(page)} />
      <main className="p-6 mb-20">
        {message && <p className="text-green">{message}</p>}
        <Routes>
          <Route path="/" element={<TileMain />} />
          <Route path="/publish" element={<PublishMain />} />
          <Route path="/profile" element={<ProfileWrapper />} />
          <Route path="/profile/:username" element={<ProfileWrapper />} />
          <Route path="/fm" element={<FmMain />} />
          <Route path="/moderation" element={<ModerationMain />} />
        </Routes>
      </main>
    </div>
  );
};

export default HomePage

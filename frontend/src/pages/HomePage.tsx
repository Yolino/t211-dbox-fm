import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../components/header/Header.tsx";
import TileMain from "../components/tiles/TileMain.tsx";
import PublishMain from "../components/PublishMain.tsx";
import ProfileMain from "../components/profile/ProfileMain.tsx";
import FmMain from "../components/fm/FmMain.tsx";
import ModerationMain from "../components/moderation/ModerationMain.tsx";
import Alert from "../components/Alert.tsx";

const ProfileWrapper = ({ onPlayAudio }) => {
  const { username } = useParams();
  return <ProfileMain username={username} onPlayAudio={onPlayAudio} />;
};

const HomePage = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="App">
      <Header onSwitchPage={(page) => navigate(page)} />
      <main className="p-6 mb-20">
        {message && <Alert type="error" text={message} onClose={() => { setMessage(""); }} />}
        <Routes>
          <Route path="/" element={<TileMain />} />
          <Route path="/publish" element={<PublishMain />} />
          <Route path="/profile" element={<ProfileWrapper />} />
          <Route path="/profile/:username" element={<ProfileWrapper />} />
          <Route path="/fm" element={<FmMain />} />
          <Route path="/moderation" element={<ModerationMain />} />
          <Route path="*" element={<Navigate to="/" state={{ message: "This page does not exist" }} />} />
        </Routes>
      </main>
    </div>
  );
};

export default HomePage

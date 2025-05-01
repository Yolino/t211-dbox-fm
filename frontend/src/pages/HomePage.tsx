import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { usePrivileges } from "../context/PrivilegesContext.tsx";
import REPORTED_COUNT_QUERY from "../graphql/reportedCountQuery.ts";
import Header from "../components/header/Header.tsx";
import TileMain from "../components/tiles/TileMain.tsx";
import PublishMain from "../components/PublishMain.tsx";
import ProfileMain from "../components/profile/ProfileMain.tsx";
import FmMain from "../components/fm/FmMain.tsx";
import ModerationMain from "../components/moderation/ModerationMain.tsx";
import Alert from "../components/Alert.tsx";

const ProfileWrapper = ({ onPlayAudio, onRefreshBadge }) => {
  const { username } = useParams();
  return <ProfileMain username={username} onPlayAudio={onPlayAudio} onRefreshBadge={onRefreshBadge} />;
};

const HomePage = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const { privileges } = usePrivileges();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const { data, loading, error, refetch } = useQuery(REPORTED_COUNT_QUERY, {
    skip: !privileges?.isModerator,
  });
  const count = (data && !loading && !error) ? data.reportedContent?.totalCount : 0;

  return (
    <div className="App">
      <Header onSwitchPage={(page) => navigate(page)} moderationCount={count} />
      <main className="p-6 mb-20">
        {message && <Alert type="error" text={message} onClose={() => { setMessage(""); }} />}
        <Routes>
          <Route path="/" element={<TileMain onRefreshBadge={refetch} />} />
          <Route path="/publish" element={<PublishMain />} />
          <Route path="/profile" element={<ProfileWrapper onRefreshBadge={refetch} />} />
          <Route path="/profile/:username" element={<ProfileWrapper onRefreshBadge={refetch} />} />
          <Route path="/fm" element={<FmMain />} />
          <Route path="/moderation" element={<ModerationMain onRefreshBadge={refetch} />} />
          <Route path="*" element={<Navigate to="/" state={{ message: "This page does not exist" }} />} />
        </Routes>
      </main>
    </div>
  );
};

export default HomePage

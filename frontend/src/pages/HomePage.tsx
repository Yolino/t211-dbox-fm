import React, { useState } from "react";
import AudioPlayer from "../components/AudioPlayer.tsx";
import Header from "../components/Header.tsx";
import TilesGroup from "../components/TilesGroup.tsx";
import { useQuery, gql } from "@apollo/client";

const GET_PUBLICATIONS = gql`
    query {
        publications {
            id
            title
            cover
            voteCount
            author {
                username
            }
        }
    }
`;

const HomePage = () => {

  const { loading, error, data } = useQuery(GET_PUBLICATIONS);
  const pubs = data?.publications;

  const [currentAudio, setCurrentAudio] = useState(null);
  const handlePlayAudio = (audioId) => {
    setCurrentAudio(audioId);
  }
  
  return (
    <div className="App">
      <Header />
      <main className="p-6">
        <TilesGroup group="Recent" onPlayAudio={handlePlayAudio} tilesData={pubs ? pubs.map(p => {
            return {id: p.id, title: p.title, artist: p.author.username, likes: p.voteCount, coverImage: p.cover};
          }) : []}/>
      </main>
      <AudioPlayer audioId={currentAudio} />
    </div>
  );
};

export default HomePage

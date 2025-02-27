import React from "react";
import AudioPlayer from "../components/AudioPlayer.tsx";
import Header from "../components/Header.tsx";
import TilesGroup from "../components/TilesGroup.tsx";
import Showcase from "../images/showcase.jpg";
import Black from "../images/black.jpg";
import CD from "../images/cd.jpg";
import Royalty from "../images/royalty.jpg";
import Sun from "../images/sun.jpg";
import { useQuery, gql } from "@apollo/client";

const GET_PUBLICATIONS = gql`
    query {
        publications {
            title
            author {
                username
            }
        }
    }
`;

const HomePage = () => {

  const { loading, error, data } = useQuery(GET_PUBLICATIONS);
  console.log(data?.publications);

  // Données pour le groupe "Recent"
  const tilesDataRecent = [
    { id: "1", title: "Summer Breeze", artist: "Dream Wave", likes: 1234, coverImage: Showcase },
    { id: "2", title: "Night Drive", artist: "Synthwave Masters", likes: 856, coverImage: Sun },
    { id: "3", title: "Ocean Waves", artist: "Chill Beats", likes: 2341, coverImage: CD },
    { id: "4", title: "Urban Jungle", artist: "City Sounds", likes: 567, coverImage: Black },
    { id: "5", title: "Midnight Rain", artist: "Nature Sounds", likes: 1789, coverImage: Showcase },
    { id: "6", title: "Morning Coffee", artist: "Lofi Beats", likes: 987, coverImage: Royalty },
  ];

  // Données pour le groupe "Popular"
  const tilesDataPopular = [
    { id: "7", title: "Golden Hour", artist: "Sunset Vibes", likes: 3456, coverImage: Sun },
    { id: "8", title: "City Lights", artist: "Urban Beats", likes: 2345, coverImage: Black },
    { id: "9", title: "Starry Night", artist: "Cosmic Sounds", likes: 1234, coverImage: CD },
    { id: "10", title: "Forest Echoes", artist: "Nature Waves", likes: 987, coverImage: Royalty },
    { id: "11", title: "Retro Drive", artist: "Synthwave Masters", likes: 876, coverImage: Showcase },
    { id: "12", title: "Chill Vibes", artist: "Lofi Beats", likes: 765, coverImage: Sun },
  ];
  return (
    <div className="App">
      <Header />
      <main className="p-6">
        <TilesGroup group="Recent" tilesData={tilesDataRecent}/>
        <TilesGroup group="Popular" tilesData={tilesDataPopular}/>
      </main>
      <AudioPlayer />
    </div>
  );
};

export default HomePage

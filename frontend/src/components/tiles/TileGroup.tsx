import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Tile from "./Tile.tsx";
import PUBLICATION_PAGE_QUERY from "../../graphql/publicationPageQuery.ts";
import LoadingIcon from "../../svg/LoadingIcon.tsx";
import CloseIcon from "../../svg/CloseIcon.tsx";
import ShowMoreIcon from "../../svg/ShowMoreIcon.tsx";

interface TileGroupProps {
  groupTitle: string;
  orderBy: string;
  onPlayAudio: () => void;
  onTileClick: () => void;
  onError: () => void;
}

const TileGroup = ({ groupTitle="Default", orderBy="-created_at", onPlayAudio, onTileClick, onError }: TileGroupProps) => {
  const [start, setStart] = useState(0);
  const [fetchCount, setFetchCount] = useState(3);
  const [displayCount, setDisplayCount] = useState(3);
  const updatePublications = (next: boolean) => {
    (next) ? setStart(start + displayCount) : setStart(Math.max(0, start - displayCount));
  };
  const { loading, error, data, refetch } = useQuery(PUBLICATION_PAGE_QUERY, {
    variables: { orderBy, start, count: fetchCount },
  });
  const pubs = data?.publicationPage.publications || [];
  const hasNextPage = data?.publicationPage.hasNextPage;

  useEffect(() => {
    const handleResize = () => {
      let newDisplayCount = 3;
      if (window.innerWidth >= 880 && window.innerWidth <= 1024) {
        newDisplayCount = 4;
      } else {
        newDisplayCount = Math.floor((window.innerWidth * 2/3) / 240);
      }
      newDisplayCount = Math.max(3, newDisplayCount);
      setDisplayCount(newDisplayCount);
      if (newDisplayCount > fetchCount) {
        setFetchCount(newDisplayCount);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize) };
  }, [fetchCount]);

  useEffect(() => {
    if (fetchCount > pubs.length && !loading && hasNextPage) {
      refetch({ orderBy, start, count: fetchCount });
    }
  }, [fetchCount, pubs.length, loading, orderBy, start, refetch, hasNextPage]);

  const onTileVote = () => {
    refetch();
  };

  return (
    <div id={orderBy} className="my-4">
      <p className="text-white text-3xl font-semibold mb-2 cursor-default">{groupTitle}</p>
      <div className="flex">
        {(loading || error) ? (
          <div className="group w-1/4 p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 hover:scale-105 hover:shadow-lg transition-all duration-300 relative">
            <div
              className="flex items-center justify-center w-full h-20 sm:h-24 md:h-28 lg:h-32 object-cover rounded mb-1 sm:mb-2 bg-gray-100"
            >
              {loading && <LoadingIcon />}
              {error && <CloseIcon />}
            </div>
            <div className="p-10">
              {loading && <p>Loading...</p>}
              {error && <p className="text-red-600">{error.message}</p>}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center">
              <button
                onClick={() => { updatePublications(false) }}
                className={`${start === 0 ? "hidden" : ""} flex justify-center items-center w-8 h-16 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none rotate-180`}
              >
                <ShowMoreIcon />
              </button>
            </div>
            <div className="flex flex-grow flex-shrink justify-around">
              {pubs.slice(0, displayCount).map((p) => (
                <Tile
                  key={p.id}
                  publication={p}
                  group={orderBy}
                  onPlayAudio={onPlayAudio}
                  onTileClick={onTileClick}
                  onTileVote={onTileVote}
                  onError={onError}
              />
              ))}
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => { updatePublications(true) }}
                className={`${!hasNextPage ? "hidden" : ""} flex justify-center items-center w-8 h-16 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none`}
              >
                <ShowMoreIcon />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TileGroup;

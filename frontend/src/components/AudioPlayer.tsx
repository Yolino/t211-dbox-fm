import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingIcon from "../svg/LoadingIcon.tsx";
import PlayIcon from "../svg/PlayIcon.tsx";
import PauseIcon from "../svg/PauseIcon.tsx";
import AudioIcon from "../svg/AudioIcon.tsx";

interface AudioPlayerProps {
  audio: number;
  onClose: () => void;
}

const AudioPlayer = ({ audio, onClose }: AudioPlayerProps) => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const controllerRef = useRef(new AbortController());
  const [audioBlob, setAudioBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAudio = async(id) => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/audio/${id}/`);
      if (!response.ok) {
        const audioError = await response.text();
        throw new Error(audioError || "Something went wrong")
      }
      const blob = await response.blob();
      setIsLoading(false);
      setAudioBlob(blob);
    } catch (error) {
      setErrorMessage(`Error fetching audio ${id}: ${error}`);
    }
  };

  useEffect(() => {
    if (audio) {
      fetchAudio(audio);
    }
  }, [audio]);

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      setErrorMessage("");
      const controller = new AbortController();
      controllerRef.current = controller;
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      // Set the URL as the source for the audio
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      if (autoplay) audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        setErrorMessage(`Playback error : ${error}`);
      });
      handleTimeUpdate();
      return () => {
        controller.abort();
      };
    }
  }, [audioBlob]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAutoplay(!autoplay);
    setIsPlaying(!isPlaying);
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = e.target.value;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    onClose();
  };

  return (
    <div className="BottomBar mt-2 p-2 w-full bg-gray-100 shadow-lg rounded-md">
      {errorMessage ? (
        <p className="text-center text-red-500">{errorMessage}</p>
      ) : (
        <>
          <audio
            ref={audioRef}
            id="music"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(audioRef.current.duration)}
          >
            Your browser does not support the audio element.
          </audio>
          <div className="flex items-center justify-between gap-2 max-w-6xl mx-auto">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors duration-200 text-white flex-shrink-0"
              disabled={isLoading}
            >
              {isLoading ? <LoadingIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            {/* Progress Bar Container */}
            <div className="w-3/5 flex items-center flex-grow space-x-2 mx-1">
              <span className="text-xs sm:text-sm text-gray-600">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer mx-1"
                style={{
                  background: `linear-gradient(to right, #4B5563 ${(currentTime / duration) * 100}%, #E5E7EB ${(currentTime / duration) * 100}%)`
                }}
              />
              <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                {formatTime(duration)}
              </span>
            </div>
            {/* Volume Control */}
            <div className="w-1/5 flex items-center space-x-1 ml-auto">
              <AudioIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4B5563 ${volume * 100}%, #E5E7EB ${volume * 100}%)`
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPlayer;


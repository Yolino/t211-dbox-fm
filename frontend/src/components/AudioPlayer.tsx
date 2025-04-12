import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingIcon from "../svg/LoadingIcon.tsx";
import PlayIcon from "../svg/PlayIcon.tsx";
import PauseIcon from "../svg/PauseIcon.tsx";
import AudioIcon from "../svg/AudioIcon.tsx";
import CloseIcon from "../svg/CloseIcon.tsx";

interface Audio {
  id: number | null;
  title: string;
  author: string;
}

interface AudioPlayerProps {
  audio: Audio;
  onClose: () => void;
}

const AudioPlayer = ({ audio, onClose }: AudioPlayerProps) => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const controllerRef = useRef(new AbortController());
  const [audioBlob, setAudioBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (audio.id) {
      fetchAudio(audio.id);
    }
  }, [audio.id]);

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
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        setErrorMessage(`Playback error : ${error}`);
      });
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
    <div className="BottomBar fixed bottom-0 w-full bg-gray-900 p-4 shadow-lg">
      {errorMessage ? <p className="text-center text-red-500">{errorMessage}</p> : (
        <>
          <audio
          ref={audioRef}
          id="music"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        >
          Your browser does not support the audio element.
        </audio>

        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="m-2 text-sm text-white">
            <p className="cursor-default">{audio.title}</p>
            <p onClick={() => { navigate(`/profile/${audio.author}`) }} className="cursor-pointer hover:underline">{audio.author}</p>
          </div>
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors duration-200 text-white"
            disabled={isLoading}
          >
            {isLoading ? (<LoadingIcon />) : isPlaying ? (<PauseIcon />) : (<PlayIcon />)}
          </button>
          {/* Progress Bar */}
          <div className="flex items-center space-x-4 flex-1 mx-4">
            <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-400">{formatTime(duration)}</span>
          </div>
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <AudioIcon />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <button
            className="p-1 m-5 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors duration-200 text-white"
            onClick={handleClosePlayer}
          >
            <CloseIcon />
          </button>
        </div>
      </>
      )}
    </div>
  );
};

export default AudioPlayer;


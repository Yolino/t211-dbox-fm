import React, { useRef, useState, useEffect } from "react";

const AudioPlayer = ({audioId}) => {
  const audioRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const fetchAudio = async(id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/audio/${id}/`);
      const blob = await response.blob();
      setAudioBlob(blob);
    } catch (error) {
      console.log(`Error fetching audio ${id}: ${error}`);
    }
  };

  useEffect(() => {
    if (audioId) {
      fetchAudio(audioId);
    }
  }, [audioId]);

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      // Set the URL as the source for the audio
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioBlob]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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

  return (
    <div className="BottomBar fixed bottom-0 w-full bg-gray-900 p-4 shadow-lg">
      <audio
        ref={audioRef}
        id="music"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
      >
        {/* No need to specify src here, it's dynamically set in the effect */}
        Your browser does not support the audio element.
      </audio>

      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors duration-200"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
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
      </div>
    </div>
  );
};

export default AudioPlayer;


import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Rewind, FastForward, SkipBack, SkipForward, Volume2, VolumeX, Maximize, PictureInPicture, Settings } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../utils/youtube';

const HlsPlayer = ({ videoUrl, poster, onNext, onPrev, hasNext, hasPrev, onTimeUpdate }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);

    // Player States
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Settings States
    const [showSettings, setShowSettings] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [qualities, setQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState('auto');

    // Check YouTube
    const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

    // Initialize HLS
    useEffect(() => {
        if (youtubeEmbedUrl) return;

        const video = videoRef.current;
        if (!video || !videoUrl) return;

        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (Hls.isSupported() && videoUrl.includes('.m3u8')) {
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
            });
            hlsRef.current = hls;

            hls.loadSource(videoUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const availableQualities = hls.levels.map(l => l.height);
                setQualities(availableQualities);
                video.play().catch(() => console.log("Autoplay blocked"));
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });

        } else if (videoUrl.includes('.m3u8') && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => console.log("Autoplay blocked"));
            });
        } else {
             video.src = videoUrl;
        }

        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [videoUrl, youtubeEmbedUrl]);

    // Controls Logic - use useCallback for stable function references
    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        isPlaying ? videoRef.current.pause() : videoRef.current.play();
    }, [isPlaying]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    const handleSkip = useCallback((seconds) => { 
        if (videoRef.current) {
            videoRef.current.currentTime += seconds; 
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }, [isMuted]);

    // Video Event Listeners and Keyboard Shortcuts
    useEffect(() => {
        if (youtubeEmbedUrl) return;
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdateLocal = (e) => {
            setCurrentTime(video.currentTime);
            if (onTimeUpdate) {
                onTimeUpdate(e);
            }
        };
        const handleLoadedMetadata = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleKeyDown = (e) => {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'KeyF') {
                e.preventDefault();
                toggleFullscreen();
            } else if (e.code === 'KeyM') {
                e.preventDefault();
                toggleMute();
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                handleSkip(10);
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                handleSkip(-10);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdateLocal);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdateLocal);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onTimeUpdate, youtubeEmbedUrl, togglePlay, toggleFullscreen, toggleMute, handleSkip]);

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const togglePiP = async () => {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            await videoRef.current.requestPictureInPicture();
        }
    };

    const changeSpeed = (rate) => {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    const changeQuality = (levelIndex) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
            setCurrentQuality(levelIndex === -1 ? 'auto' : qualities[levelIndex]);
        }
        setShowSettings(false);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    if (youtubeEmbedUrl) {
        return (
            <iframe
                key={videoUrl}
                src={youtubeEmbedUrl}
                title="YouTube video player"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full aspect-video bg-black group overflow-hidden flex items-center justify-center">
            <video
                key={videoUrl}
                ref={videoRef}
                onClick={togglePlay}
                className="w-full h-full cursor-pointer object-contain absolute inset-0"
                playsInline
                poster={poster}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                
                {/* Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 mb-4 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary z-10 relative"
                    style={{
                        background: `linear-gradient(to right, currentColor ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
                    }}
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-white">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="hover:text-primary transition">
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>
                        
                        {/* Skip 10s */}
                        <button onClick={() => handleSkip(-10)} className="hover:text-primary transition"><Rewind size={20} fill="currentColor" /></button>
                        <button onClick={() => handleSkip(10)} className="hover:text-primary transition"><FastForward size={20} fill="currentColor" /></button>

                        {/* Next/Prev Episode */}
                        <button onClick={onPrev} disabled={!hasPrev} className={`transition ${hasPrev ? 'hover:text-primary' : 'text-gray-500 cursor-not-allowed'}`}>
                            <SkipBack size={20} fill="currentColor" />
                        </button>
                        <button onClick={onNext} disabled={!hasNext} className={`transition ${hasNext ? 'hover:text-primary' : 'text-gray-500 cursor-not-allowed'}`}>
                            <SkipForward size={20} fill="currentColor" />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute} className="hover:text-primary transition">
                                {isMuted ? <VolumeX size={20} fill="currentColor" /> : <Volume2 size={20} fill="currentColor" />}
                            </button>
                        </div>

                        {/* Time */}
                        <span className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-white relative">
                        {/* Settings Menu */}
                        <div className="relative">
                            <button onClick={() => setShowSettings(!showSettings)} className="hover:text-primary transition">
                                <Settings size={20} fill="currentColor" />
                            </button>
                            {showSettings && (
                                <div className="absolute bottom-10 right-0 bg-gray-900/95 rounded-md p-2 w-48 shadow-lg border border-gray-700">
                                    <div className="text-xs text-gray-400 mb-1 px-2 uppercase font-bold">T&#7889;c &#273;&#7897;</div>
                                    <div className="flex gap-2 px-2 mb-3">
                                        {[0.5, 1, 1.5, 2].map(speed => (
                                            <button key={speed} onClick={() => changeSpeed(speed)} className={`text-sm ${playbackRate === speed ? 'text-primary font-bold' : 'text-white'}`}>
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                    {qualities.length > 0 && (
                                        <>
                                            <div className="text-xs text-gray-400 mb-1 px-2 uppercase font-bold">Ch&#7845;t l&#432;&#7907;ng</div>
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => changeQuality(-1)} className={`text-sm text-left px-2 py-1 hover:bg-gray-800 rounded ${currentQuality === 'auto' ? 'text-primary font-bold' : 'text-white'}`}>Auto</button>
                                                {qualities.map((q, idx) => (
                                                    <button key={idx} onClick={() => changeQuality(idx)} className={`text-sm text-left px-2 py-1 hover:bg-gray-800 rounded ${currentQuality === q ? 'text-primary font-bold' : 'text-white'}`}>
                                                        {q}p
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* PiP */}
                        <button onClick={togglePiP} className="hover:text-primary transition">
                            <PictureInPicture size={20} />
                        </button>

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="hover:text-primary transition">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(HlsPlayer);

import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getYouTubeEmbedUrl } from '../utils/youtube';

const HlsPlayer = ({ videoUrl, poster, onTimeUpdate }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        // Strict cleanup of previous instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const isHLS = videoUrl.includes('.m3u8');

        if (isHLS && Hls.isSupported()) {
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

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch((err) => console.log("Autoplay prevented by browser policies."));
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
        } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native support fallback
            video.src = videoUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch((err) => console.log("Autoplay prevented by browser policies."));
            });
        } else {
             video.src = videoUrl;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoUrl]); // strictly dependent ONLY on videoUrl

    const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

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
        <video
            key={videoUrl} // Force DOM recreation only when URL actually changes
            ref={videoRef}
            controls
            preload="auto"
            playsInline
            onTimeUpdate={onTimeUpdate}
            className="absolute inset-0 w-full h-full object-contain"
            poster={poster}
        />
    );
};

export default React.memo(HlsPlayer);

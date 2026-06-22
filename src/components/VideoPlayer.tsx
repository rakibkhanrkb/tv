import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Volume2, VolumeX, Play, Pause, Maximize, RotateCcw, AlertTriangle, ExternalLink, HelpCircle, ShieldAlert } from 'lucide-react';
import { Language } from '../types';

interface VideoPlayerProps {
  url: string;
  channelName: string;
  lang: Language;
}

export default function VideoPlayer({ url, channelName, lang }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // default to muted for autoplay friendliness
  const [volume, setVolume] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHttpWarning, setIsHttpWarning] = useState(false);
  const [stats, setStats] = useState({ resolution: 'Unknown', speed: '0 kbps' });

  // Reset states on URL change
  useEffect(() => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsHttpWarning(false);
    setIsPlaying(false);

    // Check if it is an HTTP link loaded on an HTTPS context
    const isHttpsPage = window.location.protocol === 'https:';
    if (isHttpsPage && url.startsWith('http://')) {
      setIsHttpWarning(true);
    }

    const video = videoRef.current;
    if (!video) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Load with hls.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 15,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch((e) => {
            console.log('Autoplay blocked or failed:', e);
            setIsPlaying(false);
          });
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        const levelObj = data.details;
        const width = data.levelInfo?.width || 0;
        const height = data.levelInfo?.height || 0;
        if (width && height) {
          setStats((prev) => ({ ...prev, resolution: `${width}x${height}` }));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Error details:', data);
        if (data.fatal) {
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg(
                lang === 'bn'
                  ? 'নেটওয়ার্ক ত্রুটি: স্ট্রিম লিংকটি সাময়িকভাবে ডাউন অথবা অ্যাক্সেসযোগ্য নয়।'
                  : 'Network Error: Stream link is down or blocked in your browser.'
              );
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMsg(
                lang === 'bn'
                  ? 'মিডিয়া ত্রুটি: মিডিয়া ডিকোড করতে সমস্যা হয়েছে।'
                  : 'Media Error: Problem decoding the broadcast.'
              );
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg(
                lang === 'bn'
                  ? 'প্লেব্যাক ত্রুটি: ব্রডকাস্টার সংযোগ করতে ব্যর্থ হয়েছে।'
                  : 'Playback Error: Unable to establish broadcast stream.'
              );
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari browsers that support native HLS streaming
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setErrorMsg(
          lang === 'bn'
            ? 'লাইভ প্লেব্যাক ত্রুটি: সাফারি ব্রাউজার স্ট্রিমটি লোড করতে পারেনি।'
            : 'Live playback error: Native Safari failed to render the stream.'
        );
      });
    } else {
      setIsLoading(false);
      setErrorMsg(
        lang === 'bn'
          ? 'অসমর্থিত ব্রাউজার: আপনার ব্রাউজারে HLS (.m3u8) প্লেব্যাক সমর্থিত নয়।'
          : 'Unsupported Browser: HLS (.m3u8) playback is not supported.'
      );
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, lang]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    video.volume = val;
    video.muted = val === 0;
    setIsMuted(val === 0);
  };

  const handleFullScreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).webkitRequestFullscreen) {
      (video as any).webkitRequestFullscreen();
    } else if ((video as any).msRequestFullscreen) {
      (video as any).msRequestFullscreen();
    }
  };

  const retryPlayback = () => {
    setIsLoading(true);
    setErrorMsg(null);
    const video = videoRef.current;
    if (hlsRef.current && video) {
      hlsRef.current.destroy();
      const hls = new Hls({ lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
      {/* Actual HTML5 Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-neutral-950/90 z-20 transition-opacity">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
            <div className="absolute w-8 h-8 rounded-full bg-amber-400 animate-pulse"></div>
          </div>
          <span className="mt-4 text-amber-400 font-medium text-sm tracking-widest">
            {lang === 'bn' ? 'স্ট্রিমিং লোড হচ্ছে...' : 'LOADING LIVE STREAM...'}
          </span>
          <span className="text-xs text-neutral-500 mt-1">
            {lang === 'bn' ? 'কম লোড টাইম নিশ্চিত করা হচ্ছে' : 'Optimizing buffer latency...'}
          </span>
        </div>
      )}

      {/* HTTP Mixed Content/Block Warning */}
      {isHttpWarning && !errorMsg && (
        <div className="absolute top-3 left-3 right-3 bg-amber-500/90 backdrop-blur text-neutral-950 p-2 text-xs rounded-lg flex items-start gap-2 z-10 shadow-lg border border-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">
              {lang === 'bn' ? 'এইচটিটিপি (HTTP) মিক্সড কনটেন্ট নোটিশ:' : 'HTTP Mixed Content Notice:'}
            </p>
            <p>
              {lang === 'bn'
                ? 'এই চ্যানেলটি HTTP স্ট্রিম ব্যবহার করে। আপনার ব্রাউজার নিরাপদে লোড করার জন্য এটি ব্লক করতে পারে।'
                : 'This channel source is HTTP instead of HTTPS. Chrome/Firefox may block it.'}
            </p>
            <div className="mt-1 flex gap-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline flex items-center gap-1 hover:text-neutral-800"
              >
                {lang === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open Directly'} <ExternalLink className="w-3 h-3" />
              </a>
              <span>|</span>
              <span className="font-semibold text-neutral-900">
                {lang === 'bn' ? 'অথবা VLC তে লিংকটি চালান' : 'Or copy to play in VLC'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Technical Error Overlay */}
      {errorMsg && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-neutral-900/95 p-6 text-center z-20">
          <AlertTriangle className="w-14 h-14 text-red-500 mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-white mb-2">
            {lang === 'bn' ? 'সম্প্রচার সংযোগে ত্রুটি' : 'Broadcast Connection Error'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mb-4 bg-black/40 p-2.5 rounded border border-neutral-800">
            {errorMsg}
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={retryPlayback}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fbbf24] hover:bg-amber-500 text-neutral-950 text-xs font-bold rounded-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry Load'}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-md transition border border-neutral-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'সরাসরি ব্রাউজারে দেখুন' : 'Open in New Tab'}
            </a>
          </div>

          <div className="mt-5 text-[11px] text-neutral-500 max-w-sm">
            {lang === 'bn'
              ? 'পরামর্শ: আইপিটিভি লাইভ লিঙ্ক সাময়িক বন্ধ হতে পারে। অ্যাপের অন্য চ্যানেলগুলো ট্রাই করতে পারেন অথবা VLC/MX Player এ দেখতে লিঙ্কটি কপি করুন।'
              : 'Tip: Live sources cycle offline occasionally. Try other sources or copy the stream URL to VLC Player.'}
          </div>
        </div>
      )}

      {/* Control Bar Overlay on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-between z-10 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-white transition"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-white transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 accent-[#fbbf24] rounded bg-neutral-700 appearance-none cursor-pointer"
            />
          </div>

          <div className="text-[11px] text-neutral-300 font-mono">
            <span>{channelName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick status values */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>Live HLS</span>
            {stats.resolution !== 'Unknown' && (
              <>
                <span>•</span>
                <span>{stats.resolution}</span>
              </>
            )}
          </div>

          <button
            onClick={handleFullScreen}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-white transition"
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

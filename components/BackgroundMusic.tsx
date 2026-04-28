"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 배경 재생용 미디어
 * - 로컬: `/audio/x.mp3`, `/video/x.mp4` (`public/` 아래)
 * - 직접 파일 URL: `.mp3` / `.mp4` 등 끝나는 주소
 * - 유튜브: `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/` (IFrame API)
 */
const BACKGROUND_MEDIA_SRC = "https://www.youtube.com/watch?v=nIRZ496KPP0&list=RDnIRZ496KPP0&start_radio=1";

const VOLUME = 0.38;

function isVideoSource(src: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(src);
}

function parseYoutubeVideoId(url: string): string | null {
  const s = url.trim();
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0]?.split("?")[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.slice("/embed/".length).split("/")[0]?.split("?")[0] || null;
      }
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];
      const v = u.searchParams.get("v");
      if (v) return v;
    }
    return null;
  } catch {
    return null;
  }
}

/** 유튜브 제외: audio/video src로 쓸 수 없는 페이지 URL */
function isOtherUnsupportedPageUrl(src: string) {
  const s = src.trim().toLowerCase();
  if (s.startsWith("/")) return false;
  if (parseYoutubeVideoId(src)) return false;
  try {
    const host = new URL(src).hostname;
    return /vimeo\.com|facebook\.com/i.test(host);
  } catch {
    return false;
  }
}

type YoutubePlayerApi = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (n: number) => void;
  unMute: () => void;
  mute: () => void;
  destroy: () => void;
};

const YT_PS = { PLAYING: 1, PAUSED: 2, ENDED: 0 } as const;

let youtubeApiPromise: Promise<void> | null = null;

function ensureYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as Window & { YT?: { Player: unknown } };
  if (w.YT && typeof w.YT.Player === "function") return Promise.resolve();
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const win = window as Window & { onYouTubeIframeAPIReady?: () => void };
      const prior = win.onYouTubeIframeAPIReady;
      win.onYouTubeIframeAPIReady = () => {
        prior?.();
        resolve();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    });
  }
  return youtubeApiPromise;
}

function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M11 5 6 9H2v6h4l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.07 4.93a9 9 0 0 1 0 14.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SpeakerOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M11 5 6 9H2v6h4l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 9l5 5M21 9l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function BackgroundMusic() {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YoutubePlayerApi | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [playError, setPlayError] = useState(false);
  const [ytReady, setYtReady] = useState(false);

  const youtubeId = parseYoutubeVideoId(BACKGROUND_MEDIA_SRC);
  const useYoutube = Boolean(youtubeId);
  const otherUnsupported = isOtherUnsupportedPageUrl(BACKGROUND_MEDIA_SRC);
  const useVideo = !useYoutube && !otherUnsupported && isVideoSource(BACKGROUND_MEDIA_SRC);

  useEffect(() => {
    if (!youtubeId) return;
    setYtReady(false);
    setLoadError(false);
    let cancelled = false;
    let player: YoutubePlayerApi | null = null;

    void ensureYoutubeIframeApi().then(() => {
      if (cancelled || !ytContainerRef.current) return;
      type YTWindow = Window & {
        YT: {
          Player: new (
            el: HTMLElement,
            opts: {
              videoId: string;
              width: number;
              height: number;
              playerVars: Record<string, string | number | undefined>;
              events: {
                onReady: (e: { target: YoutubePlayerApi }) => void;
                onStateChange: (e: { data: number }) => void;
                onError: () => void;
              };
            },
          ) => YoutubePlayerApi;
        };
      };
      const YT = (window as unknown as YTWindow).YT;
      player = new YT.Player(ytContainerRef.current, {
        videoId: youtubeId,
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: youtubeId,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            ytPlayerRef.current = e.target;
            e.target.setVolume(Math.round(VOLUME * 100));
            setYtReady(true);
          },
          onStateChange: (e) => {
            if (cancelled) return;
            if (e.data === YT_PS.PLAYING) setPlaying(true);
            if (e.data === YT_PS.PAUSED || e.data === YT_PS.ENDED) setPlaying(false);
          },
          onError: () => {
            if (cancelled) return;
            setLoadError(true);
            setYtReady(false);
            setPlaying(false);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      ytPlayerRef.current = null;
      player?.destroy();
      setYtReady(false);
      setPlaying(false);
    };
  }, [youtubeId]);

  const toggle = useCallback(() => {
    if (otherUnsupported || loadError) return;

    if (useYoutube) {
      if (!ytReady || !ytPlayerRef.current) return;
      setPlayError(false);
      const p = ytPlayerRef.current;
      if (playing) {
        p.pauseVideo();
        return;
      }
      p.unMute();
      p.setVolume(Math.round(VOLUME * 100));
      p.playVideo();
      return;
    }

    const el = mediaRef.current;
    if (!el) return;
    setPlayError(false);
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    void el.play().then(
      () => setPlaying(true),
      () => {
        setPlaying(false);
        setPlayError(true);
      },
    );
  }, [playing, otherUnsupported, loadError, useYoutube, ytReady]);

  const disabled = otherUnsupported || loadError || (useYoutube && !ytReady);

  const hint = otherUnsupported ? (
    <p className="mt-1 max-w-[220px] text-[10px] leading-snug text-black">
      이 주소는 재생할 수 없어요. 유튜브·직접 <strong className="font-medium">mp3/mp4</strong> 링크나{" "}
      <strong className="font-medium">public/audio</strong> 파일을 쓰세요.
    </p>
  ) : loadError ? (
    <p className="mt-1 max-w-[220px] text-[10px] leading-snug text-black">
      {useYoutube ? (
        <>
          유튜브를 불러오지 못했어요. 영상이 <strong className="font-medium">비공개·연령 제한</strong>
          이거나 <strong className="font-medium">외부 재생 차단</strong>이면 임베드가 안 될 수 있어요.
        </>
      ) : (
        <>
          파일을 불러오지 못했어요. <code className="text-[9px]">public/audio</code> 경로와 파일 이름을
          확인해 주세요.
        </>
      )}
    </p>
  ) : playError ? (
    <p className="mt-1 max-w-[220px] text-[10px] leading-snug text-black">
      재생이 막혔어요. 다른 브라우저에서 시도하거나 파일 형식을 확인해 주세요.
    </p>
  ) : useYoutube ? (
    <></>
  ) : null;

  return (
    <div className="fixed bottom-6 left-4 z-[39] flex flex-col items-start">
      {useYoutube ? (
        <div
          key={youtubeId}
          ref={ytContainerRef}
          className="pointer-events-none fixed bottom-0 left-0 -z-10 h-px w-px overflow-hidden opacity-0"
          aria-hidden
        />
      ) : otherUnsupported ? null : useVideo ? (
        <video
          ref={(el) => {
            mediaRef.current = el;
            if (el) el.volume = VOLUME;
          }}
          src={BACKGROUND_MEDIA_SRC}
          playsInline
          preload="auto"
          loop
          muted={false}
          controls={false}
          className="pointer-events-none fixed bottom-0 left-0 -z-10 h-px w-px overflow-hidden opacity-0"
          aria-hidden
          onError={() => {
            setLoadError(true);
            setPlaying(false);
          }}
        />
      ) : (
        <audio
          ref={(el) => {
            mediaRef.current = el;
            if (el) el.volume = VOLUME;
          }}
          src={BACKGROUND_MEDIA_SRC}
          preload="auto"
          loop
          onError={() => {
            setLoadError(true);
            setPlaying(false);
          }}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="flex h-11 items-center gap-2 rounded-full bg-white/93 px-4 text-xs font-medium text-ink-accent shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
        aria-pressed={playing}
        aria-label={playing ? "배경음악 끄기" : "배경음악 재생"}
      >
        {playing ? (
          <SpeakerOnIcon className="h-5 w-5 shrink-0" />
        ) : (
          <SpeakerOffIcon className="h-5 w-5 shrink-0" />
        )}
      </button>
      {hint}
    </div>
  );
}

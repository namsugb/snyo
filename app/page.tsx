"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const galleryMoments = [
  { title: "First hello", src: "/KakaoTalk_20260301_000807942.jpg", rotate: "-rotate-[1.8deg]" },
  { title: "Our season", src: "/KakaoTalk_20260301_000807942_01.jpg", rotate: "rotate-[1.6deg]" },
  { title: "Promise", src: "/KakaoTalk_20260301_000807942_02.jpg", rotate: "-rotate-[1.4deg]" },
  { title: "Bloom", src: "/KakaoTalk_20260301_000807942_03.jpg", rotate: "rotate-[2deg]" },
  { title: "Letters", src: "/KakaoTalk_20260301_000807942_04.jpg", rotate: "-rotate-[1deg]" },
  { title: "Picnic", src: "/KakaoTalk_20260301_000807942_05.jpg", rotate: "rotate-[0.8deg]" },
  { title: "Evening", src: "/KakaoTalk_20260301_000807942_06.jpg", rotate: "-rotate-[1.8deg]" },
  { title: "Smile", src: "/KakaoTalk_20260301_000807942_07.jpg", rotate: "rotate-[1.3deg]" },
  { title: "Forever", src: "/KakaoTalk_20260301_000807942_08.jpg", rotate: "-rotate-[1.5deg]" },
  { title: "Soft breeze", src: "/KakaoTalk_20260301_000807942_09.jpg", rotate: "rotate-[1.2deg]" },
  { title: "Daylight", src: "/KakaoTalk_20260301_000807942_10.jpg", rotate: "-rotate-[1.2deg]" },
  { title: "Night vow", src: "/KakaoTalk_20260301_000807942_11.jpg", rotate: "rotate-[1deg]" },
];

function GalleryModal({
  moment,
  onClose,
}: {
  moment: (typeof galleryMoments)[number] | null;
  onClose: () => void;
}) {
  if (!moment) {
    return null;
  }

  return (
    <div
      className="gallery-modal fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${moment.title} image preview`}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close image preview"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/12 text-xl text-white transition-colors duration-200 hover:bg-white/20"
        onClick={onClose}
      >
        ×
      </button>

      <div
        className="relative w-full max-w-5xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[4/5] max-h-screen overflow-hidden sm:aspect-[5/4]">
          <Image
            src={moment.src}
            alt={moment.title}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function IntroOverlay({ isLeaving }: { isLeaving: boolean }) {
  return (
    <div
      className={`intro-overlay fixed inset-0 z-50 flex items-center justify-center bg-background/98 px-6 ${isLeaving ? "intro-overlay-leave" : "intro-overlay-enter"
        }`}
      aria-hidden={isLeaving}
    >
      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="pointer-events-none absolute inset-x-8 top-8 h-40 rounded-full bg-[radial-gradient(circle,rgba(216,140,154,0.18),transparent_68%)] blur-3xl" />

        <div className="relative">
          <svg
            viewBox="0 0 220 220"
            className="intro-doodle h-56 w-56 text-ink-accent"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="draw-path" d="M55 84c8-11 18-18 31-20 12-2 24 2 33 11" />
              <path className="draw-path delay-1" d="M116 76c12-10 23-15 35-13 11 1 21 8 29 20" />
              <circle className="draw-path delay-2" cx="67" cy="66" r="14" />
              <circle className="draw-path delay-2" cx="149" cy="60" r="14" />
              <path className="draw-path delay-3" d="M56 82l-8 22m22-20l7 21m-13-20v44m-7 0c-4 12-11 20-19 25m26-25c7 10 14 18 23 24" />
              <path className="draw-path delay-3" d="M140 76l-8 22m22-20l7 21m-13-20v50m-7 0c-5 13-12 23-21 30m28-30c8 12 16 21 27 28" />
              <path className="draw-path delay-4" d="M88 95c12 9 24 9 37 0" />
              <path className="draw-path delay-4" d="M92 92c8 8 14 13 18 17m16-17c-8 8-14 13-18 17" />
              <path className="draw-path delay-5" d="M27 150c13-13 28-18 44-15m85-7c14 0 27 6 39 17" />
              <path className="draw-path delay-5" d="M180 88c6-4 10-9 13-15m-6 23c9 1 16 4 21 10m-17 13c6 2 10 6 13 12" />
              <path className="draw-path delay-6" d="M23 98c7-1 13 1 18 6m-8 16c-3 5-4 10-3 16m17-3c4 2 8 6 10 11" />
              <path className="draw-path delay-6" d="M28 56c3-6 9-9 16-10m5 8c-1-6 1-11 6-16" />
              <path className="draw-path delay-6" d="M166 39c3-5 7-8 12-10m13 15c2-5 5-8 10-9" />
              <path className="draw-path delay-6" d="M186 150c6-1 11 1 15 5m-1 13c4 2 7 5 9 9" />
            </g>
          </svg>
        </div>

        <p className="font-script mt-4 text-[2rem] text-accent-rose">Our beginning</p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          두 사람이 손을 맞잡은 첫 장면이
          <br />
          오늘의 초대장으로 이어집니다.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLeavingIntro, setIsLeavingIntro] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<(typeof galleryMoments)[number] | null>(null);

  useEffect(() => {
    const startFade = window.setTimeout(() => setIsLeavingIntro(true), 2200);
    const removeIntro = window.setTimeout(() => setShowIntro(false), 2900);

    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(removeIntro);
    };
  }, []);

  useEffect(() => {
    if (!selectedMoment) {
      document.body.style.overflow = "";
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMoment(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedMoment]);


  return (
    <>
      {showIntro ? <IntroOverlay isLeaving={isLeavingIntro} /> : null}
      <GalleryModal moment={selectedMoment} onClose={() => setSelectedMoment(null)} />

      <main className="relative min-h-screen overflow-hidden bg-white text-foreground">
        <div className="mx-auto min-h-screen w-full overflow-hidden rounded-none border-x border-border-soft/80 bg-white px-5 pb-18 pt-6 shadow-none sm:px-7 lg:max-w-4xl lg:rounded-[34px] lg:border lg:shadow-[0_24px_80px_rgba(120,88,76,0.12)]">

          {/* 메인 — 콘텐츠 높이에 맞춤 (빈 min-height·flex-1로 섹션 간 공백이 벌어지지 않게) */}
          <section className="pt-2 pb-2 sm:pb-3 lg:pt-1 lg:pb-3">
            <div className="mx-auto flex w-full items-start justify-center">
              <div className="relative w-full lg:mx-auto lg:max-w-lg">
                <div className="relative aspect-[4/5] overflow-hidden rounded-b-[12px] rounded-tl-[50%_42%] rounded-tr-[50%_42%]">
                  <Image
                    src="/main.png"
                    alt="남승효 윤준영 웨딩 사진"
                    fill
                    priority
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 512px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 초대말 */}
          <section className="section-divider my-20 text-center pt-4 pb-12 sm:pt-6 sm:pb-20">
            <div className="flex flex-col items-center justify-center gap-6 sm:gap-8">
              <div className="relative mx-auto w-full max-w-xs aspect-[3/4] overflow-hidden">
                <Image
                  src="/invitation.jpg"
                  alt="웨딩 초대장 느낌의 원본 스캔 이미지"
                  priority
                  fill
                  className="object-cover w-full h-full"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 280px, 320px"
                />
              </div>
            </div>
          </section>

          {/* 갤러리 */}
          <section className="section-divider py-8 sm:py-20">

            {/* 1*2 */}
            <div className="w-screen relative left-1/2 right-1/2 mb-8 -translate-x-1/2">
              <div className="relative aspect-[8/12] w-full overflow-hidden">
                <Image
                  src="/KakaoTalk_20260301_000807942_09.jpg"
                  alt="웨딩 갤러리 대형 이미지"
                  fill
                  priority={false}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>




            {/* 3*4 */}
            <div className="mx-[-20px] mt-7 overflow-hidden sm:mx-[-28px]">
              <div className="grid grid-cols-3 gap-0">
                {galleryMoments.map((moment) => (
                  <button
                    key={moment.title}
                    type="button"
                    onClick={() => setSelectedMoment(moment)}
                    className="gallery-polaroid group block w-full text-left"
                    aria-label={`${moment.title} image preview`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={moment.src}
                        alt={moment.title}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 220px, 240px"
                        className="object-cover transition duration-300"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>


          {/* 날짜 */}
          <section className="section-divider py-16 sm:py-20">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="font-script text-[1.65rem] text-text-secondary">The day</p>
              </div>
              <p className="text-right text-xs leading-5 tracking-[0.18em] text-text-secondary uppercase">
                June
                <br />
                2026
              </p>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-text-secondary">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
              {/* 2026년 6월: 1일 월요일 → 일요일 열 빈 칸 1개 */}
              {Array.from({ length: 1 }).map((_, i) => (
                <div key={`cal-pad-${i}`} className="aspect-square" aria-hidden />
              ))}
              {Array.from({ length: 30 }, (_, index) => {
                const day = index + 1;
                const isWeddingDay = day === 20;

                return (
                  <div
                    key={day}
                    className={`flex aspect-square items-center justify-center rounded-full text-sm ${isWeddingDay
                      ? "bg-accent-rose text-white shadow-[0_8px_24px_rgba(216,140,154,0.35)]"
                      : "text-foreground/88"
                      }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <p className="font-display text-2xl">2026년 6월 20일 토요일 오후 2시</p>
            </div>
          </section>

          {/* 위치 및 지도 */}
          <section className="section-divider py-16 sm:py-20">
            <p className="font-script text-[1.65rem] text-text-secondary">Place</p>

            <div className="mt-6 overflow-hidden">
              <div className="relative aspect-[5/8] overflow-hidden bg-white sm:aspect-[5/7]">
                <Image
                  src="/info.jpg"
                  alt="아이벡스컨벤션 안내 이미지"
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 720px"
                  className="object-cover"
                />
              </div>
            </div>



            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href="https://map.kakao.com/link/search/%EC%95%84%EC%9D%B4%EB%B2%A1%EC%8A%A4%EC%BB%A8%EB%B2%A4%EC%85%98"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-accent-rose/30 px-4 py-3 text-center text-xs tracking-[0.2em] text-ink-accent uppercase transition-transform duration-200 hover:-translate-y-0.5"
              >
                Kakao Map
              </a>
              <a
                href="https://map.naver.com/p/search/%EC%95%84%EC%9D%B4%EB%B2%A1%EC%8A%A4%EC%BB%A8%EB%B2%A4%EC%85%98"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-accent-sage/40 px-4 py-3 text-center text-xs tracking-[0.2em] text-ink-accent uppercase transition-transform duration-200 hover:-translate-y-0.5"
              >
                Naver Map
              </a>
            </div>
          </section>

          <section className="section-divider py-16 sm:py-20">
            <p className="font-script text-[1.65rem] text-text-secondary">Notice</p>

            <div className="mt-6 overflow-hidden">
              <div className="relative aspect-[6/5] overflow-hidden bg-white">
                <Image
                  src="/안내사항.jpg"
                  alt="안내사항 이미지"
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 720px"
                  className="object-contain"
                />
              </div>
            </div>
          </section>



          <section id="upload" className="section-divider py-16 pb-8 text-center sm:py-20 sm:pb-10">
            <p className="font-script text-[1.7rem] text-text-secondary">For guests</p>
            <h2 className="font-display mt-1 text-3xl">축하의 순간을 남겨주세요</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-text-secondary">
              예식 당일 함께한 사진을 올려주시면,
              <br />
              저희에게 오래도록 반짝이는 선물이 됩니다.
            </p>

            <div className="mt-7 rounded-[28px] border-2 border-dashed border-accent-sage/35 px-5 py-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-sage/30 text-2xl text-ink-accent">
                +
              </div>
              <p className="mt-4 font-display text-2xl">Photo Upload</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                사진 업로드 기능은 이후 연동 예정입니다.
                <br />
                지금은 안내 영역으로 먼저 디자인해두었습니다.
              </p>
              <button
                type="button"
                className="mt-5 rounded-full border border-accent-rose/35 px-6 py-3 text-sm tracking-[0.18em] text-ink-accent uppercase transition-transform duration-200 hover:-translate-y-0.5"
              >
                Upload soon
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

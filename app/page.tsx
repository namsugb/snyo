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

const accountGroups = [
  {
    title: "신랑측 계좌번호",
    entries: [
      { name: "윤준영", bank: "국민은행", account: "756002 00 010858" },
      { name: "윤우영", bank: "국민은행", account: "827 21 0642 281" },
      { name: "이민자", bank: "우리은행", account: "129 07 020930" },
    ],
  },
  {
    title: "신부측 계좌번호",
    entries: [
      { name: "남승효", bank: "국민은행", account: "246602 04 327707" },
      { name: "남유행", bank: "농협은행", account: "351 0573 5575 43" },
      { name: "김은실", bank: "농협은행", account: "351 0573 5575 43" },

    ],
  },
];

const sectionNavItems = [
  { href: "#top", label: "Top", icon: "home" },
  { href: "#gallery", label: "Gallery", icon: "gallery" },
  { href: "#day", label: "Day", icon: "calendar" },
  { href: "#place", label: "Place", icon: "pin" },
  { href: "#notice", label: "Notice", icon: "note" },
  { href: "#account", label: "Account", icon: "heart" },
  { href: "#upload", label: "Guest", icon: "message" },
];

function NavIcon({ icon }: { icon: (typeof sectionNavItems)[number]["icon"] }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    className: "h-[18px] w-[18px]",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (icon) {
    case "home":
      return (
        <svg {...commonProps}>
          <path d="M4 11.5 12 5l8 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 10.5V19h11v-8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...commonProps}>
          <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="9" cy="10" r="1.4" fill="currentColor" />
          <path d="m7 16 3.2-3 2.6 2.3 2.2-1.9L17 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...commonProps}>
          <rect x="4" y="6" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 4v4M16 4v4M4 10.5h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "pin":
      return (
        <svg {...commonProps}>
          <path d="M12 20c3.3-3.5 5-6.2 5-8.5a5 5 0 1 0-10 0c0 2.3 1.7 5 5 8.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="11.5" r="1.8" fill="currentColor" />
        </svg>
      );
    case "note":
      return (
        <svg {...commonProps}>
          <rect x="5" y="4.5" width="14" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "heart":
      return (
        <svg {...commonProps}>
          <path d="M12 19.5c-4.8-3.2-7-5.9-7-8.8A3.8 3.8 0 0 1 8.8 7c1.3 0 2.4.6 3.2 1.6A4.1 4.1 0 0 1 15.2 7 3.8 3.8 0 0 1 19 10.7c0 2.9-2.2 5.6-7 8.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "message":
      return (
        <svg {...commonProps}>
          <path d="M6.5 7h11a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 17.5 17H11l-4.5 3v-3H6.5A2.5 2.5 0 0 1 4 14.5v-5A2.5 2.5 0 0 1 6.5 7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

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
      className={`intro-overlay fixed inset-0 z-50 bg-white ${isLeaving ? "intro-overlay-leave" : "intro-overlay-enter"}`}
      aria-hidden={isLeaving}
    >
      <div className="relative h-full w-full">
        <Image
          src="/final-intro.png"
          alt="Wedding invitation intro"
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}

function SectionOrnament({
  src,
  alt,
  width,
  height,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div className="flex justify-center -mb-6 z-10  ">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    </div>
  );
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLeavingIntro, setIsLeavingIntro] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<(typeof galleryMoments)[number] | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const startFade = window.setTimeout(() => setIsLeavingIntro(true), 1400);
    const removeIntro = window.setTimeout(() => setShowIntro(false), 2000);

    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(removeIntro);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = "hidden";
      return;
    }

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
  }, [selectedMoment, showIntro]);

  /** 긴 섹션: 휠 다운 시 끝에 맞춘 뒤 한 번 더 내려야 다음 섹션 상단으로 이동 (터치·모션 축소 시 비활성) */
  useEffect(() => {
    const wrapper = document.getElementById("scroll-sections-wrapper");
    if (!wrapper) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduced.matches || coarse.matches) return;

    const getSections = () =>
      Array.from(wrapper.querySelectorAll<HTMLElement>(":scope > section"));

    const docTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

    let armedIndex: number | null = null;

    const onWheel = (e: WheelEvent) => {
      if (showIntro || selectedMoment) {
        armedIndex = null;
        return;
      }
      if (e.deltaY <= 0) {
        armedIndex = null;
        return;
      }

      const secs = getSections();
      if (secs.length < 2) return;

      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      let current = -1;
      for (let i = 0; i < secs.length; i++) {
        if (docTop(secs[i]) <= scrollY + 2) current = i;
      }
      if (current < 0 || current >= secs.length - 1) {
        armedIndex = null;
        return;
      }

      const el = secs[current];
      const top = docTop(el);
      const h = el.offsetHeight;
      const scrollRoom = h - vh;
      if (scrollRoom <= 80) {
        armedIndex = null;
        return;
      }

      const scrolledIn = scrollY - top;
      const atEnd = scrolledIn >= scrollRoom - 20;
      if (!atEnd) {
        armedIndex = null;
        return;
      }

      if (armedIndex === current) {
        e.preventDefault();
        secs[current + 1].scrollIntoView({ behavior: "smooth", block: "start" });
        armedIndex = null;
      } else {
        e.preventDefault();
        window.scrollTo({ top: top + scrollRoom, behavior: "smooth" });
        armedIndex = current;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [showIntro, selectedMoment]);

  const handleCopyAccount = async (account: string) => {
    try {
      await navigator.clipboard.writeText(account);
      setCopiedAccount(account);
      window.setTimeout(() => {
        setCopiedAccount((current) => (current === account ? null : current));
      }, 1600);
    } catch {
      setCopiedAccount(null);
    }
  };

  return (
    <>
      {showIntro ? <IntroOverlay isLeaving={isLeavingIntro} /> : null}
      <GalleryModal moment={selectedMoment} onClose={() => setSelectedMoment(null)} />

      <nav
        className="fixed bottom-6 right-3 z-40"
        aria-label="Section navigation"
      >
        <div className="flex flex-col items-end gap-3">
          {isNavOpen ? (
            <div className="flex w-12 flex-col items-stretch rounded-full border border-border-soft/80 bg-white/92 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm">
              <div className="flex w-full flex-col gap-2">
                {sectionNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group relative flex h-8 w-full shrink-0 items-center justify-center"
                    aria-label={`Go to ${item.label}`}
                    onClick={() => setIsNavOpen(false)}
                  >
                    <span className="pointer-events-none absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 whitespace-nowrap text-[10px] tracking-[0.18em] text-text-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {item.label}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/75 transition-colors duration-200 group-hover:text-foreground">
                      <NavIcon icon={item.icon} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsNavOpen((current) => !current)}
            aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border-soft/80 bg-white/92 text-foreground shadow-[0_12px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-transform duration-200 hover:scale-[1.03]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isNavOpen ? (
                <path d="M7 7 17 17M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M7 8.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 15.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <main
        id="top"
        className={`relative min-h-screen overflow-hidden bg-white text-foreground transition-opacity duration-300 ${showIntro ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <div
          id="scroll-sections-wrapper"
          className="mx-auto min-h-screen w-full overflow-hidden rounded-none border-x border-border-soft/80 bg-white px-5 pb-18 pt-6 shadow-none sm:px-7 lg:max-w-4xl lg:rounded-[34px] lg:border lg:shadow-[0_24px_80px_rgba(120,88,76,0.12)]"
        >

          {/* 메인 — 콘텐츠 높이에 맞춤 (빈 min-height·flex-1로 섹션 간 공백이 벌어지지 않게) */}
          <section className="scroll-snap-section pt-2 pb-4 sm:pb-5 lg:pt-1 lg:pb-5">
            <div className="flex justify-center items-center">
              <Image
                src="/새-03.png"
                alt="장식용 새 일러스트"
                width={204}
                height={124}
                className="h-auto w-20 mx-auto soft-float"
                style={{ pointerEvents: "none", userSelect: "none" }}
              />
            </div>
            <div className="mx-auto flex w-full items-start justify-center">
              <div className="relative w-full lg:mx-auto lg:max-w-lg">
                <div className="relative aspect-[4/5] overflow-hidden rounded-b-[12px] rounded-tl-[50%_42%] rounded-tr-[50%_42%]">
                  <Image
                    src="/main.jpg"
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
          <section className="scroll-snap-section py-10 text-center sm:py-14">
            <div className="flex flex-col items-center justify-center">
              <SectionOrnament
                src="/flower.png"
                alt="Flower ornament"
                width={120}
                height={74}
                className="h-auto w-24 opacity-90 sm:w-28"
              />
              <div className="mx-auto w-full max-w-xs bg-white px-2 py-8 text-center text-[#333333] sm:px-3 sm:py-10">
                <p className="text-base font-normal leading-[1.75] tracking-[-0.01em] sm:leading-[1.8]">
                  함께 보내는 아홉 번째 여름,
                  <br />
                  수많은 계절을 함께 걸어온 저희가
                  <br />
                  평생을 함께할 약속을 하고자 합니다.
                </p>
                <p className="mt-5 text-base font-normal leading-[1.75] tracking-[-0.01em] sm:mt-6 sm:leading-[1.8]">
                  저희의 새로운 시작에
                  <br />
                  따뜻한 발걸음으로 함께해주신다면
                  <br />
                  깊은 감사와 기쁨으로 간직하겠습니다.
                </p>
                <p className="mt-9 text-base font-normal leading-[1.75] tracking-[-0.01em] sm:mt-10 sm:leading-[1.8]">
                  윤우영 · 이민자의 장남 <span className="font-semibold text-[#2a2a2a]">준영</span>
                  <br />
                  남유행 · 김은실의 장녀 <span className="font-semibold text-[#2a2a2a]">승효</span>
                </p>
                <p className="mt-7 text-base font-normal leading-[1.75] tracking-[-0.01em] sm:mt-8 sm:leading-[1.8]">
                  2026년 6월 20일 토요일 오후 1시 40분
                  <br />
                  아이벡스 컨벤션
                </p>
              </div>
            </div>
          </section>



          {/* 갤러리 */}
          <section id="gallery" className="scroll-snap-section py-10 sm:py-14">

            {/* 1*2 */}
            <div className="relative left-1/2 right-1/2 mb-8 w-screen max-w-none -translate-x-1/2 lg:static lg:mx-auto lg:w-full lg:max-w-lg lg:translate-x-0">
              <div className="relative aspect-[8/12] w-full overflow-hidden">
                <Image
                  src="/KakaoTalk_20260301_000807942_09.jpg"
                  alt="웨딩 갤러리 대형 이미지"
                  fill
                  priority={false}
                  sizes="(min-width: 1024px) 32rem, 100vw"
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
          <section id="day" className="scroll-snap-section py-10 sm:py-14">
            <div className="mb-5 flex justify-center">
              <Image
                src="/calendar.png"
                alt="Wedding calendar illustration"
                width={320}
                height={170}
                className="h-auto w-24 bg-white sm:w-28"
                priority
              />
            </div>

            <div className="my-6 text-center">
              <p className="font-display text-lg">2026년 6월 20일 토요일 오후 1시 40분</p>
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
                      ? "bg-black text-white"

                      : "text-foreground/88"
                      }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>


          </section>



          {/* 위치 및 지도 */}
          <section id="place" className="scroll-snap-section py-10 sm:py-14">
            <div className="flex justify-center">
              <Image
                src="/map.png"
                alt="오시는 길"
                width={1425}
                height={1104}
                className="h-auto w-24 bg-white sm:w-28 -mb-6 z-10"
              />
            </div>

            <div className="overflow-hidden bg-white">
              <Image
                src="/way.jpg"
                alt="아이벡스컨벤션 안내 이미지"
                width={767}
                height={1522}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 560px"
                className="h-auto w-full"
              />
            </div>



            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href="https://map.kakao.com/link/search/%EC%95%84%EC%9D%B4%EB%B2%A1%EC%8A%A4%EC%BB%A8%EB%B2%A4%EC%85%98"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-4 py-3 text-center text-xs tracking-[0.2em] text-ink-accent uppercase transition-transform duration-200 hover:-translate-y-0.5"
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



          <section id="notice" className="scroll-snap-section py-10 sm:py-14">
            <div className="mb-5 flex justify-center">
              <Image
                src="/notice.png"
                alt="안내사항"
                width={1448}
                height={1086}
                className="h-auto w-24 bg-white sm:w-28"
              />
            </div>

            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-sm bg-[#f8f4f4] px-4 py-9 text-center text-[#383838] film-grain sm:max-w-md sm:px-6 sm:py-10">
              <p className="text-[15px] font-medium tracking-tight sm:text-base">[주차관련안내]</p>
              <div className="mt-7 space-y-6 text-[13px] font-normal leading-[1.75] tracking-[-0.01em] sm:mt-8 sm:text-sm sm:leading-[1.8]">
                <div className="space-y-2">
                  <p className="font-medium">✅주차안내</p>
                  <p>- 지하 5~6층 주차해야 편해요</p>
                  <p>- 기둥에 &apos;IVEX&apos; 표시된 구역에 주차하시면 엘리베이터 이용이 편리합니다</p>
                </div>
                <p className="font-medium text-[#2c2c2c]">
                  층마다 노란조끼를 입은 아이벡스
                  <br />
                  안내요원이 계시니 편하게 물어봐주세요
                </p>
                <div className="space-y-2">
                  <p className="font-medium">✅주차 정산 안내</p>
                  <p>2시간 무료, 웨딩홀 로비 웰컴드링크존 노트북으로 셀프정산</p>
                </div>
              </div>
            </div>
          </section>


          <section id="account" className="scroll-snap-section py-10 sm:py-14">
            <p className=" text-[1.65rem] text-text-secondary">마음전할곳</p>

            <div className="mt-6 space-y-10">
              {accountGroups.map((group) => (
                <div key={group.title}>
                  <div className="border-b border-foreground/80 pb-3">
                    <p className="text-lg font-semibold tracking-[-0.01em] text-foreground">{group.title}</p>
                  </div>

                  <div className="space-y-8 pt-6">
                    {group.entries.map((info) => (
                      <article key={`${group.title}-${info.name}-${info.account}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="pr-3">
                            <p className="mt-1 text-base text-foreground">{info.name}</p>
                            <p className="text-base leading-8 text-foreground">
                              {info.bank} {info.account}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => void handleCopyAccount(info.account)}
                            className="mt-1 shrink-0 rounded-full bg-black/80 px-3 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
                          >
                            {copiedAccount === info.account ? "복사됨" : "복사하기"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>



          <section id="upload" className="scroll-snap-section py-10 text-center sm:py-14">
            <div className="flex justify-center">
              <Image
                src="/새-03.png"
                alt="하객 참석 · 사진 안내"
                width={204}
                height={124}
                className="h-auto w-24 soft-float sm:w-28"
                style={{ pointerEvents: "none", userSelect: "none" }}
              />
            </div>

            <div className="mt-7 rounded-[28px] border border-border-soft/80 px-5 py-7 text-left">
              <p className="font-display text-2xl text-center">참석의사전달</p>
              <p className="mt-2 text-center text-sm leading-6 text-text-secondary">
                참석 여부를 남겨주시면

                준비에 많은 도움이 됩니다.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">성함</label>
                  <div className="rounded-2xl border border-border-soft/80 px-4 py-3 text-sm text-text-secondary">
                    이름을 입력해주세요
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-text-secondary">참석 여부</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border-soft/80 px-4 py-3 text-center text-sm text-text-secondary">
                      참석
                    </div>
                    <div className="rounded-2xl border border-border-soft/80 px-4 py-3 text-center text-sm text-text-secondary">
                      불참
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-text-secondary">동행 인원</label>
                  <div className="rounded-2xl border border-border-soft/80 px-4 py-3 text-sm text-text-secondary">
                    동행 인원을 선택해주세요
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-text-secondary">전달 말씀</label>
                  <div className="min-h-28 rounded-2xl border border-border-soft/80 px-4 py-3 text-sm text-text-secondary">
                    축하 메시지를 남겨주세요
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-full border border-accent-rose/35 px-6 py-3 text-sm tracking-[0.18em] text-ink-accent transition-transform duration-200 hover:-translate-y-0.5"
              >
                RSVP soon
              </button>
            </div>

            <div className="mt-5 rounded-[28px] border-2 border-dashed border-accent-sage/35 px-5 py-7">
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

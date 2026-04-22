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

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLeavingIntro, setIsLeavingIntro] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<(typeof galleryMoments)[number] | null>(null);

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


  return (
    <>
      {showIntro ? <IntroOverlay isLeaving={isLeavingIntro} /> : null}
      <GalleryModal moment={selectedMoment} onClose={() => setSelectedMoment(null)} />

      <main className="relative min-h-screen overflow-hidden bg-white text-foreground">
        <div className="mx-auto min-h-screen w-full overflow-hidden rounded-none border-x border-border-soft/80 bg-white px-5 pb-18 pt-6 shadow-none sm:px-7 lg:max-w-4xl lg:rounded-[34px] lg:border lg:shadow-[0_24px_80px_rgba(120,88,76,0.12)]">

          {/* 메인 — 콘텐츠 높이에 맞춤 (빈 min-height·flex-1로 섹션 간 공백이 벌어지지 않게) */}
          <section className="pt-2 pb-2 sm:pb-3 lg:pt-1 lg:pb-3">
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
                    src="/KakaoTalk_20260301_000807942_09.jpg"
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
          <section className="section-divider my-10 text-center pt-4 pb-12 sm:pt-6 sm:pb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="relative mx-auto w-full max-w-xs aspect-[3/4] overflow-hidden">
                <Image
                  src="/invitation.jpg"
                  alt="웨딩 초대장 느낌의 원본 스캔 이미지"
                  priority
                  fill
                  className="object-cover w-full h-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 320px"
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
              <p className="font-display text-lg">2026년 6월 20일 토요일 오후 2시</p>
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
                  src="/notice.jpg"
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

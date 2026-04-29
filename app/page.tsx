"use client";

import {
  completeGuestPhotoUploads,
  createGuestPhotoUploadUrls,
  submitWeddingRsvp,
} from "@/app/actions/wedding";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

/** thumbObjectPosition: grid 썸네일(object-cover) 세로 초점. 위가 잘리면 Y%를 50보다 작게(예: 32~40). */
const galleryMoments = [
  { title: "Gallery 01", src: "/gallery/g1.jpg", rotate: "-rotate-[1.8deg]" },
  { title: "Gallery 02", src: "/gallery/g2.jpeg", rotate: "rotate-[1.6deg]" },
  { title: "Gallery 03", src: "/gallery/g3.jpeg", rotate: "-rotate-[1.4deg]" },
  { title: "Gallery 04", src: "/gallery/g4.jpeg", rotate: "rotate-[2deg]" },
  { title: "Gallery 05", src: "/gallery/g5.jpeg", rotate: "-rotate-[1deg]" },
  {
    title: "Gallery 06",
    src: "/gallery/g6.jpeg",
    rotate: "rotate-[0.8deg]",
    thumbObjectPosition: "object-[center_38%]",
  },
  { title: "Gallery 07", src: "/gallery/g7.jpeg", rotate: "-rotate-[1.8deg]" },
  {
    title: "Gallery 08",
    src: "/gallery/g8.jpeg",
    rotate: "rotate-[1.3deg]",
    thumbObjectPosition: "object-[center_33%]",
  },
  {
    title: "Gallery 09",
    src: "/gallery/g9.jpeg",
    rotate: "-rotate-[1.5deg]",
    thumbObjectPosition: "object-[center_30%]",
  },
  {
    title: "Gallery 10",
    src: "/gallery/g10.jpeg",
    rotate: "rotate-[1.2deg]",
    thumbObjectPosition: "object-[center_38%]",
  },
  { title: "Gallery 11", src: "/gallery/g11.JPG", rotate: "-rotate-[1.2deg]" },
  { title: "Gallery 12", src: "/gallery/g12.jpg", rotate: "rotate-[1deg]" },
  { title: "Gallery 13", src: "/gallery/g13.jpeg", rotate: "-rotate-[1.6deg]" },
  { title: "Gallery 14", src: "/gallery/g14.jpeg", rotate: "rotate-[1.1deg]" },
  { title: "Gallery 15", src: "/gallery/g15.jpg", rotate: "-rotate-[1.1deg]" },
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

    ],
  },
];

const introAnimationImages = [
  {
    src: "/animation/KakaoTalk_20260425_190417916.jpg",
    alt: "Wedding invitation intro animation first frame",
    className: "intro-motion-frame-one",
  },
  {
    src: "/animation/KakaoTalk_20260425_190417916_01.jpg",
    alt: "Wedding invitation intro animation second frame",
    className: "intro-motion-frame-two",
  },
] as const;

/**
 * .ics는 서버(`/api/wedding-calendar`)에서 내려받도록 함.
 * iOS는 Blob+다운로드 시 '미리보기'만 열리고 '완료'는 저장이 아니라 닫기 — 공유 메뉴에서 캘린더 추가 필요.
 */
function openWeddingCalendar() {
  const url = new URL("/api/wedding-calendar", window.location.origin).toString();
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = url;
  }
}

const RSVP_PROMO_DISMISS_KEY = "snyo-rsvp-dismiss-until";

const WEDDING_RSVP_DETAILS = {
  couple: "신랑 윤준영 & 신부 남승효",
  when: "2026년 6월 20일 토요일 오후 1시 40분",
  where: "아이벡스컨벤션",
  whereFull: "경기 광명시 양지로 17 AK 플라자 광명 5층 아이벡스컨벤션",
} as const;

function RsvpIntroCopy({ className = "" }: { className?: string }) {
  return (
    <p className={`section-body-text text-center text-foreground ${className}`}>
      전세버스 탑승 여부를
      <br />
      미리 확인하고자 하오니,
      <br />
      아래 정보를 남겨주시면 감사하겠습니다.
    </p>
  );
}

function RsvpEventDetails({ className = "" }: { className?: string }) {
  const rows: { k: string; v: string }[] = [
    { k: "주인공", v: WEDDING_RSVP_DETAILS.couple },
    { k: "예식일", v: WEDDING_RSVP_DETAILS.when },
    { k: "위치", v: WEDDING_RSVP_DETAILS.where },
  ];
  return (
    <div className={`mx-auto w-full max-w-sm space-y-2.5 section-body-text ${className}`}>
      {rows.map((row) => (
        <div
          key={row.k}
          className="flex gap-3 border-b border-border-soft pb-2.5 last:border-b-0 last:pb-0"
        >
          <span className="w-14 shrink-0 text-left text-text-secondary">{row.k}</span>
          <span className="flex-1 text-right font-medium text-foreground">{row.v}</span>
        </div>
      ))}
    </div>
  );
}

function RsvpPromoSheet({
  open,
  onClose,
  onDismissToday,
  onOpenForm,
}: {
  open: boolean;
  onClose: () => void;
  onDismissToday: () => void;
  onOpenForm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[46] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-promo-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/45"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-10 mx-auto w-full max-w-lg rounded-t-2xl bg-white px-5 pb-6 pt-9 shadow-[0_-12px_48px_rgba(0,0,0,0.14)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
          aria-label="닫기"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 7 17 17M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <h2 id="rsvp-promo-title" className="text-center text-lg font-semibold text-foreground">
          전세버스 탑승 여부
        </h2>
        <RsvpIntroCopy className="mt-4" />
        <RsvpEventDetails className="mt-5" />
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenForm();
          }}
          className="mt-7 w-full rounded-2xl bg-accent-rose px-4 py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-92 active:opacity-88"
        >
          전세버스 탑승 여부
        </button>
      </div>
      <div className="relative z-10 flex justify-end gap-2 px-5 py-3 text-xs">
        <button type="button" className="text-white/90 underline-offset-2 hover:underline" onClick={onDismissToday}>
          오늘 그만보기
        </button>
        <span className="text-white/45" aria-hidden>
          |
        </span>
        <button type="button" className="text-white/90 underline-offset-2 hover:underline" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

function RequiredMark() {
  return (
    <span className="ml-0.5 text-black" aria-hidden>
      *
    </span>
  );
}

function RsvpFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const privacyDetailsId = useId();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  /** 추가 동승자 이름 (대표 성함은 상단 성함 필드) */
  const [companions, setCompanions] = useState<string[]>([""]);
  const [boardingPlace, setBoardingPlace] = useState<"고흥" | "순천" | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName("");
    setCompanions([""]);
    setBoardingPlace(null);
    setPrivacyOpen(false);
    setPrivacyAgreed(false);
    setFormError(null);
  }, [open]);

  if (!open) {
    return null;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const n = name.trim();
    if (!n) {
      window.alert("성함을 입력해 주세요.");
      return;
    }
    if (boardingPlace === null) {
      window.alert("탑승장소(고흥/순천)를 선택해 주세요.");
      return;
    }
    if (!privacyAgreed) {
      window.alert("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await submitWeddingRsvp({
          guestName: n,
          companionNames: companions,
          boardingPlace,
        });
        if (!result.ok) {
          setFormError(result.error);
          return;
        }
        onClose();
        window.alert("전달되었습니다. 감사합니다!");
      })();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[52] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/45"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.18)] sm:max-h-[85vh] sm:rounded-2xl sm:shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border-soft px-5 py-4">
          <h2 id="rsvp-form-title" className="text-base font-semibold text-foreground">
            전세버스 탑승 여부
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-black/5"
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 7 17 17M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="rsvp-name" className="mb-2 block text-sm text-foreground">
                성함
                <RequiredMark />
              </label>
              <input
                id="rsvp-name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="탑승자 성함"
                autoComplete="name"
                className="w-full rounded-2xl border border-black px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-secondary/70 focus:ring-2 focus:ring-accent-rose/35"
              />
            </div>
            <div>
              <span className="mb-2 block text-sm text-foreground">동승자 명단</span>
              <p className="section-body-text mb-3 text-text-secondary">
                추가로 함께 탑승하시는 분이 있으면 이름을 적어 주세요.
              </p>
              <div className="space-y-2">
                {companions.map((companionName, index) => (
                  <div key={`companion-${index}`} className="flex gap-2">
                    <input
                      id={index === 0 ? "rsvp-companion-0" : undefined}
                      aria-label={`동승자 ${index + 1}`}
                      value={companionName}
                      onChange={(ev) => {
                        const v = ev.target.value;
                        setCompanions((prev) => prev.map((row, i) => (i === index ? v : row)));
                      }}
                      placeholder={index === 0 ? "동승자 이름" : `동승자 ${index + 1}`}
                      autoComplete="name"
                      className="min-w-0 flex-1 rounded-2xl border border-black px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-secondary/70 focus:ring-2 focus:ring-accent-rose/35"
                    />
                    {companions.length > 1 ? (
                      <button
                        type="button"
                        className="shrink-0 rounded-2xl border border-black px-3 py-2 text-xs text-foreground transition-colors hover:bg-black/5"
                        onClick={() => {
                          setCompanions((prev) => prev.filter((_, i) => i !== index));
                        }}
                      >
                        삭제
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={companions.length >= 50}
                className="mt-3 w-full rounded-2xl border border-dashed border-black py-3 text-sm font-medium text-foreground transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => setCompanions((prev) => (prev.length >= 50 ? prev : [...prev, ""]))}
              >
                + 동승자 추가
              </button>
            </div>
            <div>
              <span className="mb-2 block text-sm text-foreground">
                탑승장소
                <RequiredMark />
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["고흥", "순천"] as const).map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => setBoardingPlace(place)}
                    className={`rounded-2xl border px-2 py-3 text-center text-sm transition-colors ${boardingPlace === place ? "border-black bg-black text-white" : "border-black text-text-secondary hover:bg-black/3"}`}
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border-soft">
            <button
              type="button"
              onClick={() => setPrivacyOpen((v) => !v)}
              aria-expanded={privacyOpen}
              aria-controls={privacyDetailsId}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm text-foreground"
            >
              <span>
                개인정보 수집 및 이용 동의{" "}
                <span className="text-black">(필수)</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 shrink-0 text-text-secondary transition-transform ${privacyOpen ? "rotate-180" : ""}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {privacyOpen ? (
              <div
                id={privacyDetailsId}
                className="section-body-text border-t border-border-soft px-4 pb-3 pt-2 text-text-secondary"
              >
                <p>
                  수집 항목: 성명, 동승자 명단, 탑승 장소
                  <br />
                  이용 목적: 전세버스 탑승 안내 및 연락
                  <br />
                  보유·이용 기간: 결혼식 종료 후 지체 없이 파기합니다. 동의를 거부하실 수 있으나, 거부 시 전세버스 탑승 여부 전달이 제한될 수 있습니다.
                </p>
              </div>
            ) : null}
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(ev) => setPrivacyAgreed(ev.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-black accent-black focus:ring-black/35"
            />
            <span>수집 및 이용에 동의합니다.</span>
          </label>

          {formError ? (
            <p className="mt-3 text-center text-sm text-black" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full rounded-2xl bg-accent-rose px-4 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-92 disabled:opacity-55"
          >
            {isPending ? "전달 중…" : "전세버스 탑승 여부"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GuestPhotoUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const openPicker = () => {
    setNotice(null);
    inputRef.current?.click();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;

    setNotice(null);
    setUploading(true);
    startTransition(() => {
      void (async () => {
        try {
          const uploadPlan = await createGuestPhotoUploadUrls(
            files.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
            })),
          );

          if (!uploadPlan.ok) {
            setNotice({ kind: "err", text: uploadPlan.error });
            return;
          }

          const supabase = createBrowserSupabaseClient();
          for (let i = 0; i < uploadPlan.uploads.length; i += 1) {
            const upload = uploadPlan.uploads[i];
            const file = files[i];
            const { error } = await supabase.storage
              .from("guest-uploads")
              .uploadToSignedUrl(upload.path, upload.token, file, {
                contentType: file.type || "application/octet-stream",
              });

            if (error) {
              throw error;
            }
          }

          const completedUploads = uploadPlan.uploads.map((upload) => ({
            name: upload.name,
            type: upload.type,
            size: upload.size,
            path: upload.path,
          }));
          const result = await completeGuestPhotoUploads(completedUploads);
          if (result.ok) {
            setNotice({
              kind: "ok",
              text: `${result.count}장 업로드되었습니다. 감사합니다!`,
            });
          } else {
            setNotice({ kind: "err", text: result.error });
          }
        } catch (error) {
          console.error("[GuestPhotoUploader]", error);
          setNotice({
            kind: "err",
            text: "업로드 요청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
          });
        } finally {
          setUploading(false);
        }
      })();
    });
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={onFileChange}
        disabled={uploading || pending}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading || pending}
        className="rounded-full border border-black px-6 py-3 text-sm tracking-[0.18em] text-ink-accent uppercase transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-55"
      >
        {uploading || pending ? "업로드 중…" : "Upload"}
      </button>
      {notice ? (
        <p
          className={`mt-3 text-sm ${notice.kind === "ok" ? "text-foreground" : "text-black"}`}
          role={notice.kind === "err" ? "alert" : undefined}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}

type AccountGroup = (typeof accountGroups)[number];

function AccountGroupModal({
  group,
  onClose,
  copiedAccount,
  onCopy,
}: {
  group: AccountGroup | null;
  onClose: () => void;
  copiedAccount: string | null;
  onCopy: (account: string) => void;
}) {
  if (!group) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[51] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(85vh,640px)] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border-soft px-5 py-4">
          <h2 id="account-modal-title" className="pr-2 text-lg font-semibold tracking-[-0.01em] text-foreground">
            {group.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/70 hover:bg-black/5"
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 7 17 17M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-8">
            {group.entries.map((info) => (
              <article key={`${group.title}-${info.name}-${info.account}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="pr-3">
                    <p className="section-body-text mt-1 text-foreground">{info.name}</p>
                    <p className="section-body-text mt-1 text-foreground">{info.bank} {info.account}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopy(info.account)}
                    className="mt-1 shrink-0 rounded-full bg-black/80 px-3 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
                  >
                    {copiedAccount === info.account ? "복사됨" : "복사하기"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoticeSectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-1.5 font-medium">
      <svg
        className="h-[1.05em] w-[1.05em] shrink-0 text-black"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}

function GalleryModal({
  moment,
  onClose,
}: {
  moment: (typeof galleryMoments)[number] | null;
  onClose: () => void;
}) {
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    setImageReady(false);
  }, [moment?.src]);

  if (!moment) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-3 pt-14 pb-10 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-busy={!imageReady}
      aria-label={`${moment.title} image preview`}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close image preview"
        className="absolute right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-black/35 text-xl text-white backdrop-blur-[2px] transition-colors duration-200 hover:bg-black/50 sm:right-6 sm:top-6"
        onClick={onClose}
      >
        ×
      </button>

      <div
        className="gallery-modal-panel relative w-full max-w-5xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[4/5] max-h-[min(100vh-8rem,920px)] w-full overflow-hidden sm:aspect-[5/4]">
          {!imageReady ? (
            <div
              className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
              aria-hidden
            >
              <span
                className="inline-block size-9 rounded-full border-2 border-white/25 border-t-white/70 motion-safe:animate-spin"
                style={{ animationDuration: "0.85s" }}
              />
            </div>
          ) : null}
          <Image
            key={moment.src}
            src={moment.src}
            alt={moment.title}
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            className={`relative z-[2] object-contain transition-opacity duration-300 ease-out ${imageReady ? "opacity-100" : "opacity-0"}`}
            onLoadingComplete={() => setImageReady(true)}
            onError={() => setImageReady(true)}
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
      <div className="intro-motion-stage relative h-full w-full overflow-hidden">
        <div className="absolute inset-[20%]">
          {introAnimationImages.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="60vw"
              className={`intro-motion-frame object-contain ${image.className}`}
            />
          ))}
        </div>
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
  const [selectedMoment, setSelectedMoment] = useState<(typeof galleryMoments)[number] | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [rsvpPromoOpen, setRsvpPromoOpen] = useState(false);
  const [rsvpFormOpen, setRsvpFormOpen] = useState(false);
  const [accountModalGroup, setAccountModalGroup] = useState<AccountGroup | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    /* 인트로 교차 애니메이션 2.5s 종료 후 잠깐 유지 → 퇴장(0.7s) → 언마운트 */
    const startFade = window.setTimeout(() => setIsLeavingIntro(true), 3000);
    const removeIntro = window.setTimeout(() => setShowIntro(false), 3600);

    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(removeIntro);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (showIntro) {
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const until = localStorage.getItem(RSVP_PROMO_DISMISS_KEY);
        const today = new Date().toISOString().slice(0, 10);
        if (until === today) return;
      } catch {
        /* ignore */
      }
      setRsvpPromoOpen(true);
    }, 480);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [showIntro]);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = "hidden";
      return;
    }

    if (!selectedMoment && !rsvpPromoOpen && !rsvpFormOpen && !accountModalGroup) {
      document.body.style.overflow = "";
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (rsvpFormOpen) setRsvpFormOpen(false);
      else if (rsvpPromoOpen) setRsvpPromoOpen(false);
      else if (accountModalGroup) setAccountModalGroup(null);
      else setSelectedMoment(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showIntro, selectedMoment, rsvpPromoOpen, rsvpFormOpen, accountModalGroup]);

  const dismissRsvpPromoToday = () => {
    try {
      localStorage.setItem(RSVP_PROMO_DISMISS_KEY, new Date().toISOString().slice(0, 10));
    } catch {
      /* ignore */
    }
    setRsvpPromoOpen(false);
  };


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
      {!showIntro ? <BackgroundMusic /> : null}
      <GalleryModal moment={selectedMoment} onClose={() => setSelectedMoment(null)} />
      <RsvpPromoSheet
        open={rsvpPromoOpen}
        onClose={() => setRsvpPromoOpen(false)}
        onDismissToday={dismissRsvpPromoToday}
        onOpenForm={() => setRsvpFormOpen(true)}
      />
      <RsvpFormModal open={rsvpFormOpen} onClose={() => setRsvpFormOpen(false)} />
      <AccountGroupModal
        group={accountModalGroup}
        onClose={() => setAccountModalGroup(null)}
        copiedAccount={copiedAccount}
        onCopy={(account) => void handleCopyAccount(account)}
      />

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
                  <div className="pointer-events-none absolute inset-x-0 bottom-[16%] z-10 flex justify-center px-3 sm:bottom-[11%]">
                    <Image
                      src="/main_text.png"
                      alt="We're getting married"
                      width={520}
                      height={140}
                      className="h-auto w-[98%] max-w-[310px] select-none object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)]"
                      sizes="(max-width: 640px) 78vw, 280px"
                    />
                  </div>
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
              <div className="mx-auto w-full max-w-xs bg-white px-2 py-8 text-center text-black sm:px-3 sm:py-10">
                <div className="mx-auto w-full max-w-[280px] sm:max-w-[300px]">
                  <Image
                    src="/ment.jpeg"
                    alt="신랑 신부 초대 인사말"
                    width={600}
                    height={780}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 640px) 85vw, 300px"
                  />
                </div>
                <p className="section-body-text mt-9 font-normal sm:mt-10">
                  윤우영 · 이민자의 장남 <span className="font-semibold text-black">준영</span>
                  <br />
                  남유행 · 김은실의 장녀 <span className="font-semibold text-black">승효</span>
                </p>
                <p className="section-body-text mt-7 font-normal sm:mt-8">
                  2026년 6월 20일 토요일 오후 1시 40분
                  <br />
                  아이벡스 컨벤션
                </p>
              </div>
            </div>
          </section>

          {/* 날짜 */}
          <section
            id="day"
            className="scroll-snap-section mx-[-20px] bg-[#f6ccd9] px-[20px] pt-10 pb-10 sm:mx-[-28px] sm:px-[28px] sm:pt-0 sm:py-14 md:py-14"
          >


            <div className="pb-6 text-center font-medium">
              <p className="font-display text-base">2026년 6월 20일 토요일 <br />오후 1시 40분</p>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary max-w-[300px] mx-auto">
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

            <div className="mt-6 flex flex-col items-center gap-2 px-2">
              <button
                type="button"
                onClick={openWeddingCalendar}
                aria-label="휴대폰 캘린더에 결혼식 일정 추가"
                className="text-black w-full max-w-[300px] rounded-full border border-black px-4 py-3 text-center text-sm font-medium tracking-wide transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                캘린더에 등록
              </button>
              <p className="text-xs max-w-[300px] text-center text-black">
                (카카오톡이 아닌 외부 브라우저에서 <br />사용 가능합니다.)
              </p>
            </div>
          </section>

          {/* 갤러리 */}
          <section id="gallery" className="scroll-snap-section z-10 bg-white pt-10 pb-0 sm:pt-14 sm:pb-0">
            <Image
              src="/wewe3.png"
              alt="갤러리"
              width={320}
              height={54}
              className="mx-auto h-auto w-full max-w-[240px] -mb-8 -mt-16"
            />

            {/* 3*5 */}
            <div className="mx-[-20px] overflow-hidden sm:mx-[-28px]">
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
                        className={`object-cover transition duration-300 ${"thumbObjectPosition" in moment ? (moment.thumbObjectPosition ?? "") : ""}`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>


          {/* 위치 및 지도 */}
          <section id="place" className="scroll-snap-section py-10 sm:py-14">
            <div className="flex justify-center items-center pt-10">
              <Image
                src="/새-03.png"
                alt="장식용 새 일러스트"
                width={204}
                height={124}
                className="h-auto w-20 mx-auto soft-float"
                style={{ pointerEvents: "none", userSelect: "none" }}
              />
            </div>
            <p className="text-[15px] font-bold tracking-tight sm:text-base text-center">오시는 길</p>

            <div className="overflow-hidden bg-white">
              <Image
                src="/yakdo.png"
                alt="아이벡스컨벤션 안내 이미지"
                width={320}
                height={54}
                className="mx-auto h-auto w-full max-w-[300px]"
              />

              <div className="section-body-text mx-auto mt-6 w-full max-w-[300px] px-1 pb-2 text-center font-normal text-foreground">
                <p className="font-medium text-black">아이벡스컨벤션</p>
                <p className="mt-1.5">
                  경기 광명시 양지로 17
                  <br />
                  AK 플라자 광명 5층
                </p>
                <p className="mt-1.5">
                  <a href="tel:02-897-1002" className="text-ink-accent underline-offset-2 hover:underline">
                    TEL 02-897-1002
                  </a>
                </p>

                <div className="mt-5 space-y-4 sm:mt-6">
                  <div className="space-y-1">
                    <NoticeSectionHeading>자가용</NoticeSectionHeading>
                    <p className="whitespace-nowrap -ml-3">- 네비게이션 : &apos;아이벡스컨벤션&apos; 또는 &apos;AK플라자 광명&apos;</p>

                    <p>- 주차장 : AK 플라자 B3-B8, 주차 2시간 무료</p>
                  </div>
                  <div className="space-y-1">
                    <NoticeSectionHeading>지하철 / KTX</NoticeSectionHeading>
                    <p>- 1호선 광명역 : 1번 출구 도보 5분</p>
                    <p>
                      - 1호선 관악역 : 1번출구 &gt; 마을버스 1-1 승차 &gt; <br />광명역데시앙.일직동행정복지센터 하차
                    </p>
                  </div>
                  <div className="space-y-1">
                    <NoticeSectionHeading>버스</NoticeSectionHeading>
                    <p>- 광역버스 8507 <br />(사당역 4번출구 ↔ KTX광명역3번출구)</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-1 justify-items-center md:grid-cols-1">
              <a
                href="https://map.kakao.com/link/search/%EC%95%84%EC%9D%B4%EB%B2%A1%EC%8A%A4%EC%BB%A8%EB%B2%A4%EC%85%98"
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-[280px] rounded-full border border-black px-4 py-3 text-center text-xs tracking-[0.2em] uppercase transition-transform duration-200 hover:-translate-y-0.5"
              >
                Kakao Map
              </a>
              <a
                href="https://map.naver.com/p/search/%EC%95%84%EC%9D%B4%EB%B2%A1%EC%8A%A4%EC%BB%A8%EB%B2%A4%EC%85%98"
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-[280px] rounded-full border border-black px-4 py-3 text-center text-xs tracking-[0.2em] uppercase transition-transform duration-200 hover:-translate-y-0.5"
              >
                Naver Map
              </a>
            </div>
          </section>


          {/* 안내사항 */}
          <section
            id="notice"
            className="scroll-snap-section mx-[-20px] bg-gray-100 px-[20px] py-10 sm:mx-[-28px] sm:px-[28px] sm:py-14"
          >
            <div className="flex justify-center">
              <Image
                src="/noticeImage.png"
                alt="안내사항"
                width={1448}
                height={1086}
                className="h-auto w-32 sm:w-32 -mr-6"
              />
            </div>

            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-sm text-center text-black film-grain sm:max-w-md sm:px-6 sm:pt-4">
              <p className="text-[15px] font-bold tracking-tight sm:text-base">주차관련안내</p>
              <div className="section-body-text mt-2 space-y-4 font-normal sm:mt-6">
                <div className="space-y-1">
                  <NoticeSectionHeading>주차안내</NoticeSectionHeading>
                  <p>- 지하 5~6층 주차해야 편해요</p>
                  <p>- 기둥에 &apos;IVEX&apos; 표시된 구역에 주차하시면 <br />엘리베이터 이용이 편리합니다</p>
                </div>
                <p className="font-medium">
                  층마다 노란조끼를 입은 아이벡스
                  <br />
                  안내요원이 계시니 편하게 물어봐주세요
                </p>
                <div className="space-y-1">
                  <NoticeSectionHeading>주차 정산 안내</NoticeSectionHeading>
                  <p>2시간 무료, 웨딩홀 로비 웰컴드링크존 노트북으로 셀프정산</p>
                </div>
              </div>
            </div>
          </section>


          <section id="account" className="scroll-snap-section py-10 sm:py-14">
            <div className="flex justify-center">
              <Image
                src="/heart.png"
                alt="마음 전할 곳"
                width={320}
                height={170}
                className="h-auto w-24 bg-white sm:w-28"
              />
            </div>
            <p className="text-base font-bold text-center mt-2 z-10">마음 전할 곳</p>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setAccountModalGroup(accountGroups[0])}
                className="w-full max-w-[300px] rounded-full border border-black bg-white px-4 py-3 text-center text-sm font-medium tracking-wide text-ink-accent transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                신랑 측 계좌번호
              </button>
              <button
                type="button"
                onClick={() => setAccountModalGroup(accountGroups[1])}
                className="w-full max-w-[300px] rounded-full border border-black bg-white px-4 py-3 text-center text-sm font-medium tracking-wide text-ink-accent transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                신부 측 계좌번호
              </button>
            </div>
          </section>



          <section id="upload" className="scroll-snap-section pt-10 pb-10 text-center sm:pt-14 sm:pb-14">
            {/* 주차관련안내 섹션과 동일한 전폭 회색 배경 */}
            <div className="mx-[-20px] bg-gray-100 px-[20px] py-10 sm:mx-[-28px] sm:px-[28px] sm:py-14">
              <p className="text-center text-base font-bold">전세버스 탑승 여부</p>
              <RsvpIntroCopy className="mt-4" />
              <button
                type="button"
                onClick={() => setRsvpFormOpen(true)}
                className="mt-7 w-full max-w-md mx-auto rounded-full bg-accent-rose px-4 py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-92 active:opacity-88"
              >
                전세버스 탑승 여부
              </button>
            </div>

            <div className="mt-5 rounded-[28px] px-5 py-7">

              <p className="mt-4 font-bold text-base">사진 업로드</p>
              <p className="section-body-text mt-2 text-text-secondary">
                소중한 추억을 함께 나누어요
              </p>
              <p className="section-body-text mt-2 text-text-secondary">
                사진 여러 장을 한 번에 선택할 수 있어요.
              </p>
              <p className="section-body-text text-gray-400/80">
                (단일 파일 최대 용량 10MB)
              </p>

              <div className="mt-5 flex justify-center">
                <GuestPhotoUploader />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

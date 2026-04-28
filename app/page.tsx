"use client";

import {
  completeGuestPhotoUploads,
  createGuestPhotoUploadUrls,
  submitWeddingRsvp,
} from "@/app/actions/wedding";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
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

const galleryMoments = [
  { title: "Gallery 01", src: "/gallery/g1.jpeg", rotate: "-rotate-[1.8deg]" },
  { title: "Gallery 02", src: "/gallery/g2.jpeg", rotate: "rotate-[1.6deg]" },
  { title: "Gallery 03", src: "/gallery/g3.jpeg", rotate: "-rotate-[1.4deg]" },
  { title: "Gallery 04", src: "/gallery/g4.jpeg", rotate: "rotate-[2deg]" },
  { title: "Gallery 05", src: "/gallery/g5.jpeg", rotate: "-rotate-[1deg]" },
  { title: "Gallery 06", src: "/gallery/g6.jpeg", rotate: "rotate-[0.8deg]" },
  { title: "Gallery 07", src: "/gallery/g7.jpeg", rotate: "-rotate-[1.8deg]" },
  { title: "Gallery 08", src: "/gallery/g8.jpeg", rotate: "rotate-[1.3deg]" },
  { title: "Gallery 09", src: "/gallery/g9.jpeg", rotate: "-rotate-[1.5deg]" },
  { title: "Gallery 10", src: "/gallery/g10.jpeg", rotate: "rotate-[1.2deg]" },
  { title: "Gallery 11", src: "/gallery/g11.JPG", rotate: "-rotate-[1.2deg]" },
  { title: "Gallery 12", src: "/gallery/g12.jpeg", rotate: "rotate-[1deg]" },
  { title: "Gallery 13", src: "/gallery/g13.jpeg", rotate: "-rotate-[1.6deg]" },
  { title: "Gallery 14", src: "/gallery/g14.jpeg", rotate: "rotate-[1.1deg]" },
  { title: "Gallery 15", src: "/gallery/g15.jpeg", rotate: "-rotate-[1.1deg]" },
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

const sectionNavItems = [
  { href: "#top", label: "Top", icon: "home" },
  { href: "#gallery", label: "Gallery", icon: "gallery" },
  { href: "#day", label: "Day", icon: "calendar" },
  { href: "#place", label: "Place", icon: "pin" },
  { href: "#notice", label: "Notice", icon: "note" },
  { href: "#account", label: "Account", icon: "heart" },
  { href: "#upload", label: "Guest", icon: "message" },
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
    <p className={`text-center text-sm leading-relaxed text-foreground ${className}`}>
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
    <div className={`mx-auto w-full max-w-sm space-y-2.5 text-sm ${className}`}>
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
  const [headcount, setHeadcount] = useState("");
  const [boardingPlace, setBoardingPlace] = useState<"고흥" | "순천" | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName("");
    setHeadcount("");
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
    const count = Number.parseInt(headcount.trim(), 10);
    if (!n) {
      window.alert("성함을 입력해 주세요.");
      return;
    }
    if (!Number.isFinite(count) || count < 1) {
      window.alert("탑승인원(본인 포함 총 인원)을 숫자로 입력해 주세요.");
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
          headcount: count,
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
              <label htmlFor="rsvp-headcount" className="mb-2 block text-sm text-foreground">
                탑승인원
                <RequiredMark />
              </label>
              <input
                id="rsvp-headcount"
                inputMode="numeric"
                pattern="[0-9]*"
                value={headcount}
                onChange={(ev) => setHeadcount(ev.target.value.replace(/\D/g, ""))}
                placeholder="본인 포함 총 탑승 인원수"
                className="w-full rounded-2xl border border-black px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-secondary/70 focus:ring-2 focus:ring-accent-rose/35"
              />
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
                className="border-t border-border-soft px-4 pb-3 pt-2 text-xs leading-relaxed text-text-secondary"
              >
                <p>
                  수집 항목: 성명, 탑승 인원, 탑승 장소
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
                    <p className="mt-1 text-base text-foreground">{info.name}</p>
                    <p className="text-base leading-8 text-foreground">
                      {info.bank} {info.account}
                    </p>
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
      <div className="intro-motion-stage relative h-full w-full overflow-hidden">
        <div className="absolute inset-[25%]">
          {introAnimationImages.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="50vw"
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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<(typeof galleryMoments)[number] | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [rsvpPromoOpen, setRsvpPromoOpen] = useState(false);
  const [rsvpFormOpen, setRsvpFormOpen] = useState(false);
  const [accountModalGroup, setAccountModalGroup] = useState<AccountGroup | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const startFade = window.setTimeout(() => setIsLeavingIntro(true), 3600);
    const removeIntro = window.setTimeout(() => setShowIntro(false), 2000);

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
                <p className="mt-9 text-base font-normal leading-[1.75] tracking-[-0.01em] sm:mt-10 sm:leading-[1.8]">
                  윤우영 · 이민자의 장남 <span className="font-semibold text-black">준영</span>
                  <br />
                  남유행 · 김은실의 장녀 <span className="font-semibold text-black">승효</span>
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
          <section id="gallery" className="scroll-snap-section bg-white pt-10 pb-0 sm:pt-14 sm:pb-0">
            <Image
              src="/wewe2.png"
              alt="갤러리"
              width={320}
              height={54}
              className="mx-auto h-auto w-full max-w-[240px] bg-white -mb-8 -mt-16"
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
                        className="object-cover transition duration-300"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>


          {/* 날짜 */}
          <section
            id="day"
            className="scroll-snap-section mx-[-20px] bg-pink-100 px-[20px] pt-0 pb-10 sm:mx-[-28px] sm:px-[28px] sm:pt-0 sm:py-14 md:py-14"
          >
            <div className="pt-8 flex justify-center">
              <Image
                src="/calendar6.png"
                alt="Wedding calendar illustration"
                width={320}
                height={170}
                className="h-auto w-24 sm:w-28"
                priority
              />
            </div>

            <div className="my-4 text-center">
              <p className="font-display text-base">2026년 6월 20일 토요일 오후 1시 40분</p>
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
              <p className="max-w-[300px] text-center text-[11px] leading-relaxed text-black">
                (카카오톡이 아닌 외부 브라우저에서 사용 가능합니다.)
              </p>
            </div>
          </section>



          {/* 위치 및 지도 */}
          <section id="place" className="scroll-snap-section py-10 sm:py-14">
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

            <div className="overflow-hidden bg-white">
              <Image
                src="/yakdo.png"
                alt="아이벡스컨벤션 안내 이미지"
                width={320}
                height={54}
                className="mx-auto h-auto w-full max-w-[300px]"
              />

              <div className="mx-auto mt-6 w-full max-w-[300px] px-1 pb-2 text-center text-base font-normal leading-[1.45] tracking-[-0.01em] text-foreground sm:text-base sm:leading-[1.5]">
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
                    <p>- 네비게이션 : &apos;아이벡스컨벤션&apos; 또는 &apos;AK플라자 광명&apos;</p>
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


            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-1 justify-items-center md:grid-cols-1">
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
              <div className="mt-2 space-y-4 text-[13px] font-normal leading-[1.45] tracking-[-0.01em] sm:mt-6 sm:text-base sm:leading-[1.5]">
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



          <section id="upload" className="scroll-snap-section py-10 text-center sm:py-14">
            <div className="mt-4 rounded-2xl bg-border-soft/35 px-5 py-8 sm:px-7 sm:py-9">
              <p className="text-center text-base font-bold">전세버스 탑승 여부</p>
              <RsvpIntroCopy className="mt-4" />
              <button
                type="button"
                onClick={() => setRsvpFormOpen(true)}
                className="mt-7 w-full rounded-2xl bg-accent-rose px-4 py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-92 active:opacity-88"
              >
                전세버스 탑승 여부
              </button>
            </div>

            <div className="mt-5 rounded-[28px] border border-black px-5 py-7">

              <p className="mt-4 font-bold text-base">사진 업로드</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                소중한 추억을 함께 나누어요
                <br />
                <span className="text-xs">사진 여러 장을 한 번에 선택할 수 있어요. (최대 30장, 각 10MB)</span>
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

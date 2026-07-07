"use client";

export type Tab = "vagas" | "matches" | "perfil";

const TABS: { id: Tab; label: string; icon: (ativo: boolean) => React.ReactNode }[] = [
  {
    id: "vagas",
    label: "Vagas",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M13.5 2s.8 2.6-1.3 5.2C10.2 9.7 8 10.8 8 14a5.5 5.5 0 0 0 11 0c0-2.2-1-3.8-2-5-.6 1.2-1.5 1.8-1.5 1.8S17 6 13.5 2Z"
          stroke={a ? "#c8ff16" : "#9c9cb0"}
          strokeWidth="1.8"
          fill={a ? "rgba(200,255,22,0.15)" : "none"}
          strokeLinejoin="round"
        />
        <path
          d="M5 8.5C5 8.5 5.6 10 5 11.5 4.3 13.1 3.5 14 3.5 15.7"
          stroke={a ? "#c8ff16" : "#9c9cb0"}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "matches",
    label: "Matches",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4 4-.02-4H6.5A2.5 2.5 0 0 1 4 14.5v-8Z"
          stroke={a ? "#c8ff16" : "#9c9cb0"}
          strokeWidth="1.8"
          fill={a ? "rgba(200,255,22,0.15)" : "none"}
          strokeLinejoin="round"
        />
        <path
          d="M9 9.5c.6-1.4 2.4-1.3 3 .1.6-1.4 2.4-1.5 3-.1.5 1.2-.6 2.4-3 4-2.4-1.6-3.5-2.8-3-4Z"
          fill={a ? "#c8ff16" : "#9c9cb0"}
        />
      </svg>
    ),
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8.5"
          r="3.5"
          stroke={a ? "#c8ff16" : "#9c9cb0"}
          strokeWidth="1.8"
          fill={a ? "rgba(200,255,22,0.15)" : "none"}
        />
        <path
          d="M5 19.5c1.2-3.2 4-4.5 7-4.5s5.8 1.3 7 4.5"
          stroke={a ? "#c8ff16" : "#9c9cb0"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function TabBar({
  tab,
  onChange,
  badgeMatches,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  badgeMatches: number;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg2/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((t) => {
          const ativo = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold"
              style={{ color: ativo ? "#c8ff16" : "#9c9cb0" }}
            >
              {t.icon(ativo)}
              {t.label}
              {t.id === "matches" && badgeMatches > 0 && (
                <span className="absolute right-[26%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                  {badgeMatches}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

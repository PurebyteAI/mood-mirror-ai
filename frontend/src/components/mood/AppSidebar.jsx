import React, { useState } from "react";
import {
  House,
  Clock,
  Compass,
  Bookmark,
  MessageSquare,
  Settings,
  Wind,
  LogOut,
  Palette,
} from "lucide-react";
import { BreathingModal } from "@/components/mood/BreathingModal";

export const AppSidebar = ({ currentView, onNav, onExit, t, mood, historyCount = 0 }) => {
  const [breathingOpen, setBreathingOpen] = useState(false);

  const navItems = [
    { id: "mirror", labelKey: "navHome", icon: House, badge: null },
    { id: "museum", label: "Living Museum", icon: Palette, badge: "Art" },
    { id: "history", labelKey: "navHistory", icon: Clock, badge: historyCount > 0 ? historyCount : null },
    { id: "insights", labelKey: "navInsights", icon: Compass, badge: null },
    { id: "journal", labelKey: "navJournal", icon: Bookmark, badge: null },
    { id: "talk", labelKey: "navTalk", icon: MessageSquare, badge: "Live" },
    { id: "settings", labelKey: "navSettings", icon: Settings, badge: null },
  ];

  const handleExitToLanding = () => {
    if (onExit) {
      onExit();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      <aside
        className="hidden xl:flex flex-col w-[250px] shrink-0 h-screen sticky top-0 py-5 px-4 z-20 select-none transition-colors duration-300"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Brand Header */}
        <button
          onClick={() => onNav("mirror")}
          className="flex items-center gap-3 px-2 mb-6 text-left group transition-transform duration-200 active:scale-98"
        >
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 30%, #FFB49D, #8C63FF 50%, #66B7FF 100%)",
                boxShadow: "0 0 20px rgba(155, 108, 255, 0.6), inset 0 0 6px rgba(255,255,255,0.4)",
              }}
            />
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: "var(--bg-base)" }}
            />
          </div>
          <div>
            <p
              className="font-display text-base font-bold tracking-tight leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              {t("appTitle")}
            </p>
            <p
              className="text-[11px] leading-none mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {t("appSubtitle")}
            </p>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;

            return (
              <button
                key={item.id}
                data-testid={
                  item.id === "mirror"
                    ? "nav-home-btn"
                    : item.id === "history"
                    ? "toggle-history-btn"
                    : item.id === "insights"
                    ? "nav-insights-btn"
                    : item.id === "journal"
                    ? "nav-journal-btn"
                    : `nav-${item.id}-btn`
                }
                onClick={() => onNav(item.id)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all duration-200 text-left relative group"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--chip-active-bg)" : "transparent",
                  border: active
                    ? "1px solid rgba(155, 108, 255, 0.45)"
                    : "1px solid transparent",
                  boxShadow: active
                    ? "0 0 20px rgba(155, 108, 255, 0.18)"
                    : "none",
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={active ? 2.2 : 1.6}
                  style={{
                    color: active ? "#9333EA" : "var(--text-muted)",
                  }}
                  className="shrink-0"
                />
                <span className="flex-1 font-medium">
                  {item.labelKey ? t(item.labelKey) : item.label}
                </span>

                {item.badge && (
                  <span
                    className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full uppercase"
                    style={{
                      background: active
                        ? "rgba(155, 108, 255, 0.35)"
                        : "var(--control-bg)",
                      color: active ? "var(--text-primary)" : "var(--text-muted)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Mindfulness Card, Institutional Logos, Exit Button */}
        <div className="mt-auto space-y-3 pt-3">
          {/* Daily Reflection Mini Sparkline Card */}
          <div
            data-testid="take-a-breath-btn"
            onClick={() => setBreathingOpen(true)}
            className="p-3 rounded-2xl cursor-pointer transition-all duration-300 group hover:border-violet-500/40"
            style={{
              background: "var(--card-glass-bg)",
              border: "1px solid var(--card-glass-border)",
              boxShadow: "var(--card-glass-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Wind size={12} className="text-violet-500 dark:text-violet-400" />
                <span
                  className="text-xs font-semibold tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("takeABreath")}
                </span>
              </div>
              <span
                className="text-[9px] font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                Streak 12
              </span>
            </div>

            {/* Sparkline Wave Chart */}
            <div className="h-6 w-full flex items-end">
              <svg
                viewBox="0 0 160 30"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="sidebarWave" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="50%" stopColor="#8C63FF" />
                    <stop offset="100%" stopColor="#66B7FF" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,22 Q25,8 50,18 T100,10 T160,16"
                  fill="none"
                  stroke="url(#sidebarWave)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="10" r="3" fill="#8C63FF" />
              </svg>
            </div>
          </div>

          {/* Institutional Affiliation Logos (ScaDS.AI & TU Dresden) */}
          <div
            className="p-2 rounded-xl flex items-center justify-around gap-2"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <img
              src="/logo.png"
              alt="ScaDS.AI"
              style={{ height: "16px", maxWidth: "80px", objectFit: "contain" }}
              className="opacity-85 hover:opacity-100 transition-opacity"
              title="ScaDS.AI - Center for Scalable Data Analytics and AI"
            />
            <div className="w-[1px] h-3.5" style={{ background: "var(--border-subtle)" }} />
            <img
              src="/TU_Dresden.png"
              alt="TU Dresden"
              style={{ height: "16px", maxWidth: "80px", objectFit: "contain" }}
              className="opacity-85 hover:opacity-100 transition-opacity brightness-200 contrast-125"
              title="TU Dresden"
            />
          </div>

          {/* Exit to Landing Page Button */}
          <button
            data-testid="exit-to-landing-btn"
            onClick={handleExitToLanding}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all hover:bg-red-500/10 hover:border-red-500/30"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
            title="Exit to Landing Page"
          >
            <LogOut size={13} className="text-red-400" />
            <span>Exit to Landing</span>
          </button>
        </div>
      </aside>

      {/* Breathing Meditation Modal */}
      <BreathingModal
        isOpen={breathingOpen}
        onClose={() => setBreathingOpen(false)}
        t={t}
      />
    </>
  );
};

export const MobileNav = ({ currentView, onNav, t }) => {
  const items = [
    { id: "mirror", labelKey: "navHome", icon: House },
    { id: "museum", label: "Museum", icon: Palette },
    { id: "history", labelKey: "navHistory", icon: Clock },
    { id: "insights", labelKey: "navInsights", icon: Compass },
    { id: "journal", labelKey: "navJournal", icon: Bookmark },
    { id: "talk", labelKey: "navTalk", icon: MessageSquare },
  ];

  return (
    <nav
      data-testid="mobile-nav"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 safe-area-inset-bottom"
      style={{
        background: "rgba(10, 16, 32, 0.92)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(155, 108, 255, 0.2)",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all"
            style={{
              color: active ? "var(--accent-glow)" : "var(--text-muted)",
            }}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
            <span className="text-[9px] font-medium tracking-tight">
              {item.labelKey ? t(item.labelKey) : item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default AppSidebar;

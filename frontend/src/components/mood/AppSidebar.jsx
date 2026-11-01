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

export const AppSidebar = ({
  currentView,
  activeMode = "portal",
  onNav,
  onExit,
  onOpenBreathing,
  t,
  mood,
  historyCount = 0,
}) => {
  const [localBreathingOpen, setLocalBreathingOpen] = useState(false);

  const navItems = [
    { id: "mirror", labelKey: "navHome", icon: House, badge: null },
    { id: "museum", labelKey: "navMuseum", icon: Palette, badgeKey: "badgeArt" },
    { id: "history", labelKey: "navHistory", icon: Clock, badge: historyCount > 0 ? historyCount : null },
    { id: "insights", labelKey: "navInsights", icon: Compass, badge: null },
    { id: "journal", labelKey: "navJournal", icon: Bookmark, badge: null },
    { id: "talk", labelKey: "navTalk", icon: MessageSquare, badgeKey: "badgeLive" },
    { id: "settings", labelKey: "navSettings", icon: Settings, badge: null },
  ];

  const handleExitToLanding = () => {
    if (onExit) {
      onExit();
    } else {
      window.location.href = "/";
    }
  };

  const handleBreathClick = () => {
    if (onOpenBreathing) {
      onOpenBreathing();
    } else {
      setLocalBreathingOpen(true);
    }
  };

  const isItemActive = (itemId) => {
    if (itemId === "talk") {
      return currentView === "talk" || (currentView === "mirror" && activeMode === "talk");
    }
    if (itemId === "mirror") {
      return currentView === "mirror" && activeMode !== "talk";
    }
    return currentView === itemId;
  };

  return (
    <>
      <aside
        data-testid="app-sidebar"
        className="hidden xl:flex flex-col w-[256px] shrink-0 fixed top-0 left-0 bottom-0 h-screen py-6 px-4 z-30 select-none overflow-y-auto overflow-x-hidden"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Brand Header */}
        <button
          onClick={() => onNav("mirror")}
          className="flex items-center gap-3.5 px-2.5 mb-7 text-left group transition-transform duration-200 active:scale-98"
        >
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center rounded-full"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <div
              className="w-4 h-4 rounded-full transition-transform duration-500 group-hover:scale-110"
              style={{
                background: "radial-gradient(circle at 32% 30%, var(--aura-gold), var(--aura-terracotta) 65%, var(--aura-violet) 100%)",
                boxShadow: "0 0 12px rgba(212, 163, 115, 0.35)",
              }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="font-display text-lg font-medium tracking-tight leading-none truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {t("appTitle")}
            </p>
            <p
              className="text-[10px] font-mono uppercase tracking-[0.14em] leading-none mt-1.5 truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {t("appSubtitle")}
            </p>
          </div>
        </button>

        {/* Section Label */}
        <div className="px-3 mb-2 flex items-center justify-between">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            Observatory
          </span>
          <span
            className="text-[9px] font-mono"
            style={{ color: "var(--aura-gold)" }}
          >
            v2.4
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id);

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
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-left relative group"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--chip-active-bg)" : "transparent",
                  border: active
                    ? "1px solid var(--border-strong)"
                    : "1px solid transparent",
                }}
              >
                {active && (
                  <span
                    className="w-1 h-4 rounded-full absolute left-1.5"
                    style={{ background: "var(--aura-gold)" }}
                  />
                )}
                <Icon
                  size={15}
                  strokeWidth={active ? 2 : 1.6}
                  style={{
                    color: active ? "var(--aura-gold)" : "var(--text-muted)",
                  }}
                  className="shrink-0"
                />
                <span className="flex-1 font-medium tracking-tight">
                  {item.labelKey ? t(item.labelKey) : item.label}
                </span>

                {(item.badge || item.badgeKey) && (
                  <span
                    className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                    style={{
                      background: active
                        ? "var(--control-bg-hover)"
                        : "var(--control-bg)",
                      color: active ? "var(--aura-gold)" : "var(--text-muted)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {item.badgeKey ? t(item.badgeKey) : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Somatic Breath Cadence Card, Institutional Attribution, Exit */}
        <div className="mt-auto space-y-3 pt-4">
          {/* Daily Somatic Breath Card */}
          <button
            type="button"
            data-testid="take-a-breath-btn"
            onClick={handleBreathClick}
            className="w-full text-left p-3.5 rounded-2xl cursor-pointer transition-all duration-300 group"
            style={{
              background: "var(--card-glass-bg)",
              border: "1px solid var(--card-glass-border)",
              boxShadow: "var(--card-glass-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wind size={13} style={{ color: "var(--aura-sage)" }} />
                <span
                  className="text-xs font-medium tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("takeABreath")}
                </span>
              </div>
              <span
                className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: "var(--aura-sage)",
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                4–4–6 Hz
              </span>
            </div>

            {/* Subtle Analog Sine Wave */}
            <div className="h-5 w-full flex items-end">
              <svg
                viewBox="0 0 160 28"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="sidebarWave" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--aura-gold)" />
                    <stop offset="50%" stopColor="var(--aura-terracotta)" />
                    <stop offset="100%" stopColor="var(--aura-sage)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,20 Q25,6 50,16 T100,9 T160,15"
                  fill="none"
                  stroke="url(#sidebarWave)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="9" r="2.5" fill="var(--aura-gold)" />
              </svg>
            </div>
          </button>

          {/* Institutional Affiliation Logos (ScaDS.AI & TU Dresden) */}
          <div
            className="px-3 py-2.5 rounded-xl flex items-center justify-around gap-2"
            style={{
              background: "linear-gradient(180deg, rgba(251, 248, 241, 0.95) 0%, rgba(242, 236, 224, 0.92) 100%)",
              border: "1px solid rgba(212, 163, 115, 0.38)",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
            }}
          >
            <img
              src="/logo.png"
              alt="ScaDS.AI"
              style={{ height: "16px", maxWidth: "84px", objectFit: "contain" }}
              className="opacity-95 hover:opacity-100 transition-opacity"
              title="ScaDS.AI - Center for Scalable Data Analytics and AI"
            />
            <div className="w-[1px] h-3.5" style={{ background: "rgba(28, 25, 23, 0.2)" }} />
            <img
              src="/TU_Dresden.png"
              alt="TU Dresden"
              style={{
                height: "16px",
                maxWidth: "86px",
                objectFit: "contain",
              }}
              className="opacity-95 hover:opacity-100 transition-opacity"
              title="TU Dresden"
            />
          </div>

          {/* Exit to Landing Page Button */}
          <button
            data-testid="exit-to-landing-btn"
            onClick={handleExitToLanding}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
            title={t("exitLanding")}
          >
            <LogOut size={13} style={{ color: "var(--aura-terracotta)" }} />
            <span>{t("exitLanding")}</span>
          </button>
        </div>
      </aside>

      {/* Fallback Breathing Modal only when rendered standalone without parent modal */}
      {!onOpenBreathing && (
        <BreathingModal
          isOpen={localBreathingOpen}
          onClose={() => setLocalBreathingOpen(false)}
          t={t}
        />
      )}
    </>
  );
};

export const MobileNav = ({ currentView, activeMode = "portal", onNav, t }) => {
  const items = [
    { id: "mirror", labelKey: "navHome", icon: House },
    { id: "museum", labelKey: "navMuseumShort", icon: Palette },
    { id: "history", labelKey: "navHistory", icon: Clock },
    { id: "insights", labelKey: "navInsights", icon: Compass },
    { id: "journal", labelKey: "navJournal", icon: Bookmark },
    { id: "talk", labelKey: "navTalk", icon: MessageSquare },
    { id: "settings", labelKey: "navSettings", icon: Settings },
  ];

  const isItemActive = (itemId) => {
    if (itemId === "talk") {
      return currentView === "talk" || (currentView === "mirror" && activeMode === "talk");
    }
    if (itemId === "mirror") {
      return currentView === "mirror" && activeMode !== "talk";
    }
    return currentView === itemId;
  };

  return (
    <nav
      data-testid="mobile-nav"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1.5 py-2 safe-area-inset-bottom"
      style={{
        background: "var(--sidebar-bg)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--sidebar-border)",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item.id);

        return (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all"
            style={{
              color: active ? "var(--aura-gold)" : "var(--text-muted)",
              background: active ? "var(--chip-active-bg)" : "transparent",
            }}
          >
            <Icon size={17} strokeWidth={active ? 2.1 : 1.6} />
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

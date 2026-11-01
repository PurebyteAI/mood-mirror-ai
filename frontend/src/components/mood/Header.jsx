import React from "react";
import { Flame, Settings, LogOut, Moon, Sun, Heart, Compass } from "lucide-react";
import { useTheme } from "next-themes";
import { AmbientControl } from "@/components/mood/AmbientControl";
import { LanguageSwitcher } from "@/components/mood/LanguageSwitcher";

const THEME_CYCLES = [
  { id: "dark", label: "Obsidian", icon: Moon },
  { id: "light", label: "Atelier", icon: Sun },
  { id: "romantic", label: "Rosewater", icon: Heart },
];

const VIEW_KEYS = {
  mirror: "navMirror",
  journal: "navJournal",
  insights: "navInsights",
  history: "navHistory",
  museum: "navMuseum",
  settings: "navSettings",
};

export const Header = ({
  onNav,
  onExit,
  language,
  onLanguageChange,
  t,
  dominantMood,
  currentView = "mirror",
  historyCount = 0,
}) => {
  const { theme = "dark", setTheme } = useTheme();
  const activeViewLabel = t(VIEW_KEYS[currentView] || "navMirror");

  const handleExit = () => {
    if (onExit) onExit();
    else window.location.href = "/";
  };

  return (
    <header
      data-testid="app-header"
      className="flex items-center justify-between py-3.5 mb-3 w-full gap-3 border-b"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      {/* Mobile brand header (hidden on desktop) */}
      <button
        type="button"
        onClick={() => onNav("mirror")}
        className="flex items-center gap-3 xl:hidden text-left"
      >
        <div
          className="relative w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, var(--aura-gold), var(--aura-terracotta) 70%, var(--aura-violet) 100%)",
            }}
          />
        </div>
        <div>
          <h1
            data-testid="app-title"
            className="font-display text-base font-medium tracking-tight leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("appTitle")}
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {t("appSubtitle")}
          </p>
        </div>
      </button>

      {/* Desktop Section Status Breadcrumb */}
      <div className="hidden xl:flex items-center gap-2.5">
        <Compass size={14} style={{ color: "var(--aura-gold)" }} />
        <span
          className="text-xs font-mono uppercase tracking-[0.16em]"
          style={{ color: "var(--text-muted)" }}
        >
          {t("appTitle")}
        </span>
        <span className="text-xs font-mono" style={{ color: "var(--divider-subtle)" }}>
          /
        </span>
        <span
          className="text-xs font-mono font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {activeViewLabel}
        </span>
      </div>

      {/* Right Controls: Theme Switcher, Language, Ambient Audio, Streak Badge, Mobile Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* 1-Click Segmented Theme Pill */}
        <div
          data-testid="header-theme-switcher"
          className="hidden sm:flex items-center p-0.5 rounded-full"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
          }}
          role="group"
          aria-label="Theme appearance"
        >
          {THEME_CYCLES.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`header-theme-${opt.id}`}
                onClick={() => setTheme(opt.id)}
                title={`${opt.label} Theme`}
                aria-label={`${opt.label} Theme`}
                aria-pressed={active}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all"
                style={{
                  background: active ? "var(--chip-active-bg)" : "transparent",
                  color: active ? "var(--aura-gold)" : "var(--text-muted)",
                  border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
                }}
              >
                <Icon size={12} strokeWidth={active ? 2.1 : 1.6} />
                <span className="hidden lg:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language switcher */}
        <LanguageSwitcher
          language={language}
          onChange={onLanguageChange}
          label={t("settingsLanguage")}
        />

        {/* Ambient Sound Pill Toggle */}
        <div className="hidden sm:flex">
          <AmbientControl mood={dominantMood} label={t("ambientLabel")} variant="header" />
        </div>

        {/* Streak / Archive Badge Pill */}
        <div
          data-testid="streak-badge"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-default"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Flame size={13} style={{ color: "var(--aura-terracotta)" }} />
          <span
            className="text-xs font-mono font-medium tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {t("streak")} {historyCount > 0 ? historyCount : 12}
          </span>
        </div>

        {/* Mobile Exit & Settings Buttons */}
        <button
          type="button"
          onClick={handleExit}
          className="xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
          title={t("exitLanding")}
        >
          <LogOut size={13} style={{ color: "var(--aura-terracotta)" }} />
          <span className="hidden sm:inline">{t("exit")}</span>
        </button>

        <button
          type="button"
          onClick={() => onNav("settings")}
          aria-label={t("navSettings")}
          className="xl:hidden w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <Settings size={15} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import { Flame, Settings, LogOut } from "lucide-react";
import { AmbientControl } from "@/components/mood/AmbientControl";
import HackathonDemoBar from "@/components/mood/HackathonDemoBar";

export const Header = ({ onNav, onExit, language, onLanguageChange, t, dominantMood, currentView, onSelectScenario }) => {
  const handleExit = () => {
    if (onExit) onExit();
    else window.location.href = "/";
  };

  return (
    <header
      data-testid="app-header"
      className="flex items-center justify-between py-3 mb-2 w-full gap-3"
    >
      {/* Mobile brand header (hidden on desktop) */}
      <button
        onClick={() => onNav("mirror")}
        className="flex items-center gap-3 xl:hidden text-left"
      >
        <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, #FFB49D, #8C63FF 50%, #66B7FF 100%)",
              boxShadow: "0 0 16px rgba(155, 108, 255, 0.5)",
            }}
          />
          <div className="w-4 h-4 rounded-full" style={{ background: "var(--bg-base)" }} />
        </div>
        <div>
          <h1
            data-testid="app-title"
            className="font-display text-base font-bold tracking-tight leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("appTitle")}
          </h1>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {t("appSubtitle")}
          </p>
        </div>
      </button>

      {/* Center/Left: Hackathon Judge Demo Bar */}
      {onSelectScenario && (
        <div className="hidden md:block">
          <HackathonDemoBar onSelectScenario={onSelectScenario} />
        </div>
      )}

      {/* Right Controls: Language, Ambient Music, Streak Badge, Exit */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Language switcher */}
        <div
          data-testid="language-switcher"
          className="flex items-center p-0.5 rounded-full"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {["en", "de"].map((lang) => (
            <button
              key={lang}
              data-testid={`lang-${lang}`}
              onClick={() => onLanguageChange(lang)}
              className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium uppercase transition-all"
              style={{
                background: language === lang ? "var(--chip-active-bg)" : "transparent",
                color: language === lang ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Ambient Sound Pill Toggle */}
        <div className="hidden sm:flex">
          <AmbientControl mood={dominantMood} label="" />
        </div>

        {/* Streak Badge Pill */}
        <div
          data-testid="streak-badge"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full cursor-default"
          style={{
            background: "linear-gradient(135deg, rgba(255, 179, 156, 0.12), rgba(249, 115, 22, 0.12))",
            border: "1px solid rgba(255, 179, 156, 0.3)",
            boxShadow: "0 0 16px rgba(249, 115, 22, 0.15)",
          }}
        >
          <Flame size={14} className="text-orange-500" />
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "#FED7AA" }}
          >
            Streak 12
          </span>
        </div>

        {/* Exit to Landing Page Button */}
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-red-500/10 hover:border-red-500/30"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
          title="Exit to Landing Page"
        >
          <LogOut size={13} className="text-red-400" />
          <span className="hidden sm:inline">Exit</span>
        </button>

        {/* Settings button on mobile */}
        <button
          onClick={() => onNav("settings")}
          aria-label={t("navSettings")}
          className="xl:hidden w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <Settings size={15} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};

export default Header;

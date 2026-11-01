import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MoodMirror from "./pages/MoodMirror";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider } from "next-themes";
import axios from "axios";

const mockNavigate = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

// Mock axios
jest.mock("axios");

describe("MoodMirror Application UX & Full Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    axios.get.mockImplementation((url) => {
      if (url.includes("/history")) {
        return Promise.resolve({
          data: [
            {
              id: "hist-1",
              input_type: "text",
              input_preview: "Quiet evening walk by the river",
              dominant_mood: "joy",
              response_type: "poem",
              response_text:
                "Quiet light settles along the windowsill,\nthe hurried clockwork loosens its grip.\nEven the longest afternoon learns how to rest,\nheld gently in the hush between breaths.\n\nNo urgency remains to be answered here,\nonly the slow tide returning to shore.\nLet your shoulders drop their borrowed weight,\nthe evening is wide enough for peace.",
              emotions: [
                { emotion: "joy", score: 0.68 },
                { emotion: "neutral", score: 0.22 },
                { emotion: "surprise", score: 0.1 },
              ],
              timestamp: "2026-10-29T18:00:00Z",
            },
          ],
        });
      }
      if (url.includes("/journal/trends")) {
        return Promise.resolve({
          data: [
            {
              dominant_mood: "joy",
              valence: 0.72,
              arousal: 0.28,
              timestamp: "2026-10-29T18:00:00Z",
            },
          ],
        });
      }
      if (url.includes("/journal")) {
        return Promise.resolve({
          data: [
            {
              id: "hist-1",
              input_type: "text",
              input_preview: "Quiet evening walk by the river",
              dominant_mood: "joy",
              response_type: "poem",
              response_text: "Quiet light settles along the windowsill.",
              emotions: [{ emotion: "joy", score: 0.68 }],
              journal_note: "Saved reflection",
              timestamp: "2026-10-29T18:00:00Z",
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    axios.post.mockImplementation((url) => {
      if (url.includes("/image/generate")) {
        return Promise.resolve({
          data: {
            generated: true,
            image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
          },
        });
      }
      if (url.includes("/journal/save")) {
        return Promise.resolve({
          data: { message: "Saved to journal", id: "test-id" },
        });
      }
      return Promise.resolve({
        data: {
          id: "test-id",
          emotions: [
            { emotion: "joy", score: 0.65 },
            { emotion: "sadness", score: 0.15 },
            { emotion: "neutral", score: 0.2 },
          ],
          dominant_mood: "joy",
          response_type: "poem",
          response_text:
            "Quiet light settles along the windowsill,\nthe hurried clockwork loosens its grip.\nEven the longest afternoon learns how to rest,\nheld gently in the hush between breaths.\n\nNo urgency remains to be answered here,\nonly the slow tide returning to shore.\nLet your shoulders drop their borrowed weight,\nthe evening is wide enough for peace.",
          input_type: "text",
          input_preview: "I finished the project",
          alignment: {
            score: 0.54,
            has_mismatch: true,
            words_alignment: 68,
            voice_alignment: 82,
            visual_alignment: 85,
            contradiction_notice:
              "Your words sound relieved, but somatic cues suggest underlying fatigue.",
            subconscious_insight: "Relief + underlying exhaustion",
          },
          cognitive_reframing: {
            distortion_detected: "All-or-Nothing Thinking",
            explanation: "Holding high internal pressure after a milestone.",
            reframing_prompts: [
              "What small part of today went well?",
              "How would you speak to a friend feeling this way?",
              "What can wait until tomorrow morning?",
            ],
            grounding_affirmation: "You are permitted to pause and breathe.",
          },
        },
      });
    });
    axios.delete.mockResolvedValue({ data: { message: "History cleared" } });

    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      ellipse: jest.fn(),
      roundRect: jest.fn(),
      rect: jest.fn(),
    }));
  });

  test("LandingPage renders 3D Dark, Daylight, Romantic realms and localized content across all 6 languages", () => {
    const expectedByLang = {
      en: {
        hero: "Understand Your Emotions.",
        daylight: "Discover Patterns.",
        romantic: "Be Kinder",
        reveal: "Start Your Journey",
        specimen: "Quiet light settles along the windowsill",
      },
      de: {
        hero: "Verstehe deine Emotionen.",
        daylight: "Muster erkennen.",
        romantic: "Sei freundlicher",
        reveal: "Deine Reise starten",
        specimen: "Stilles Licht legt sich auf das Fensterbrett",
      },
      fr: {
        hero: "Comprenez vos émotions.",
        daylight: "Découvrez vos rythmes.",
        romantic: "Soyez plus doux",
        reveal: "Commencer votre voyage",
        specimen: "Une lumière douce se pose sur le rebord",
      },
      it: {
        hero: "Comprendi le tue emozioni.",
        daylight: "Scopri i tuoi schemi.",
        romantic: "Sii più gentile",
        reveal: "Inizia il tuo viaggio",
        specimen: "Una luce quieta si posa sul davanzale",
      },
      es: {
        hero: "Comprende tus emociones.",
        daylight: "Descubre patrones.",
        romantic: "Sé más amable",
        reveal: "Comienza tu viaje",
        specimen: "Una luz tranquila se posa en el alféizar",
      },
      zh: {
        hero: "读懂你的情绪，",
        daylight: "发现情绪脉络，",
        romantic: "对自己的内心，",
        reveal: "开启你的旅程",
        specimen: "柔和的光线静静落在窗台",
      },
    };

    for (const [lang, expected] of Object.entries(expectedByLang)) {
      localStorage.setItem("mm-language", lang);
      const { unmount } = render(
        <ThemeProvider attribute="class" defaultTheme="dark">
          <LandingPage />
        </ThemeProvider>
      );

      expect(screen.getByTestId("landing-3d-stage")).toBeInTheDocument();
      expect(screen.getByTestId("landing-top-nav-logos")).toBeInTheDocument();
      expect(screen.getByTestId("landing-hero-top-logos")).toBeInTheDocument();
      expect(screen.getByTestId("landing-about-logos")).toBeInTheDocument();
      expect(screen.getByTestId("landing-footer-logos")).toBeInTheDocument();
      expect(screen.getByTestId("landing-hero-heading")).toHaveTextContent(expected.hero);
      expect(screen.getByTestId("landing-specimen-poem")).toHaveTextContent(expected.specimen);
      expect(screen.getByTestId("daylight-hero-heading")).toHaveTextContent(expected.daylight);
      expect(screen.getByTestId("romantic-hero-heading")).toHaveTextContent(expected.romantic);
      expect(screen.getByTestId("final-brand-reveal")).toHaveTextContent(expected.reveal);

      // Ensure no raw untranslated key names leak into the page
      const bodyText = document.body.textContent || "";
      expect(bodyText).not.toMatch(/landing[A-Z]\w+/);
      expect(bodyText).not.toMatch(/landHero\w+|landModal\w+|landLoop\w+|landFaq\w+/);

      unmount();
    }
  });

  test("renders hero title, sidebar, orbital mirror controls, and ensures HackathonDemoBar is removed", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <MoodMirror />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(screen.getByTestId("hero-title")).toBeInTheDocument();
    expect(screen.getByText("Express Yourself")).toBeInTheDocument();

    expect(screen.getByTestId("orbital-write-btn")).toBeInTheDocument();
    expect(screen.getByTestId("orbital-speak-btn")).toBeInTheDocument();
    expect(screen.getByTestId("orbital-draw-btn")).toBeInTheDocument();
    expect(screen.getByTestId("orbital-talk-btn")).toBeInTheDocument();

    // Verify sidebar is fixed to viewport so it never scrolls up when right side scrolls
    const sidebar = screen.getByTestId("app-sidebar");
    expect(sidebar.className).toContain("fixed");
    expect(sidebar.className).toContain("top-0");
    expect(sidebar.className).toContain("left-0");

    // Verify HackathonDemoBar is completely removed
    expect(screen.queryByTestId("hackathon-demo-btn-high_achiever_burnout")).toBeNull();
    expect(screen.queryByText("Demo")).toBeNull();
  });

  test("opens and closes the breathing modal from sidebar without duplicate modals", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <MoodMirror />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    const breathBtn = screen.getByTestId("take-a-breath-btn");
    expect(breathBtn).toBeInTheDocument();
    fireEvent.click(breathBtn);

    const modals = screen.getAllByTestId("breathing-modal");
    expect(modals).toHaveLength(1);
    expect(screen.getByText("Mindfulness Breathing")).toBeInTheDocument();
  });

  test("analyzes written expression, saves to journal, and integrates with Museum, History, Insights, and Settings", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <MoodMirror />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId("orbital-write-btn"));

    const textarea = screen.getByTestId("text-input");
    fireEvent.change(textarea, {
      target: { value: "I finished the project but I feel completely drained." },
    });

    fireEvent.click(screen.getByTestId("analyze-text-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("mood-result")).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/analyze"),
      expect.objectContaining({
        input_type: "text",
        content: "I finished the project but I feel completely drained.",
      }),
      expect.any(Object)
    );

    expect(screen.getByTestId("poem-slip")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-column")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-bar-joy")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-bar-sadness")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-bar-anger")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-bar-fear")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-bar-surprise")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-bar-disgust")).toBeInTheDocument();
    expect(screen.getByTestId("emotion-bar-neutral")).toBeInTheDocument();
    expect(screen.getByTestId("contradiction-detector-card")).toBeInTheDocument();
    expect(screen.getByTestId("cognitive-reframer-card")).toBeInTheDocument();

    // Save to journal integration
    fireEvent.click(screen.getByTestId("save-to-journal-btn"));
    fireEvent.click(screen.getByTestId("confirm-save-btn"));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/journal/save"),
        expect.objectContaining({ analysis_id: "test-id" })
      );
    });

    // Navigate to Living Museum and verify user history reflection card is integrated
    fireEvent.click(screen.getByTestId("nav-museum-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("living-museum-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("museum-card-hist-1")).toBeInTheDocument();

    // Navigate to Insights and verify trends integration
    fireEvent.click(screen.getByTestId("nav-insights-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("insights-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("affect-radar-chart")).toBeInTheDocument();
  });
});

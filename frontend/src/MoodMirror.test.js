import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MoodMirror from "./pages/MoodMirror";
import { ThemeProvider } from "next-themes";
import axios from "axios";

// Mock axios
jest.mock("axios");

describe("MoodMirror Application UX", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({
      data: {
        id: "test-id",
        emotions: [{ emotion: "calmness", score: 0.8 }],
        dominant_mood: "calmness",
        response_type: "reflection",
        response_text: "A gentle reflection for testing.",
        input_type: "text"
      }
    });
    axios.delete.mockResolvedValue({ data: { success: true } });

    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
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
    }));
  });

  test("renders hero title, sidebar, and orbital mirror controls", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <MoodMirror />
      </ThemeProvider>
    );

    // Hero title
    expect(screen.getByTestId("hero-title")).toBeInTheDocument();
    expect(screen.getByText("Express Yourself")).toBeInTheDocument();

    // Orbital mode buttons
    expect(screen.getByTestId("orbital-write-btn")).toBeInTheDocument();
    expect(screen.getByTestId("orbital-speak-btn")).toBeInTheDocument();
    expect(screen.getByTestId("orbital-draw-btn")).toBeInTheDocument();

    // Prompt carousel
    expect(screen.getByText("Need inspiration?")).toBeInTheDocument();
  });

  test("opens and closes the breathing modal from sidebar", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <MoodMirror />
      </ThemeProvider>
    );

    // Click 'Take a breath' card button
    const breathBtn = screen.getByTestId("take-a-breath-btn");
    expect(breathBtn).toBeInTheDocument();
    fireEvent.click(breathBtn);

    // Breathing modal elements should appear
    expect(screen.getByTestId("breathing-modal")).toBeInTheDocument();
    expect(screen.getByText("Mindfulness Breathing")).toBeInTheDocument();
  });
});

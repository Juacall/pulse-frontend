// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PoliticianCard } from "../components/PoliticianCard.jsx";

const makePolitician = (overrides = {}) => ({
  id: "A000001",
  name: "Jane Doe",
  party: "Democratic",
  state: "CA",
  stateName: "California",
  chamber: "House",
  bio: "Bio",
  metrics: { passRate: 10, sponsoredCount: 3 },
  sentimentStats: { approve: 1, disapprove: 1, neutral: 0 },
  ...overrides
});

const renderCard = (overrides) =>
  render(<PoliticianCard politician={makePolitician(overrides)} onSelect={() => {}} />);

describe("PoliticianCard absence badge", () => {
  afterEach(cleanup);

  it("is amber when missed votes exceed 8%", () => {
    renderCard({ rollCallVotes: { totalVotes: 1000, missedVotes: 123 } });
    expect(screen.getByText("Absence · 12.3%").className).toContain("text-amber-300");
  });

  it("is neutral at or below 8%", () => {
    renderCard({ rollCallVotes: { totalVotes: 1235, missedVotes: 9, attendancePercentage: 99.27 } });
    expect(screen.getByText("Absence · 0.7%").className).toContain("text-slate-300");
  });

  it("is always shown, with N/A when data is missing", () => {
    renderCard();
    expect(screen.getByText("Absence · N/A")).toBeTruthy();
  });
});


import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SectorDefinition } from "../../../shared/sector-definitions";
import { SectorFilter } from "./SectorFilter";

const sectors: SectorDefinition[] = [
  {
    id: "food",
    name: "Food and beverage",
    icon: "Utensils",
    description: "Food sector"
  },
  {
    id: "fashion",
    name: "Fashion and apparel",
    icon: "Shirt",
    description: "Fashion sector"
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "Cpu",
    description: "Electronics sector"
  }
];

describe("SectorFilter", () => {
  it("renders sectors with counts and selection indicator", () => {
    const onChange = vi.fn();
    render(
      <SectorFilter
        sectors={sectors}
        selectedSectors={["food"]}
        itemCounts={{ food: 10, fashion: 5, electronics: 2 }}
        onChange={onChange}
      />
    );

    expect(
      screen.getByText("Food and beverage")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fashion and apparel")
    ).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onChange when toggling sector selection", () => {
    const onChange = vi.fn();
    render(
      <SectorFilter
        sectors={sectors}
        selectedSectors={[]}
        itemCounts={{}}
        onChange={onChange}
      />
    );

    const foodButton = screen.getByText("Food and beverage");
    fireEvent.click(foodButton);

    expect(onChange).toHaveBeenCalledWith(["food"]);
  });

  it("selects all sectors when Select all is clicked", () => {
    const onChange = vi.fn();
    render(
      <SectorFilter
        sectors={sectors}
        selectedSectors={[]}
        itemCounts={{}}
        onChange={onChange}
      />
    );

    const button = screen.getByRole("button", { name: /Select all/i });
    fireEvent.click(button);

    expect(onChange).toHaveBeenCalledWith([
      "food",
      "fashion",
      "electronics"
    ]);
  });

  it("clears all sectors when Clear all is clicked", () => {
    const onChange = vi.fn();
    render(
      <SectorFilter
        sectors={sectors}
        selectedSectors={["food", "fashion"]}
        itemCounts={{}}
        onChange={onChange}
      />
    );

    const button = screen.getByRole("button", { name: /Clear all/i });
    fireEvent.click(button);

    expect(onChange).toHaveBeenCalledWith([]);
  });
});


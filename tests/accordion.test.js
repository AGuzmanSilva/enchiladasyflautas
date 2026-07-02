import { describe, it, expect, beforeEach } from "vitest";
import { initAccordion } from "../assets/accordion.js";

function setupDOM() {
  document.body.innerHTML = `
    <div class="category" id="cat1">
      <div class="category-header">Categoría 1</div>
      <div class="menu-grid" id="grid1"></div>
    </div>
    <div class="category" id="cat2">
      <div class="category-header">
        <span>Categoría 2</span>
        <span class="category-badge">4</span>
      </div>
      <div class="menu-grid" id="grid2"></div>
    </div>
    <div class="category" id="cat3">
      <div class="category-header">Categoría 3</div>
      <div class="menu-grid" id="grid3"></div>
    </div>
  `;
}

describe("initAccordion", () => {
  beforeEach(() => {
    setupDOM();
    initAccordion();
  });

  it("debe abrir la primera categoría por defecto", () => {
    const firstCat = document.getElementById("cat1");
    const firstGrid = document.getElementById("grid1");
    expect(firstCat.classList.contains("open")).toBe(true);
    expect(firstGrid.classList.contains("active")).toBe(true);
  });

  it("debe cerrar otras categorías al abrir una nueva", () => {
    const secondHeader = document.querySelector("#cat2 .category-header");
    secondHeader.click();

    const firstCat = document.getElementById("cat1");
    const secondCat = document.getElementById("cat2");
    const firstGrid = document.getElementById("grid1");
    const secondGrid = document.getElementById("grid2");

    expect(firstCat.classList.contains("open")).toBe(false);
    expect(firstGrid.classList.contains("active")).toBe(false);
    expect(secondCat.classList.contains("open")).toBe(true);
    expect(secondGrid.classList.contains("active")).toBe(true);
  });

  it("debe cerrar la categoría actual si se hace clic en la misma", () => {
    const firstHeader = document.querySelector("#cat1 .category-header");
    firstHeader.click();

    const firstCat = document.getElementById("cat1");
    const firstGrid = document.getElementById("grid1");

    expect(firstCat.classList.contains("open")).toBe(false);
    expect(firstGrid.classList.contains("active")).toBe(false);
  });

  it("no debe alternar al hacer clic en el badge", () => {
    const badge = document.querySelector("#cat2 .category-badge");
    badge.click();

    const firstCat = document.getElementById("cat1");
    expect(firstCat.classList.contains("open")).toBe(true);
  });
});

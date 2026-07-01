export function initAccordion() {
  const categories = document.querySelectorAll(".category");
  if (categories.length > 0) {
    const firstGrid = categories[0].querySelector(".menu-grid");
    if (firstGrid) {
      firstGrid.classList.add("active");
      categories[0].classList.add("open");
    }
  }

  categories.forEach(category => {
    const header = category.querySelector(".category-header");
    if (!header) return;

    header.addEventListener("click", e => {
      if (e.target.closest(".category-badge")) return;
      const currentGrid = category.querySelector(".menu-grid");
      const isOpen = category.classList.contains("open");

      categories.forEach(cat => {
        cat.classList.remove("open");
        const grid = cat.querySelector(".menu-grid");
        if (grid) grid.classList.remove("active");
      });

      if (!isOpen) {
        category.classList.add("open");
        if (currentGrid) currentGrid.classList.add("active");
      }
    });
  });
}

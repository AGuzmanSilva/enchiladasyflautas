import { describe, it, expect, beforeEach, vi } from "vitest";
import { createProductCardHTML, bindQtyButtons, setupEnviarButton } from "../assets/product-card.js";

describe("createProductCardHTML", () => {
  const prodConImagen = {
    nombre: "Tacos",
    descripcion: "Deliciosos tacos",
    precio: 50,
    tag: "Nuevo",
    imagen: "/img/tacos.webp"
  };

  const prodSinImagen = {
    nombre: "Tacos",
    descripcion: "Deliciosos tacos",
    precio: 50
  };

  it("debe incluir imagen cuando el producto tiene una", () => {
    const html = createProductCardHTML(prodConImagen, 0);
    expect(html).toContain("/img/tacos.webp");
    expect(html).toContain("product-img-wrapper");
  });

  it("debe omitir imagen cuando el producto no tiene una", () => {
    const html = createProductCardHTML(prodSinImagen, 0);
    expect(html).not.toContain("product-img-wrapper");
  });

  it("debe incluir tag cuando el producto tiene uno", () => {
    const html = createProductCardHTML(prodConImagen, 0);
    expect(html).toContain("product-tag");
    expect(html).toContain("Nuevo");
  });

  it("debe mostrar el precio formateado", () => {
    const html = createProductCardHTML(prodConImagen, 0);
    expect(html).toContain("$50");
  });

  it("debe mostrar la cantidad actual", () => {
    const html = createProductCardHTML(prodConImagen, 3);
    expect(html).toContain(">3<");
  });

  it("debe mostrar subtotal cuando cantidad > 0", () => {
    const html = createProductCardHTML(prodConImagen, 2);
    expect(html).toContain("Subtotal: $100");
  });

  it("no debe mostrar subtotal cuando cantidad es 0", () => {
    const html = createProductCardHTML(prodConImagen, 0);
    expect(html).not.toContain("subtotal-indicator");
  });
});

describe("bindQtyButtons", () => {
  it("debe llamar a actualizarFn con -1 al hacer clic en menos", () => {
    const card = document.createElement("div");
    card.innerHTML = '<button class="qty-btn minus">−</button><span class="qty-number">0</span><button class="qty-btn plus">+</button><div class="qty-wrapper"></div>';
    const prod = { nombre: "Taco", precio: 10 };
    const fn = vi.fn();

    bindQtyButtons(card, prod, fn);
    card.querySelector(".minus").click();

    expect(fn).toHaveBeenCalledWith("Taco", -1, 10, card);
  });

  it("debe llamar a actualizarFn con +1 al hacer clic en más", () => {
    const card = document.createElement("div");
    card.innerHTML = '<button class="qty-btn minus">−</button><span class="qty-number">0</span><button class="qty-btn plus">+</button><div class="qty-wrapper"></div>';
    const prod = { nombre: "Taco", precio: 10 };
    const fn = vi.fn();

    bindQtyButtons(card, prod, fn);
    card.querySelector(".plus").click();

    expect(fn).toHaveBeenCalledWith("Taco", 1, 10, card);
  });

  it("no debe propagar el evento al hacer clic", () => {
    const card = document.createElement("div");
    card.innerHTML = '<button class="qty-btn minus">−</button><span class="qty-number">0</span><button class="qty-btn plus">+</button><div class="qty-wrapper"></div>';
    const prod = { nombre: "Taco", precio: 10 };
    const fn = vi.fn();
    const parentClick = vi.fn();

    card.addEventListener("click", parentClick);
    bindQtyButtons(card, prod, fn);
    card.querySelector(".minus").click();

    expect(parentClick).not.toHaveBeenCalled();
  });
});

describe("setupEnviarButton", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="enviarPedidoBtn">Enviar</button>
      <div id="floatBtn"></div>
    `;
  });

  it("debe agregar click listener al botón de enviar", () => {
    const fn = vi.fn();
    setupEnviarButton(fn);
    document.getElementById("enviarPedidoBtn").click();
    expect(fn).toHaveBeenCalled();
  });

  it("debe agregar click listener al botón flotante", () => {
    const fn = vi.fn();
    setupEnviarButton(fn);
    document.getElementById("floatBtn").click();
    expect(fn).toHaveBeenCalled();
  });
});

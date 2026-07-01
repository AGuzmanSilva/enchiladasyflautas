import { describe, it, expect, beforeEach } from "vitest";
import { mostrarMensaje } from "../assets/ui.js";

describe("mostrarMensaje", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("debe crear un elemento mensaje", () => {
    mostrarMensaje("Prueba", "info", 100);
    const el = document.querySelector(".mensaje-flotante");
    expect(el).not.toBeNull();
    expect(el.textContent).toContain("Prueba");
  });

  it("debe tener la clase del tipo correcto", () => {
    mostrarMensaje("Error test", "error", 100);
    const el = document.querySelector(".mensaje-flotante");
    expect(el.className).toContain("mensaje-error");
  });

  it("debe remover el mensaje anterior si existe", () => {
    mostrarMensaje("Primero", "info", 100);
    mostrarMensaje("Segundo", "info", 100);
    const elementos = document.querySelectorAll(".mensaje-flotante");
    expect(elementos.length).toBe(1);
  });
});

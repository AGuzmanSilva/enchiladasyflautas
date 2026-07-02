import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mostrarMensaje, mostrarMensajeLimite, guardarPedidoOffline, enviarPedidoOffline, showLoadingSkeleton } from "../assets/ui.js";

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

describe("mostrarMensajeLimite", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("debe mostrar mensaje de límite con el nombre y cantidad correctos", () => {
    mostrarMensajeLimite("Pan", 5);
    const el = document.querySelector(".mensaje-flotante");
    expect(el.textContent).toContain("Pan");
    expect(el.textContent).toContain("5");
    expect(el.className).toContain("mensaje-warning");
  });
});

describe("guardarPedidoOffline", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("debe guardar el ticket en localStorage", () => {
    const result = guardarPedidoOffline("Mi pedido");
    expect(result).toBe(true);
    const cola = JSON.parse(localStorage.getItem("pedidos_pendientes"));
    expect(cola.length).toBe(1);
    expect(cola[0].ticket).toBe("Mi pedido");
  });

  it("debe agregar a la cola existente", () => {
    localStorage.setItem("pedidos_pendientes", JSON.stringify([{ ticket: "Anterior", fecha: "2024-01-01" }]));
    guardarPedidoOffline("Nuevo");
    const cola = JSON.parse(localStorage.getItem("pedidos_pendientes"));
    expect(cola.length).toBe(2);
    expect(cola[1].ticket).toBe("Nuevo");
  });
});

describe("enviarPedidoOffline", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe abrir WhatsApp si está en línea", () => {
    const openSpy = vi.fn();
    window.open = openSpy;
    enviarPedidoOffline("525511111111", "Hola");
    expect(openSpy).toHaveBeenCalledWith("https://wa.me/525511111111?text=Hola", "_blank");
  });

  it("debe guardar offline si no hay conexión", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true, writable: true });
    enviarPedidoOffline("525511111111", "Offline ticket");
    const cola = JSON.parse(localStorage.getItem("pedidos_pendientes"));
    expect(cola.length).toBe(1);
    expect(cola[0].ticket).toBe("Offline ticket");
  });
});

describe("showLoadingSkeleton", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container1"></div>
      <div id="container2"></div>
    `;
  });

  it("debe insertar skeletons en los contenedores", () => {
    showLoadingSkeleton(["container1", "container2"]);
    const c1 = document.getElementById("container1");
    const c2 = document.getElementById("container2");
    expect(c1.innerHTML).toContain("skeleton-card");
    expect(c2.innerHTML).toContain("skeleton-card");
  });

  it("debe insertar skeletons por contenedor", () => {
    showLoadingSkeleton(["container1"]);
    const c1 = document.getElementById("container1");
    const skeletons = c1.querySelectorAll(".skeleton-card");
    expect(skeletons.length).toBe(6);
  });

  it("no debe fallar si un contenedor no existe", () => {
    expect(() => showLoadingSkeleton(["no-existe"])).not.toThrow();
  });
});

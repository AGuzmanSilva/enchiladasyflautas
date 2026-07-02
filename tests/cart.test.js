import { describe, it, expect, beforeEach } from "vitest";
import { carrito, actualizarCantidad, actualizarResumen, selectedPayment, setSelectedPayment, tieneProductosEnCarrito } from "../assets/cart.js";

function setupDOM() {
  document.body.innerHTML = `
    <div id="resumenItems">✨ Ningún producto seleccionado. Agrega cantidades con +</div>
    <div id="totalPrecio">$0</div>
    <div id="floatBtn"></div>
  `;
}

describe("carrito", () => {
  beforeEach(() => {
    carrito.clear();
    setupDOM();
  });

  it("debe estar vacío al inicio", () => {
    expect(carrito.size).toBe(0);
  });

  it("debe agregar un producto", () => {
    const card = document.createElement("div");
    card.innerHTML = '<span class="qty-number">0</span><div class="qty-wrapper"></div>';
    actualizarCantidad("Tacos", 1, 10, card);
    expect(carrito.get("Tacos").cantidad).toBe(1);
    expect(carrito.get("Tacos").precio).toBe(10);
  });

  it("debe incrementar cantidad", () => {
    const card = document.createElement("div");
    card.innerHTML = '<span class="qty-number">0</span><div class="qty-wrapper"></div>';
    actualizarCantidad("Tacos", 1, 10, card);
    actualizarCantidad("Tacos", 1, 10, card);
    expect(carrito.get("Tacos").cantidad).toBe(2);
  });

  it("debe decrementar cantidad sin ir a negativo", () => {
    const card = document.createElement("div");
    card.innerHTML = '<span class="qty-number">0</span><div class="qty-wrapper"></div>';
    actualizarCantidad("Tacos", -1, 10, card);
    expect(carrito.get("Tacos").cantidad).toBe(0);
  });

  it("debe actualizar el resumen", () => {
    const card = document.createElement("div");
    card.innerHTML = '<span class="qty-number">0</span><div class="qty-wrapper"></div>';
    actualizarCantidad("Tacos", 2, 10, card);
    actualizarResumen();
    const total = document.getElementById("totalPrecio");
    expect(total.innerText).toBe("$20");
  });
});

describe("tieneProductosEnCarrito", () => {
  beforeEach(() => {
    carrito.clear();
  });

  it("debe retornar false si el carrito está vacío", () => {
    expect(tieneProductosEnCarrito()).toBe(false);
  });

  it("debe retornar true si hay productos con cantidad > 0", () => {
    carrito.set("Tacos", { cantidad: 2, precio: 10 });
    expect(tieneProductosEnCarrito()).toBe(true);
  });

  it("debe retornar false si todos los productos tienen cantidad 0", () => {
    carrito.set("Tacos", { cantidad: 0, precio: 10 });
    carrito.set("Tostadas", { cantidad: 0, precio: 15 });
    expect(tieneProductosEnCarrito()).toBe(false);
  });
});

describe("selectedPayment", () => {
  it("debe iniciar como efectivo", () => {
    expect(selectedPayment).toBe("efectivo");
  });

  it("debe cambiar el método de pago", () => {
    setSelectedPayment("transferencia");
    expect(selectedPayment).toBe("transferencia");
  });
});

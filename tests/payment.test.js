import { describe, it, expect, beforeEach, vi } from "vitest";
import { copiarTexto, updateBankDataVisibility, setupPaymentListeners } from "../assets/payment.js";
import { setSelectedPayment } from "../assets/cart.js";

function setupDOM() {
  document.body.innerHTML = `
    <div id="bankDataContainer" class="bank-data-hidden"></div>
    <div class="payment-options">
      <div class="payment-option selected" data-payment="efectivo">
        <span class="payment-icon">💵</span> Efectivo
      </div>
      <div class="payment-option" data-payment="transferencia">
        <span class="payment-icon">🏦</span> Transferencia
      </div>
    </div>
  `;
}

describe("copiarTexto", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue() },
      writable: true,
      configurable: true
    });
    document.body.innerHTML = "";
  });

  it("debe copiar el texto al portapapeles", () => {
    copiarTexto("12345");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("12345");
  });
});

describe("updateBankDataVisibility", () => {
  const bankData = { clabe: "0123456789", tarjeta: "1111222233334444" };

  beforeEach(() => {
    setupDOM();
  });

  it("debe ocultar datos bancarios cuando el pago es efectivo", () => {
    setSelectedPayment("efectivo");
    updateBankDataVisibility(bankData);
    const container = document.getElementById("bankDataContainer");
    expect(container.className).toBe("bank-data-hidden");
    expect(container.innerHTML).toBe("");
  });

  it("debe mostrar datos bancarios cuando el pago es transferencia", () => {
    setSelectedPayment("transferencia");
    updateBankDataVisibility(bankData);
    const container = document.getElementById("bankDataContainer");
    expect(container.className).toBe("bank-data-visible");
    expect(container.innerHTML).toContain("CLABE");
    expect(container.innerHTML).toContain("0123456789");
    expect(container.innerHTML).toContain("1111222233334444");
  });

  it("debe agregar botones de copiar en los datos bancarios", () => {
    setSelectedPayment("transferencia");
    updateBankDataVisibility(bankData);
    const copyBtns = document.querySelectorAll(".copy-btn-small");
    expect(copyBtns.length).toBe(2);
  });
});

describe("setupPaymentListeners", () => {
  const bankData = { clabe: "0123456789", tarjeta: "1111222233334444" };

  beforeEach(() => {
    setSelectedPayment("efectivo");
    setupDOM();
  });

  it("debe cambiar selección al hacer clic en una opción de pago", () => {
    setupPaymentListeners(bankData);
    const transferencia = document.querySelector('[data-payment="transferencia"]');
    transferencia.click();
    expect(transferencia.classList.contains("selected")).toBe(true);
    expect(document.querySelector('[data-payment="efectivo"]').classList.contains("selected")).toBe(false);
  });
});

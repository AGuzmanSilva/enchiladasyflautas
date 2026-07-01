import { selectedPayment, setSelectedPayment } from "./cart.js";
import { mostrarMensaje } from "./ui.js";

export function copiarTexto(texto) {
  navigator.clipboard.writeText(texto).then(() => {
    mostrarMensaje("✅ Copiado: " + texto, "success", 2000);
  });
}

export function updateBankDataVisibility(bankData) {
  const container = document.getElementById("bankDataContainer");
  if (selectedPayment === "transferencia") {
    container.className = "bank-data-visible";
    const clabe = bankData.clabe;
    const tarjeta = bankData.tarjeta;
    container.innerHTML =
      '<div style="font-weight:800; margin-bottom:12px;">🏦 Datos para transferencia BBVA:</div>' +
      '<div class="bank-row"><strong>CLABE:</strong> ' + clabe + ' <button class="copy-btn-small" data-copy="' + clabe + '">Copiar</button></div>' +
      '<div class="bank-row"><strong>Tarjeta:</strong> ' + tarjeta + ' <button class="copy-btn-small" data-copy="' + tarjeta + '">Copiar</button></div>' +
      '<small style="display:block; margin-top:10px;">📌 Envía tu comprobante por este mismo WhatsApp</small>';

    container.querySelectorAll(".copy-btn-small").forEach(btn => {
      btn.addEventListener("click", () => copiarTexto(btn.dataset.copy));
    });
  } else {
    container.className = "bank-data-hidden";
    container.innerHTML = "";
  }
}

export function setupPaymentListeners(bankData) {
  document.querySelectorAll(".payment-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".payment-option").forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      setSelectedPayment(opt.getAttribute("data-payment"));
      updateBankDataVisibility(bankData);
    });
  });
}

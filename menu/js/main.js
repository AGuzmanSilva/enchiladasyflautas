import { carrito, actualizarCantidad, actualizarResumen, tieneProductosEnCarrito, selectedPayment } from "../../assets/cart.js";
import { mostrarMensaje, showLoadingSkeleton, enviarPedidoOffline } from "../../assets/ui.js";
import { setupPaymentListeners } from "../../assets/payment.js";
import { initAccordion } from "../../assets/accordion.js";
import { createProductCardHTML, bindQtyButtons, setupEnviarButton } from "../../assets/product-card.js";
import { cargarJSON } from "../../assets/fetch.js";

const CONTAINERS = ["menu-enchiladas", "menu-flautas", "menu-bebidas"];
const CATEGORY_MAP = { enchiladas: "menu-enchiladas", flautas: "menu-flautas", bebidas: "menu-bebidas" };

(async function init() {
  try {
    const productos = await cargarJSON("../data/menu-comida.json");
    setupPaymentListeners(CONFIG.comidas.bank);

    showLoadingSkeleton(CONTAINERS);

    function renderMenu() {
      CONTAINERS.forEach(id => document.getElementById(id).innerHTML = "");

      productos.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        const item = carrito.get(prod.nombre);
        const cantidad = item ? item.cantidad : 0;

        card.innerHTML = createProductCardHTML(prod, cantidad);
        if (cantidad > 0) card.classList.add("selected");

        bindQtyButtons(card, prod, actualizarCantidad);
        document.getElementById(CATEGORY_MAP[prod.categoria]).appendChild(card);
      });
    }

    function enviarPedido() {
      const telefono = CONFIG.comidas.whatsapp;
      const nombre = document.getElementById("clienteNombre").value.trim();
      const direccion = document.getElementById("clienteDireccion").value.trim();
      const notas = document.getElementById("notas").value.trim();

      if (!nombre) { mostrarMensaje("📝 Por favor ingresa tu nombre.", "warning", 3000); return; }
      if (!direccion) { mostrarMensaje("📍 Ingresa la dirección de entrega.", "warning", 3000); return; }

      const productosList = [];
      let totalGeneral = 0;

      carrito.forEach((data, nombreProd) => {
        if (data.cantidad > 0) {
          productosList.push(data.cantidad + "x " + nombreProd + " = $" + (data.cantidad * data.precio));
          totalGeneral += data.cantidad * data.precio;
        }
      });

      if (productosList.length === 0) { mostrarMensaje("🍽️ Selecciona al menos un producto del menú.", "warning", 3000); return; }

      let ticket = "🍽️ *NUEVO PEDIDO - ENCHILADAS Y FLAUTAS* 🍽️%0A%0A";
      ticket += "👤 *Cliente:* " + nombre + "%0A";
      ticket += "📍 *Dirección:* " + direccion + "%0A";
      ticket += "📦 *Pedido:*%0A";
      productosList.forEach(p => { ticket += "• " + p + "%0A"; });
      ticket += "💰 *Total:* $" + totalGeneral + "%0A";
      ticket += "*Pago:* " + (selectedPayment === "transferencia" ? "Transferencia" : "Efectivo") + "%0A";
      if (notas) ticket += "📝 *Notas:* " + notas + "%0A";
      ticket += "%0A🙏 ¡Gracias por su preferencia! Envío a domicilio sin costo (la propina para el repartidor es voluntaria, lo que usted considere).";

      enviarPedidoOffline(telefono, ticket);
    }

    setupEnviarButton(enviarPedido);
    renderMenu();
    initAccordion();

    const switchLink = document.querySelector("[data-nav-switch]");
    const modal = document.getElementById("modalCambioMenu");
    const cancelBtn = document.getElementById("modalCancelar");
    const confirmBtn = document.getElementById("modalConfirmar");
    let pendingHref = "";

    if (switchLink && modal) {
      switchLink.addEventListener("click", e => {
        if (tieneProductosEnCarrito()) {
          e.preventDefault();
          pendingHref = switchLink.href;
          modal.classList.add("active");
        }
      });

      cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
      confirmBtn.addEventListener("click", () => { window.location.href = pendingHref; });
      modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("active"); });
    }
  } catch {
    mostrarMensaje("Error al cargar el menú. Verifica tu conexión.", "error", 5000);
  }
})();

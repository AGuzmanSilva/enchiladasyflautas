(function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideDownMensaje { from { opacity: 0; transform: translateX(-50%) translateY(-30px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes slideUpMensaje { from { opacity: 1; transform: translateX(-50%) translateY(0); } to { opacity: 0; transform: translateX(-50%) translateY(-30px); } }
    .mensaje-icono { font-size: 1.5rem; flex-shrink: 0; }
    .mensaje-texto { flex: 1; }
    .mensaje-cerrar { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0 4px; line-height: 1; }
    .skeleton-card { background: linear-gradient(90deg, #f0ece6 25%, #f8f6f2 50%, #f0ece6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 20px; height: 100px; margin-bottom: 16px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `;
  document.head.appendChild(style);
})();

export function mostrarMensaje(mensaje, tipo = "warning", duracion = 3000) {
  const mensajeAnterior = document.querySelector(".mensaje-flotante");
  if (mensajeAnterior) mensajeAnterior.remove();

  const mensajeDiv = document.createElement("div");
  mensajeDiv.className = "mensaje-flotante mensaje-" + tipo;

  const iconos = { warning: "⚠️", success: "✅", error: "❌", info: "ℹ️" };
  mensajeDiv.innerHTML = '<span class="mensaje-icono">' + (iconos[tipo] || "ℹ️") + '</span><span class="mensaje-texto">' + mensaje + '</span><button class="mensaje-cerrar">✕</button>';

  const colores = {
    warning: { bg: "#fff3cd", border: "#ffc107", text: "#856404" },
    success: { bg: "#d4edda", border: "#28a745", text: "#155724" },
    error: { bg: "#f8d7da", border: "#dc3545", text: "#721c24" },
    info: { bg: "#d1ecf1", border: "#17a2b8", text: "#0c5460" }
  };
  const color = colores[tipo] || colores.warning;

  mensajeDiv.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:" + color.bg + ";border:2px solid " + color.border + ";border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 25px rgba(0,0,0,0.15);z-index:9999;max-width:90%;animation:slideDownMensaje 0.4s ease;font-family:'Inter',sans-serif;font-size:0.95rem;color:" + color.text + ";font-weight:500;";

  document.body.appendChild(mensajeDiv);

  mensajeDiv.querySelector(".mensaje-cerrar").addEventListener("click", () => {
    mensajeDiv.style.animation = "slideUpMensaje 0.3s ease forwards";
    setTimeout(() => mensajeDiv.remove(), 300);
  });

  if (duracion > 0) {
    setTimeout(() => {
      if (document.body.contains(mensajeDiv)) {
        mensajeDiv.style.animation = "slideUpMensaje 0.3s ease forwards";
        setTimeout(() => mensajeDiv.remove(), 300);
      }
    }, duracion);
  }
}

export function mostrarMensajeLimite(opcionNombre, maxCantidad) {
  mostrarMensaje("Solo puedes agregar máximo " + maxCantidad + ' de "' + opcionNombre + '"', "warning", 3000);
}

export function guardarPedidoOffline(ticket) {
  try {
    const cola = JSON.parse(localStorage.getItem("pedidos_pendientes") || "[]");
    cola.push({ ticket, fecha: new Date().toISOString() });
    localStorage.setItem("pedidos_pendientes", JSON.stringify(cola));
    mostrarMensaje("📡 Sin conexión. Tu pedido se guardó y se enviará cuando tengas internet.", "info", 5000);
    return true;
  } catch {
    mostrarMensaje("Error al guardar el pedido offline.", "error", 3000);
    return false;
  }
}

export function enviarPedidoOffline(telefono, ticket) {
  if (navigator.onLine) {
    window.open("https://wa.me/" + telefono + "?text=" + ticket, "_blank");
  } else {
    guardarPedidoOffline(ticket);
  }
}

export function showLoadingSkeleton(containerIds) {
  containerIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>'.repeat(3);
    }
  });
}

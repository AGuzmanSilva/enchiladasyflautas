export const carrito = new Map();
export let selectedPayment = "efectivo";

export function setSelectedPayment(value) {
  selectedPayment = value;
}

export function tieneProductosEnCarrito() {
  for (const [, data] of carrito) {
    if (data.cantidad > 0) return true;
  }
  return false;
}

export function actualizarResumen() {
  const resumenDiv = document.getElementById("resumenItems");
  const totalSpan = document.getElementById("totalPrecio");
  let itemsHtml = "";
  let total = 0;

  carrito.forEach((data, nombre) => {
    if (data.cantidad > 0) {
      let subtotal = data.cantidad * data.precio;
      let opcionesText = "";
      let opcionesTotal = 0;

      if (data.opciones) {
        Object.keys(data.opciones).forEach(tipo => {
          data.opciones[tipo].forEach(opcion => {
            const subtotalOpcion = opcion.cantidad * opcion.precio;
            opcionesTotal += subtotalOpcion;
            opcionesText += '<br><span style="font-size:0.8rem;color:#7a5f4a;margin-left:20px;">↳ ' + opcion.cantidad + 'x ' + opcion.nombre + ' (+$' + subtotalOpcion + ')</span>';
          });
        });
      }

      const totalItem = subtotal + opcionesTotal;
      itemsHtml += '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><div><span style="font-weight:600;">' + data.cantidad + 'x ' + nombre + '</span>' + opcionesText + '</div><div><span style="font-weight:600;">$' + data.precio + '</span></div><span style="font-weight:600;">$' + totalItem + '</span></div>';
      total += totalItem;
    }
  });

  resumenDiv.innerHTML = itemsHtml === "" ? "✨ Ningún producto seleccionado. Agrega cantidades con +" : itemsHtml;
  totalSpan.innerText = "$" + total;

  const floatBtn = document.getElementById("floatBtn");
  if (floatBtn) {
    floatBtn.classList.toggle("visible", total > 0);
  }
}

export function actualizarCantidad(nombre, delta, precio, cardElement) {
  const item = carrito.get(nombre) || { cantidad: 0, precio: precio };
  let nuevaCant = item.cantidad + delta;
  if (nuevaCant < 0) nuevaCant = 0;
  item.cantidad = nuevaCant;
  carrito.set(nombre, item);

  const qtySpan = cardElement.querySelector(".qty-number");
  qtySpan.innerText = nuevaCant;

  cardElement.classList.toggle("selected", nuevaCant > 0);

  let subtotalDiv = cardElement.querySelector(".subtotal-indicator");
  if (nuevaCant > 0) {
    if (subtotalDiv) {
      subtotalDiv.innerText = "Subtotal: $" + (nuevaCant * precio);
    } else {
      const wrapper = cardElement.querySelector(".qty-wrapper");
      const newSub = document.createElement("div");
      newSub.className = "subtotal-indicator";
      newSub.innerText = "Subtotal: $" + (nuevaCant * precio);
      wrapper.appendChild(newSub);
    }
  } else {
    if (subtotalDiv) subtotalDiv.remove();
  }

  actualizarResumen();
}

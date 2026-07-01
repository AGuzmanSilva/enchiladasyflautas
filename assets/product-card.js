export function createProductCardHTML(prod, cantidad) {
  const imgHtml = prod.imagen
    ? '<div class="product-img-wrapper"><img class="product-img" src="' + prod.imagen + '" alt="' + prod.nombre + '" loading="lazy"></div>'
    : '';
  return (
    '<div class="product-main">' +
      imgHtml +
      '<div class="product-info">' +
        '<div class="product-name">' + prod.nombre + (prod.tag ? '<span class="product-tag">' + prod.tag + '</span>' : "") + '</div>' +
        '<div class="product-desc">' + prod.descripcion + '</div>' +
      '</div>' +
      '<div class="product-price">$' + prod.precio + '</div>' +
    '</div>' +
    '<div class="qty-wrapper">' +
      '<div class="qty-controls">' +
        '<button class="qty-btn minus">−</button>' +
        '<span class="qty-number">' + cantidad + '</span>' +
        '<button class="qty-btn plus">+</button>' +
      '</div>' +
      (cantidad > 0 ? '<div class="subtotal-indicator">Subtotal: $' + (cantidad * prod.precio) + '</div>' : "") +
    '</div>'
  );
}

export function bindQtyButtons(card, prod, actualizarFn) {
  const minusBtn = card.querySelector(".minus");
  const plusBtn = card.querySelector(".plus");

  minusBtn.addEventListener("click", e => {
    e.stopPropagation();
    actualizarFn(prod.nombre, -1, prod.precio, card);
  });

  plusBtn.addEventListener("click", e => {
    e.stopPropagation();
    actualizarFn(prod.nombre, 1, prod.precio, card);
  });
}

export function setupEnviarButton(submitFn) {
  document.getElementById("enviarPedidoBtn").addEventListener("click", submitFn);
  const floatBtn = document.getElementById("floatBtn");
  if (floatBtn) floatBtn.addEventListener("click", submitFn);
}

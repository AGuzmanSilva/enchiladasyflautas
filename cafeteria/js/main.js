import { carrito, selectedPayment, actualizarResumen } from "../../assets/cart.js";
import { mostrarMensaje, mostrarMensajeLimite, showLoadingSkeleton, enviarPedidoOffline } from "../../assets/ui.js";
import { setupPaymentListeners } from "../../assets/payment.js";
import { initAccordion } from "../../assets/accordion.js";
import { setupEnviarButton } from "../../assets/product-card.js";
import { cargarJSON } from "../../assets/fetch.js";

const CONTAINERS = ["menu-calientes", "menu-frios", "menu-panes", "menu-extras"];
const CATEGORY_MAP = { calientes: "menu-calientes", frios: "menu-frios", panes: "menu-panes", extras: "menu-extras" };

let productos = [];
let productos_sabores = [];
let productos_sustitutos = [];
let productos_extra = [];
let productos_config = [];

(async function init() {
  try {
    const data = await cargarJSON("../data/menu-cafeteria.json");
    productos = data.productos;
    productos_sabores = data.sabores;
    productos_sustitutos = data.sustitutos;
    productos_extra = data.extras;
    productos_config = data.config;

    setupPaymentListeners(CONFIG.cafeteria.bank);
    showLoadingSkeleton(CONTAINERS);

    document.getElementById("count-calientes").innerText = productos.filter(p => p.categoria === "calientes").length;
    document.getElementById("count-frios").innerText = productos.filter(p => p.categoria === "frios").length;
    document.getElementById("count-panes").innerText = productos.filter(p => p.categoria === "panes").length;
    document.getElementById("count-extras").innerText = productos.filter(p => p.categoria === "extras").length;

    const actualizarCantidad = (nombre, delta, precio, cardElement) => {
      const item = carrito.get(nombre) || { cantidad: 0, precio: precio, opciones: {} };
      let nuevaCant = (item.cantidad || 0) + delta;

      if (delta > 0) {
        const maximo = getMaximoProducto(nombre);
        if (maximo && nuevaCant > maximo) {
          mostrarMensaje("Solo puedes agregar máximo " + maximo + ' de "' + nombre + '"', "warning", 3000);
          return;
        }
      }

      if (nuevaCant < 0) nuevaCant = 0;
      item.cantidad = nuevaCant;
      carrito.set(nombre, item);

      const qtySpan = cardElement.querySelector(".qty-number");
      qtySpan.innerText = nuevaCant;
      actualizarBotonPersonalizar(cardElement, nuevaCant);

      if (nuevaCant > 0) {
        cardElement.classList.add("selected");
        if (delta > 0) mostrarMensaje("Agregaste " + nombre + " al carrito", "success", 1500);
      } else {
        cardElement.classList.remove("selected");
        if (delta < 0) mostrarMensaje("Eliminaste " + nombre + " del carrito", "info", 1500);
        item.opciones = {};
        carrito.set(nombre, item);
        actualizarUIopciones(cardElement);
      }

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
    };

    function getOpcionesProducto(nombreProducto) {
      const prod = productos.find(p => p.nombre === nombreProducto);
      return prod && prod.opciones ? prod.opciones : null;
    }

    function getOpcionesDisponibles(nombreProducto) {
      const opciones = getOpcionesProducto(nombreProducto);
      if (!opciones) return {};
      const disponibles = {};
      if (opciones.productos_sabores) disponibles.productos_sabores = productos_sabores;
      if (opciones.productos_sustitutos) disponibles.productos_sustitutos = productos_sustitutos;
      if (opciones.productos_extra) disponibles.productos_extra = productos_extra;
      return disponibles;
    }

    function getConfiguracionExtra(tipo) {
      return productos_config.find(c => c.nombre === tipo);
    }

    function getMaximoProducto(nombreProducto) {
      const prod = productos.find(p => p.nombre === nombreProducto);
      return prod && prod.maximo ? prod.maximo : null;
    }

    function actualizarBotonPersonalizar(cardElement, cantidad) {
      const toggleBtn = cardElement.querySelector(".toggle-opciones-btn");
      if (!toggleBtn) return;
      toggleBtn.style.display = cantidad > 0 ? "inline-block" : "none";
      if (cantidad === 0) {
        const opcionesDiv = cardElement.querySelector(".opciones-extra");
        if (opcionesDiv) {
          opcionesDiv.classList.remove("show");
          const arrow = toggleBtn.querySelector(".arrow");
          if (arrow) arrow.classList.remove("open");
        }
      }
    }

    function crearOpcionHTML(prod, tipo, opcion, opcionesSeleccionadas, esOptions, esCheckbox) {
      const opcionData = opcionesSeleccionadas.find(o => o.nombre === opcion.nombre);
      const cantidadOpcion = opcionData ? opcionData.cantidad : 0;
      const subtotalOpcion = cantidadOpcion * opcion.precio;
      const maxCantidad = opcion.cantidad || 1;
      const isSelected = cantidadOpcion > 0;

      const base =
        '<div class="opcion-item ' + (isSelected ? "selected" : "") + '" data-producto="' + prod.nombre + '" data-tipo="' + tipo + '" data-opcion="' + opcion.nombre + '" data-precio="' + opcion.precio + '" data-max="' + maxCantidad + '">' +
          '<div class="opcion-left">' +
            '<div class="' + (esOptions ? "custom-radio" : "custom-checkbox") + '"></div>' +
            '<div class="opcion-info">' +
              '<span class="opcion-nombre">' + opcion.nombre + '</span>' +
              '<span class="opcion-desc">' + opcion.descripcion + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<span class="opcion-precio">+$' + opcion.precio + '</span>' +
            (isSelected
              ? '<div class="opcion-controls">' +
                  '<button class="opcion-btn minus-opcion" data-producto="' + prod.nombre + '" data-tipo="' + tipo + '" data-opcion="' + opcion.nombre + '" data-precio="' + opcion.precio + '">−</button>' +
                  '<span class="opcion-cantidad">' + cantidadOpcion + '</span>' +
                  '<button class="opcion-btn plus-opcion" data-producto="' + prod.nombre + '" data-tipo="' + tipo + '" data-opcion="' + opcion.nombre + '" data-precio="' + opcion.precio + '">+</button>' +
                '</div>' +
                '<span class="opcion-total">$' + subtotalOpcion + '</span>'
              : '<span class="max-indicator">Máx: ' + maxCantidad + '</span>'
            ) +
          '</div>' +
        '</div>';

      return base;
    }

    function renderMenu() {
      CONTAINERS.forEach(id => document.getElementById(id).innerHTML = "");

      productos.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-name", prod.nombre);

        const item = carrito.get(prod.nombre) || { cantidad: 0, precio: prod.precio, opciones: {} };
        const cantidadActual = item.cantidad || 0;
        if (cantidadActual > 0) card.classList.add("selected");

        let opcionesHtml = "";
        const opcionesDisponibles = getOpcionesDisponibles(prod.nombre);
        const hasOpciones = Object.keys(opcionesDisponibles).length > 0;

        if (hasOpciones) {
          let opcionesContent = "";
          Object.keys(opcionesDisponibles).forEach(tipo => {
            const lista = opcionesDisponibles[tipo];
            const config = getConfiguracionExtra(tipo);
            const esOptions = config && config.tipo === "options";
            const esCheckbox = config && config.tipo === "checkbox";
            const tipoLabel = tipo === "productos_sabores" ? "🍯 Sabores (elige uno)"
              : tipo === "productos_sustitutos" ? "🥛 Sustitutos de leche"
              : "➕ Extras";

            opcionesContent += '<div class="opcion-categoria"><span class="opcion-categoria-title">' + tipoLabel + '</span>';

            const opcionesSeleccionadas = item.opciones && item.opciones[tipo] ? item.opciones[tipo] : [];
            lista.forEach(opcion => {
              opcionesContent += crearOpcionHTML(prod, tipo, opcion, opcionesSeleccionadas, esOptions, esCheckbox);
            });
            opcionesContent += '</div>';
          });

          opcionesHtml =
            '<button class="toggle-opciones-btn" data-producto="' + prod.nombre + '" style="display:none;">' +
              '<span class="arrow">▶</span> ¿Quieres personalizar tu bebida?' +
            '</button>' +
            '<div class="opciones-extra" data-producto="' + prod.nombre + '">' +
              opcionesContent +
            '</div>';
        }

        const maximoProducto = getMaximoProducto(prod.nombre);
        const maximoText = maximoProducto ? ' <span style="font-size:0.7rem;color:#7a5f4a;font-weight:400;">(Máx: ' + maximoProducto + ')</span>' : "";

        const imgHtml = prod.imagen
          ? '<div class="product-img-wrapper"><img class="product-img" src="' + prod.imagen + '" alt="' + prod.nombre + '" loading="lazy"></div>'
          : '';

        card.innerHTML =
          '<div class="product-main">' +
            imgHtml +
            '<div class="product-info">' +
              '<div class="product-name">' + prod.nombre + (prod.tag ? '<span class="product-tag">' + prod.tag + '</span>' : "") + maximoText + '</div>' +
              '<div class="product-desc">' + prod.descripcion + '</div>' +
            '</div>' +
            '<div class="product-price">$' + prod.precio + '</div>' +
          '</div>' +
          '<div class="qty-wrapper">' +
            '<div class="qty-controls">' +
              '<button class="qty-btn minus">−</button>' +
              '<span class="qty-number">' + cantidadActual + '</span>' +
              '<button class="qty-btn plus">+</button>' +
            '</div>' +
            (cantidadActual > 0 ? '<div class="subtotal-indicator">Subtotal: $' + (cantidadActual * prod.precio) + '</div>' : "") +
          '</div>' +
          opcionesHtml;

        actualizarBotonPersonalizar(card, cantidadActual);

        const minusBtn = card.querySelector(".minus");
        const plusBtn = card.querySelector(".plus");

        minusBtn.addEventListener("click", e => {
          e.stopPropagation();
          actualizarCantidad(prod.nombre, -1, prod.precio, card);
        });

        plusBtn.addEventListener("click", e => {
          e.stopPropagation();
          const maximo = getMaximoProducto(prod.nombre);
          const itemActual = carrito.get(prod.nombre) || { cantidad: 0 };
          if (maximo && (itemActual.cantidad || 0) >= maximo) {
            mostrarMensaje("Solo puedes agregar máximo " + maximo + ' de "' + prod.nombre + '"', "warning", 3000);
            return;
          }
          actualizarCantidad(prod.nombre, 1, prod.precio, card);
        });

        if (hasOpciones) {
          const toggleBtn = card.querySelector(".toggle-opciones-btn");
          const opcionesDiv = card.querySelector(".opciones-extra");

          toggleBtn.addEventListener("click", e => {
            e.stopPropagation();
            opcionesDiv.classList.toggle("show");
            toggleBtn.querySelector(".arrow").classList.toggle("open");
          });

          opcionesDiv.querySelectorAll(".opcion-item").forEach(itemDiv => {
            itemDiv.addEventListener("click", function(e) {
              if (e.target.closest(".opcion-btn")) return;

              const producto = this.dataset.producto;
              const tipo = this.dataset.tipo;
              const opcionNombre = this.dataset.opcion;
              const precio = parseFloat(this.dataset.precio);
              const maxCantidad = parseInt(this.dataset.max) || 1;
              const cardElement = this.closest(".product-card");
              const isRadio = this.querySelector(".custom-radio") !== null;
              const isCheckbox = this.querySelector(".custom-checkbox") !== null;
              const cartItem = carrito.get(producto) || { cantidad: 0, precio: 0, opciones: {} };

              if (isRadio) {
                if (this.classList.contains("selected")) return;

                const parentCategoria = this.closest(".opcion-categoria");
                if (parentCategoria) {
                  parentCategoria.querySelectorAll(".opcion-item").forEach(el => {
                    if (el !== itemDiv && el.dataset.tipo === tipo) {
                      const radioItem = carrito.get(producto) || { cantidad: 0, precio: 0, opciones: {} };
                      if (radioItem.opciones[tipo]) {
                        radioItem.opciones[tipo] = radioItem.opciones[tipo].filter(o => o.nombre !== el.dataset.opcion);
                        if (radioItem.opciones[tipo].length === 0) delete radioItem.opciones[tipo];
                        carrito.set(producto, radioItem);
                      }
                      el.classList.remove("selected");
                      const container = el.querySelector('div[style*="display:flex"]');
                      if (container) {
                        const controls = container.querySelector(".opcion-controls");
                        if (controls) controls.remove();
                        const total = container.querySelector(".opcion-total");
                        if (total) total.remove();
                        if (!container.querySelector(".max-indicator")) {
                          const maxSpan = document.createElement("span");
                          maxSpan.className = "max-indicator";
                          maxSpan.textContent = "Máx: " + (el.dataset.max || 1);
                          container.appendChild(maxSpan);
                        }
                      }
                    }
                  });
                }

                this.classList.add("selected");
                actualizarOpcion(producto, tipo, opcionNombre, 1, precio, cardElement);

                const container = this.querySelector('div[style*="display:flex"]');
                if (container) {
                  const maxIndicator = container.querySelector(".max-indicator");
                  if (maxIndicator) maxIndicator.remove();
                  if (!container.querySelector(".opcion-controls")) {
                    const controls = document.createElement("div");
                    controls.className = "opcion-controls";
                    controls.innerHTML =
                      '<button class="opcion-btn minus-opcion" data-producto="' + producto + '" data-tipo="' + tipo + '" data-opcion="' + opcionNombre + '" data-precio="' + precio + '">−</button>' +
                      '<span class="opcion-cantidad">1</span>' +
                      '<button class="opcion-btn plus-opcion" data-producto="' + producto + '" data-tipo="' + tipo + '" data-opcion="' + opcionNombre + '" data-precio="' + precio + '">+</button>';
                    const totalSpan = container.querySelector(".opcion-total");
                    if (totalSpan) {
                      container.insertBefore(controls, totalSpan);
                    } else {
                      container.appendChild(controls);
                      const newTotal = document.createElement("span");
                      newTotal.className = "opcion-total";
                      newTotal.textContent = "$" + precio;
                      container.appendChild(newTotal);
                    }
                    controls.querySelectorAll(".opcion-btn").forEach(btn => {
                      btn.addEventListener("click", function(e) {
                        e.stopPropagation();
                        const delta = btn.classList.contains("plus-opcion") ? 1 : -1;
                        actualizarOpcion(producto, tipo, opcionNombre, delta, precio, cardElement);
                      });
                    });
                  }
                }
              } else if (isCheckbox) {
                if (!this.classList.contains("selected")) {
                  const opcionData = cartItem.opciones && cartItem.opciones[tipo] ? cartItem.opciones[tipo].find(o => o.nombre === opcionNombre) : null;
                  if (opcionData && opcionData.cantidad >= maxCantidad) {
                    mostrarMensajeLimite(opcionNombre, maxCantidad);
                    return;
                  }
                  this.classList.add("selected");
                  actualizarOpcion(producto, tipo, opcionNombre, 1, precio, cardElement);

                  const container = this.querySelector('div[style*="display:flex"]');
                  if (container) {
                    const maxIndicator = container.querySelector(".max-indicator");
                    if (maxIndicator) maxIndicator.remove();
                    if (!container.querySelector(".opcion-controls")) {
                      const controls = document.createElement("div");
                      controls.className = "opcion-controls";
                      controls.innerHTML =
                        '<button class="opcion-btn minus-opcion" data-producto="' + producto + '" data-tipo="' + tipo + '" data-opcion="' + opcionNombre + '" data-precio="' + precio + '">−</button>' +
                        '<span class="opcion-cantidad">1</span>' +
                        '<button class="opcion-btn plus-opcion" data-producto="' + producto + '" data-tipo="' + tipo + '" data-opcion="' + opcionNombre + '" data-precio="' + precio + '">+</button>';
                      const totalSpan = container.querySelector(".opcion-total");
                      if (totalSpan) {
                        container.insertBefore(controls, totalSpan);
                      } else {
                        container.appendChild(controls);
                        const newTotal = document.createElement("span");
                        newTotal.className = "opcion-total";
                        newTotal.textContent = "$" + precio;
                        container.appendChild(newTotal);
                      }
                      controls.querySelectorAll(".opcion-btn").forEach(btn => {
                        btn.addEventListener("click", function(e) {
                          e.stopPropagation();
                          const delta = btn.classList.contains("plus-opcion") ? 1 : -1;
                          actualizarOpcion(producto, tipo, opcionNombre, delta, precio, cardElement);
                        });
                      });
                    }
                  }
                } else {
                  this.classList.remove("selected");
                  const item = carrito.get(producto) || { cantidad: 0, precio: 0, opciones: {} };
                  if (item.opciones[tipo]) {
                    item.opciones[tipo] = item.opciones[tipo].filter(o => o.nombre !== opcionNombre);
                    if (item.opciones[tipo].length === 0) delete item.opciones[tipo];
                    carrito.set(producto, item);
                  }
                  const container = this.querySelector('div[style*="display:flex"]');
                  if (container) {
                    const controls = container.querySelector(".opcion-controls");
                    if (controls) controls.remove();
                    const totalSpan = container.querySelector(".opcion-total");
                    if (totalSpan) totalSpan.remove();
                    if (!container.querySelector(".max-indicator")) {
                      const maxSpan = document.createElement("span");
                      maxSpan.className = "max-indicator";
                      maxSpan.textContent = "Máx: " + maxCantidad;
                      container.appendChild(maxSpan);
                    }
                  }
                  actualizarResumen();
                }
              }
            });
          });
        }

        document.getElementById(CATEGORY_MAP[prod.categoria]).appendChild(card);
      });
    }

    function actualizarUIopciones(cardElement) {
      const opcionesDiv = cardElement.querySelector(".opciones-extra");
      if (!opcionesDiv) return;
      opcionesDiv.querySelectorAll(".opcion-cantidad").forEach(span => { span.innerText = "0"; });
      opcionesDiv.querySelectorAll(".opcion-total").forEach(el => el.remove());
      opcionesDiv.querySelectorAll(".custom-radio").forEach(radio => { radio.checked = false; });
      opcionesDiv.querySelectorAll(".custom-checkbox").forEach(checkbox => {
        const itemDiv = checkbox.closest(".opcion-item");
        if (itemDiv) {
          const controls = itemDiv.querySelector(".opcion-controls");
          if (controls) controls.remove();
          const total = itemDiv.querySelector(".opcion-total");
          if (total) total.remove();
          const maxCantidad = parseInt(itemDiv.dataset.max) || 1;
          if (!itemDiv.querySelector(".max-indicator")) {
            const maxSpan = document.createElement("span");
            maxSpan.className = "max-indicator";
            maxSpan.textContent = "Máx: " + maxCantidad;
            const container = itemDiv.querySelector('div[style*="display:flex"]');
            if (container) {
              const oldMax = container.querySelector(".max-indicator");
              if (oldMax) oldMax.remove();
              container.appendChild(maxSpan);
            }
          }
        }
      });
    }

    function actualizarOpcion(nombreProducto, tipo, opcionNombre, delta, precio, cardElement) {
      const item = carrito.get(nombreProducto) || { cantidad: 0, precio: 0, opciones: {} };

      if (item.cantidad === 0 && delta > 0) {
        mostrarMensaje("Primero agrega el producto principal antes de personalizarlo.", "warning", 3000);
        return;
      }

      let opcionOriginal = null;
      if (tipo === "productos_sabores") opcionOriginal = productos_sabores.find(s => s.nombre === opcionNombre);
      else if (tipo === "productos_sustitutos") opcionOriginal = productos_sustitutos.find(s => s.nombre === opcionNombre);
      else if (tipo === "productos_extra") opcionOriginal = productos_extra.find(s => s.nombre === opcionNombre);

      const maxCantidad = opcionOriginal ? opcionOriginal.cantidad : 1;

      if (!item.opciones[tipo]) item.opciones[tipo] = [];
      let opcionExistente = item.opciones[tipo].find(o => o.nombre === opcionNombre);

      if (!opcionExistente && delta > 0) {
        opcionExistente = { nombre: opcionNombre, cantidad: 0, precio: precio };
        item.opciones[tipo].push(opcionExistente);
      }

      if (opcionExistente) {
        const nuevaCant = opcionExistente.cantidad + delta;
        if (nuevaCant > maxCantidad) {
          mostrarMensajeLimite(opcionNombre, maxCantidad);
          return;
        }
        if (nuevaCant < 0) {
          item.opciones[tipo] = item.opciones[tipo].filter(o => o.nombre !== opcionNombre);
          if (item.opciones[tipo].length === 0) delete item.opciones[tipo];
        } else {
          opcionExistente.cantidad = nuevaCant;
        }
        carrito.set(nombreProducto, item);
      }

      const opcionesDiv = cardElement.querySelector(".opciones-extra");
      if (opcionesDiv) {
        opcionesDiv.querySelectorAll(".opcion-item").forEach(itemDiv => {
          const nombreSpan = itemDiv.querySelector(".opcion-nombre");
          if (nombreSpan && nombreSpan.textContent === opcionNombre) {
            const cantidadSpan = itemDiv.querySelector(".opcion-cantidad");
            const totalSpan = itemDiv.querySelector(".opcion-total");
            const nuevaCantVal = opcionExistente ? opcionExistente.cantidad : 0;

            if (cantidadSpan) cantidadSpan.innerText = nuevaCantVal;

            const container = itemDiv.querySelector('div[style*="display:flex"]');
            if (container) {
              if (nuevaCantVal === 0) {
                itemDiv.classList.remove("selected");
                const controls = container.querySelector(".opcion-controls");
                if (controls) controls.remove();
                if (totalSpan) totalSpan.remove();
                if (!container.querySelector(".max-indicator")) {
                  const maxSpan = document.createElement("span");
                  maxSpan.className = "max-indicator";
                  maxSpan.textContent = "Máx: " + maxCantidad;
                  container.appendChild(maxSpan);
                }
              } else {
                itemDiv.classList.add("selected");
                if (totalSpan) {
                  totalSpan.textContent = "$" + (nuevaCantVal * precio);
                } else {
                  const newTotal = document.createElement("span");
                  newTotal.className = "opcion-total";
                  newTotal.textContent = "$" + (nuevaCantVal * precio);
                  container.appendChild(newTotal);
                }

                if (!container.querySelector(".opcion-controls")) {
                  const controls = document.createElement("div");
                  controls.className = "opcion-controls";
                  controls.innerHTML =
                    '<button class="opcion-btn minus-opcion" data-producto="' + nombreProducto + '" data-tipo="' + tipo + '" data-opcion="' + opcionNombre + '" data-precio="' + precio + '">−</button>' +
                    '<span class="opcion-cantidad">' + nuevaCantVal + '</span>' +
                    '<button class="opcion-btn plus-opcion" data-producto="' + nombreProducto + '" data-tipo="' + tipo + '" data-opcion="' + opcionNombre + '" data-precio="' + precio + '">+</button>';
                  const totalSpanInContainer = container.querySelector(".opcion-total");
                  if (totalSpanInContainer) {
                    container.insertBefore(controls, totalSpanInContainer);
                  } else {
                    container.appendChild(controls);
                  }
                  controls.querySelectorAll(".opcion-btn").forEach(btn => {
                    btn.addEventListener("click", function(e) {
                      e.stopPropagation();
                      const deltaBtn = btn.classList.contains("plus-opcion") ? 1 : -1;
                      actualizarOpcion(nombreProducto, tipo, opcionNombre, deltaBtn, precio, cardElement);
                    });
                  });
                }
              }
            }
          }
        });
      }

      actualizarResumen();
    }

    function enviarPedido() {
      const telefono = CONFIG.cafeteria.whatsapp;
      const nombre = document.getElementById("clienteNombre").value.trim();
      const direccion = document.getElementById("clienteDireccion").value.trim();
      const notas = document.getElementById("notas").value.trim();

      if (!nombre) { mostrarMensaje("Favor ingresa tu nombre.", "warning", 3000); return; }
      if (!direccion) { mostrarMensaje("Ingresa la dirección de entrega.", "warning", 3000); return; }

      const productosPedido = [];
      let totalGeneral = 0;
      let tieneProductos = false;

      carrito.forEach((data, nombreProd) => {
        if (data.cantidad > 0) {
          tieneProductos = true;
          let subtotal = data.cantidad * data.precio;
          const opcionesList = [];

          if (data.opciones) {
            Object.keys(data.opciones).forEach(tipo => {
              data.opciones[tipo].forEach(opcion => {
                const subtotalOpcion = opcion.cantidad * opcion.precio;
                subtotal += subtotalOpcion;
                opcionesList.push({ nombre: opcion.nombre, cantidad: opcion.cantidad, precio: opcion.precio, subtotal: subtotalOpcion });
              });
            });
          }

          productosPedido.push({ nombre: nombreProd, cantidad: data.cantidad, precioUnitario: data.precio, subtotal: subtotal, opciones: opcionesList });
          totalGeneral += subtotal;
        }
      });

      if (!tieneProductos) { mostrarMensaje("🍽️ Selecciona al menos un producto del menú.", "warning", 3000); return; }

      const fecha = new Date();
      const fechaFormateada = fecha.toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

      let ticket = "";
      ticket += "╔══════════════════════════════╗%0A";
      ticket += "║    ☕ CAFETERÍA GICHI ☕     ║%0A";
      ticket += "╚══════════════════════════════╝%0A";
      ticket += "%0A";
      ticket += "🕐 *" + fechaFormateada + "*%0A";
      ticket += "👤 *Cliente:* " + nombre + "%0A";
      ticket += "📍 *Dirección:* " + direccion + "%0A%0A";
      ticket += "📦 *PEDIDO:*%0A";
      ticket += "──────────────────────────%0A";

      productosPedido.forEach(p => {
        ticket += p.cantidad + "x " + p.nombre + " ... $" + p.subtotal + "%0A";
        if (p.opciones.length > 0) {
          p.opciones.forEach(op => {
            ticket += "   ↳ " + op.cantidad + "x " + op.nombre + " (+$" + op.subtotal + ")%0A";
          });
        }
      });

      ticket += "──────────────────────────%0A";
      ticket += "💰 *TOTAL:* $" + totalGeneral + "%0A";
      if (notas) ticket += "📝 *Notas:* " + notas + "%0A";
      ticket += "💳 *Pago:* " + (selectedPayment === "transferencia" ? "Transferencia" : "Efectivo") + "%0A%0A";
      ticket += "🙏 ¡Gracias por tu preferencia!";

      enviarPedidoOffline(telefono, ticket);
    }

    setupEnviarButton(enviarPedido);
    renderMenu();
    initAccordion();
  } catch {
    mostrarMensaje("Error al cargar el menú. Verifica tu conexión.", "error", 5000);
  }
})();

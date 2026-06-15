// Datos del menú
const productos = [
    { categoria: 'enchiladas', nombre: 'Enchiladas Poblanas', descripcion: 'Deliciosa salsa cremosa de chile poblano de la casa.', precio: 65, tag: 'Salsa' },
    { categoria: 'enchiladas', nombre: 'Enchiladas de Mole', descripcion: 'Tradicional mole artesanal de la casa.', precio: 65, tag: 'Mole' },
    { categoria: 'flautas', nombre: 'Flautas de Carne', descripcion: 'Carne de res deshebrada bien sazonada.', precio: 65, tag: 'Res' },
    { categoria: 'flautas', nombre: 'Flautas de Papa', descripcion: 'Puré de papa casero suave y terso.', precio: 65, tag: 'Papa' },
    { categoria: 'flautas', nombre: 'Flautas de Pollo', descripcion: 'Pechuga de pollo deshebrada jugosa.', precio: 65, tag: 'Pollo' },
    { categoria: 'bebidas', nombre: 'Agua de Jamaica (1L)', descripcion: 'Refrescante agua de jamaica natural.', precio: 25, tag: 'Natural' },
    { categoria: 'bebidas', nombre: 'Refresco Coca Cola 600ml', descripcion: 'Bebida carbonatada bien fría.', precio: 25, tag: 'Refresco' }
];

let carrito = new Map(); // key: nombre, value: {cantidad, precio}

function renderMenu() {
    const enchiladasDiv = document.getElementById('menu-enchiladas');
    const flautasDiv = document.getElementById('menu-flautas');
    const bebidasDiv = document.getElementById('menu-bebidas');
    
    enchiladasDiv.innerHTML = '';
    flautasDiv.innerHTML = '';
    bebidasDiv.innerHTML = '';
    
    productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-name', prod.nombre);
        const cantidadActual = carrito.get(prod.nombre)?.cantidad || 0;
        if (cantidadActual > 0) card.classList.add('selected');
        
        card.innerHTML = `
            <div class="product-main">
                <div class="product-info">
                    <div class="product-name">${prod.nombre} ${prod.tag ? `<span class="product-tag">${prod.tag}</span>` : ''}</div>
                    <div class="product-desc">${prod.descripcion}</div>
                </div>
                <div class="product-price">$${prod.precio}</div>
            </div>
            <div class="qty-wrapper">
                <div class="qty-controls">
                    <button class="qty-btn minus">−</button>
                    <span class="qty-number">${cantidadActual}</span>
                    <button class="qty-btn plus">+</button>
                </div>
                ${cantidadActual > 0 ? `<div class="subtotal-indicator">Subtotal: $${cantidadActual * prod.precio}</div>` : ''}
            </div>
        `;
        
        const minusBtn = card.querySelector('.minus');
        const plusBtn = card.querySelector('.plus');
        minusBtn.addEventListener('click', (e) => { e.stopPropagation(); actualizarCantidad(prod.nombre, -1, prod.precio, card); });
        plusBtn.addEventListener('click', (e) => { e.stopPropagation(); actualizarCantidad(prod.nombre, 1, prod.precio, card); });
        
        if (prod.categoria === 'enchiladas') enchiladasDiv.appendChild(card);
        else if (prod.categoria === 'flautas') flautasDiv.appendChild(card);
        else bebidasDiv.appendChild(card);
    });
}

function actualizarCantidad(nombre, delta, precio, cardElement) {
    let item = carrito.get(nombre) || { cantidad: 0, precio: precio };
    let nuevaCant = item.cantidad + delta;
    if (nuevaCant < 0) nuevaCant = 0;
    item.cantidad = nuevaCant;
    carrito.set(nombre, item);
    
    // Actualizar UI de esa tarjeta
    const qtySpan = cardElement.querySelector('.qty-number');
    qtySpan.innerText = nuevaCant;
    if (nuevaCant > 0) cardElement.classList.add('selected');
    else cardElement.classList.remove('selected');
    
    const subtotalDiv = cardElement.querySelector('.subtotal-indicator');
    if (nuevaCant > 0) {
        if (subtotalDiv) subtotalDiv.innerText = `Subtotal: $${nuevaCant * precio}`;
        else {
            const wrapper = cardElement.querySelector('.qty-wrapper');
            const newSub = document.createElement('div');
            newSub.className = 'subtotal-indicator';
            newSub.innerText = `Subtotal: $${nuevaCant * precio}`;
            wrapper.appendChild(newSub);
        }
    } else {
        if (subtotalDiv) subtotalDiv.remove();
    }
    actualizarResumen();
}

function actualizarResumen() {
    const resumenDiv = document.getElementById('resumenItems');
    const totalSpan = document.getElementById('totalPrecio');
    let itemsHtml = '';
    let total = 0;
    for (let [nombre, data] of carrito.entries()) {
        if (data.cantidad > 0) {
            const subtotal = data.cantidad * data.precio;
            itemsHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>${data.cantidad}x ${nombre}</span><span style="font-weight: 600;">$${subtotal}</span></div>`;
            total += subtotal;
        }
    }
    if (itemsHtml === '') resumenDiv.innerHTML = '✨ Ningún producto seleccionado. Agrega cantidades con +';
    else resumenDiv.innerHTML = itemsHtml;
    totalSpan.innerText = `$${total}`;
}

function enviarPedido() {
    const telefono = "525548383367";
    const nombre = document.getElementById('clienteNombre').value.trim();
    const direccion = document.getElementById('clienteDireccion').value.trim();
    const notas = document.getElementById('notas').value.trim();
    if (!nombre) { alert("📝 Por favor ingresa tu nombre."); return; }
    if (!direccion) { alert("📍 Ingresa la dirección de entrega."); return; }
    
    let productosPedido = [];
    let totalGeneral = 0;
    for (let [nombreProd, data] of carrito.entries()) {
        if (data.cantidad > 0) {
            productosPedido.push(`${data.cantidad}x ${nombreProd} = $${data.cantidad * data.precio}`);
            totalGeneral += data.cantidad * data.precio;
        }
    }
    if (productosPedido.length === 0) { alert("🍽️ Selecciona al menos un producto del menú."); return; }
    
    let mensaje = `🍽️ *NUEVO PEDIDO - ENCHILADAS Y FLAUTAS* 🍽️%0A%0A`;
    mensaje += `👤 *Cliente:* ${nombre}%0A`;
    mensaje += `📍 *Dirección:* ${direccion}%0A`;
    mensaje += `📦 *Pedido:*%0A${productosPedido.map(p => `• ${p}`).join('%0A')}%0A`;
    mensaje += `💰 *Total:* $${totalGeneral}%0A`;
    if (notas) mensaje += `📝 *Notas:* ${notas}%0A`;
    mensaje += `%0A🙏 ¡Gracias por su preferencia! Envío a domicilio sin costo (la propina para el repartidor es voluntaria, lo que usted considere).`;
    
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

document.getElementById('enviarPedidoBtn').addEventListener('click', enviarPedido);
document.getElementById('floatBtn').addEventListener('click', enviarPedido);

renderMenu();

// Datos bancarios
const bankData = {
    clabe: "012 180 02978589739 1",
    tarjeta: "4152 3144 0656 5161"
};

// Variables
let selectedPayment = "efectivo";
let cart = [];

// Función para mostrar/ocultar datos bancarios en el menú
function updateBankDataVisibility() {
    const container = document.getElementById('bankDataContainer');
    if (selectedPayment === "transferencia") {
        container.className = "bank-data-visible";
        container.innerHTML = `
            <div style="font-weight:800; margin-bottom:12px;">🏦 Datos para transferencia BBVA:</div>
            <div class="bank-row"><strong>CLABE:</strong> ${bankData.clabe} <button class="copy-btn-small" onclick="copiarTexto('${bankData.clabe}')">Copiar</button></div>
            <div class="bank-row"><strong>Tarjeta:</strong> ${bankData.tarjeta} <button class="copy-btn-small" onclick="copiarTexto('${bankData.tarjeta}')">Copiar</button></div>
            <small style="display:block; margin-top:10px;">📌 Envía tu comprobante por este mismo WhatsApp</small>
        `;
    } else {
        container.className = "bank-data-hidden";
        container.innerHTML = "";
    }
}

document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedPayment = opt.getAttribute('data-payment');
        updateBankDataVisibility();
    });
});

window.copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto).then(() => alert(`✅ Copiado: ${texto}`));
};

// Función para limpiar y formatear el texto SIN emojis problemáticos
function limpiarTextoParaWhatsApp(texto) {
    // Elimina emojis y caracteres especiales que causan problemas
    return texto.replace(/[^\x00-\x7F]/g, '').trim();
}

// Función para generar el mensaje SIN emojis (solo texto plano)
function generarMensajePlano(nombre, direccion, notas, resumenTexto, total) {
    let mensaje = "";
    mensaje += "NUEVO PEDIDO\n";
    mensaje += "==============================\n\n";
    mensaje += "Cliente: " + nombre + "\n";
    mensaje += "Direccion: " + direccion + "\n";
    mensaje += "Pago: " + (selectedPayment === 'efectivo' ? "Efectivo" : "Transferencia BBVA") + "\n";
    mensaje += "Notas: " + (notas || "Ninguna") + "\n\n";
    mensaje += "Pedido:\n";
    mensaje += resumenTexto + "\n";
    mensaje += "-------------------------------\n";
    mensaje += "Total: $" + total + " pesos\n\n";
    
    if (selectedPayment === 'transferencia') {
        mensaje += "DATOS PARA TRANSFERENCIA BBVA:\n";
        mensaje += "CLABE: " + bankData.clabe + "\n";
        mensaje += "Tarjeta: " + bankData.tarjeta + "\n";
        mensaje += "\nImportante: Enviar comprobante de pago a este mismo chat, al momento de la entrega.\n";
    } else {
        mensaje += "Pago en efectivo al momento de la entrega (favor de pagar con cambio).\n";
    }
    
    mensaje += "\nConfirmar disponibilidad antes de enviar.";
    return mensaje;
}

// Reemplazar el evento del botón
setTimeout(() => {
    const btn = document.getElementById('enviarPedidoBtn');
    if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            const nombre = document.getElementById('clienteNombre')?.value.trim() || '';
            const direccion = document.getElementById('clienteDireccion')?.value.trim() || '';
            const notas = document.getElementById('notas')?.value.trim() || '';
            
            const resumenDiv = document.getElementById('resumenItems');
            let resumenTexto = resumenDiv?.innerText || '';
            let totalSpan = document.getElementById('totalPrecio');
            let totalTexto = totalSpan?.innerText || '$0';
            let totalNumero = parseInt(totalTexto.replace('$', '')) || 0;
            
            if (!nombre || !direccion) {
                alert('Por favor ingresa tu nombre y direccion');
                return;
            }
            if (totalNumero === 0) {
                alert('Agrega productos a tu pedido');
                return;
            }
            
            // Limpiar el resumen de caracteres raros
            resumenTexto = resumenTexto.replace(/[^\x00-\x7F]/g, '').replace(/Ningún producto seleccionado/g, '');
            
            // Generar mensaje plano (SIN EMOJIS)
            const mensajeFinal = generarMensajePlano(nombre, direccion, notas, resumenTexto, totalNumero);
            
            // Codificar para URL
            const mensajeCodificado = encodeURIComponent(mensajeFinal);
            
            // Número de WhatsApp (cambiar por el tuyo)
            const telefono = "5548383367";
            const url = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
            
            window.open(url, '_blank');
        });
    }
}, 500);
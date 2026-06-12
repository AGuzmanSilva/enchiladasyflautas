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
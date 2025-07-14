
// Producto único mostrado
const producto = {
  id: 1,
  nombre: "Nike Air Max Excee White",
  precio: 1999.00,
  impuestos: 0.16,
  envio: 150.00,
  imagen: "img/tenis-nike-air-max-excee-white-is-CD4165-100-1.png",
  tallas: [24.5, 25, 25.5, 26, 26.5, 27, 27.5, 28, 28.5]
};

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function formatearMoneda(valor) {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function obtenerTallaSeleccionada() {
  const btns = document.querySelectorAll('.tallas .btn');
  for (const btn of btns) {
    if (btn.classList.contains('active')) {
      return btn.textContent.trim();
    }
  }
  return null;
}

function agregarAlCarrito(producto, talla, cantidad = 1) {
  const index = carrito.findIndex(item => item.id === producto.id && item.talla === talla);
  if (index > -1) {
    carrito[index].cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      impuestos: producto.impuestos,
      envio: producto.envio,
      imagen: producto.imagen,
      talla: talla,
      cantidad: cantidad
    });
  }
  guardarCarrito();
  renderCarrito();
  actualizarContadorCarrito();
}

function renderCarrito() {
  if (carrito.length === 0) {
    Swal.fire({
      title: 'Carrito',
      html: '<div class="carrito-vacio">El carrito está vacío</div>',
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      width: '700px',
      customClass: { popup: 'swal2-carrito-modal' }
    });
    return;
  }
  let html = `<div class="carrito-table-wrap"><table class="carrito-table"><tbody>`;
  let total = 0;
  let envioTotal = 0;
  carrito.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    envioTotal += item.envio;
    const imagenSrc = item.imagen;
    html += `<tr>
      <td class="carrito-td-info">
        <div class="carrito-item-row">
          <img src="${imagenSrc}" alt="" class="carrito-img">
          <div class="carrito-detalles">
            <span class="carrito-nombre">${item.nombre}</span>
            <span class="carrito-talla">Talla: ${item.talla}</span>
            <button data-index="${i}" class="carrito-eliminar-btn carrito-eliminar">Eliminar</button>
          </div>
          <input type="number" min="1" value="${item.cantidad}" data-index="${i}" class="carrito-cantidad">
        </div>
      </td>
      <td class="carrito-td-precio">
        <div class="carrito-precios">
          <div>Precio: <b>${formatearMoneda(item.precio)}</b></div>
          <div class="carrito-subtotal">Subtotal: <b>${formatearMoneda(subtotal)}</b></div>
        </div>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div><div class="carrito-envio">Costo de envío: <b>${formatearMoneda(envioTotal)}</b></div><div class="carrito-total">Total: <b>${formatearMoneda(total + envioTotal)}</b></div><div class="carrito-btns"><button id="continuar-comprando" class="carrito-btn-continuar">Continuar comprando</button><button id="finalizar-compra" class="carrito-btn-finalizar">Finalizar compra</button></div>`;
  Swal.fire({
    title: 'Carrito de compras',
    html: html,
    showConfirmButton: false,
    showCloseButton: true,
    width: '950px',
    customClass: { popup: 'swal2-carrito-modal' },
    didOpen: () => {
      document.querySelectorAll('.carrito-eliminar').forEach(btn => {
        btn.onclick = e => {
          eliminarDelCarrito(Number(btn.dataset.index));
          setTimeout(actualizarTotalesCarrito, 100);
        };
      });
      document.querySelectorAll('.carrito-cantidad').forEach(input => {
        input.oninput = e => cambiarCantidad(Number(input.dataset.index), Number(input.value));
      });
      actualizarTotalesCarrito();
      document.getElementById('finalizar-compra').onclick = finalizarCompra;
      document.getElementById('continuar-comprando').onclick = () => Swal.close();
    }
  });
}
// Actualiza los totales del carrito en el modal
function actualizarTotalesCarrito() {
  let total = 0;
  let envioTotal = 0;
  carrito.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    envioTotal += item.envio;
    // Actualiza el subtotal en la fila
    const filas = document.querySelectorAll('.carrito-cantidad');
    if (filas[i]) {
      const fila = filas[i].closest('tr');
      if (fila) {
        const subtotalDiv = fila.querySelector('.carrito-subtotal');
        if (subtotalDiv) subtotalDiv.innerHTML = `<b>${formatearMoneda(subtotal)}</b>`;
      }
    }
  });
  // Actualiza el costo de envío y total
  const envioDiv = document.querySelector('.carrito-envio');
  if (envioDiv) envioDiv.innerHTML = `Costo de envío: <b>${formatearMoneda(envioTotal)}</b>`;
  const totalDiv = document.querySelector('.carrito-total');
  if (totalDiv) totalDiv.innerHTML = `Total: <b>${formatearMoneda(total + envioTotal)}</b>`;
}

function eliminarDelCarrito(index) {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: '¿Estás seguro de que deseas eliminar este producto del carrito?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.splice(index, 1);
      guardarCarrito();
      renderCarrito();
      actualizarContadorCarrito();
    }
  });
}

function finalizarCompra() {
  if (carrito.length === 0) return;
  let resumen = '<ul class="resumen-lista">';
  let total = 0;
  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    resumen += `<li>${item.nombre} (Talla: ${item.talla}) x${item.cantidad} - ${formatearMoneda(subtotal)}</li>`;
  });
  resumen += `</ul><b>Total: ${formatearMoneda(total)}</b>`;
  Swal.fire({
    title: 'Resumen de compra',
    html: resumen,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Confirmar compra',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarrito();
      renderCarrito();
      actualizarContadorCarrito();
      Swal.fire('¡Compra realizada!', 'Gracias por tu compra. Recibirás un correo con los detalles.', 'success');
    }
  });
}

function cambiarCantidad(index, nuevaCantidad) {
  if (nuevaCantidad < 1) return;
  carrito[index].cantidad = nuevaCantidad;
  guardarCarrito();
  actualizarTotalesCarrito();
  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const count = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  const countSpan = document.querySelector('.btn-carrito-header .cart-count');
  if (countSpan) {
    if (count > 0) {
      countSpan.textContent = count;
      countSpan.classList.add('cart-count--visible');
    } else {
      countSpan.classList.remove('cart-count--visible');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Generar dinámicamente los botones de tallas
  const tallasCont = document.getElementById('tallas-producto');
  if (tallasCont && producto.tallas && Array.isArray(producto.tallas)) {
    tallasCont.innerHTML = producto.tallas.map(talla =>
      `<button class="btn btn-outline-success my-2 my-sm-0" data-bs-toggle="button" type="button">${talla}</button>`
    ).join('');
  }
  // Insertar dinámicamente la imagen principal del producto
  const imgElem = document.getElementById('img-producto-principal');
  if (imgElem) imgElem.src = producto.imagen;
  // Insertar dinámicamente nombre y precio del producto desde el objeto producto
  const nombreElem = document.getElementById('nombre-producto');
  const precioElem = document.getElementById('precio-producto');
  if (nombreElem) nombreElem.textContent = producto.nombre;
  if (precioElem) precioElem.textContent = `$${producto.precio.toFixed(2)}`;

  // Habilitar selección de talla y botón carrito
  const ctaBtn = document.querySelector('.cta-principal button');
  if (ctaBtn) {
    ctaBtn.classList.add('disabled', 'btn-disabled');
    ctaBtn.setAttribute('aria-disabled', 'true');
  }
  // Asignar eventos a los botones de talla generados dinámicamente
  function asignarEventosTallas() {
    const tallaBtns = document.querySelectorAll('.tallas .btn');
    tallaBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        tallaBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (ctaBtn) {
          ctaBtn.classList.remove('disabled', 'btn-disabled');
          ctaBtn.removeAttribute('aria-disabled');
        }
      });
    });
  }
  asignarEventosTallas();
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const talla = obtenerTallaSeleccionada();
      if (!talla) return;
      agregarAlCarrito(producto, talla, 1);
    });
  }
  const btnCarrito = document.querySelector('.btn-carrito-header');
  if (btnCarrito) {
    btnCarrito.addEventListener('click', function(e) {
      e.preventDefault();
      renderCarrito();
    });
  }
  actualizarContadorCarrito();
});

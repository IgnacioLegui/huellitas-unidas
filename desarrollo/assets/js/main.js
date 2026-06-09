/* =========================================
   HUELLITAS UNIDAS — main.js
   ========================================= */

'use strict';

/* -------------------------------------------------------
   1. ACTIVE NAV LINK
   Marca el link activo según la página actual
------------------------------------------------------- */
(function setActiveNav() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-huellitas .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop();
    if (
      linkFile === currentFile ||
      (currentFile === '' && linkFile === 'index.html')
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();

/* -------------------------------------------------------
   2. NAVBAR SCROLL SHADOW
   Añade sombra extra cuando el usuario scrollea
------------------------------------------------------- */
(function navbarScrollShadow() {
  const navbar = document.querySelector('.navbar-huellitas');
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,.10)';
    } else {
      navbar.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* -------------------------------------------------------
   3. TEXTAREA CONTADOR DE CARACTERES
------------------------------------------------------- */
(function charCounter() {
  document.querySelectorAll('textarea[data-maxlength]').forEach(textarea => {
    const max = parseInt(textarea.dataset.maxlength, 10);
    const counter = textarea.parentElement.querySelector('.char-counter');
    if (!counter) return;

    const update = () => {
      const remaining = max - textarea.value.length;
      counter.textContent = `${textarea.value.length}/${max}`;
      counter.classList.remove('warn', 'limit');
      if (remaining <= 20) counter.classList.add('limit');
      else if (remaining <= 50) counter.classList.add('warn');
    };

    textarea.addEventListener('input', update);
    update();
  });
})();

/* -------------------------------------------------------
   4. VALIDACIÓN DEL FORMULARIO DE ADOPCIÓN
------------------------------------------------------- */
(function formValidation() {
  const form = document.getElementById('form-adopcion');
  if (!form) return;

  /* --- Reglas de validación --- */
  const rules = {
    nombre: {
      validate: v => /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,}$/.test(v.trim()),
      message: 'Ingresá al menos 2 letras (solo caracteres alfabéticos).'
    },
    apellido: {
      validate: v => /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,}$/.test(v.trim()),
      message: 'Ingresá al menos 2 letras (solo caracteres alfabéticos).'
    },
    email: {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Ingresá un correo electrónico válido.'
    },
    vivienda: {
      validate: v => v !== '' && v !== 'seleccionar',
      message: 'Seleccioná un tipo de vivienda.'
    },
    patio: {
      validate: () => !!form.querySelector('input[name="patio"]:checked'),
      message: 'Seleccioná una opción.'
    },
    ninos: {
      validate: () => !!form.querySelector('input[name="ninos"]:checked'),
      message: 'Seleccioná una opción.'
    },
    mensaje: {
      validate: v => v.trim().length >= 20,
      message: 'Escribí al menos 20 caracteres para contarnos más sobre vos.'
    }
  };

  /* --- Helpers --- */
  function getFieldElement(name) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return null;
    if (el.type === 'radio') return form.querySelector(`input[name="${name}"]`);
    return el;
  }

  function getFieldValue(name) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return '';
    if (el.type === 'radio') {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : '';
    }
    return el.value;
  }

  function getFieldWrapper(name) {
    const el = getFieldElement(name);
    if (!el) return null;
    if (el.type === 'radio') return el.closest('.radio-group-wrapper');
    return el;
  }

  function showValid(name) {
    const wrapper = getFieldWrapper(name);
    if (!wrapper) return;

    if (wrapper.classList.contains('radio-group-wrapper')) {
      wrapper.querySelectorAll('.form-check-input').forEach(r => {
        r.classList.remove('is-invalid');
        r.classList.add('is-valid');
      });
    } else {
      wrapper.classList.remove('is-invalid');
      wrapper.classList.add('is-valid');
    }

    const fb = wrapper.parentElement?.querySelector('.valid-feedback-custom') ||
               wrapper.closest('.mb-3, .mb-4')?.querySelector('.valid-feedback-custom');
    const ifb = wrapper.parentElement?.querySelector('.invalid-feedback-custom') ||
                wrapper.closest('.mb-3, .mb-4')?.querySelector('.invalid-feedback-custom');

    if (fb) fb.style.display = 'block';
    if (ifb) ifb.style.display = 'none';
  }

  function showInvalid(name) {
    const wrapper = getFieldWrapper(name);
    if (!wrapper) return;

    if (wrapper.classList.contains('radio-group-wrapper')) {
      wrapper.querySelectorAll('.form-check-input').forEach(r => {
        r.classList.remove('is-valid');
        r.classList.add('is-invalid');
      });
    } else {
      wrapper.classList.remove('is-valid');
      wrapper.classList.add('is-invalid');
    }

    const fb = wrapper.parentElement?.querySelector('.valid-feedback-custom') ||
               wrapper.closest('.mb-3, .mb-4')?.querySelector('.valid-feedback-custom');
    const ifb = wrapper.parentElement?.querySelector('.invalid-feedback-custom') ||
                wrapper.closest('.mb-3, .mb-4')?.querySelector('.invalid-feedback-custom');

    if (fb) fb.style.display = 'none';
    if (ifb) {
      ifb.textContent = rules[name]?.message || 'Campo requerido.';
      ifb.style.display = 'block';
    }
  }

  function validateField(name) {
    const value = getFieldValue(name);
    const rule = rules[name];
    if (!rule) return true;
    const isValid = rule.validate(value);
    if (isValid) showValid(name); else showInvalid(name);
    return isValid;
  }

  /* --- Validación en tiempo real --- */
  Object.keys(rules).forEach(name => {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return;

    if (el.type === 'radio') {
      form.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.addEventListener('change', () => validateField(name));
      });
    } else {
      el.addEventListener('input', () => validateField(name));
      el.addEventListener('change', () => validateField(name));
      el.addEventListener('blur', () => {
        if (el.value !== '') validateField(name);
      });
    }
  });

  /* --- Submit --- */
  form.addEventListener('submit', e => {
    e.preventDefault();

    const fieldOrder = ['nombre', 'apellido', 'email', 'vivienda', 'patio', 'ninos', 'mensaje'];
    let errorCount = 0;

    fieldOrder.forEach(name => {
      if (!validateField(name)) errorCount++;
    });

    const alertEl = document.getElementById('alert-validacion');
    if (errorCount > 0) {
      if (alertEl) {
        alertEl.textContent = `Hay ${errorCount} campo${errorCount > 1 ? 's' : ''} con errores. Revisalos antes de continuar.`;
        alertEl.style.display = 'flex';
        alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (alertEl) alertEl.style.display = 'none';

    /* Redirigir a confirmación */
    window.location.href = 'confirmacion.html';
  });
})();

/* -------------------------------------------------------
   5. PANEL — FILTROS NAV PILLS
   Filtra las filas/cards por estado
------------------------------------------------------- */
(function panelFilters() {
  const pills = document.querySelectorAll('.panel-pills .nav-link');
  if (pills.length === 0) return;

  pills.forEach(pill => {
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      pills.forEach(p => p.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;

      /* Tabla desktop */
      document.querySelectorAll('#tabla-solicitudes tbody tr').forEach(row => {
        const estado = row.dataset.estado;
        row.style.display = (filter === 'todas' || estado === filter) ? '' : 'none';
      });

      /* Cards mobile */
      document.querySelectorAll('.solicitud-card-mobile').forEach(card => {
        const estado = card.dataset.estado;
        card.style.display = (filter === 'todas' || estado === filter) ? '' : 'none';
      });
    });
  });
})();

/* -------------------------------------------------------
   6. CATALOGO — GALERÍA (ficha.html mini thumbnail)
------------------------------------------------------- */
(function gallery() {
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainImg = document.getElementById('foto-principal');
  if (!thumbs.length || !mainImg) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const src = thumb.dataset.img;
      if (src) mainImg.src = src;
    });
  });
})();

/* -------------------------------------------------------
   7. CATALOGO — FILTROS: limpiar
------------------------------------------------------- */
(function clearFilters() {
  const clearBtn = document.getElementById('btn-limpiar-filtros');
  if (!clearBtn) return;

  clearBtn.addEventListener('click', () => {
    document.querySelectorAll('.filtros-sidebar select').forEach(s => s.value = '');
    document.querySelectorAll('.filtros-sidebar input[type="checkbox"]').forEach(c => c.checked = false);
  });
})();

/* -------------------------------------------------------
   8. SMOOTH SCROLL para anclas internas
------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* Cerrar navbar mobile si está abierta */
    const navCollapse = document.getElementById('navbarNav');
    if (navCollapse && navCollapse.classList.contains('show')) {
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) toggler.click();
    }
  });
});

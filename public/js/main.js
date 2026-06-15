/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ===== MOBILE MENU ===== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

/* ===== STAT COUNTER ANIMATION ===== */
function animateCounters() {
  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateCounters();
    heroObserver.disconnect();
  }
}, { threshold: 0.3 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) heroObserver.observe(statsEl);

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.service-card, .segmento-card, .valor, .contato-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.08}s`;
  revealObserver.observe(el);
});

/* ===== WHATSAPP ===== */
const WHATSAPP_NUMERO = '5511996957903';
function whatsappURL(msg) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg || 'Olá! Gostaria de mais informações sobre os serviços da SRD Segurança Eletrônica.')}`;
}

const whatsappFloat = document.getElementById('whatsappFloat');
if (whatsappFloat) whatsappFloat.href = whatsappURL();

const ctaWhatsapp = document.getElementById('ctaWhatsapp');
if (ctaWhatsapp) ctaWhatsapp.href = whatsappURL();

fetch('/api/whatsapp').then(r => r.json()).then(data => {
  if (data.numero) {
    if (whatsappFloat) whatsappFloat.href = whatsappURL().replace(WHATSAPP_NUMERO, data.numero);
    if (ctaWhatsapp) ctaWhatsapp.href = whatsappURL().replace(WHATSAPP_NUMERO, data.numero);
  }
}).catch(() => {});

/* ===== SERVICE CTA → FORM ===== */
document.querySelectorAll('.service-cta[data-servico]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const servico = link.dataset.servico;
    const select = document.getElementById('orc-servico');
    if (select) {
      for (const opt of select.options) {
        if (opt.value === servico) { select.value = servico; break; }
      }
      select.dispatchEvent(new Event('change'));
    }
    document.getElementById('orcamento').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ===== DYNAMIC FORM DETAILS ===== */
const servicoSelect = document.getElementById('orc-servico');
const detalhesMap = {
  'CFTV - Câmeras de Segurança': 'detalhesCFTV',
  'Câmeras Speed Dome': 'detalhesCFTV',
  'Sistemas de Alarme': 'detalhesAlarme',
  'Cercas Elétricas': 'detalhesCerca',
  'Controle de Acesso': 'detalhesAcesso',
};

if (servicoSelect) {
  servicoSelect.addEventListener('change', () => {
    document.querySelectorAll('.detalhes-servico').forEach(el => el.style.display = 'none');
    const targetId = detalhesMap[servicoSelect.value];
    if (targetId) document.getElementById(targetId).style.display = 'block';
  });
}

/* ===== PHONE MASK ===== */
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    input.value = v;
  });
});

/* ===== FORM: ORÇAMENTO ===== */
const formOrcamento = document.getElementById('formOrcamento');
if (formOrcamento) {
  formOrcamento.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formOrcamento.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Enviando...';

    const servico = servicoSelect.value;
    const detalhes = {};

    if (servico === 'CFTV - Câmeras de Segurança' || servico === 'Câmeras Speed Dome') {
      detalhes.tipo = document.getElementById('cftv-tipo')?.value || '';
      detalhes.cameras = document.getElementById('cftv-cameras')?.value || '';
      detalhes.local = document.getElementById('cftv-local')?.value || '';
    } else if (servico === 'Sistemas de Alarme') {
      detalhes.sensores = document.getElementById('alarme-sensores')?.value || '';
      detalhes.local = document.getElementById('alarme-local')?.value || '';
    } else if (servico === 'Cercas Elétricas') {
      detalhes.metros = document.getElementById('cerca-metros')?.value || '';
      detalhes.altura = document.getElementById('cerca-altura')?.value || '';
    } else if (servico === 'Controle de Acesso') {
      detalhes.tipo = document.getElementById('acesso-tipo')?.value || '';
      detalhes.pontos = document.getElementById('acesso-pontos')?.value || '';
    }

    const body = {
      nome: document.getElementById('orc-nome').value,
      telefone: document.getElementById('orc-telefone').value,
      email: document.getElementById('orc-email').value,
      cidade: document.getElementById('orc-cidade').value,
      servico,
      detalhes,
      mensagem: document.getElementById('orc-mensagem').value,
    };

    try {
      const res = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('modalTitulo').textContent = 'Orçamento Solicitado!';
        document.getElementById('modalMsg').textContent = 'Recebemos sua solicitação. Nossa equipe entrará em contato em até 24 horas com uma proposta personalizada.';
        document.getElementById('modalSucesso').classList.add('active');
        formOrcamento.reset();
        document.querySelectorAll('.detalhes-servico').forEach(el => el.style.display = 'none');
      } else {
        alert(data.erro || 'Erro ao enviar. Tente novamente.');
      }
    } catch {
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
    }

    btn.disabled = false;
    btn.innerHTML = originalText;
  });
}

/* ===== FORM: CONTATO ===== */
const formContato = document.getElementById('formContato');
if (formContato) {
  formContato.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formContato.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const body = {
      nome: document.getElementById('cont-nome').value,
      telefone: document.getElementById('cont-telefone').value,
      email: document.getElementById('cont-email').value,
      mensagem: document.getElementById('cont-mensagem').value,
    };

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('modalTitulo').textContent = 'Mensagem Enviada!';
        document.getElementById('modalMsg').textContent = 'Agradecemos seu contato. Retornaremos o mais breve possível.';
        document.getElementById('modalSucesso').classList.add('active');
        formContato.reset();
      } else {
        alert(data.erro || 'Erro ao enviar.');
      }
    } catch {
      alert('Erro de conexão.');
    }

    btn.disabled = false;
    btn.textContent = 'Enviar Mensagem';
  });
}

/* ===== SMOOTH SCROLL ACTIVE NAV ===== */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active-link', scrollY >= top && scrollY < top + height);
    }
  });
});

/* ===== SPIN ANIMATION (inline) ===== */
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
  .nav-links a.active-link { color: var(--primary) !important; }
`;
document.head.appendChild(style);

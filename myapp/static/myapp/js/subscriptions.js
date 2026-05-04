// ── Add modal ──────────────────────────────────────────
const modal = document.getElementById('modal');
const panel = document.getElementById('modal-panel');
const backdrop = document.getElementById('modal-backdrop');

function openModal() {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        panel.classList.add('open');
        backdrop.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
    modal.querySelectorAll('input[type="text"], input[type="number"], select').forEach(el => {
        el.classList.add('form-input');
    });
}

function closeModal() {
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    setTimeout(() => { modal.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
}

document.getElementById('open-modal').addEventListener('click', openModal);
document.getElementById('close-modal').addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);

if (window.SHOW_MODAL) openModal();

// ── Edit modal ─────────────────────────────────────────
const editModal = document.getElementById('edit-modal');
const editPanel = document.getElementById('edit-panel');
const editBackdrop = document.getElementById('edit-backdrop');

function openEditModal(card) {
    document.getElementById('edit-sub-id').value       = card.dataset.subId;
    document.getElementById('edit-name').value         = card.dataset.subName;
    document.getElementById('edit-amount').value       = card.dataset.subAmount;
    document.getElementById('edit-billing-day').value  = card.dataset.subBillingDay;
    document.getElementById('edit-active').checked     = card.dataset.subActive === 'true';
    hideDeleteConfirm();
    editModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        editPanel.classList.add('open');
        editBackdrop.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    editPanel.classList.remove('open');
    editBackdrop.classList.remove('open');
    setTimeout(() => { editModal.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
}

editBackdrop.addEventListener('click', closeEditModal);

function showDeleteConfirm() {
    document.getElementById('delete-section').classList.add('hidden');
    document.getElementById('delete-confirm').classList.remove('hidden');
}

function hideDeleteConfirm() {
    document.getElementById('delete-section').classList.remove('hidden');
    document.getElementById('delete-confirm').classList.add('hidden');
}

async function submitEdit() {
    const subId      = document.getElementById('edit-sub-id').value;
    const name       = document.getElementById('edit-name').value.trim();
    const amount     = document.getElementById('edit-amount').value.trim();
    const billingDay = document.getElementById('edit-billing-day').value.trim();
    const active     = document.getElementById('edit-active').checked;
    if (!name || !amount || !billingDay) return;

    const body = new FormData();
    body.append('name', name);
    body.append('amount', amount);
    body.append('billing_day', billingDay);
    if (active) body.append('active', 'on');

    const resp = await fetch(`/subscriptions/${subId}/edit/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body,
    });
    const data = await resp.json();
    if (data.ok) {
        closeEditModal();
        window.location.reload();
    }
}

async function submitDelete() {
    const subId = document.getElementById('edit-sub-id').value;
    const resp = await fetch(`/subscriptions/${subId}/delete/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
    });
    const data = await resp.json();
    if (data.ok) {
        closeEditModal();
        const card = document.querySelector(`.sub-card[data-sub-id="${subId}"]`);
        if (card) {
            card.classList.add('removing');
            setTimeout(() => {
                card.remove();
                updateCount();
            }, 260);
        }
    }
}

function updateCount() {
    const remaining = document.querySelectorAll('.sub-card').length;
    const el = document.getElementById('subs-count');
    if (el) el.textContent = `${remaining} assinatura${remaining !== 1 ? 's' : ''}`;
    if (remaining === 0) {
        const footer = document.getElementById('subs-footer');
        if (footer) footer.remove();
    }
}

// ── Keyboard close ─────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeModal();
        closeEditModal();
    }
});

// ── Payment toggle ─────────────────────────────────────
function getCookie(name) {
    let value = null;
    document.cookie.split(';').forEach(c => {
        const [k, v] = c.trim().split('=');
        if (k === name) value = decodeURIComponent(v);
    });
    return value;
}

async function togglePayment(btn) {
    if (btn.classList.contains('loading')) return;
    const subId  = btn.dataset.subId;
    const wasPaid = btn.dataset.paid === 'true';
    btn.classList.add('loading');
    renderPaymentBtn(btn, !wasPaid);
    try {
        const resp = await fetch(`/subscriptions/${subId}/toggle-payment/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
        });
        const data = await resp.json();
        renderPaymentBtn(btn, data.paid);
    } catch {
        renderPaymentBtn(btn, wasPaid);
    } finally {
        btn.classList.remove('loading');
    }
}

function renderPaymentBtn(btn, paid) {
    btn.dataset.paid = paid ? 'true' : 'false';
    const span = btn.querySelector('span');
    if (paid) {
        span.className = 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 text-white text-[11px] font-bold shadow-sm shadow-emerald-200';
        span.innerHTML = '<i class="fas fa-check text-[10px]"></i> Paga';
    } else {
        span.className = 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold';
        span.innerHTML = '<i class="fas fa-clock text-[10px]"></i> Pendente';
    }
}

// ── Helpers ────────────────────────────────────────────
function getCookie(name) {
    let value = null;
    document.cookie.split(';').forEach(c => {
        const [k, v] = c.trim().split('=');
        if (k === name) value = decodeURIComponent(v);
    });
    return value;
}

// ── Add modal ──────────────────────────────────────────
const modal    = document.getElementById('modal');
const panel    = document.getElementById('modal-panel');
const backdrop = document.getElementById('modal-backdrop');

function openModal() {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        panel.classList.add('open');
        backdrop.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
    modal.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], select, textarea').forEach(el => {
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
const editModal    = document.getElementById('edit-modal');
const editPanel    = document.getElementById('edit-panel');
const editBackdrop = document.getElementById('edit-backdrop');

function openEditModal(row) {
    document.getElementById('edit-exp-id').value      = row.dataset.expId;
    document.getElementById('edit-title').value       = row.dataset.expTitle;
    document.getElementById('edit-amount').value      = row.dataset.expAmount;
    document.getElementById('edit-category').value    = row.dataset.expCategoryId;
    document.getElementById('edit-date').value        = row.dataset.expDate;
    document.getElementById('edit-description').value = row.dataset.expDescription;
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
    const expId      = document.getElementById('edit-exp-id').value;
    const title      = document.getElementById('edit-title').value.trim();
    const amount     = document.getElementById('edit-amount').value.trim();
    const categoryId = document.getElementById('edit-category').value;
    const date       = document.getElementById('edit-date').value;
    const description = document.getElementById('edit-description').value.trim();
    if (!title || !amount || !categoryId || !date) return;

    const body = new FormData();
    body.append('title', title);
    body.append('amount', amount);
    body.append('category', categoryId);
    body.append('date', date);
    body.append('description', description);

    const resp = await fetch(`/expenses/${expId}/edit/`, {
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
    const expId = document.getElementById('edit-exp-id').value;
    const resp = await fetch(`/expenses/${expId}/delete/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
    });
    const data = await resp.json();
    if (data.ok) {
        closeEditModal();
        const row = document.querySelector(`.exp-row[data-exp-id="${expId}"]`);
        if (row) {
            row.classList.add('removing');
            setTimeout(() => row.remove(), 260);
        }
    }
}

// ── Keyboard ───────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeEditModal(); }
});

// ── Nova categoria inline ──────────────────────────────
const catModal  = document.getElementById('cat-modal');
const catPanel  = document.getElementById('cat-panel');
const catBd     = document.getElementById('cat-backdrop');
const catInput  = document.getElementById('cat-name-input');
const catError  = document.getElementById('cat-error');
const catSelect = document.querySelector('select[name="category"]');

function openCatModal() {
    catModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        catBd.style.opacity = '1';
        catPanel.style.transform = 'scale(1)';
        catPanel.style.opacity = '1';
    });
    catInput.value = '';
    catError.classList.add('hidden');
    setTimeout(() => catInput.focus(), 150);
}
function closeCatModal() {
    catBd.style.opacity = '0';
    catPanel.style.transform = 'scale(0.95)';
    catPanel.style.opacity = '0';
    setTimeout(() => catModal.classList.add('hidden'), 200);
}

document.getElementById('add-category-btn').addEventListener('click', openCatModal);
document.getElementById('close-cat-modal').addEventListener('click', closeCatModal);
catBd.addEventListener('click', closeCatModal);

document.getElementById('save-cat-btn').addEventListener('click', async () => {
    const name = catInput.value.trim();
    if (!name) {
        catError.textContent = 'Digite um nome para a categoria.';
        catError.classList.remove('hidden');
        return;
    }
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const res = await fetch(window.URLS.categoryCreateAjax, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrf, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${encodeURIComponent(name)}`,
    });
    if (res.ok) {
        const data = await res.json();
        const opt = new Option(data.name, data.id, true, true);
        catSelect.add(opt);
        catSelect.value = data.id;
        const editCatSel = document.getElementById('edit-category');
        editCatSel.add(new Option(data.name, data.id));
        closeCatModal();
    } else {
        catError.textContent = 'Erro ao salvar. Tente novamente.';
        catError.classList.remove('hidden');
    }
});

catInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('save-cat-btn').click(); });

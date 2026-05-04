// ── Add modal ──
const addModal = document.getElementById('add-modal');
const addPanel = document.getElementById('add-panel');
const addBd    = document.getElementById('add-backdrop');

function openAdd() {
    addModal.classList.remove('hidden');
    requestAnimationFrame(() => { addPanel.classList.add('open'); addBd.classList.add('open'); });
    document.body.style.overflow = 'hidden';
}
function closeAdd() {
    addPanel.classList.remove('open'); addBd.classList.remove('open');
    setTimeout(() => { addModal.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
}
document.getElementById('open-add').addEventListener('click', openAdd);
document.getElementById('close-add').addEventListener('click', closeAdd);
addBd.addEventListener('click', closeAdd);
if (window.SHOW_MODAL) openAdd();

// ── Edit modal ──
const editModal = document.getElementById('edit-modal');
const editPanel = document.getElementById('edit-panel');
const editBd    = document.getElementById('edit-backdrop');
const editForm  = document.getElementById('edit-form');
const editInput = document.getElementById('edit-name-input');

function openEdit(pk, name) {
    editForm.action = `/categories/${pk}/edit/`;
    editInput.value = name;
    editModal.classList.remove('hidden');
    requestAnimationFrame(() => { editPanel.classList.add('open'); editBd.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    setTimeout(() => editInput.focus(), 200);
}
function closeEdit() {
    editPanel.classList.remove('open'); editBd.classList.remove('open');
    setTimeout(() => { editModal.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
}
document.getElementById('close-edit').addEventListener('click', closeEdit);
editBd.addEventListener('click', closeEdit);

// ── Delete modal ──
const delModal  = document.getElementById('del-modal');
const delPanel  = document.getElementById('del-panel');
const delBd     = document.getElementById('del-backdrop');
const delForm   = document.getElementById('del-form');
const delName   = document.getElementById('del-name');

function confirmDelete(pk, name) {
    delForm.action = `/categories/${pk}/delete/`;
    delName.textContent = name;
    delModal.classList.remove('hidden');
    requestAnimationFrame(() => { delBd.style.opacity = '1'; delPanel.style.transform = 'scale(1)'; delPanel.style.opacity = '1'; });
    document.body.style.overflow = 'hidden';
}
function closeDelete() {
    delBd.style.opacity = '0'; delPanel.style.transform = 'scale(0.95)'; delPanel.style.opacity = '0';
    setTimeout(() => { delModal.classList.add('hidden'); document.body.style.overflow = ''; }, 200);
}
document.getElementById('del-cancel').addEventListener('click', closeDelete);
delBd.addEventListener('click', closeDelete);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAdd(); closeEdit(); closeDelete(); }
});

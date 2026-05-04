const expenseFields = document.querySelector('.expense-fields');
const subscriptionFields = document.querySelector('.subscription-fields');
const submitBtn = document.getElementById('submit-btn');

function showFields(type) {
    expenseFields.style.display = type === 'expense' ? 'block' : 'none';
    subscriptionFields.style.display = type === 'subscription' ? 'block' : 'none';
    submitBtn.classList.remove('hidden');
}

document.querySelectorAll('input[name="item_type"]').forEach(radio => {
    radio.addEventListener('change', function () {
        showFields(this.value);
    });
});

// Pre-select on page load (e.g. form re-render after error)
const checked = document.querySelector('input[name="item_type"]:checked');
if (checked) showFields(checked.value);

// Disable fields in hidden sections so they're not submitted
document.querySelector('form').addEventListener('submit', function () {
    if (expenseFields.style.display === 'none') {
        expenseFields.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
    }
    if (subscriptionFields.style.display === 'none') {
        subscriptionFields.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
    }
});

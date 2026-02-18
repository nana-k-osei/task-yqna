// ── API Configuration ──
const API_BASE = 'https://simplepos-backend.onrender.com';

// ── API Calls ──
const api = {
    async getMerchant() {
        const res = await fetch(`${API_BASE}/api/merchant`);
        if (!res.ok) throw new Error('Failed to fetch merchant');
        return res.json();
    },

    async createPayment(amount, paymentMethod) {
        const res = await fetch(`${API_BASE}/api/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount), payment_method: paymentMethod })
        });
        if (!res.ok) throw new Error('Payment request failed');
        return res.json();
    },

    async getPayment(id) {
        const res = await fetch(`${API_BASE}/api/payments/${id}`);
        if (!res.ok) throw new Error('Payment not found');
        return res.json();
    },

    async getTransactions() {
        const res = await fetch(`${API_BASE}/api/transactions`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },

    async getTransaction(id) {
        const res = await fetch(`${API_BASE}/api/transactions/${id}`);
        if (!res.ok) throw new Error('Transaction not found');
        return res.json();
    },

    async refundTransaction(id) {
        const res = await fetch(`${API_BASE}/api/transactions/${id}/refund`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Refund failed');
        }
        return res.json();
    }
};

// ── Session helpers ──
const session = {
    set(key, value) { sessionStorage.setItem(key, JSON.stringify(value)); },
    get(key) {
        const v = sessionStorage.getItem(key);
        return v ? JSON.parse(v) : null;
    },
    clear(...keys) { keys.forEach(k => sessionStorage.removeItem(k)); }
};

// ── Formatting ──
function formatAmount(amount) {
    return `£${parseFloat(amount).toFixed(2)}`;
}

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(isoString) {
    return `${formatDate(isoString)} at ${formatTime(isoString)}`;
}

// ── Load merchant name into header ──
async function loadMerchantHeader() {
    const els = document.querySelectorAll('.merchant-name');
    if (!els.length) return;
    try {
        const merchant = await api.getMerchant();
        els.forEach(el => el.textContent = merchant.name);
    } catch {
        els.forEach(el => el.textContent = 'Joes Cafe');
    }
}

// ── SVG Icons ──
const icons = {
    card: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    qr: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="18" y="18" width="3" height="3"/></svg>`,
    back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
    history: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    check: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    x: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    delete: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>`,
    alert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    receipt: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    wifi_off: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`
};

document.addEventListener('DOMContentLoaded', loadMerchantHeader);

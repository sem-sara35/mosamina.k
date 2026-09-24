// ============================================================
// منطق لوحة التحكم: تسجيل الدخول وعرض الطلبات وتحديث حالتها
// ============================================================

const loginBox = document.getElementById('loginBox');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const ordersBody = document.getElementById('ordersBody');
const emptyState = document.getElementById('emptyState');

let unsubscribe = null;

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  loginError.style.display = 'none';
  loginBtn.disabled = true;
  loginBtn.textContent = 'جارٍ الدخول...';

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    loginError.style.display = 'block';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'دخول';
  }
});

logoutBtn.addEventListener('click', () => auth.signOut());

auth.onAuthStateChanged(user => {
  if (user) {
    loginBox.style.display = 'none';
    dashboard.style.display = 'block';
    listenToOrders();
  } else {
    loginBox.style.display = 'block';
    dashboard.style.display = 'none';
    if (unsubscribe) unsubscribe();
  }
});

function listenToOrders() {
  unsubscribe = db.collection('orders')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      ordersBody.innerHTML = '';

      if (snapshot.empty) {
        emptyState.style.display = 'block';
        return;
      }
      emptyState.style.display = 'none';

      snapshot.forEach(doc => {
        const o = doc.data();
        ordersBody.appendChild(buildRow(doc.id, o));
      });
    });
}

function buildRow(id, o) {
  const tr = document.createElement('tr');

  const date = o.createdAt && o.createdAt.toDate
    ? o.createdAt.toDate().toLocaleString('ar-DZ')
    : '—';

  const statusLabels = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكدة',
    cancelled: 'ملغاة'
  };
  const statusClass = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    cancelled: 'status-cancelled'
  };

  tr.innerHTML = `
    <td>${date}</td>
    <td>${escapeHtml(o.fullName)}</td>
    <td><a href="tel:${escapeHtml(o.phone)}">${escapeHtml(o.phone)}</a></td>
    <td>${escapeHtml(o.wilaya)}</td>
    <td>${escapeHtml(o.address)}</td>
    <td>${o.qty} علبة — ${o.price} دج</td>
    <td><span class="status-pill ${statusClass[o.status] || 'status-pending'}">${statusLabels[o.status] || 'قيد الانتظار'}</span></td>
    <td class="action-btns"></td>
  `;

  const actionCell = tr.querySelector('.action-btns');

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn-confirm';
  confirmBtn.textContent = 'تأكيد';
  confirmBtn.onclick = () => updateStatus(id, 'confirmed');

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-cancel';
  cancelBtn.textContent = 'إلغاء';
  cancelBtn.onclick = () => updateStatus(id, 'cancelled');

  const pendingBtn = document.createElement('button');
  pendingBtn.className = 'btn-pending';
  pendingBtn.textContent = 'إعادة للانتظار';
  pendingBtn.onclick = () => updateStatus(id, 'pending');

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.title = 'حذف الطلبية';
  deleteBtn.innerHTML = '🗑';
  deleteBtn.onclick = () => deleteOrder(id, o.fullName);

  actionCell.appendChild(confirmBtn);
  actionCell.appendChild(cancelBtn);
  actionCell.appendChild(pendingBtn);
  actionCell.appendChild(deleteBtn);

  return tr;
}

function updateStatus(id, status) {
  db.collection('orders').doc(id).update({ status });
}

function deleteOrder(id, name) {
  const sure = confirm('هل أنت متأكد من حذف طلبية "' + name + '" نهائياً؟ لا يمكن التراجع عن هذا.');
  if (!sure) return;
  db.collection('orders').doc(id).delete();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

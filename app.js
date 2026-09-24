// ============================================================
// منطق صفحة الطلب: اختيار العرض وإرسال الطلب إلى قاعدة البيانات
// ============================================================

let selectedOffer = null; // { qty, price }

const offerCards = document.querySelectorAll('.offer-card');
const totalDisplay = document.getElementById('totalDisplay');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('orderForm');
const formMsg = document.getElementById('formMsg');

offerCards.forEach(card => {
  card.addEventListener('click', () => {
    offerCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedOffer = {
      qty: Number(card.dataset.qty),
      price: Number(card.dataset.price)
    };
    totalDisplay.textContent =
      (selectedOffer.qty === 1 ? 'علبة واحدة' : selectedOffer.qty + ' علب') +
      ' — ' + selectedOffer.price + ' دج';
    submitBtn.disabled = false;
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.className = 'form-msg';
  formMsg.textContent = '';

  if (!selectedOffer) {
    showMsg('يرجى اختيار عرض قبل الإرسال', 'err');
    return;
  }

  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const wilaya = document.getElementById('wilaya').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!fullName || !phone || !wilaya || !address) {
    showMsg('يرجى تعبئة جميع الحقول', 'err');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'جارٍ الإرسال...';

  try {
    await db.collection('orders').add({
      fullName,
      phone,
      wilaya,
      address,
      qty: selectedOffer.qty,
      price: selectedOffer.price,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showMsg('تم استلام طلبك بنجاح! سنتصل بك قريباً لتأكيد الطلبية.', 'ok');
    form.reset();
    offerCards.forEach(c => c.classList.remove('selected'));
    selectedOffer = null;
    totalDisplay.textContent = '— اختر عرضاً أعلاه —';
    submitBtn.textContent = 'أطلب الآن';
  } catch (err) {
    console.error(err);
    showMsg('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.', 'err');
    submitBtn.disabled = false;
    submitBtn.textContent = 'أطلب الآن';
  }
});

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = 'form-msg ' + type;
}

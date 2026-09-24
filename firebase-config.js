// ============================================================
// عدّل هذا الملف فقط بمعلومات مشروعك في Firebase
// كيفية الحصول على هذه المعلومات: راجع ملف README.md
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCVz0exlEGaZtUj7Amu5dWLJpgYY_6Dcj8",
  authDomain: "mosamina.firebaseapp.com",
  projectId: "mosamina",
  storageBucket: "mosamina.firebasestorage.app",
  messagingSenderId: "1023035335987",
  appId: "1:1023035335987:web:e5bad40d565c7df63e4a46"
};

// تهيئة Firebase (لا تعدّل هذا الجزء)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

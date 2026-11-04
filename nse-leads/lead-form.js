import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJAS0l3FgUhCyTvecYkQyXA7kG1gE0bN5v8F2d1s9",
  authDomain: "nse-leads.firebaseapp.com",
  projectId: "nse-leads",
  storageBucket: "nse-leads.firebasestorage.app",
  messagingSenderId: "372703343539",
  appId: "1:372703343539:web:be0727d482d1fD4fa711c6",
  measurementId: "G-WCE3509P8S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.submitLead = async function(event, projectName) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.innerText;

  const data = {
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim() || "N/A",
    market: form.elements.market.value,
    source: "Website Form - " + projectName,
    score: "Warm",
    buyer_category: form.elements.buyer_type ? form.elements.buyer_type.value : "Unknown",
    budget: form.elements.budget.value || "Not specified",
    assigned_agent: "Unassigned",
    matched_keywords: [projectName],
    timestamp: serverTimestamp()
  };

  const dedupeKey = `lead_${data.phone}_${data.market}`;
  const last = localStorage.getItem(dedupeKey);
  if (last && Date.now() - parseInt(last) < 600000) {
    alert("We already received your enquiry. Our advisor will call you shortly.");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Submitting...";

  try {
    await addDoc(collection(db, "leads"), data);
    localStorage.setItem(dedupeKey, Date.now().toString());
    form.innerHTML = `<div style="text-align:center; padding:2rem; background:#F0FDF4; border-radius:8px;">
      <div style="font-size:3rem; color:#10B981;">✓</div>
      <h3 style="color:#0A192F; margin:0.5rem 0;">Thank You, ${data.name.split(' ')[0]}</h3>
      <p style="color:#4A5568;">Our senior advisor will call you within 2 working hours.</p>
    </div>`;
  } catch (err) {
    console.error("Form error:", err);
    btn.disabled = false;
    btn.innerText = originalText;
    alert("Submission failed. Please retry.");
  }
};
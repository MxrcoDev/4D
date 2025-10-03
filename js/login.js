// login.js
const ADMIN_HASH = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"; // SHA-256("test")

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const input = document.getElementById("admin-code");
  const errorDiv = document.getElementById("login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = input.value || "";

    try {
      const codeHash = await sha256Hex(code.trim());

      if (codeHash === ADMIN_HASH) {
        // Password corretta: salva token in localStorage
        localStorage.setItem("adminAccess", "true");
        // Reindirizza alla pagina admin
        window.location.href = "admin.html";
      } else {
        errorDiv.style.display = "block";
        input.value = "";
        input.focus();
        setTimeout(() => errorDiv.style.display = "none", 3000);
      }
    } catch (err) {
      console.error("Errore nel calcolo hash:", err);
      errorDiv.textContent = "Errore imprevisto. Riprova.";
      errorDiv.style.display = "block";
    }
  });
});

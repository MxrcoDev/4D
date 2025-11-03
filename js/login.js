// login.js
const Z = "6f5a362b7173c5381269329f7aaba23947c5eb9b00440da50b68332284760c52";

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

      if (codeHash === Z) {
        localStorage.setItem("osdnoi3223oi3nboin3p091u90123nksnofi", "true");
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

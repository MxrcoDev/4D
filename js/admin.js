const API_URL = "https://script.google.com/macros/s/AKfycbwgmFVadr_CM55CVSmsV1Uy8V_e2OQ_905lHtiWjy8E-urtVhsEKyq6D4mn4fnvPlqwQA/exec";

// 🔹 Controllo accesso: impedisce accesso diretto senza login
if (localStorage.getItem("adminAccess") !== "true") {
    alert("Devi prima effettuare il login!");
    window.location.href = "login.html";
}

// 🔹 Logout
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("adminAccess");
            window.location.href = "login.html";
        });
    }
});

// 🔹 Genera tabelle con checkbox interattive per ogni materia
function generateAdminTables(data) {
    const listeContainer = document.getElementById("liste-container");
    listeContainer.innerHTML = "";

    const materie = {};

    data.forEach(item => {
        const materia = item.Materia;
        const studente = item.Studente;
        if (!materie[materia]) materie[materia] = [];
        materie[materia].push({ nome: studente, interrogato: item.Interrogato === true });
    });

    for (const materia in materie) {
        const divMateria = document.createElement("div");
        divMateria.className = "materia-block";
        divMateria.style.marginBottom = "40px"; // spazio tra le tabelle

        const h2 = document.createElement("h2");
        h2.textContent = materia;
        h2.style.marginBottom = "10px";
        divMateria.appendChild(h2);

        const table = document.createElement("table");
        table.className = "materia-table";
        table.style.width = "100%";
        table.style.borderCollapse = "collapse"; // per i bordi uniformi

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr style="background:#667eea; color:white;">
                <th style="border: 1px solid #333; padding:8px;">Nome</th>
                <th style="border: 1px solid #333; padding:8px;">Interrogato</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        materie[materia].forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="border: 1px solid #333; padding:8px;">${s.nome}</td>
                <td style="border: 1px solid #333; text-align:center; padding:8px;">
                    <input type="checkbox" ${s.interrogato ? "checked" : ""}>
                </td>
            `;
            tbody.appendChild(tr);

            const checkbox = tr.querySelector("input[type=checkbox]");
            checkbox.addEventListener("change", async () => {
                await updateSheetStatus(s.nome, materia, checkbox.checked);
            });
        });

        table.appendChild(tbody);
        divMateria.appendChild(table);
        listeContainer.appendChild(divMateria);
    }
}

// 🔹 Aggiorna lo stato nel foglio tramite GET
async function updateSheetStatus(studente, materia, status) {
    try {
        const url = `${API_URL}?studente=${encodeURIComponent(studente)}&materia=${encodeURIComponent(materia)}&interrogato=${status}`;
        await fetch(url);
    } catch (err) {
        console.error("Errore aggiornamento:", err);
        alert(`Errore aggiornamento per ${studente}`);
    }
}

// 🔹 Caricamento dati principale
async function init() {
    const loadingDiv = document.getElementById("loading");
    const errorDiv = document.getElementById("error");

    loadingDiv.style.display = "block";
    errorDiv.style.display = "none";

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Errore rete");

        const data = await res.json();
        if (!data || data.length === 0) throw new Error("Nessun dato trovato");

        generateAdminTables(data);
    } catch (err) {
        console.error("Errore caricamento:", err);
        errorDiv.style.display = "block";
    } finally {
        loadingDiv.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", init);

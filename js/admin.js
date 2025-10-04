const API_URL = "https://script.google.com/macros/s/AKfycbzLNXDIbMAY3XVr6N4XWAqVglPhm42uIH5DCzCCFQ9ynryhySYZ0KXc69v4D76zfEsMlA/exec";

let passwordCorretta = ""; // Verrà caricata dal server
let modifichePerMateria = {}; // Tiene traccia delle modifiche non salvate per materia

// 🔹 Controllo accesso: impedisce accesso diretto senza login
if (localStorage.getItem("osdnoi3223oi3nboin3p091u90123nksnofi") !== "true") {
    alert("Devi prima effettuare il login!");
    window.location.href = "login.html";
}

// 🔹 Logout
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("osdnoi3223oi3nboin3p091u90123nksnofi");
            window.location.href = "login.html";
        });
    }
});

// 🔹 Genera tabelle con checkbox interattive per ogni materia
function generateAdminTables(data) {
    const listeContainer = document.getElementById("liste-container");
    listeContainer.innerHTML = "";

    const materie = {};

    // Organizza i dati per materia
    data.forEach(item => {
        const materia = item.Materia;
        const studente = item.Studente;
        
        if (!materie[materia]) materie[materia] = [];
        materie[materia].push({ 
            nome: studente, 
            interrogato: item.Interrogato === true || item.Interrogato === "TRUE"
        });
    });

    // Crea una tabella per ogni materia
    for (const materia in materie) {
        modifichePerMateria[materia] = []; // Inizializza array delle modifiche

        const divMateria = document.createElement("div");
        divMateria.className = "materia-block";

        const h2 = document.createElement("h2");
        h2.textContent = materia;
        divMateria.appendChild(h2);

        const table = document.createElement("table");
        table.className = "materia-table";

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Nome</th>
                <th style="text-align:center;">Interrogato</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        materie[materia].forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${s.nome}</td>
                <td style="text-align:center;">
                    <input type="checkbox" ${s.interrogato ? "checked" : ""} data-studente="${s.nome}" data-materia="${materia}">
                </td>
            `;
            tbody.appendChild(tr);

            // Gestisce il cambiamento dello stato delle checkbox
            const checkbox = tr.querySelector("input[type=checkbox]");
            checkbox.addEventListener("change", () => {
                aggiungiModifica(s.nome, materia, checkbox.checked);
            });
        });

        table.appendChild(tbody);
        divMateria.appendChild(table);

        // Bottone Salva
        const saveBtn = document.createElement("button");
        saveBtn.className = "save-button";
        saveBtn.textContent = "Salva";
        saveBtn.setAttribute("data-materia", materia);
        saveBtn.addEventListener("click", () => salvaCambiamenti(materia));
        divMateria.appendChild(saveBtn);

        listeContainer.appendChild(divMateria);
    }
}

// 🔹 Aggiunge una modifica alla lista delle modifiche pendenti
function aggiungiModifica(studente, materia, status) {
    const modifiche = modifichePerMateria[materia];
    
    // Rimuove eventuali modifiche precedenti per lo stesso studente
    const index = modifiche.findIndex(m => m.studente === studente);
    if (index !== -1) {
        modifiche.splice(index, 1);
    }
    
    // Aggiunge la nuova modifica
    modifiche.push({ studente, status });
}

// 🔹 Input password mascherato
function richiediPassword() {
    return new Promise((resolve) => {
        // Crea overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = 1000;

        // Crea box
        const box = document.createElement("div");
        box.style.backgroundColor = "#fff";
        box.style.padding = "20px";
        box.style.borderRadius = "8px";
        box.style.textAlign = "center";
        box.innerHTML = `
            <p>Inserisci la password:</p>
            <input type="password" id="password-input" style="padding:5px; width:200px;">
            <br><br>
            <button id="password-ok">OK</button>
            <button id="password-cancel">Annulla</button>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Gestione pulsanti
        document.getElementById("password-ok").onclick = () => {
            const val = document.getElementById("password-input").value;
            document.body.removeChild(overlay);
            resolve(val);
        };
        document.getElementById("password-cancel").onclick = () => {
            document.body.removeChild(overlay);
            resolve(null);
        };

        document.getElementById("password-input").focus();
    });
}

// 🔹 Salva tutti i cambiamenti per una materia specifica
async function salvaCambiamenti(materia) {
    const modifiche = modifichePerMateria[materia];
    
    if (modifiche.length === 0) {
        alert("Nessuna modifica da salvare per " + materia);
        return;
    }

    // Usa input mascherato
    const passwordInserita = await richiediPassword();
    
    if (!passwordInserita) {
        alert("Operazione annullata");
        return;
    }

    if (passwordInserita !== passwordCorretta) {
        alert("❌ Password errata! Le modifiche non sono state salvate.");
        return;
    }

    // Disabilita il bottone durante il salvataggio
    const saveBtn = document.querySelector(`button[data-materia="${materia}"]`);
    saveBtn.disabled = true;
    saveBtn.textContent = "Salvataggio...";

    try {
        // Invia tutte le modifiche in sequenza
        let salvateConSuccesso = 0;
        for (const modifica of modifiche) {
            const success = await updateSheetStatus(modifica.studente, materia, modifica.status);
            if (success) {
                salvateConSuccesso++;
            }
        }

        if (salvateConSuccesso === modifiche.length) {
            alert(`✅ Modifiche salvate con successo per ${materia}! (${salvateConSuccesso}/${modifiche.length})`);
            modifichePerMateria[materia] = []; // Svuota le modifiche salvate
        } else {
            alert(`⚠️ Salvate ${salvateConSuccesso}/${modifiche.length} modifiche. Alcune potrebbero non essere state salvate.`);
        }
    } catch (err) {
        console.error("Errore durante il salvataggio:", err);
        alert("❌ Errore durante il salvataggio. Riprova.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Salva";
    }
}

// 🔹 Aggiorna lo stato nel foglio tramite GET
async function updateSheetStatus(studente, materia, status) {
    try {
        const url = `${API_URL}?studente=${encodeURIComponent(studente)}&materia=${encodeURIComponent(materia)}&interrogato=${status}`;
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });

        if (res.ok) {
            console.log(`✅ Aggiornato: ${studente} (${materia}) -> ${status}`);
            return true;
        } else {
            console.error(`❌ Errore aggiornamento: ${studente} (${materia})`);
            return false;
        }
    } catch (err) {
        console.error(`❌ Errore fetch per ${studente} (${materia}):`, err);
        return false;
    }
}

// 🔹 Carica la password dal server
async function caricaPassword() {
    try {
        const res = await fetch(`${API_URL}?action=getPwd`);
        if (res.ok) {
            const data = await res.json();
            passwordCorretta = data.pwd;
            console.log("✅ Password caricata dal server");
        }
    } catch (err) {
        console.error("❌ Errore caricamento password:", err);
    }
}

// 🔹 Caricamento dati principale
async function init() {
    const loadingDiv = document.getElementById("loading");
    const errorDiv = document.getElementById("error");

    loadingDiv.style.display = "block";
    errorDiv.style.display = "none";

    try {
        // Carica prima la password
        await caricaPassword();
        
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Errore rete");

        const data = await res.json();
        if (!data || data.length === 0) throw new Error("Nessun dato trovato");

        console.log("Dati caricati:", data);
        generateAdminTables(data);
    } catch (err) {
        console.error("Errore caricamento:", err);
        errorDiv.style.display = "block";
    } finally {
        loadingDiv.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", init);

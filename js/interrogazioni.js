const API_URL = "https://script.google.com/macros/s/AKfycbyVpRSNrbGOTOkET7QYFserx1N-OEDb1fX32yZl7s0olsy28LlESKjDiUNNNVsCgC3K2w/exec"; // incolla qui l'URL Apps Script

// Funzione per generare le tabelle per ogni materia
function generateTables(data) {
    const listeContainer = document.getElementById("liste-container");
    listeContainer.innerHTML = "";

    const materie = {};

    // Raggruppa studenti per materia
    data.forEach(item => {
        const materia = item.Materia;
        const studente = item.Studente;
        if (!materie[materia]) materie[materia] = [];
        materie[materia].push({ nome: studente, interrogato: item.Interrogato === true });
    });

    // Genera tabella per ogni materia
    for (const materia in materie) {
        const divMateria = document.createElement("div");
        divMateria.className = "materia-block";

        // Titolo materia
        const h2 = document.createElement("h2");
        h2.textContent = materia;
        divMateria.appendChild(h2);

        // Tabella
        const table = document.createElement("table");
        table.className = "materia-table";
        table.style.width = "100%"; // tutte le tabelle larghezza uniforme

        // Intestazione tabella
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>Interrogato</th>
            </tr>
        `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement("tbody");
        materie[materia].forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${s.nome}</td>
                <td style="text-align:center;">${s.interrogato ? "✅" : "❌"}</td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        divMateria.appendChild(table);
        listeContainer.appendChild(divMateria);
    }
}

// Funzione principale di caricamento dati
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

        generateTables(data);
    } catch (err) {
        console.error("Errore caricamento:", err);
        errorDiv.style.display = "block";
    } finally {
        loadingDiv.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", init);

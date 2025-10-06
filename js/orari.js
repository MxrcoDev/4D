// Funzione per generare le tabelle dell'orario
function generateOrario(data) {
    const orarioContainer = document.getElementById("orario-container");
    orarioContainer.innerHTML = "";

    const giorni = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

    giorni.forEach(giorno => {
        if (data[giorno]) {
            const divGiorno = document.createElement("div");
            divGiorno.className = "giorno-block";

            // Titolo giorno
            const h2 = document.createElement("h2");
            h2.textContent = giorno;
            divGiorno.appendChild(h2);

            // Tabella
            const table = document.createElement("table");
            table.className = "orario-table";

            // Intestazione tabella
            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th>Ora</th>
                    <th>Materia</th>
                </tr>
            `;
            table.appendChild(thead);

            // Corpo tabella
            const tbody = document.createElement("tbody");
            const ore = data[giorno];

            for (let i = 1; i <= 8; i++) {
                const tr = document.createElement("tr");
                const materia = ore[`ora${i}`] || "-";
                
                tr.innerHTML = `
                    <td class="ora-cell">${i}ª</td>
                    <td class="${materia === '-' ? 'empty-cell' : 'materia-cell'}">${materia}</td>
                `;
                tbody.appendChild(tr);
            }

            table.appendChild(tbody);
            divGiorno.appendChild(table);
            orarioContainer.appendChild(divGiorno);
        }
    });
}

// Funzione principale di caricamento dati
async function init() {
    const loadingDiv = document.getElementById("loading");
    const errorDiv = document.getElementById("error");

    loadingDiv.style.display = "block";
    errorDiv.style.display = "none";

    try {
        const res = await fetch('../storage/orari.json');
        if (!res.ok) throw new Error("Errore nel caricamento del file JSON");

        const data = await res.json();

        if (!data) throw new Error("Nessun dato trovato");

        generateOrario(data);
    } catch (err) {
        console.error("Errore caricamento:", err);
        errorDiv.style.display = "block";
    } finally {
        loadingDiv.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", init);
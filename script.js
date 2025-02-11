let userTimezone = localStorage.getItem("userTimezone") || Intl.DateTimeFormat().resolvedOptions().timeZone;
const marketSessions = [
    { name: "Session Asiatique", startUTC: 0, endUTC: 9 },
    { name: "Session Européenne", startUTC: 7, endUTC: 16 },
    { name: "Session Américaine", startUTC: 13, endUTC: 22 },
    { name: "Session Pacifique", startUTC: 22, endUTC: 6 }
];

let customClocks = JSON.parse(localStorage.getItem("customClocks")) || [];

function toggleSettings() {
    const settingsSection = document.getElementById("settingsSection");
    settingsSection.style.display = settingsSection.style.display === "none" ? "block" : "none";
}

function populateTimezoneSelect() {
    const timezoneSelect = document.getElementById("timezoneSelect");
    timezoneSelect.innerHTML = Intl.supportedValuesOf("timeZone").sort().map(zone =>
        `<option value="${zone}" ${zone === userTimezone ? "selected" : ""}>${zone}</option>`
    ).join('');
}

function populateCustomClockTimezoneSelect() {
    const customClockTimezone = document.getElementById("customClockTimezone");
    customClockTimezone.innerHTML = Intl.supportedValuesOf("timeZone").sort().map(zone =>
        `<option value="${zone}">${zone}</option>`
    ).join('');
}

function updateUserTimezone() {
    userTimezone = document.getElementById("timezoneSelect").value;
    localStorage.setItem("userTimezone", userTimezone);
    updateCurrentSession();
    populateMarketSessionsList();
    updateCustomClocks();
}

function convertToTimezone(utcHour, timezone) {
    const date = new Date();
    date.setUTCHours(utcHour, 0, 0, 0);
    return date.toLocaleTimeString("fr-FR", { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
}

function updateCurrentSession() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    let activeSessions = marketSessions.filter(session =>
        (session.startUTC <= utcHour && utcHour < session.endUTC) ||
        (session.startUTC > session.endUTC && (utcHour >= session.startUTC || utcHour < session.endUTC))
    );

    const sessionTitle = activeSessions.map(s => s.name).join(" & ") || "Aucune session en cours";
    const sessionTime = now.toLocaleTimeString("fr-FR", { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.getElementById("sessionTitle").innerText = sessionTitle;
    document.getElementById("sessionTime").innerText = sessionTime;
}

function populateMarketSessionsList() {
    const marketSessionsList = document.getElementById("marketSessionsList");
    marketSessionsList.innerHTML = marketSessions.map(session => {
        const startLocal = convertToTimezone(session.startUTC, userTimezone);
        const endLocal = convertToTimezone(session.endUTC, userTimezone);
        return `<li class="list-group-item">${session.name}: ${startLocal} - ${endLocal}</li>`;
    }).join('');
}

function addCustomClock(title, timezone) {
    customClocks.push({ title, timezone });
    localStorage.setItem("customClocks", JSON.stringify(customClocks));
    updateCustomClocks();
}

function updateCustomClocks() {
    const customClocksList = document.getElementById("customClocksList");
    customClocksList.innerHTML = customClocks.map((clock, index) => {
        const now = new Date();
        const time = now.toLocaleTimeString("fr-FR", { timeZone: clock.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${clock.title}: ${time}</span>
                <button class="btn btn-danger btn-sm" onclick="removeCustomClock(${index})">Supprimer</button>
            </li>`;
    }).join('');
}

function removeCustomClock(index) {
    customClocks.splice(index, 1);
    localStorage.setItem("customClocks", JSON.stringify(customClocks));
    updateCustomClocks();
}

window.onload = () => {
    populateTimezoneSelect();
    populateCustomClockTimezoneSelect();
    populateMarketSessionsList();
    updateCurrentSession();
    updateCustomClocks();
    setInterval(updateCurrentSession, 1000);
    setInterval(updateCustomClocks, 1000);

    document.getElementById("customClockForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("customClockTitle").value;
        const timezone = document.getElementById("customClockTimezone").value;
        addCustomClock(title, timezone);
        document.getElementById("customClockForm").reset();
    });
};
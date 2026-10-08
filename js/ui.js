(function() { try { if (localStorage.getItem("theme") === "dark") document.documentElement.setAttribute("data-theme", "dark"); } catch(e) {} })();

function showToast(mensaje, tipo = "success") {
    let container = document.getElementById("toast-container");
    if (!container) { container = document.createElement("div"); container.id = "toast-container"; document.body.appendChild(container); }
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo} fade-in`;
    toast.innerHTML = (tipo === "success" ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>') + ` <span>${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = "fadeOut 0.4s forwards"; setTimeout(() => toast.remove(), 400); }, 3500);
}

function mostrarConfirmacion(titulo, mensaje, onConfirmar) {
    let existing = document.getElementById("customConfirmModal");
    if (existing) existing.remove();
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "customConfirmModal"; modalOverlay.className = "modal-overlay";
    modalOverlay.innerHTML = `<div class="modal-card"><div class="modal-icon"><i class="fa-solid fa-triangle-exclamation"></i></div><h3>${titulo}</h3><p>${mensaje}</p><div class="modal-actions"><button id="confirmCancel" class="btn-secondary-modal">Cancelar</button><button id="confirmOk" class="btn-danger-modal">Sí, continuar</button></div></div>`;
    document.body.appendChild(modalOverlay);
    document.getElementById("confirmCancel").onclick = () => modalOverlay.remove();
    document.getElementById("confirmOk").onclick = () => { modalOverlay.remove(); if(onConfirmar) onConfirmar(); };
}

function escaparHTML(texto) { if (!texto) return ""; const div = document.createElement('div'); div.textContent = texto; return div.innerHTML; }

document.addEventListener("DOMContentLoaded", () => {
    // Protección global
    if (!window.location.pathname.includes("index") && !window.location.pathname.includes("registro") && !window.location.pathname.includes("recuperar") && !localStorage.getItem("usuario")) {
        window.location.replace("index.html"); return;
    }

    const themeToggleBtn = document.getElementById("themeToggle");
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = document.documentElement.getAttribute("data-theme") === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        themeToggleBtn.addEventListener("click", () => {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
            localStorage.setItem("theme", isDark ? "light" : "dark");
            themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        });
    }

    // Pomodoro logic
    const D = 25 * 60; let pomoInterval;
    const startBtn = document.getElementById("sidebarPomoStart"), resetBtn = document.getElementById("sidebarPomoReset"), display = document.getElementById("sidebarPomoTimer");
    function getPomo() { return JSON.parse(localStorage.getItem("pomodoroState")) || { timeLeft: D, isRunning: false, endTime: null }; }
    function setPomo(s) { localStorage.setItem("pomodoroState", JSON.stringify(s)); }
    function act(seg) { if(display) display.textContent = `${Math.floor(seg/60).toString().padStart(2,'0')}:${(seg%60).toString().padStart(2,'0')}`; }
    
    let pState = getPomo();
    if(pState.isRunning && pState.endTime) {
        const rest = Math.round((pState.endTime - Date.now())/1000);
        if(rest>0) { pState.timeLeft = rest; runClock(); } else { pState.isRunning=false; pState.timeLeft=D; pState.endTime=null; setPomo(pState); showToast("¡Pomodoro listo!","success"); }
    }
    act(pState.timeLeft);

    function runClock() {
        if(startBtn) { startBtn.textContent="Pausar"; startBtn.style.background="#f59e0b"; }
        clearInterval(pomoInterval);
        pomoInterval = setInterval(() => {
            let s = getPomo(); if(!s.isRunning) { clearInterval(pomoInterval); return; }
            const r = Math.round((s.endTime - Date.now())/1000);
            if(r>0) { s.timeLeft = r; setPomo(s); act(r); } else { clearInterval(pomoInterval); s.isRunning=false; s.timeLeft=D; s.endTime=null; setPomo(s); act(D); if(startBtn){startBtn.textContent="Iniciar";startBtn.style.background="var(--primary)";} showToast("¡Tiempo!","success"); }
        }, 1000);
    }

    if(startBtn) startBtn.onclick = () => { let s = getPomo(); if(!s.isRunning) { s.isRunning=true; s.endTime = Date.now()+(s.timeLeft*1000); setPomo(s); runClock(); } else { clearInterval(pomoInterval); s.isRunning=false; s.timeLeft = Math.max(0, Math.round((s.endTime-Date.now())/1000)); s.endTime=null; setPomo(s); startBtn.textContent="Iniciar"; startBtn.style.background="var(--primary)"; act(s.timeLeft); }};
    if(resetBtn) resetBtn.onclick = () => { clearInterval(pomoInterval); setPomo({timeLeft:D, isRunning:false, endTime:null}); act(D); if(startBtn){startBtn.textContent="Iniciar"; startBtn.style.background="var(--primary)";} };

    document.querySelectorAll(".logout").forEach(btn => btn.onclick = () => { localStorage.removeItem("usuario"); window.location.replace("index.html"); });
});
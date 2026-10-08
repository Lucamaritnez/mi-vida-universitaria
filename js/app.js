document.addEventListener("DOMContentLoaded", () => {
    let usuario;
    try { usuario = JSON.parse(localStorage.getItem("usuario")); if (!usuario) throw new Error(); } catch { return; }
    
    // Fechas y Saludos
    const fechaEl = document.getElementById("currentDate");
    if (fechaEl) {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        fechaEl.innerHTML = `<i class="fa-regular fa-calendar-days"></i> <span>${new Date().toLocaleDateString('es-ES', opciones)}</span>`;
    }
    
    const avatarEl = document.getElementById("userAvatar");
    if (avatarEl) avatarEl.textContent = (usuario.nombre || "U").charAt(0).toUpperCase();

    const saludoEl = document.getElementById("dynamicGreeting");
    if (saludoEl) {
        const h = new Date().getHours();
        let saludo = "Buenas noches";
        if (h >= 5 && h < 12) saludo = "Buenos días";
        else if (h >= 12 && h < 20) saludo = "Buenas tardes";
        saludoEl.innerHTML = `${saludo}, ${escaparHTML(usuario.nombre.split(' ')[0])} 👋`;
    }

    // Progreso
    let eventos = usuario.eventos || [];
    let completados = eventos.filter(e => e.completado).length;
    let pendientes = eventos.filter(e => !e.completado).length;
    let total = eventos.length;
    let progreso = total === 0 ? 0 : Math.round((completados / total) * 100);

    const pendCount = document.getElementById("pendientesCount");
    const compCount = document.getElementById("completadasCount");
    const progText = document.getElementById("progressText");
    const progBar = document.getElementById("progressBar");

    if (pendCount) pendCount.textContent = pendientes;
    if (compCount) compCount.textContent = completados;
    if (progText) progText.textContent = `${progreso}% Completado`;
    if (progBar) progBar.style.width = `${progreso}%`;

    // Renderizar urgentes
    const lista = document.getElementById("listaPendientesDashboard");
    const sinPendientes = document.getElementById("sinPendientes");
    
    if (lista) {
        lista.innerHTML = "";
        let urgentes = eventos.filter(e => !e.completado).sort((a,b) => a.fecha.localeCompare(b.fecha)).slice(0, 4);
        
        if (urgentes.length === 0) {
            if (sinPendientes) sinPendientes.style.display = "block";
        } else {
            if (sinPendientes) sinPendientes.style.display = "none";
            urgentes.forEach(e => {
                const [anio, mes, dia] = e.fecha.split("-");
                lista.innerHTML += `
                <div class="stat-card fade-in" style="margin-bottom: 12px; flex-direction: row; align-items: center; justify-content: space-between; padding: 14px 22px;">
                    <div>
                        <h3 style="font-size: 15px; margin-bottom: 2px;">${escaparHTML(e.titulo)}</h3>
                        <span style="font-size: 12px; color: var(--text-light);"><strong style="color: var(--primary);">${escaparHTML(e.materiaAsociada || "General")}</strong> • ${dia}/${mes}/${anio}</span>
                    </div>
                    <span class="badge-dias bg-naranja">${escaparHTML(e.tipo)}</span>
                </div>`;
            });
        }
    }
});
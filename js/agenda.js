document.addEventListener("DOMContentLoaded", () => {
    let usuario;
    try { 
        usuario = JSON.parse(localStorage.getItem("usuario")); 
        if (!usuario) throw new Error();
    } catch(err) { 
        window.location.replace("index.html"); return; 
    }

    if (!Array.isArray(usuario.eventos)) usuario.eventos = [];
    if (!Array.isArray(usuario.materias)) usuario.materias = [];

    const nombre = usuario.nombre || "Estudiante";
    const avatarEl = document.getElementById("userAvatar");
    if (avatarEl) avatarEl.textContent = nombre.charAt(0).toUpperCase();

    const eventForm = document.getElementById("eventForm");
    const addEventButton = document.getElementById("addEventButton");
    const saveEventButton = document.getElementById("saveEventButton");
    const eventSubjectSelect = document.getElementById("eventSubjectSelect");
    let filtroActual = "todos";

    if (addEventButton && eventForm) {
        addEventButton.addEventListener("click", () => {
            eventForm.style.display = eventForm.style.display === "none" ? "block" : "none";
            if (eventForm.style.display === "block") {
                cargarSelectMaterias();
            }
        });
    }

    function cargarSelectMaterias() {
        if (!eventSubjectSelect) return;
        eventSubjectSelect.innerHTML = '<option value="General">Materia: General</option>';
        usuario.materias.forEach(m => {
            eventSubjectSelect.innerHTML += `<option value="${escaparHTML(m.nombre)}">${escaparHTML(m.nombre)}</option>`;
        });
    }

    function guardarYRefrescar() {
        localStorage.setItem("usuario", JSON.stringify(usuario));
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const index = usuarios.findIndex(u => u.id === usuario.id);
        if (index !== -1) { 
            usuarios[index] = usuario; 
            localStorage.setItem("usuarios", JSON.stringify(usuarios)); 
        }
        renderizarEventos();
    }

    function calcularDiasExactos(fechaString) {
        if (!fechaString) return 0;
        const [anio, mes, dia] = fechaString.split('-');
        const fechaE = new Date(anio, mes - 1, dia);
        fechaE.setHours(0,0,0,0);
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        return Math.ceil((fechaE - hoy) / (1000 * 60 * 60 * 24));
    }

    if (saveEventButton) {
        saveEventButton.addEventListener("click", () => {
            const titulo = document.getElementById("eventTitle").value.trim();
            const fecha = document.getElementById("eventDate").value;
            const materiaAsociada = eventSubjectSelect.value;
            const tipo = document.getElementById("eventType").value;

            if (!titulo || !fecha) {
                showToast("Por favor completa el título y la fecha del evento.", "error");
                return;
            }

            const dias = calcularDiasExactos(fecha);
            if (dias < 0) {
                showToast("⚠️ Atención: Estás agendando un evento con fecha pasada.", "error");
            }

            const nuevoEvento = {
                id: Date.now(),
                titulo,
                fecha,
                materiaAsociada,
                tipo,
                completado: false
            };

            usuario.eventos.push(nuevoEvento);
            guardarYRefrescar();

            document.getElementById("eventTitle").value = "";
            document.getElementById("eventDate").value = "";
            eventForm.style.display = "none";
            showToast("✨ ¡Evento agendado con éxito!", "success");
        });
    }

    // Botones de filtro
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            filtroActual = this.dataset.filter;
            renderizarEventos();
        });
    });

    function renderizarEventos() {
        const eventsList = document.getElementById("eventsList");
        const emptyEvents = document.getElementById("emptyEvents");
        if (!eventsList) return;

        eventsList.innerHTML = "";

        let eventosFiltrados = usuario.eventos;
        if (filtroActual !== "todos") {
            eventosFiltrados = usuario.eventos.filter(e => e.tipo === filtroActual);
        }

        if (eventosFiltrados.length === 0) {
            if (emptyEvents) emptyEvents.style.display = "block";
        } else {
            if (emptyEvents) emptyEvents.style.display = "none";
            eventosFiltrados.sort((a, b) => a.fecha.localeCompare(b.fecha));

            eventosFiltrados.forEach(e => {
                const dias = calcularDiasExactos(e.fecha);
                let badge = "bg-azul"; let txt = `Faltan ${dias} días`;
                
                if (dias < 0) { badge = "bg-rojo"; txt = "Vencido"; }
                else if (dias === 0) { badge = "bg-rojo"; txt = "¡Es hoy!"; }
                else if (dias <= 3) badge = "bg-rojo";
                else if (dias <= 7) badge = "bg-naranja";

                const [anio, mes, dia] = e.fecha.split("-");
                const claseCompletado = e.completado ? "tarea-completada" : "";
                const textoBtnCheck = e.completado ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-check" style="opacity: 0.8; font-size: 14px;"></i>';
                const claseCheckExtra = e.completado ? "completado" : "";

                eventsList.innerHTML += `
                    <div class="stat-card fade-in ${claseCompletado}" style="margin-bottom: 12px; flex-direction: row; align-items: center; justify-content: space-between; padding: 14px 22px;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <button class="btn-check ${claseCheckExtra}" data-id="${e.id}" title="Marcar como completado">
                                ${textoBtnCheck}
                            </button>
                            <div>
                                <h3 style="font-size: 15px; margin-bottom: 2px;">${escaparHTML(e.titulo)}</h3>
                                <span style="font-size: 12px; color: var(--text-light);"><strong style="color: var(--primary);">${escaparHTML(e.materiaAsociada) || "General"}</strong> • ${dia}/${mes}/${anio} • ${e.tipo}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span class="badge-dias ${badge}">${txt}</span>
                            <button class="btn-delete-event" data-id="${e.id}" title="Eliminar evento" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 16px; padding: 6px; transition: 0.2s;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>`;
            });

            document.querySelectorAll(".btn-check").forEach(btn => {
                btn.addEventListener("click", function() {
                    const idx = usuario.eventos.findIndex(ev => ev.id === Number(this.dataset.id));
                    if (idx !== -1) { 
                        usuario.eventos[idx].completado = !usuario.eventos[idx].completado;
                        const mensaje = usuario.eventos[idx].completado ? "🌟 ¡Excelente trabajo! Tarea completada." : "Tarea marcada como pendiente.";
                        showToast(mensaje, "success");
                        guardarYRefrescar(); 
                    }
                });
            });

            document.querySelectorAll(".btn-delete-event").forEach(btn => {
                btn.addEventListener("click", function() {
                    const eventoId = Number(this.dataset.id);
                    mostrarConfirmacion(
                        "¿Eliminar evento?", 
                        "Esta acción eliminará el compromiso permanentemente de tu agenda.", 
                        () => {
                            usuario.eventos = usuario.eventos.filter(ev => ev.id !== eventoId);
                            guardarYRefrescar();
                            showToast("🗑️ Evento eliminado correctamente.", "success");
                        }
                    );
                });
            });
        }
    }

    renderizarEventos();

    document.querySelectorAll(".logout").forEach(btn => {
        btn.addEventListener("click", () => { 
            localStorage.removeItem("usuario"); 
            window.location.replace("index.html"); 
        });
    });
});
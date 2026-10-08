document.addEventListener("DOMContentLoaded", () => {
    let usuario;
    try {
        usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) throw new Error();
    } catch(err) {
        window.location.replace("index.html"); return;
    }

    if (!Array.isArray(usuario.materias)) usuario.materias = [];
    if (!Array.isArray(usuario.eventos)) usuario.eventos = [];

    const nombre = usuario.nombre || "Estudiante";
    const avatarEl = document.getElementById("userAvatar");
    if (avatarEl) avatarEl.textContent = nombre.charAt(0).toUpperCase();

    const formSection = document.getElementById("materiaFormSection");
    const btnNew = document.getElementById("btnNuevaMateria");
    const btnSave = document.getElementById("btnGuardarMateria");
    const listaMaterias = document.getElementById("listaMaterias");
    const emptyState = document.getElementById("emptyMaterias");

    if (btnNew && formSection) {
        btnNew.addEventListener("click", () => {
            formSection.style.display = formSection.style.display === "none" ? "block" : "none";
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
        renderizarMaterias();
    }

    if (btnSave) {
        btnSave.addEventListener("click", () => {
            const nombreMat = document.getElementById("materiaNombre").value.trim();
            const profesor = document.getElementById("materiaProfesor").value.trim() || "No especificado";
            const horario = document.getElementById("materiaHorario").value.trim() || "No especificado";

            if (!nombreMat) {
                showToast("Por favor, ingresá el nombre de la materia.", "error");
                return;
            }

            // SEGURIDAD: Evitar materias duplicadas
            const existe = usuario.materias.some(m => m.nombre.toLowerCase() === nombreMat.toLowerCase());
            if (existe) {
                showToast("⚠️ Ya existe una materia registrada con ese nombre.", "error");
                return;
            }

            usuario.materias.push({ nombre: nombreMat, profesor, horario });
            guardarYRefrescar();

            document.getElementById("materiaNombre").value = "";
            document.getElementById("materiaProfesor").value = "";
            document.getElementById("materiaHorario").value = "";
            formSection.style.display = "none";
            showToast("✨ Materia agregada con éxito.", "success");
        });
    }

    function mostrarModalAgregarEventoRapido(materiaNombre) {
        let existing = document.getElementById("quickAddEventModal");
        if (existing) existing.remove();

        const modalOverlay = document.createElement("div");
        modalOverlay.id = "quickAddEventModal";
        modalOverlay.className = "modal-overlay";
        modalOverlay.innerHTML = `
            <div class="modal-card" style="max-width: 450px; text-align: left; animation: fadeIn 0.3s ease-out;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: var(--dark); font-size: 18px; margin: 0;">Agregar a <span style="color: var(--primary);">${escaparHTML(materiaNombre)}</span></h3>
                    <button id="closeQuickAdd" style="background: transparent; border: none; font-size: 20px; color: var(--text-light); cursor: pointer; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <div class="input-group" style="margin-bottom: 14px;">
                    <i class="fa-regular fa-pen-to-square"></i>
                    <input type="text" id="qaEventTitle" placeholder="Título (Ej: Parcial 1)" required>
                </div>
                
                <div class="input-group" style="margin-bottom: 14px;">
                    <i class="fa-regular fa-calendar"></i>
                    <input type="date" id="qaEventDate" required>
                </div>
                
                <div class="input-group" style="margin-bottom: 20px;">
                    <i class="fa-solid fa-tag"></i>
                    <select id="qaEventType">
                        <option value="Examen">Examen</option>
                        <option value="TP">Trabajo Práctico</option>
                        <option value="Entrega">Entrega</option>
                        <option value="Final">Examen Final</option>
                    </select>
                </div>

                <button id="qaSaveEvent" class="btn-primary" style="width: 100%;"><i class="fa-solid fa-check"></i> Guardar Evento</button>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        document.getElementById("closeQuickAdd").addEventListener("click", () => modalOverlay.remove());
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) modalOverlay.remove();
        });

        document.getElementById("qaSaveEvent").addEventListener("click", () => {
            const titulo = document.getElementById("qaEventTitle").value.trim();
            const fecha = document.getElementById("qaEventDate").value;
            const tipo = document.getElementById("qaEventType").value;

            if (!titulo || !fecha) {
                showToast("Por favor completa el título y la fecha.", "error");
                return;
            }

            const nuevoEvento = {
                id: Date.now(),
                titulo,
                fecha,
                materiaAsociada: materiaNombre,
                tipo,
                completado: false
            };

            usuario.eventos.push(nuevoEvento);
            guardarYRefrescar();
            modalOverlay.remove();
            showToast(`✨ ¡Evento agendado con éxito para ${materiaNombre}!`, "success");
        });
    }

    function renderizarMaterias() {
        if (!listaMaterias) return;
        listaMaterias.innerHTML = "";

        if (usuario.materias.length === 0) {
            if (emptyState) emptyState.style.display = "block";
        } else {
            if (emptyState) emptyState.style.display = "none";

            usuario.materias.forEach((m, index) => {
                const eventosAsociados = usuario.eventos.filter(e => e.materiaAsociada === m.nombre);

                listaMaterias.innerHTML += `
                    <div class="stat-card fade-in clickable-card" data-nombre="${escaparHTML(m.nombre)}" title="Clic para agregar un evento a esta materia" style="margin-bottom: 12px; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 22px;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 45px; height: 45px; background: rgba(67, 97, 238, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                <i class="fa-solid fa-book-open"></i>
                            </div>
                            <div>
                                <h3 style="font-size: 16px; margin-bottom: 2px; color: var(--dark);">${escaparHTML(m.nombre)}</h3>
                                <span style="font-size: 13px; color: var(--text-light);"><i class="fa-regular fa-user" style="font-size: 11px;"></i> ${escaparHTML(m.profesor)} • <i class="fa-regular fa-clock" style="font-size: 11px;"></i> ${escaparHTML(m.horario)}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="text-align: right; margin-right: 10px;">
                                <span style="font-size: 12px; font-weight: 600; color: var(--text-light); background: var(--background); padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border);">${eventosAsociados.length} eventos</span>
                            </div>
                            <button class="btn-delete-materia" data-index="${index}" data-nombre="${escaparHTML(m.nombre)}" title="Eliminar materia" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 18px; padding: 6px; transition: 0.2s;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            document.querySelectorAll(".clickable-card").forEach(card => {
                card.addEventListener("click", function(e) {
                    if (e.target.closest('.btn-delete-materia')) return;
                    const matNombre = this.dataset.nombre;
                    mostrarModalAgregarEventoRapido(matNombre);
                });
            });

            document.querySelectorAll(".btn-delete-materia").forEach(btn => {
                btn.addEventListener("click", function(e) {
                    const idx = this.dataset.index;
                    const matNombre = this.dataset.nombre;

                    mostrarConfirmacion(
                        "¿Eliminar materia?", 
                        `¿Estás seguro de que querés borrar la materia <strong>${matNombre}</strong>? También se eliminarán de tu agenda todos los eventos asociados a ella.`, 
                        () => {
                            usuario.materias.splice(idx, 1);
                            usuario.eventos = usuario.eventos.filter(ev => ev.materiaAsociada !== matNombre);
                            guardarYRefrescar();
                            showToast("🗑️ Materia y eventos asociados eliminados.", "success");
                        }
                    );
                });
            });
        }
    }

    renderizarMaterias();

    document.querySelectorAll(".logout").forEach(btn => {
        btn.addEventListener("click", () => {
            localStorage.removeItem("usuario");
            window.location.replace("index.html");
        });
    });
});
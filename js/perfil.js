document.addEventListener("DOMContentLoaded", () => {
    let usuario;
    try {
        usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) throw new Error();
    } catch(err) {
        window.location.replace("index.html"); return;
    }

    const nameInput = document.getElementById("profileNameInput");
    const emailInput = document.getElementById("profileEmailInput");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileAvatar = document.getElementById("profileAvatar");
    const userAvatar = document.getElementById("userAvatar");
    const saveBtn = document.getElementById("saveProfileButton");

    function cargarDatosPerfil() {
        const nombre = usuario.nombre || "";
        const email = usuario.email || "";

        if (nameInput) nameInput.value = nombre;
        if (emailInput) emailInput.value = email;
        if (profileName) profileName.textContent = nombre;
        if (profileEmail) profileEmail.textContent = email;
        
        const inicial = nombre.charAt(0).toUpperCase() || "U";
        if (profileAvatar) profileAvatar.textContent = inicial;
        if (userAvatar) userAvatar.textContent = inicial;
    }

    cargarDatosPerfil();

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const nuevoNombre = nameInput.value.trim();
            const nuevoEmail = emailInput.value.trim();

            if (!nuevoNombre || !nuevoEmail) {
                showToast("Por favor completa todos los campos.", "error");
                return;
            }

            usuario.nombre = nuevoNombre;
            usuario.email = nuevoEmail;

            localStorage.setItem("usuario", JSON.stringify(usuario));
            let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            const idx = usuarios.findIndex(u => u.id === usuario.id);
            if (idx !== -1) {
                usuarios[idx] = usuario;
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
            }

            cargarDatosPerfil();
            showToast("✨ ¡Perfil actualizado con éxito!", "success");
        });
    }

    // EXPORTAR DATOS
    const exportBtn = document.getElementById("exportDataBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(usuario, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `backup_universidad_${usuario.nombre || 'usuario'}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("📥 Copia de seguridad exportada correctamente.", "success");
        });
    }

    // IMPORTAR DATOS CON VALIDACIÓN SEGURA (TRY...CATCH)
    const importBtn = document.getElementById("importDataBtn");
    const importFile = document.getElementById("importFile");

    if (importBtn && importFile) {
        importBtn.addEventListener("click", () => importFile.click());

        importFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const datosImportados = JSON.parse(event.target.result);
                    
                    // Validación robusta del formato JSON
                    if (!datosImportados || typeof datosImportados.nombre !== 'string' || !Array.isArray(datosImportados.eventos)) {
                        throw new Error("Estructura de archivo inválida.");
                    }

                    usuario = datosImportados;
                    localStorage.setItem("usuario", JSON.stringify(usuario));
                    
                    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
                    const idx = usuarios.findIndex(u => u.id === usuario.id);
                    if (idx !== -1) {
                        usuarios[idx] = usuario;
                    } else {
                        usuarios.push(usuario);
                    }
                    localStorage.setItem("usuarios", JSON.stringify(usuarios));

                    cargarDatosPerfil();
                    showToast("✨ ¡Datos importados correctamente con éxito!", "success");
                    importFile.value = "";
                } catch(err) {
                    showToast("❌ Error: El archivo JSON no es válido o está dañado.", "error");
                    importFile.value = "";
                }
            };
            reader.readAsText(file);
        });
    }

    document.querySelectorAll(".logout").forEach(btn => {
        btn.addEventListener("click", () => {
            localStorage.removeItem("usuario");
            window.location.replace("index.html");
        });
    });
});
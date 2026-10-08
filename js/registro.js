document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("usuario")) { window.location.href = "dashboard.html"; return; }
    const registroForm = document.querySelector("form");
    if (registroForm) {
        registroForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombreInput = registroForm.querySelector('input[type="text"]');
            const emailInput = registroForm.querySelector('input[type="email"]');
            const passwordInput = registroForm.querySelector('input[type="password"]');
            const nombre = nombreInput ? nombreInput.value.trim() : "Estudiante";
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            if (usuarios.some(u => u.email === email)) {
                if (typeof showToast === "function") showToast("⚠️ Este correo ya está registrado", "error");
                else alert("Este correo ya está registrado");
                return;
            }
            const nuevoUsuario = { id: Date.now(), nombre, email, password, materias: [], eventos: [] };
            usuarios.push(nuevoUsuario);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
            window.location.href = "dashboard.html";
        });
    }
});
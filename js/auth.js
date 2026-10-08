document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("usuario")) { window.location.href = "dashboard.html"; return; }
    const loginForm = document.querySelector("form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value.trim();
            const password = loginForm.querySelector('input[type="password"]').value;
            let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);
            if (usuarioEncontrado) {
                localStorage.setItem("usuario", JSON.stringify(usuarioEncontrado));
                window.location.href = "dashboard.html";
            } else {
                if (typeof showToast === "function") showToast("❌ Correo o contraseña incorrectos", "error");
                else alert("Correo o contraseña incorrectos");
            }
        });
    }
});
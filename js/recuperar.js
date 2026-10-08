document.addEventListener("DOMContentLoaded", () => {
    const recuperarForm = document.querySelector("form");
    if (recuperarForm) {
        recuperarForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.querySelector('input[type="email"]').value.trim();
            let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            const usuarioEncontrado = usuarios.find(u => u.email === email);
            if (usuarioEncontrado) {
                alert(`🔒 Tu contraseña es: ${usuarioEncontrado.password}`);
                window.location.href = "index.html";
            } else {
                if (typeof showToast === "function") showToast("❌ Correo no encontrado.", "error");
                else alert("Correo no encontrado.");
            }
        });
    }
});
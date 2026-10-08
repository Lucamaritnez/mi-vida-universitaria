document.addEventListener("DOMContentLoaded", () => {
    let usuario;
    try { 
        usuario = JSON.parse(localStorage.getItem("usuario")); 
        if (!usuario) throw new Error(); 
    } catch(err) { 
        window.location.replace("index.html"); 
        return; 
    }

    const nombreUsuario = usuario.nombre || "Usuario";
    const avatar = document.getElementById("userAvatar");
    if (avatar) {
        avatar.textContent = nombreUsuario.charAt(0).toUpperCase();
    }

    document.querySelectorAll(".logout").forEach(btn => {
        btn.addEventListener("click", () => { 
            localStorage.removeItem("usuario"); 
            window.location.replace("index.html"); 
        });
    });
});
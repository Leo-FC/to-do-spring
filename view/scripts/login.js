const loginForm = document.getElementById('loginForm');
const alertError = document.getElementById('alertError');
const API_URL = "http://localhost:8080";

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const token = response.headers.get("Authorization");
            const data = await response.json();

            if (token && data) {
                localStorage.setItem("token", token);
                localStorage.setItem("userRoles", data.roles);
                window.location.href = "index.html";
            } else {
                showError("Erro: O servidor não retornou o token.");
            }
        } else {
            showError("Usuário ou senha incorretos.");
        }
    } catch (error) {
        console.error("Erro:", error);
        showError("Erro ao conectar com o servidor.");
    }
});

function showError(message) {
    alertError.textContent = message;
    alertError.classList.remove('d-none');
}
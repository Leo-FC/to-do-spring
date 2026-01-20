const signupForm = document.getElementById('signupForm');
const alertError = document.getElementById('alertError');
const alertSuccess = document.getElementById('alertSuccess');
const API_URL = "http://localhost:8080";

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (username.length < 2) {
        showError("O usuário deve ter pelo menos 3 caracteres.");
        return;
    }

    if (password.length < 8) {
        showError("A senha deve ter pelo menos 8 caracteres.");
        return;
    }

    if (password !== confirmPassword) {
        showError("As senhas não coincidem.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            showSuccess();
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            const data = await response.json();
            if (data && data.message) {
                showError(data.message);
            }else if (data.errors){
                const errorMessages = data.errors.map(err => err.message).join("\n");
                showError(errorMessages)
            } else {
                showError("Erro ao criar usuário.");
            }
        }
    } catch (error) {
        console.error("Erro:", error);
        showError("Falha na comunicação com o servidor.");
    }
});

function showError(message) {
    alertSuccess.classList.add('d-none');
    alertError.textContent = message;
    alertError.classList.remove('d-none');
}

function showSuccess() {
    alertError.classList.add('d-none');
    alertSuccess.classList.remove('d-none');
}
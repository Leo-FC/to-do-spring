const API_URL = "http://localhost:8080";

let taskIdToDelete = null;
let taskIdToEdit = null;
let deleteModalBS = null;
let editModalBS = null;

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        logout();
    } else {
        getTasks();
        deleteModalBS = new bootstrap.Modal(document.getElementById('deleteModal'));
        editModalBS = new bootstrap.Modal(document.getElementById('editModal'));
    }
});

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

async function getTasks() {
    const token = localStorage.getItem("token");
    const loadingElement = document.getElementById("loading");

    try {
        const response = await fetch(`${API_URL}/task/user`, {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 403 || response.status === 401) {
            alert("Sessão expirada. Faça login novamente.");
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error("Erro ao buscar tarefas");
        }

        const tasks = await response.json();
        renderTasks(tasks);

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados: " + error.message);
    } finally {
        if(loadingElement) loadingElement.classList.add("d-none");
    }
}

function handleEnter(event) {
    if (event.key === "Enter") {
        createTask();
    }
}

async function createTask() {
    const descriptionInput = document.getElementById("taskDescription");
    const description = descriptionInput.value;
    const token = localStorage.getItem("token");

    if (!description || description.trim() === "") {
        alert("A descrição da tarefa não pode estar vazia!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/task`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: description
            })
        });

        if (response.ok) {
            descriptionInput.value = "";
            getTasks();
        } else {
            alert("Erro ao criar tarefa.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Falha na comunicação com o servidor.");
    }
}

async function deleteTask(id) {
    const token = localStorage.getItem("token");

    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/task/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            getTasks();
        } else {
            alert("Erro ao deletar tarefa.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Falha na comunicação com o servidor.");
    }
}

async function updateTask(id, currentDescription) {
    const token = localStorage.getItem("token");

    const newDescription = prompt("Edite a descrição da tarefa:", currentDescription);

    if (newDescription === null || newDescription.trim() === "") {
        return;
    }

    if (newDescription === currentDescription) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/task/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: newDescription
            })
        });

        if (response.ok) {
            getTasks();
        } else {
            alert("Erro ao atualizar tarefa.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Falha na comunicação com o servidor.");
    }
}

function openDeleteModal(id) {
    taskIdToDelete = id;
    deleteModalBS.show();
}

async function confirmDeleteTask() {
    if (!taskIdToDelete) return;

    try {
        const response = await fetch(`${API_URL}/task/${taskIdToDelete}`, {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("token"),
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            getTasks();
            deleteModalBS.hide();
        } else {
            alert("Erro ao deletar tarefa.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Falha na comunicação com o servidor.");
    }
}

function openEditModal(id, currentDescription) {
    taskIdToEdit = id;
    const input = document.getElementById('editTaskDescription');
    input.value = currentDescription;
    editModalBS.show();

    setTimeout(() => input.focus(), 500);
}

async function confirmUpdateTask() {
    if (!taskIdToEdit) return;

    const newDescription = document.getElementById('editTaskDescription').value;

    if (!newDescription || newDescription.trim() === "") {
        alert("A descrição não pode ser vazia.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/task/${taskIdToEdit}`, {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: newDescription
            })
        });

        if (response.ok) {
            getTasks();
            editModalBS.hide();
        } else {
            alert("Erro ao atualizar tarefa.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Falha na comunicação com o servidor.");
    }
}

function renderTasks(tasks) {
    const tbody = document.getElementById("tasksBody");
    const table = document.getElementById("tasksTable");
    const noTasks = document.getElementById("noTasksMessage");

    tbody.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        noTasks.classList.remove("d-none");
        table.classList.add("d-none");
        return;
    }

    table.classList.remove("d-none");
    noTasks.classList.add("d-none");

    tasks.forEach((task, index) => {
        const safeDescription = task.description.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${task.description}</td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm me-2" onclick="openEditModal(${task.id}, '${safeDescription}')">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${task.id})">
                        <i class="bi bi-trash"></i> Deletar
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
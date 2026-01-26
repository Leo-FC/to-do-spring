const API_URL = "http://localhost:8080";

let currentTasks = [];
let currentViewMode = 'list'; // 'list' ou 'kanban'

let taskIdToDelete = null;
let taskIdToEdit = null;
let deleteModalBS = null;
let editModalBS = null;

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        logout();
    } else {
        deleteModalBS = new bootstrap.Modal(document.getElementById('deleteModal'));
        editModalBS = new bootstrap.Modal(document.getElementById('editModal'));

        if (isAdmin()) {
            setupAdminPanel();
            getTasks('mine');
        } else {
            getTasks('mine');
            displayUserInfo();
        }
    }
});

function switchView(mode) {
    currentViewMode = mode;
    const listContainer = document.getElementById("listViewContainer");
    const kanbanContainer = document.getElementById("kanbanViewContainer");
    const btnList = document.getElementById("viewListBtn");
    const btnKanban = document.getElementById("viewKanbanBtn");

    if (mode === 'list') {
        listContainer.classList.remove("d-none");
        kanbanContainer.classList.add("d-none");

        btnList.classList.add("active");
        btnKanban.classList.remove("active");

        renderTasks(currentTasks);
    } else {
        listContainer.classList.add("d-none");
        kanbanContainer.classList.remove("d-none");

        btnList.classList.remove("active");
        btnKanban.classList.add("active");

        renderKanban(currentTasks);
    }
}

function getPriorityBadge(code) {
    switch(code) {
        case 1: return '<span class="badge bg-success">Baixa</span>';
        case 2: return '<span class="badge bg-primary">Média</span>';
        case 3: return '<span class="badge bg-warning text-dark">Alta</span>';
        case 4: return '<span class="badge bg-danger">Urgente</span>';
        default: return '<span class="badge bg-secondary">Indefinido</span>';
    }
}

function getStatusBadge(code) {
    switch(code) {
        case 1: return '<span class="badge border border-secondary text-secondary bg-transparent">Não Começou</span>';
        case 2: return '<span class="badge bg-info text-dark">Em Andamento</span>';
        case 3: return '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Concluído</span>';
        default: return '<span class="badge bg-secondary">?</span>';
    }
}

function formatDate(dateInput) {
    if (!dateInput) return '<span class="text-muted small">-</span>';

    if (Array.isArray(dateInput)) {
        const year = dateInput[0];
        const month = String(dateInput[1]).padStart(2, '0');
        const day = String(dateInput[2]).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

    if (typeof dateInput === 'string') {
        const parts = dateInput.split('-');
        if(parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }

    return dateInput;
}

function formatForInput(dateInput) {
    if (!dateInput) return "";

    if (Array.isArray(dateInput)) {
        const year = dateInput[0];
        const month = String(dateInput[1]).padStart(2, '0');
        const day = String(dateInput[2]).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return dateInput;
}

function isAdmin() {
    const roles = localStorage.getItem("userRoles");
    return roles && roles.includes("ROLE_ADMIN");
}

async function setupAdminPanel() {
    document.getElementById("adminPanel").classList.remove("d-none");

    try {
        const response = await fetch(`${API_URL}/user/lista`, {
            headers: { "Authorization": localStorage.getItem("token") }
        });

        if(response.ok) {
            const users = await response.json();
            const select = document.getElementById("userFilterSelect");

            select.innerHTML = '<option value="" selected>Filtrar por Usuário...</option>';

            users.forEach(user => {
                const option = document.createElement("option");
                option.value = user.username;
                option.text = `${user.username} (ID: ${user.id})`;
                select.appendChild(option);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar lista de usuários:", e);
    }
}

function setAdminView(mode, filterValue) {
    document.getElementById("btnMyTasks").classList.remove("active");
    document.getElementById("btnAllTasks").classList.remove("active");

    if (mode !== 'user') {
        document.getElementById("userFilterSelect").value = "";
    }

    const title = document.getElementById("pageTitle");

    if (mode === 'mine') {
        document.getElementById("btnMyTasks").classList.add("active");
        title.innerText = "Minhas Tarefas";
        getTasks('mine');
    }
    else if (mode === 'all') {
        document.getElementById("btnAllTasks").classList.add("active");
        title.innerText = "Todas as Tarefas do Sistema";
        getTasks('all');
    }
    else if (mode === 'user') {
        if (!filterValue) return;
        title.innerText = `Tarefas de: ${filterValue}`;
        getTasks('filter', filterValue);
    }
}

async function getTasks(mode = 'mine', filterUsername = null) {
    const token = localStorage.getItem("token");
    const loadingElement = document.getElementById("loading");

    if(loadingElement) loadingElement.classList.remove("d-none");

    document.getElementById("listViewContainer").classList.add("d-none");
    document.getElementById("kanbanViewContainer").classList.add("d-none");
    document.getElementById("noTasksMessage").classList.add("d-none");

    let endpoint = "/task/user";
    if (mode === 'all' || mode === 'filter') {
        endpoint = "/task/user/all";
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 403 || response.status === 401) {
            alert("Sessão expirada ou sem permissão. Faça login novamente.");
            logout();
            return;
        }

        let tasks = await response.json();

        currentTasks = tasks;

        if (mode === 'filter' && filterUsername) {
            currentTasks = tasks.filter(t => t.user && t.user.username === filterUsername);
        }

        if (currentViewMode === 'list') {
            document.getElementById("listViewContainer").classList.remove("d-none");
            renderTasks(currentTasks);
        } else {
            document.getElementById("kanbanViewContainer").classList.remove("d-none");
            renderKanban(currentTasks);
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados.");
    } finally {
        if(loadingElement) loadingElement.classList.add("d-none");
    }
}

function renderTasks(tasks) {
    const table = document.getElementById("tasksTable");
    const tbody = document.getElementById("tasksBody");
    const thead = table.querySelector("thead tr");
    const noTasks = document.getElementById("noTasksMessage");

    tbody.innerHTML = "";

    const userColumnId = "userColHeader";
    let userHeader = document.getElementById(userColumnId);

    if (isAdmin()) {
        if (!userHeader) {
            const th = document.createElement("th");
            th.id = userColumnId;
            th.innerText = "Usuário";
            thead.insertBefore(th, thead.children[2]);
        }
    } else {
        if (userHeader) userHeader.remove();
    }

    if (!tasks || tasks.length === 0) {
        document.getElementById("listViewContainer").classList.add("d-none");
        noTasks.classList.remove("d-none");
        return;
    }

    document.getElementById("listViewContainer").classList.remove("d-none");
    table.classList.remove("d-none");

    tasks.forEach((task, index) => {
        const createdDate = task.createdDate;
        const deadline = task.deadline;

        const userColumnHtml = isAdmin()
            ? `<td><span class="badge bg-info text-dark">${task.user ? task.user.username : 'N/A'}</span></td>`
            : '';

        const row = `
            <tr class="align-middle">
                <td>${index + 1}</td>
                <td class="fw-bold desc-cell">${task.description}</td>
                
                ${userColumnHtml}
                
                <td class="text-center">${formatDate(createdDate)}</td>
                <td class="text-center">${formatDate(deadline)}</td>

                <td class="text-center">${getPriorityBadge(task.priority)}</td>
                <td class="text-center">${getStatusBadge(task.status)}</td>
                
                <td class="text-end">
                    <button class="btn btn-outline-warning btn-sm me-1" 
                        onclick="openEditModal(${task.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="openDeleteModal(${task.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderKanban(tasks) {
    const noTasks = document.getElementById("noTasksMessage");

    for (let i = 1; i <= 4; i++) {
        const col = document.getElementById(`col-priority-${i}`);
        if(col) col.innerHTML = "";
    }

    if (!tasks || tasks.length === 0) {
        document.getElementById("kanbanViewContainer").classList.add("d-none");
        noTasks.classList.remove("d-none");
        return;
    }

    noTasks.classList.add("d-none");
    document.getElementById("kanbanViewContainer").classList.remove("d-none");

    tasks.forEach(task => {
        let statusText = "Indefinido";
        let statusClass = "status-bar-1";

        let arrowsHtml = "";

        if (task.status === 1) {
            statusText = "Não começou";
            statusClass = "status-bar-1";
            arrowsHtml = `
                <button type="button" class="status-btn" onclick="changeStatus(event, ${task.id}, 2)" title="Iniciar">
                    <i class="bi bi-caret-up-fill"></i>
                </button>
            `;
        }
        else if (task.status === 2) {
            statusText = "Em andamento";
            statusClass = "status-bar-2";
            arrowsHtml = `
                <button type="button" class="status-btn" onclick="changeStatus(event, ${task.id}, 1)" title="Voltar">
                    <i class="bi bi-caret-down-fill"></i>
                </button>
                <span class="mx-2">${statusText}</span>
                <button type="button" class="status-btn" onclick="changeStatus(event, ${task.id}, 3)" title="Concluir">
                    <i class="bi bi-caret-up-fill"></i>
                </button>
            `;
        }
        else if (task.status === 3) {
            statusText = "Concluído";
            statusClass = "status-bar-3";
            arrowsHtml = `
                <button type="button" class="status-btn" onclick="changeStatus(event, ${task.id}, 2)" title="Retomar">
                    <i class="bi bi-caret-down-fill"></i>
                </button>
            `;
        }

        if (task.status !== 2) {
            if (task.status === 1) {
                arrowsHtml = `<span>${statusText}</span> ${arrowsHtml}`;
            } else {
                arrowsHtml = `${arrowsHtml} <span>${statusText}</span>`;
            }
        }

        const deadline = formatDate(task.deadline);
        const userName = (isAdmin() && task.user) ? `<div class="small text-center mb-2" style="opacity: 0.8">${task.user.username}</div>` : '';
        const priorityClass = `prio-${task.priority}`;

        const cardHtml = `
            <div class="task-card ${priorityClass}" draggable="true" ondragstart="drag(event, ${task.id})">
                <div class="card-actions">
                    <button class="card-btn" onclick="openEditModal(${task.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="card-btn" onclick="openDeleteModal(${task.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>

                <div class="card-title" style="margin-top: 35px;">
                    ${task.description}
                </div>
                
                ${userName}

                <div class="card-dates">
                    <i class="bi bi-calendar3 me-1"></i> ${deadline}
                </div>

                <div class="card-status-bar ${statusClass}">
                    <div class="status-controls">
                        ${arrowsHtml}
                    </div>
                </div>
            </div>
        `;

        const colId = `col-priority-${task.priority}`;
        const colElement = document.getElementById(colId);
        if (colElement) {
            colElement.innerHTML += cardHtml;
        }
    });
}

function handleEnter(event) {
    if (event.key === "Enter") {
        createTask();
    }
}

async function createTask() {
    const descriptionInput = document.getElementById("taskDescription");
    const priorityInput = document.getElementById("taskPriority");
    const deadlineInput = document.getElementById("taskDeadline");

    const description = descriptionInput.value;
    const priority = priorityInput.value;
    const deadline = deadlineInput.value;
    const token = localStorage.getItem("token");

    if (!description || description.trim() === "") {
        alert("A descrição da tarefa não pode estar vazia!");
        return;
    }

    if (!priority) {
        alert("Por favor, selecione uma prioridade!");
        return;
    }

    if (deadline) {
        const today = new Date().toISOString().split('T')[0];
        if (deadline < today) {
            alert("A data de entrega não pode ser no passado!");
            return;
        }
    }

    try {
        const response = await fetch(`${API_URL}/task`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: description,
                priority: parseInt(priority),
                deadline: deadline || null
            })
        });

        if (response.ok) {
            descriptionInput.value = "";
            priorityInput.value = "";
            deadlineInput.value = "";

            if(isAdmin() && document.getElementById("btnAllTasks").classList.contains("active")) {
                getTasks('all');
            } else {
                getTasks('mine');
                if(isAdmin()) setAdminView('mine');
            }
        } else {
            alert("Erro ao criar tarefa.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Falha na comunicação com o servidor.");
    }
}


function openEditModal(id) {
    const task = currentTasks.find(t => t.id === id);

    if (!task) return;

    taskIdToEdit = id;

    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskPriority').value = task.priority || 1;
    document.getElementById('editTaskStatus').value = task.status || 1;

    document.getElementById('editTaskCreatedDate').value = formatForInput(task.createdDate);
    document.getElementById('editTaskDeadline').value = formatForInput(task.deadline);

    editModalBS.show();
}

async function confirmUpdateTask() {
    if (!taskIdToEdit) return;

    const newDescription = document.getElementById('editTaskDescription').value;
    const newPriority = document.getElementById('editTaskPriority').value;
    const newStatus = document.getElementById('editTaskStatus').value;

    const newCreatedDate = document.getElementById('editTaskCreatedDate').value;
    const newDeadline = document.getElementById('editTaskDeadline').value;

    if (!newDescription || newDescription.trim() === "") {
        alert("A descrição não pode ser vazia.");
        return;
    }

    if (newDeadline && newCreatedDate) {
        if (newDeadline < newCreatedDate) {
            alert("A data de entrega não pode ser anterior à data de criação!");
            return;
        }
    }

    try {
        const response = await fetch(`${API_URL}/task/${taskIdToEdit}`, {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: newDescription,
                priority: parseInt(newPriority),
                status: parseInt(newStatus),
                createdDate: newCreatedDate || null,
                deadline: newDeadline || null
            })
        });

        if (response.ok) {
            editModalBS.hide();
            if(isAdmin() && document.getElementById("btnAllTasks").classList.contains("active")) {
                getTasks('all');
            } else if (isAdmin() && document.getElementById("userFilterSelect").value !== "") {
                getTasks('filter', document.getElementById("userFilterSelect").value);
            } else {
                getTasks('mine');
            }
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
            deleteModalBS.hide();
            if(isAdmin() && document.getElementById("btnAllTasks").classList.contains("active")) {
                getTasks('all');
            } else if (isAdmin() && document.getElementById("userFilterSelect").value !== "") {
                getTasks('filter', document.getElementById("userFilterSelect").value);
            } else {
                getTasks('mine');
            }
        } else {
            alert("Erro ao deletar tarefa.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Falha na comunicação com o servidor.");
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRoles");
    window.location.href = "login.html";
}

function refreshCurrentView() {
    if (!isAdmin()) {
        getTasks('mine');
        return;
    }

    if (document.getElementById("btnAllTasks").classList.contains("active")) {
        getTasks('all');
    } else if (document.getElementById("userFilterSelect").value !== "") {
        getTasks('filter', document.getElementById("userFilterSelect").value);
    } else {
        getTasks('mine');
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev, taskId) {
    ev.dataTransfer.setData("text/plain", taskId);
    ev.target.style.opacity = "0.4";
}

async function drop(ev, newPriority) {
    ev.preventDefault();

    const taskId = ev.dataTransfer.getData("text/plain");

    const task = currentTasks.find(t => t.id == taskId);

    if (task && task.priority === newPriority) return;

    try {
        const response = await fetch(`${API_URL}/task/${taskId}`, {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: task.description,
                priority: parseInt(newPriority),
                status: task.status,
                createdDate: task.createdDate,
                deadline: task.deadline
            })
        });

        if (response.ok) {
            if(isAdmin() && document.getElementById("btnAllTasks").classList.contains("active")) {
                getTasks('all');
            } else {
                getTasks('mine');
            }
        } else {
            alert("Erro ao mover tarefa.");
        }
    } catch (error) {
        console.error("Erro ao mover card:", error);
    }
}

document.addEventListener("dragend", function(event) {
    event.target.style.opacity = "1";
});

async function changeStatus(event, taskId, newStatus) {
    if(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const taskIndex = currentTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = currentTasks[taskIndex];

    try {
        const response = await fetch(`${API_URL}/task/${taskId}`, {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: task.description,
                priority: task.priority,
                status: parseInt(newStatus),
                createdDate: task.createdDate,
                deadline: task.deadline
            })
        });

        if (response.ok) {
            currentTasks[taskIndex].status = parseInt(newStatus);

            if (currentViewMode === 'kanban') {
                renderKanban(currentTasks);
            } else {
                renderTasks(currentTasks);
            }
        } else {
            alert("Erro ao atualizar status.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

function displayUserInfo() {
    let username = localStorage.getItem("username");

    const avatarEl = document.getElementById("userAvatar");
    const nameEl = document.getElementById("userName");
    const container = document.getElementById("userInfoDisplay");

    if (username) {
        nameEl.innerText = username;
        avatarEl.innerText = username.charAt(0);
        container.classList.remove("d-none");
    }
}
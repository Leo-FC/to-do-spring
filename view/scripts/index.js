const API_URL = "http://localhost:8080";

let allTasks = [];
let currentTasks = [];
let allProjects = [];
let currentViewMode = 'list';
let currentProjectId = null;

let taskIdToDelete = null;
let taskIdToEdit = null;

let deleteModalBS = null;
let editModalBS = null;
let createProjectModalBS = null;
let editProjectModalBS = null;
let deleteProjectModalBS = null;

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        logout();
    } else {
        deleteModalBS = new bootstrap.Modal(document.getElementById('deleteModal'));
        editModalBS = new bootstrap.Modal(document.getElementById('editModal'));
        createProjectModalBS = new bootstrap.Modal(document.getElementById('createProjectModal'));
        editProjectModalBS = new bootstrap.Modal(document.getElementById('editProjectModal'));
        deleteProjectModalBS = new bootstrap.Modal(document.getElementById('deleteProjectModal'));

        loadProjects();

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

    filterAndRender();

    if (mode === 'list') {
        listContainer.classList.remove("d-none");
        kanbanContainer.classList.add("d-none");
        btnList.classList.add("active");
        btnKanban.classList.remove("active");
    } else {
        listContainer.classList.add("d-none");
        kanbanContainer.classList.remove("d-none");
        btnList.classList.remove("active");
        btnKanban.classList.add("active");
    }
}

async function loadProjects() {
    const token = localStorage.getItem("token");
    const selectFilter = document.getElementById("projectSelect");
    const selectEditTask = document.getElementById("editTaskProject");

    if(!selectFilter) return;

    try {
        const response = await fetch(`${API_URL}/project/user`, {
            headers: { "Authorization": token }
        });

        if (response.ok) {
            allProjects = await response.json();

            let filterOptions = '<option value="" selected>Todas as Tarefas</option>';
            filterOptions += '<option value="-1">Sem Projeto (Avulsas)</option>';

            let editOptions = '<option value="-1">Sem Projeto</option>';

            allProjects.forEach(proj => {
                const opt = `<option value="${proj.id}">${proj.name}</option>`;
                filterOptions += opt;
                editOptions += opt;
            });

            selectFilter.innerHTML = filterOptions;
            if(selectEditTask) selectEditTask.innerHTML = editOptions;

            if(currentProjectId) {
                const exists = allProjects.some(p => p.id === currentProjectId);
                if (exists || currentProjectId === -1) {
                    selectFilter.value = currentProjectId;
                } else {
                    selectFilter.value = "";
                    currentProjectId = null;
                }
            }
        }
    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
    }
}

async function createProject() {
    const nameInput = document.getElementById("projectName");
    const descInput = document.getElementById("projectDescription");
    const token = localStorage.getItem("token");

    if (!nameInput.value.trim()) {
        showToast("O nome do projeto é obrigatório.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/project`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nameInput.value,
                description: descInput.value
            })
        });

        if (response.status === 201) {
            createProjectModalBS.hide();
            nameInput.value = "";
            descInput.value = "";
            await loadProjects();
            showToast("Projeto criado com sucesso!", "success");
        } else {
            showToast("Erro ao criar projeto.", "error");
        }
    } catch (error) {
        console.error("Erro:", error);
        showToast("Erro de conexão.", "error");
    }
}

function handleProjectChange(projectId) {
    currentProjectId = projectId ? parseInt(projectId) : null;

    const editBtn = document.getElementById("editProjectBtn");
    const deleteBtn = document.getElementById("deleteProjectBtn");
    const descDisplay = document.getElementById("projectDescriptionDisplay");

    if(currentProjectId && currentProjectId > 0) {
        if(editBtn) editBtn.classList.remove("d-none");
        if(deleteBtn) deleteBtn.classList.remove("d-none");

        const project = allProjects.find(p => p.id === currentProjectId);
        if(project && project.description) {
            descDisplay.innerText = project.description;
            descDisplay.classList.remove("d-none");
        } else {
            descDisplay.classList.add("d-none");
        }

    } else {
        if(editBtn) editBtn.classList.add("d-none");
        if(deleteBtn) deleteBtn.classList.add("d-none");
        if(descDisplay) descDisplay.classList.add("d-none");
    }

    filterAndRender();
}

function openEditProjectModal() {
    if (!currentProjectId || currentProjectId <= 0) return;

    const project = allProjects.find(p => p.id === currentProjectId);
    if(!project) return;

    document.getElementById("editProjectName").value = project.name;
    document.getElementById("editProjectDescription").value = project.description || "";

    editProjectModalBS.show();
}

async function updateProject() {
    if (!currentProjectId || currentProjectId <= 0) return;

    const nameVal = document.getElementById("editProjectName").value;
    const descVal = document.getElementById("editProjectDescription").value;
    const token = localStorage.getItem("token");

    if(!nameVal.trim()) {
        showToast("Nome é obrigatório", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/project/${currentProjectId}`, {
            method: "PUT",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nameVal,
                description: descVal
            })
        });

        if (response.status === 204) {
            editProjectModalBS.hide();
            await loadProjects();

            const descDisplay = document.getElementById("projectDescriptionDisplay");
            if(descVal) {
                descDisplay.innerText = descVal;
                descDisplay.classList.remove("d-none");
            } else {
                descDisplay.classList.add("d-none");
            }

            showToast("Projeto atualizado!", "success");
        } else {
            showToast("Erro ao atualizar projeto.", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Erro de conexão.", "error");
    }
}

function openDeleteProjectModal() {
    if (!currentProjectId || currentProjectId <= 0) return;
    deleteProjectModalBS.show();
}

async function confirmDeleteProject() {
    if (!currentProjectId || currentProjectId <= 0) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/project/${currentProjectId}`, {
            method: "DELETE",
            headers: {
                "Authorization": token
            }
        });

        if (response.status === 204) {
            deleteProjectModalBS.hide();

            currentProjectId = null;
            document.getElementById("projectSelect").value = "";
            handleProjectChange("");

            await loadProjects();
            await getTasks('mine');

            showToast("Projeto excluído com sucesso!", "success");
        } else {
            showToast("Erro ao excluir projeto.", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Erro de conexão.", "error");
    }
}


function filterAndRender() {
    if (currentProjectId === -1) {
        currentTasks = allTasks.filter(t => !t.projectId);
    }
    else if (currentProjectId) {
        currentTasks = allTasks.filter(t => t.projectId === currentProjectId);
    }
    else {
        currentTasks = [...allTasks];
    }

    if (currentViewMode === 'list') {
        renderTasks(currentTasks);
    } else {
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
        if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
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
            alert("Sessão expirada. Login necessário.");
            logout();
            return;
        }

        let tasks = await response.json();
        allTasks = tasks;

        if (mode === 'filter' && filterUsername) {
            allTasks = tasks.filter(t => t.user && t.user.username === filterUsername);
        }

        filterAndRender();

    } catch (error) {
        console.error(error);
        showToast("Erro ao carregar dados.", "error");
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
                    <button class="btn btn-outline-warning btn-sm me-1" onclick="openEditModal(${task.id})">
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
        showToast("A descrição da tarefa não pode estar vazia!", "warning");
        return;
    }

    if (!priority) {
        showToast("Por favor, selecione uma prioridade!", "warning");
        return;
    }

    if (deadline) {
        const today = new Date().toISOString().split('T')[0];
        if (deadline < today) {
            showToast("A data de entrega não pode ser no passado!", "warning");
            return;
        }
    }

    let projectData = null;
    if (currentProjectId && currentProjectId > 0) {
        projectData = { id: currentProjectId };
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
                deadline: deadline || null,
                project: projectData
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
            showToast("Tarefa criada!", "success");
        } else {
            showToast("Erro ao criar tarefa.", "error");
        }

    } catch (error) {
        console.error("Erro:", error);
        showToast("Falha na comunicação.", "error");
    }
}

function openEditModal(id) {
    const task = allTasks.find(t => t.id === id);

    if (!task) return;

    taskIdToEdit = id;

    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskPriority').value = task.priority || 1;
    document.getElementById('editTaskStatus').value = task.status || 1;

    document.getElementById('editTaskCreatedDate').value = formatForInput(task.createdDate);
    document.getElementById('editTaskDeadline').value = formatForInput(task.deadline);

    const selectProject = document.getElementById('editTaskProject');
    if(selectProject) {
        if (task.projectId) {
            selectProject.value = task.projectId;
        } else {
            selectProject.value = "-1";
        }
    }

    editModalBS.show();
}

async function confirmUpdateTask() {
    if (!taskIdToEdit) return;

    const newDescription = document.getElementById('editTaskDescription').value;
    const newPriority = document.getElementById('editTaskPriority').value;
    const newStatus = document.getElementById('editTaskStatus').value;
    const newCreatedDate = document.getElementById('editTaskCreatedDate').value;
    const newDeadline = document.getElementById('editTaskDeadline').value;
    const newProjectVal = document.getElementById('editTaskProject').value;

    if (!newDescription || newDescription.trim() === "") {
        showToast("A descrição não pode ser vazia.", "warning");
        return;
    }

    if (newDeadline && newCreatedDate) {
        if (newDeadline < newCreatedDate) {
            showToast("O prazo não pode ser anterior à data de criação!", "warning");
            return;
        }
    }

    let projectData = null;
    if (newProjectVal && newProjectVal !== "-1") {
        projectData = { id: parseInt(newProjectVal) };
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
                deadline: newDeadline || null,
                project: projectData
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
            showToast("Tarefa atualizada!", "success");
        } else {
            showToast("Erro ao atualizar tarefa.", "error");
        }
    } catch (error) {
        console.error("Erro:", error);
        showToast("Falha na comunicação.", "error");
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
            showToast("Tarefa excluída.", "success");
        } else {
            showToast("Erro ao deletar tarefa.", "error");
        }
    } catch (error) {
        console.error("Erro:", error);
        showToast("Falha na comunicação.", "error");
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
    const task = allTasks.find(t => t.id == taskId);

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
                deadline: task.deadline,
                project: task.projectId ? { id: task.projectId } : null
            })
        });

        if (response.ok) {
            if(isAdmin() && document.getElementById("btnAllTasks").classList.contains("active")) {
                getTasks('all');
            } else {
                getTasks('mine');
            }
        } else {
            showToast("Erro ao mover tarefa.", "error");
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

    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;

    try {
        task.status = parseInt(newStatus);
        filterAndRender();

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
                deadline: task.deadline,
                project: task.projectId ? { id: task.projectId } : null
            })
        });

        if (!response.ok) {
            task.status = oldStatus;
            filterAndRender();
            showToast("Erro ao salvar status. Tente novamente.", "error");
        } else {
        }

    } catch (error) {
        console.error("Erro:", error);
        task.status = oldStatus;
        filterAndRender();
        showToast("Erro de conexão.", "error");
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

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toastMessage');
    const toastBS = bootstrap.Toast.getOrCreateInstance(toastEl);

    toastMsg.innerText = message;

    toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
    toastEl.classList.remove('text-dark', 'text-white');

    if (type === 'success') {
        toastEl.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toastEl.classList.add('bg-danger', 'text-white');
    } else if (type === 'warning') {
        toastEl.classList.add('bg-warning', 'text-dark');
    } else {
        toastEl.classList.add('bg-info', 'text-dark');
    }

    toastBS.show();
}
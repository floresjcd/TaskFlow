// Variáveis globais
let tasks = [];
let currentFilter = "all";
let taskToEdit = null;

// Elementos do DOM
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const totalCounter = document.getElementById("total-counter");
const pendingCounter = document.getElementById("pending-counter");
const completedCounter = document.getElementById("completed-counter");
const editModal = document.getElementById("edit-modal");
const editTaskInput = document.getElementById("edit-task-input");
const saveEditBtn = document.getElementById("save-edit-btn");
const closeModal = document.querySelector(".close-modal");

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  renderTasks();

  // Event Listeners
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      renderTasks();
    });
  });

  closeModal.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  saveEditBtn.addEventListener("click", saveEditedTask);

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    if (e.target === editModal) {
      editModal.style.display = "none";
    }
  });
});

/**
 * Carrega tarefas do localStorage
 */
function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  updateCounters();
}

/**
 * Salva tarefas no localStorage
 */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateCounters();
}

/**
 * Adiciona uma nova tarefa
 */
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask); // Adiciona no início do array
  saveTasks();
  renderTasks();

  // Limpa o input e mantém o foco
  taskInput.value = "";
  taskInput.focus();
}

/**
 * Renderiza as tarefas na tela com base no filtro atual
 */
function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = [];

  switch (currentFilter) {
    case "pending":
      filteredTasks = tasks.filter((task) => !task.completed);
      break;
    case "completed":
      filteredTasks = tasks.filter((task) => task.completed);
      break;
    default:
      filteredTasks = [...tasks];
  }

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent =
      currentFilter === "all"
        ? "Nenhuma tarefa adicionada ainda!"
        : currentFilter === "pending"
        ? "Nenhuma tarefa pendente!"
        : "Nenhuma tarefa concluída!";
    emptyMessage.classList.add("empty-message");
    taskList.appendChild(emptyMessage);
    return;
  }

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";
    taskItem.dataset.id = task.id;

    taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${
              task.completed ? "checked" : ""
            }>
            <span class="task-text ${task.completed ? "completed" : ""}">${
      task.text
    }</span>
            <div class="task-actions">
                <button class="task-btn edit-btn"><i class="fas fa-edit"></i></button>
                <button class="task-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;

    taskList.appendChild(taskItem);

    // Adiciona event listeners para os elementos recém-criados
    const checkbox = taskItem.querySelector(".task-checkbox");
    const editBtn = taskItem.querySelector(".edit-btn");
    const deleteBtn = taskItem.querySelector(".delete-btn");

    checkbox.addEventListener("change", () => toggleTaskCompletion(task.id));
    editBtn.addEventListener("click", () => openEditModal(task.id));
    deleteBtn.addEventListener("click", () => deleteTask(task.id));
  });
}

/**
 * Alterna o status de conclusão de uma tarefa
 * @param {number} taskId - ID da tarefa
 */
function toggleTaskCompletion(taskId) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks();
    renderTasks();
  }
}

/**
 * Abre o modal de edição para uma tarefa
 * @param {number} taskId - ID da tarefa
 */
function openEditModal(taskId) {
  taskToEdit = tasks.find((task) => task.id === taskId);
  if (taskToEdit) {
    editTaskInput.value = taskToEdit.text;
    editModal.style.display = "flex";
    editTaskInput.focus();
  }
}

/**
 * Salva as alterações feitas na edição de uma tarefa
 */
function saveEditedTask() {
  if (!taskToEdit) return;

  const newText = editTaskInput.value.trim();
  if (newText === "") return;

  taskToEdit.text = newText;
  saveTasks();
  renderTasks();
  editModal.style.display = "none";
  taskToEdit = null;
}

/**
 * Remove uma tarefa
 * @param {number} taskId - ID da tarefa
 */
function deleteTask(taskId) {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
  }
}

/**
 * Atualiza os contadores de tarefas
 */
function updateCounters() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalCounter.textContent = `Total: ${total}`;
  pendingCounter.textContent = `Pendentes: ${pending}`;
  completedCounter.textContent = `Concluídas: ${completed}`;
}

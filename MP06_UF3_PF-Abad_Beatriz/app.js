let users = [];
let selectedUserIndex = null;

function $(id) {
  return document.getElementById(id);
}

function addUser() {
  const input = $("newUserInput");
  const name = input.value.trim();
  if (!name) return;
  users.push({ name, tasks: [] });
  input.value = "";
  renderUsers();
}

function selectUser(index) {
  selectedUserIndex = index;
  $("mainTitle").textContent = "Tareas de " + users[index].name;
  $("taskSection").classList.remove("hidden");
  $("userInfo").classList.remove("hidden");

  updateSidebarInfo();
  renderUsers();
  renderTasks();
}

function deselectUser() {
  selectedUserIndex = null;
  $("mainTitle").textContent = "Selecciona un usuario";
  $("taskSection").classList.add("hidden");
  $("userInfo").classList.add("hidden");
  renderUsers();
}

function updateSidebarInfo() {
  const user = users[selectedUserIndex];
  const completed = user.tasks.filter(t => t.completed).length;
  $("userName").textContent = user.name;
  $("userStats").textContent = `Tareas: ${completed} / ${user.tasks.length} completadas`;
}

function renderUsers() {
  const ul = $("userList");
  ul.innerHTML = "";

  users.forEach((user, index) => {
    const li = document.createElement("li");
    li.textContent = user.name;
    li.style.cursor = "pointer";

    if (selectedUserIndex == index) {
      li.style.fontWeight = "bold";
    }

    li.onclick = () => selectUser(index);
    ul.appendChild(li);
  });
}

function addTask() {
  const input = $("newTaskInput");
  const text = input.value.trim();
  if (!text || selectedUserIndex === null) return;
  users[selectedUserIndex].tasks.push({ text, completed: false });
  input.value = "";
  renderTasks();
  updateSidebarInfo();
}

function toggleTask(index) {
  const task = users[selectedUserIndex].tasks[index];
  task.completed = !task.completed;
  renderTasks();
  updateSidebarInfo();
}

function deleteTask(index) {
  users[selectedUserIndex].tasks.splice(index, 1);
  renderTasks();
  updateSidebarInfo();
}

function editTask(index) {
  const newText = prompt("Editar tarea:", users[selectedUserIndex].tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    users[selectedUserIndex].tasks[index].text = newText.trim();
    renderTasks();
    updateSidebarInfo();
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
}

function renderTasks() {
  const ul = $("taskList");
  ul.innerHTML = "";
  users[selectedUserIndex].tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
      <span onclick="toggleTask(${index})">${task.text}</span>
      <div class="actions">
        <button onclick="editTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    ul.appendChild(li);
  });
}

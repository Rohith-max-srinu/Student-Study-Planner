const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");

const addBtn = document.getElementById("addBtn");
const allBtn = document.getElementById("allBtn");
const pendingBtn = document.getElementById("pendingBtn");
const completedBtn = document.getElementById("completedBtn");

addBtn.addEventListener("click", addTask);

searchInput.addEventListener("keyup", searchTasks);

allBtn.addEventListener("click", showAll);

pendingBtn.addEventListener("click", showPending);

completedBtn.addEventListener("click", showCompleted);

loadTasks();

function addTask() {

    const task = taskInput.value.trim();

    if (task === "") {
        alert("Please enter a task.");
        return;
    }

    createTask(
        task,
        priority.value,
        dueDate.value,
        false
    );

    saveTasks();

    taskInput.value = "";
    dueDate.value = "";
}

function createTask(task, priorityValue, due, completed) {

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.style.width = "20px";

    const taskContainer = document.createElement("div");
    taskContainer.style.flex = "1";

    const span = document.createElement("span");
    span.className = "task-text";

    let icon = "🟢";

    if (priorityValue === "High") {
        icon = "🔴";
    }
    else if (priorityValue === "Medium") {
        icon = "🟡";
    }

    span.textContent = icon + " " + task;

    const dueSpan = document.createElement("div");
    dueSpan.className = "due-date";

    if (due !== "") {
        dueSpan.textContent = "📅 Due: " + due;
    }
    else {
        dueSpan.textContent = "";
    }

    if (completed) {

        span.style.textDecoration = "line-through";
        span.style.color = "green";

    }

    checkbox.onchange = function () {

        if (checkbox.checked) {

            span.style.textDecoration = "line-through";
            span.style.color = "green";

        }
        else {

            span.style.textDecoration = "none";
            span.style.color = "black";

        }

        saveTasks();

    };

    span.ondblclick = function () {

        const input = document.createElement("input");

        input.type = "text";

        input.value = task;

        taskContainer.replaceChild(input, span);

        input.focus();

        input.onkeydown = function (event) {

            if (event.key === "Enter") {

                span.textContent = icon + " " + input.value;

                taskContainer.replaceChild(span, input);

                saveTasks();

            }

        };

    };

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete";

    deleteBtn.className = "delete-btn";

    deleteBtn.onclick = function () {

        li.remove();

        saveTasks();

    };

    taskContainer.appendChild(span);

    taskContainer.appendChild(dueSpan);

    li.appendChild(checkbox);

    li.appendChild(taskContainer);

    li.appendChild(deleteBtn);

    taskList.appendChild(li);

}const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");

const addBtn = document.getElementById("addBtn");
const allBtn = document.getElementById("allBtn");
const pendingBtn = document.getElementById("pendingBtn");
const completedBtn = document.getElementById("completedBtn");

addBtn.addEventListener("click", addTask);

searchInput.addEventListener("keyup", searchTasks);

allBtn.addEventListener("click", showAll);

pendingBtn.addEventListener("click", showPending);

completedBtn.addEventListener("click", showCompleted);

loadTasks();

function addTask() {

    const task = taskInput.value.trim();

    if (task === "") {
        alert("Please enter a task.");
        return;
    }

    createTask(
        task,
        priority.value,
        dueDate.value,
        false
    );

    saveTasks();

    taskInput.value = "";
    dueDate.value = "";
}

function createTask(task, priorityValue, due, completed) {

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.style.width = "20px";

    const taskContainer = document.createElement("div");
    taskContainer.style.flex = "1";

    const span = document.createElement("span");
    span.className = "task-text";

    let icon = "🟢";

    if (priorityValue === "High") {
        icon = "🔴";
    }
    else if (priorityValue === "Medium") {
        icon = "🟡";
    }

    span.textContent = icon + " " + task;

    const dueSpan = document.createElement("div");
    dueSpan.className = "due-date";

    if (due !== "") {
        dueSpan.textContent = "📅 Due: " + due;
    }
    else {
        dueSpan.textContent = "";
    }

    if (completed) {

        span.style.textDecoration = "line-through";
        span.style.color = "green";

    }

    checkbox.onchange = function () {

        if (checkbox.checked) {

            span.style.textDecoration = "line-through";
            span.style.color = "green";

        }
        else {

            span.style.textDecoration = "none";
            span.style.color = "black";

        }

        saveTasks();

    };

    span.ondblclick = function () {

        const input = document.createElement("input");

        input.type = "text";

        input.value = task;

        taskContainer.replaceChild(input, span);

        input.focus();

        input.onkeydown = function (event) {

            if (event.key === "Enter") {

                span.textContent = icon + " " + input.value;

                taskContainer.replaceChild(span, input);

                saveTasks();
               

            }

        };

    };

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete";

    deleteBtn.className = "delete-btn";

    deleteBtn.onclick = function () {

        li.remove();

        saveTasks();

    };

    taskContainer.appendChild(span);

    taskContainer.appendChild(dueSpan);

    li.appendChild(checkbox);

    li.appendChild(taskContainer);

    li.appendChild(deleteBtn);

    taskList.appendChild(li);

}
function saveTasks() {

    const tasks = [];

    const items = taskList.querySelectorAll("li");

    items.forEach(function (item) {

        const checkbox = item.querySelector("input");

        const taskText = item.querySelector(".task-text");

        const dueDateText = item.querySelector(".due-date");

        let priority = "Low";

        if (taskText.textContent.startsWith("🔴")) {

            priority = "High";

        } else if (taskText.textContent.startsWith("🟡")) {

            priority = "Medium";

        }

        let due = "";

        if (dueDateText.textContent !== "") {

            due = dueDateText.textContent.replace("📅 Due: ", "");

        }

        tasks.push({

            text: taskText.textContent.substring(2),

            priority: priority,

            due: due,

            completed: checkbox.checked

        });

    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

}

function loadTasks() {

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(function (task) {

        createTask(

            task.text,

            task.priority,

            task.due,

            task.completed

        );

    });

}
function searchTasks() {

    const search = searchInput.value.toLowerCase();

    const tasks = taskList.querySelectorAll("li");

    tasks.forEach(function (task) {

        const text = task.querySelector(".task-text").textContent.toLowerCase();

        if (text.includes(search)) {

            task.style.display = "";

        } else {

            task.style.display = "none";

        }

    });

}

function showAll() {

    const tasks = taskList.querySelectorAll("li");

    tasks.forEach(function (task) {

        task.style.display = "";

    });

}

function showCompleted() {

    const tasks = taskList.querySelectorAll("li");

    tasks.forEach(function (task) {

        const checked = task.querySelector("input").checked;

        if (checked) {

            task.style.display = "";

        } else {

            task.style.display = "none";

        }

    });

}

function showPending() {

    const tasks = taskList.querySelectorAll("li");

    tasks.forEach(function (task) {

        const checked = task.querySelector("input").checked;

        if (!checked) {

            task.style.display = "";

        } else {

            task.style.display = "none";

        }

    });

}
// Highlight due dates
function updateDueDateColors() {

    const today = new Date();

    // Remove time for accurate comparison
    today.setHours(0, 0, 0, 0);

    const tasks = taskList.querySelectorAll("li");

    tasks.forEach(function (task) {

        const dueElement = task.querySelector(".due-date");

        if (dueElement.textContent === "") {
            return;
        }

        const dueText = dueElement.textContent.replace("📅 Due: ", "");

        const dueDate = new Date(dueText);

        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {

            dueElement.style.color = "red";
            dueElement.style.fontWeight = "bold";

        }
        else if (dueDate.getTime() === today.getTime()) {

            dueElement.style.color = "orange";
            dueElement.style.fontWeight = "bold";

        }
        else {

            dueElement.style.color = "green";
            dueElement.style.fontWeight = "bold";

        }

    });

}

// Run after page loads
updateDueDateColors();

// Update colors every second
setInterval(updateDueDateColors, 1000);
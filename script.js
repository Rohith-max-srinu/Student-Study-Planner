const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const addButton = document.querySelector("button");

addButton.addEventListener("click", addTask);

function addTask() {

    const task = taskInput.value.trim();

    if (task === "") {
        alert("Please enter a task.");
        return;
    }

    const li = document.createElement("li");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // Task text
    const span = document.createElement("span");
    span.textContent = task;
    span.style.marginLeft = "10px";

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "20px";

    // Complete task
    checkbox.onchange = function () {

        if (checkbox.checked) {

            span.style.textDecoration = "line-through";
            span.style.color = "green";

        } else {

            span.style.textDecoration = "none";
            span.style.color = "black";

        }

    };

    // Delete task
    deleteBtn.onclick = function () {

        li.remove();

    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);

    taskInput.value = "";

}
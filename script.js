const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
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

function addTask(){

    const task=taskInput.value.trim();

    if(task===""){
        alert("Please enter task");
        return;
    }

    createTask(task,priority.value,false);

    saveTasks();

    taskInput.value="";
}

function createTask(task,priorityValue,completed){

    const li=document.createElement("li");

    const checkbox=document.createElement("input");
    checkbox.type="checkbox";
    checkbox.checked=completed;
    checkbox.style.width="20px";

    const span=document.createElement("span");
    span.style.marginLeft="10px";

    let icon="🟢";

    if(priorityValue==="High")
        icon="🔴";
    else if(priorityValue==="Medium")
        icon="🟡";

    span.textContent=icon+" "+task;

    if(completed){
        span.style.textDecoration="line-through";
        span.style.color="green";
    }

    checkbox.onchange=function(){

        if(checkbox.checked){
            span.style.textDecoration="line-through";
            span.style.color="green";
        }
        else{
            span.style.textDecoration="none";
            span.style.color="black";
        }

        saveTasks();
    }

    span.ondblclick=function(){

        const input=document.createElement("input");

        input.value=task;

        li.replaceChild(input,span);

        input.focus();

        input.onkeydown=function(e){

            if(e.key==="Enter"){

                span.textContent=icon+" "+input.value;

                li.replaceChild(span,input);

                saveTasks();

            }

        }

    }

    const deleteBtn=document.createElement("button");

    deleteBtn.textContent="Delete";

    deleteBtn.style.marginLeft="20px";

    deleteBtn.onclick=function(){

        li.remove();

        saveTasks();

    }

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);

}

function saveTasks(){

    const tasks=[];

    document.querySelectorAll("#taskList li").forEach(function(item){

        const checkbox=item.querySelector("input");

        const span=item.querySelector("span");

        let priority="Low";

        if(span.textContent.startsWith("🔴"))
            priority="High";
        else if(span.textContent.startsWith("🟡"))
            priority="Medium";

        tasks.push({
            text:span.textContent.substring(2),
            priority:priority,
            completed:checkbox.checked
        });

    });

    localStorage.setItem("tasks",JSON.stringify(tasks));

}

function loadTasks(){

    const tasks=JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(function(task){

        createTask(task.text,task.priority,task.completed);

    });

}

function searchTasks(){

    const search=searchInput.value.toLowerCase();

    document.querySelectorAll("#taskList li").forEach(function(task){

        const text=task.querySelector("span").textContent.toLowerCase();

        if(text.includes(search))
            task.style.display="";
        else
            task.style.display="none";

    });

}

function showAll(){

    document.querySelectorAll("#taskList li").forEach(function(task){

        task.style.display="";

    });

}

function showCompleted(){

    document.querySelectorAll("#taskList li").forEach(function(task){

        const checked=task.querySelector("input").checked;

        if(checked)
            task.style.display="";
        else
            task.style.display="none";

    });

}

function showPending(){

    document.querySelectorAll("#taskList li").forEach(function(task){

        const checked=task.querySelector("input").checked;

        if(!checked)
            task.style.display="";
        else
            task.style.display="none";

    });

}
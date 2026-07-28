const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const addButton = document.querySelector("button");

addButton.addEventListener("click", addTask);

function addTask(){

    const task = taskInput.value.trim();

    if(task===""){
        alert("Please enter a task.");
        return;
    }

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type="checkbox";

    const span = document.createElement("span");

    let icon="🟢";

    if(priority.value==="High"){
        icon="🔴";
    }
    else if(priority.value==="Medium"){
        icon="🟡";
    }

    span.textContent=icon+" "+task;
    span.style.marginLeft="10px";

    span.ondblclick=function(){

        const input=document.createElement("input");

        input.type="text";

        input.value=task;

        li.replaceChild(input,span);

        input.focus();

        input.onkeydown=function(event){

            if(event.key==="Enter"){

                span.textContent=icon+" "+input.value;

                li.replaceChild(span,input);

            }

        }

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

    }

    const deleteBtn=document.createElement("button");

    deleteBtn.textContent="Delete";

    deleteBtn.style.marginLeft="20px";

    deleteBtn.onclick=function(){

        li.remove();

    }

    li.appendChild(checkbox);

    li.appendChild(span);

    li.appendChild(deleteBtn);

    taskList.appendChild(li);

    taskInput.value="";
}
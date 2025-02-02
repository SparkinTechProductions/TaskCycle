//Mini Cycle
let draggedTask = null;
let logoTimeoutId = null;
let touchStartY = 0;
let touchEndY = 0;
let holdTimeout = null;


document.addEventListener('DOMContentLoaded', (event) => {
 
    setupMenu();

const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const cycleMessage = document.getElementById("cycleMessage");
const progressBar = document.getElementById("progressBar");
const completeAllButton = document.getElementById("completeAll");
const TASK_LIMIT = 50; 

loadTasks();

function saveTasks() {
    const tasks = [...taskList.children].map(task => ({
        text: task.querySelector("span").textContent,
        completed: task.querySelector("input").checked
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    taskList.innerHTML = "";
    savedTasks.forEach(task => addTask(task.text, task.completed, false));
    updateProgressBar();
    checkCompleteAllButton();
}


function updateProgressBar() {
    const totalTasks = taskList.children.length;
    const completedTasks = [...taskList.children].filter(task => task.querySelector("input").checked).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    saveTasks();

}

function checkTaskCycle() {
    updateProgressBar();
    const allCompleted = [...taskList.children].every(task => task.querySelector("input").checked);
    if (allCompleted && taskList.children.length > 0) {
        triggerLogoBackground('green', 300);
        setTimeout(resetTasks, 1000);
    }
    saveTasks();

}



function DragAndDrop(taskElement) {
    taskElement.setAttribute("draggable", "true");

    // Desktop Dragging
    taskElement.addEventListener("dragstart", (event) => {
        draggedTask = taskElement;
        event.dataTransfer.effectAllowed = "move";
        setTimeout(() => taskElement.classList.add("dragging"), 0);
    });

    taskElement.addEventListener("dragover", (event) => {
        event.preventDefault();
        handleRearrange(event.target);
    });

    taskElement.addEventListener("drop", () => {
        saveTasks();
    });

    taskElement.addEventListener("dragend", () => {
        draggedTask.classList.remove("dragging");
        draggedTask = null;
    });

    // ✅ Mobile Touch Support with Hold Delay
    let touchStartY = 0;
    let touchEndY = 0;
    let holdTimeout = null;

    taskElement.addEventListener("touchstart", (event) => {
        touchStartY = event.touches[0].clientY;
        
        holdTimeout = setTimeout(() => {
            draggedTask = taskElement;
            taskElement.classList.add("dragging");
        }, 300); // 300ms hold time before drag starts
    });

    taskElement.addEventListener("touchmove", (event) => {
        if (!draggedTask) return;
        event.preventDefault();
        touchEndY = event.touches[0].clientY;
        const movingTask = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
        handleRearrange(movingTask);
    });

    taskElement.addEventListener("touchend", () => {
        clearTimeout(holdTimeout);
        if (draggedTask) {
            draggedTask.classList.remove("dragging");
            draggedTask = null;
            saveTasks();
        }
    });
}

// Helper function for rearranging tasks
function handleRearrange(target) {
    const draggingOver = target.closest(".task");
    if (draggingOver && draggingOver !== draggedTask) {
        const bounding = draggingOver.getBoundingClientRect();
        const offset = touchEndY - bounding.top;
        const parent = taskList;
        if (offset > bounding.height / 2) {
            parent.insertBefore(draggedTask, draggingOver.nextSibling);
        } else {
            parent.insertBefore(draggedTask, draggingOver);
        }
    }
}






function addTask() {
let taskText = taskInput.value.trim();
if (!taskText) return;
if (taskText.length > TASK_LIMIT) {
alert(`Task must be ${TASK_LIMIT} characters or less.`);
return;
}

const li = document.createElement("li");
li.classList.add("task");
li.setAttribute("draggable", "true");

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.addEventListener("change", checkTaskCycle);
checkbox.addEventListener("click", () => {
    triggerLogoBackground('green', 300);
    });

const label = document.createElement("span");
label.textContent = taskText;
label.addEventListener("click", () => {
checkbox.checked = !checkbox.checked;
checkTaskCycle(); 
saveTasks();
triggerLogoBackground('green', 300);
});

const taskActions = document.createElement("div");
taskActions.classList.add("task-actions");

const renameBtn = document.createElement("button");
renameBtn.innerHTML = "✏️";
renameBtn.classList.add("action-btn", "rename-btn");
renameBtn.addEventListener("click", () => renameTask(label));

const deleteBtn = document.createElement("button");
deleteBtn.innerHTML = "🗑️";
deleteBtn.classList.add("action-btn", "delete-btn");
deleteBtn.addEventListener("click", (event) => {
event.stopPropagation();
li.remove();
updateProgressBar();
checkCompleteAllButton();
saveTasks();
});

DragAndDrop(li);

taskActions.appendChild(renameBtn);
taskActions.appendChild(deleteBtn);
li.appendChild(checkbox);
li.appendChild(label);
li.appendChild(taskActions);
taskList.appendChild(li);
taskInput.value = "";


document.querySelector(".task-list-container").scrollTo({
top: taskList.scrollHeight,
behavior: "smooth"
});


checkCompleteAllButton(); 
updateProgressBar();
if (shouldSave) saveTasks();
saveTasks();

}


function renameTask(label) {
    const newName = prompt(`Rename Task (Max ${TASK_LIMIT} chars):`, label.textContent);
    if (newName !== null && newName.trim() !== "" && newName.length <= TASK_LIMIT) {
        label.textContent = newName.trim();
        saveTasks();
    } else if (newName.length > TASK_LIMIT) {
        alert(`Task name cannot exceed ${TASK_LIMIT} characters.`);
    }
}

function resetTasks() {
    taskList.querySelectorAll(".task input").forEach(task => task.checked = false);
    cycleMessage.style.display = "block";
    progressBar.style.width = "0%";
    setTimeout(() => cycleMessage.style.display = "none", 2000);
}

addTaskButton.addEventListener("click", addTask);
taskInput.addEventListener("keypress", event => {
    if (event.key === "Enter") addTask();
});
window.onload = () => taskInput.focus();


completeAllButton.addEventListener("click", () => {
    taskList.querySelectorAll(".task input").forEach(task => task.checked = true);
    checkTaskCycle();
    console.log(taskList.children.length);
});


function checkCompleteAllButton() {

if (taskList.children.length > 0) 
    {
        console.log(taskList.children.length);
completeAllButton.style.display = "block";

completeAllButton.style.zIndex = "2";
} else {
    completeAllButton.style.display = "none";
    console.log(taskList.children.length);


}
}


function triggerLogoBackground(color = 'green', duration = 300) {
  const logo = document.querySelector('.logo img');

  if (logo) {

      if (logoTimeoutId) {
          clearTimeout(logoTimeoutId);
          logoTimeoutId = null;
      }


      logo.style.backgroundColor = color;
      logoTimeoutId = setTimeout(() => {
          logo.style.backgroundColor = '';
          logoTimeoutId = null; 
      }, duration);
  }
}


function setupMenu() {
    const menuButton = document.querySelector(".menu-button");
    const menu = document.querySelector(".menu-container");
    const toggleAutoReset = document.getElementById("toggleAutoReset");
    const exitToStart = document.getElementById("exitToStart");

    menuButton.addEventListener("click", () => {
        menu.classList.toggle("visible");
    });

    toggleAutoReset.addEventListener("change", (event) => {
        autoReset = event.target.checked;
        saveSettings();
    });

    exitToStart.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}
function saveSettings() {
    localStorage.setItem("autoReset", autoReset);
}











});


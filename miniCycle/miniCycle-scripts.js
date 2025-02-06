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

    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        console.log("Tasks saved successfully:", tasks);
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
}


function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    
    // ✅ Prevent errors if no data exists
    if (!savedTasks) {
        console.warn("No saved tasks found in localStorage.");
        return;
    }

    try {
        const parsedTasks = JSON.parse(savedTasks);
        if (!Array.isArray(parsedTasks)) throw new Error("Invalid task data");

        taskList.innerHTML = ""; // Clear tasks before loading

        parsedTasks.forEach(task => addTask(task.text, task.completed, false));

        updateProgressBar();
        checkCompleteAllButton();
    } catch (error) {
        console.error("Error loading tasks:", error);
        localStorage.removeItem("tasks"); // Clear corrupted data
    }
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
        
        if (autoReset) { // ✅ Auto-reset tasks if enabled
            setTimeout(resetTasks, 1000);
        }
    }

    saveTasks();
}




function DragAndDrop(taskElement) {
    taskElement.setAttribute("draggable", "true");

     // Prevent text selection on mobile
     taskElement.style.userSelect = "none";
     taskElement.style.webkitUserSelect = "none";
     taskElement.style.msUserSelect = "none";
     taskElement.style.touchAction = "none";
 

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
    if (!target) return; // ✅ Prevents errors if `target` is null
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






function addTask(taskText, completed = false, shouldSave = true) {
    // ✅ Prevent events from being passed by mistake
    if (typeof taskText !== "string") {
        console.error("Error: taskText is not a string", taskText);
        return;
    }
    let taskTextTrimmed = taskText.trim();
    if (!taskTextTrimmed) return;
if (!taskTextTrimmed.length > TASK_LIMIT) {
alert(`Task must be ${TASK_LIMIT} characters or less.`);
return;
}

const li = document.createElement("li");
li.classList.add("task");
li.setAttribute("draggable", "true");

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = completed;
checkbox.addEventListener("change", checkTaskCycle);
checkbox.addEventListener("click", () => {
    triggerLogoBackground('green', 300);
    });

const label = document.createElement("span");
label.textContent = taskTextTrimmed;
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

}


function renameTask(label) {
    const newName = prompt(`Rename Task (Max ${TASK_LIMIT} chars):`, label.textContent);
    if (newName !== null && newName.trim() !== "" && newName.length <= TASK_LIMIT) {
        label.textContent = newName.trim();
        saveTasks(); // ✅ Ensures the new name is saved
    } else if (newName.length > TASK_LIMIT) {
        alert(`Task name cannot exceed ${TASK_LIMIT} characters.`);
    }
}


function resetTasks() {
    taskList.querySelectorAll(".task input").forEach(task => task.checked = false);
    cycleMessage.style.display = "block";
    progressBar.style.width = "0%";

    setTimeout(() => {
        cycleMessage.style.display = "none";
    }, 2000);

    saveTasks(); // ✅ Save the reset state
}


addTaskButton.addEventListener("click", () => {
    addTask(taskInput.value); // ✅ Passes the task text, not the event
});

taskInput.addEventListener("keypress", event => {
    if (event.key === "Enter") {
        addTask(taskInput.value); // ✅ Ensures only text is passed
    }
});



window.onload = () => taskInput.focus();


completeAllButton.addEventListener("click", () => {
    taskList.querySelectorAll(".task input").forEach(task => task.checked = true);
    checkTaskCycle();
    
    // ✅ Always reset tasks, even if autoReset is off
    setTimeout(resetTasks, 1000);
});



function checkCompleteAllButton() {

if (taskList.children.length > 0) 
    {
        console.log(taskList.children.length);
completeAllButton.style.display = "block";

completeAllButton.style.zIndex = "2";
} else {
    completeAllButton.style.display = taskList.children.length > 0 ? "block" : "none";
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

    // ✅ Load autoReset setting from localStorage
    autoReset = JSON.parse(localStorage.getItem("autoReset")) || false;
    toggleAutoReset.checked = autoReset; // Reflect stored setting

    menuButton.addEventListener("click", () => {
        menu.classList.toggle("visible");
    });

    toggleAutoReset.addEventListener("change", (event) => {
        autoReset = event.target.checked;
        localStorage.setItem("autoReset", JSON.stringify(autoReset)); // ✅ Save to localStorage
    });

    exitToStart.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}


function saveSettings() {
    localStorage.setItem("autoReset", autoReset);
}

const toggleAutoReset = document.getElementById("toggleAutoReset");

// Function to check if it's the user's first visit
function checkFirstTimeUse() {
    if (localStorage.getItem("hasVisitedBefore") === null) {
        // First time using the app
        localStorage.setItem("autoReset", JSON.stringify(true)); // ✅ Default to ON
        localStorage.setItem("hasVisitedBefore", "true"); // ✅ Mark that they’ve visited before
    }
}

// Function to load saved preferences
function loadAutoReset() {
    const savedAutoReset = JSON.parse(localStorage.getItem("autoReset"));
    if (savedAutoReset !== null) {
        toggleAutoReset.checked = savedAutoReset; // Set the checkbox state
    }
}

// Save user preference when toggling
toggleAutoReset.addEventListener("change", () => {
    localStorage.setItem("autoReset", JSON.stringify(toggleAutoReset.checked));
});

// Run functions on page load
checkFirstTimeUse();
loadAutoReset();


document.addEventListener("click", (event) => {
    let isTaskClick = event.target.closest(".task");

    if (!isTaskClick) {
        // Hide all task action buttons when clicking outside
        document.querySelectorAll(".task-actions").forEach(action => {
            action.style.opacity = "0"; // Hide buttons
        });
    }
});

document.addEventListener("click", (event) => {
    let taskItem = event.target.closest(".task");

    // Hide all task action buttons first
    document.querySelectorAll(".task-actions").forEach(action => {
        action.style.opacity = "0"; 
    });

    if (taskItem) {
        // Show buttons only for the clicked task
        let taskActions = taskItem.querySelector(".task-actions");
        if (taskActions) {
            taskActions.style.opacity = "1";
        }
    }
});
let startX = 0;
let isSwiping = false;
let isStatsVisible = false;
const statsPanel = document.getElementById("stats-panel");
const taskView = document.getElementById("task-view");

// Detect swipe start
document.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
    isSwiping = true;
});

// Detect swipe move
document.addEventListener("touchmove", (event) => {
    if (!isSwiping) return;
    let moveX = event.touches[0].clientX;
    let difference = startX - moveX;

    // Swipe left → Slide in Stats Panel, Slide out Task View
    if (difference > 50 && !isStatsVisible) {
        statsPanel.classList.add("show");  // Slide in stats
        statsPanel.classList.remove("hide"); // Ensure it's not hiding

        taskView.classList.add("hide"); // Slide out task list
        isStatsVisible = true;
        isSwiping = false;
    }

    // Swipe right → Slide out Stats Panel, Slide in Task View
    if (difference < -50 && isStatsVisible) {
        statsPanel.classList.add("hide");  // Slide out stats
        taskView.classList.remove("hide"); // Bring back task list
        isStatsVisible = false;
        isSwiping = false;
    }
});

// Reset swipe tracking
document.addEventListener("touchend", () => {
    isSwiping = false;
});



// Update Stats Panel
function updateStatsPanel() {
    let totalTasks = document.querySelectorAll(".task").length;
    let completedTasks = document.querySelectorAll(".task input:checked").length;
    let completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) + "%" : "0%";

    document.getElementById("total-tasks").textContent = totalTasks;
    document.getElementById("completed-tasks").textContent = completedTasks;
    document.getElementById("completion-rate").textContent = completionRate;
    document.getElementById("stats-progress-bar").style.width = completionRate;
}

// Hook into existing task functions to update stats when tasks change
document.getElementById("taskList").addEventListener("change", updateStatsPanel);
document.getElementById("addTask").addEventListener("click", updateStatsPanel);


const slideLeft = document.getElementById("slide-left");
const slideRight = document.getElementById("slide-right");


slideLeft.classList.add("hide");
slideLeft.classList.remove("show");

slideRight.addEventListener("click", () => {
    statsPanel.classList.add("show");
    statsPanel.classList.remove("hide");

    taskView.classList.add("hide");
    taskView.classList.remove("show");

    slideRight.classList.add("hide");
    slideRight.classList.remove("show");

    slideLeft.classList.add("show");
    slideLeft.classList.remove("hide");

    isStatsVisible = true;
});

slideLeft.addEventListener("click", () => {
    statsPanel.classList.add("hide");
    statsPanel.classList.remove("show");

    taskView.classList.add("show");
    taskView.classList.remove("hide");

    slideRight.classList.add("show");
    slideRight.classList.remove("hide");

    slideLeft.classList.add("hide");
    slideLeft.classList.remove("show");

    isStatsVisible = false;
});






});


//Mini Cycle
let draggedTask = null;
let logoTimeoutId = null;
let touchStartTime = 0;
let isLongPress = false;
let touchStartY = 0;
let touchEndY = 0;
let holdTimeout = null;
let moved = false;
let isDragging = false;
let rearrangeInitialized = false;
let lastDraggedOver = null;
let lastRearrangeTarget = null;
let lastDragOverTime = 0;
let hasInteracted = false;
let reminderIntervalId;
let timesReminded = 0;
let lastReminderTime = 0;







document.addEventListener('DOMContentLoaded', (event) => {
 


const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const cycleMessage = document.getElementById("cycleMessage");
const progressBar = document.getElementById("progressBar");
const completeAllButton = document.getElementById("completeAll");
const toggleAutoReset = document.getElementById("toggleAutoReset");
const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".menu-container");
const exitMiniCycle = document.getElementById("exit-mini-cycle");
const feedbackModal = document.getElementById("feedback-modal");
const openFeedbackBtn = document.getElementById("open-feedback-modal");
const closeFeedbackBtn = document.querySelector(".close-feedback-modal");
const submitFeedbackBtn = document.getElementById("submit-feedback");
const feedbackText = document.getElementById("feedback-text");
const openUserManual = document.getElementById("open-user-manual");
const enableReminders = document.getElementById("enableReminders");
const enableTaskReminders = document.getElementById("enable-task-reminders");
const indefiniteCheckbox = document.getElementById("indefiniteCheckbox");
const repeatCountRow = document.getElementById("repeat-count-row");
const frequencySection = document.getElementById("frequency-section");
const remindersModal = document.getElementById("reminders-modal");
const closeRemindersBtn = document.getElementById("close-reminders-btn");
const closeMainMenuBtn = document.getElementById("close-main-menu");

const DRAG_THROTTLE_MS = 50;
const TASK_LIMIT = 50; 




// Run functions on page load
initialSetup();
setupMainMenu();
setupSettingsMenu();
setupAbout();
setupUserManual();
setupFeedbackModal();
updateStatsPanel(); 
loadMiniCycle();
setupMiniCycleTitleListener();
setupDownloadMiniCycle();
setupUploadMiniCycle();
setupRearrange();
dragEndCleanup ();
updateMoveArrowsVisibility();
checkDueDates();
setupThemes();
loadRemindersSettings();
setTimeout(() => {
    startReminders();
}, 200); // Small delay ensures tasks exist first
setTimeout(remindOverdueTasks, 2000);






window.onload = () => taskInput.focus();

// ✅ Dark Mode Toggle Logic
function applyDarkMode(isEnabled) {
    document.body.classList.toggle("dark-mode", isEnabled);
    localStorage.setItem("darkModeEnabled", isEnabled.toString());
}

document.addEventListener("DOMContentLoaded", showOnboarding);
showOnboarding();


function showOnboarding() {
    const onboardingModal = document.getElementById("onboarding-modal");
    const startButton = document.getElementById("start-mini-cycle");

    if (!onboardingModal || !startButton) {
        console.error("❌ Onboarding modal elements not found!");
        return;
    }

    const hasSeenOnboarding = localStorage.getItem("miniCycleOnboarding");

    if (hasSeenOnboarding) {
        onboardingModal.style.display = "none";
        return;
    }
 
    if (!hasSeenOnboarding) {
        onboardingModal.style.display = "flex";
    }

    // ✅ Close modal when clicking the button
    startButton.addEventListener("click", () => {
        onboardingModal.style.display = "none"; // ✅ Hide modal on click
        localStorage.setItem("miniCycleOnboarding", "true"); // ✅ Save to localStorage
        console.log("🚀 Onboarding dismissed!");
    });

    // ✅ Close modal when clicking outside of the content box
    onboardingModal.addEventListener("click", (event) => {
        if (event.target === onboardingModal) {
            onboardingModal.style.display = "none";
            localStorage.setItem("miniCycleOnboarding", "true"); // ✅ Mark as seen
            console.log("✅ Onboarding closed by clicking outside.");
        }
    });
}


/**
 * Adds an event listener safely by removing any existing listener first.
 * This prevents duplicate event bindings and ensures only one listener is active at a time.
 *
 * @param {HTMLElement} element - The element to attach the event listener to.
 * @param {string} event - The event type (e.g., "click", "input").
 * @param {Function} handler - The function that handles the event.
 */

function safeAddEventListener(element, event, handler) {
    if (!element) return; // Prevent errors if element is null
    element.removeEventListener(event, handler); // Clear old one
    element.addEventListener(event, handler); // Add fresh
}

function safeAddEventListenerById(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        safeAddEventListener(element, event, handler);
    } else {
        console.warn(`⚠ Cannot attach event listener: #${id} not found.`);
    }
}


/**
 * Detects the device type and applies the appropriate class to the body.
 * Determines if the device has touch capabilities or a fine pointer (mouse).
 */

function detectDeviceType() {
    let hasTouchEvents = "ontouchstart" in window;
    let touchPoints = navigator.maxTouchPoints || navigator.msMaxTouchPoints;
    let isFinePointer = window.matchMedia("(pointer: fine)").matches;

    console.log(`touch detected: hasTouchEvents=${hasTouchEvents}, maxTouchPoints=${touchPoints}, isFinePointer=${isFinePointer}`);

    if (!isFinePointer && (hasTouchEvents || touchPoints > 0)) {
        document.body.classList.add("touch-device");
    } else {
        document.body.classList.add("non-touch-device");
    }
}
detectDeviceType();


/**
 * Initializes the main menu by attaching event listeners to menu buttons.
 * Ensures the function runs only once to prevent duplicate event bindings.
 */

function setupMainMenu() {
    if (setupMainMenu.hasRun) return; // Prevents running more than once
    setupMainMenu.hasRun = true;

    safeAddEventListener(document.getElementById("save-as-mini-cycle"), "click", saveMiniCycleAsNew);
    safeAddEventListener(document.getElementById("open-mini-cycle"), "click", switchMiniCycle);    
    safeAddEventListener(document.getElementById("clear-mini-cycle-tasks"), "click", clearAllTasks);
    safeAddEventListener(document.getElementById("delete-all-mini-cycle-tasks"), "click", deleteAllTasks);
    safeAddEventListener(document.getElementById("new-mini-cycle"), "click", createNewMiniCycle);
    safeAddEventListener(document.getElementById("close-main-menu"), "click", closeMainMenu);

    safeAddEventListener(exitMiniCycle, "click", () => {
        window.location.href = "../index.html";
    });
    
}


function closeMainMenu() {
if (menu) { menu.classList.remove("visible");}
}



/**
 * Initializes the Mini Cycle app by loading or creating a saved Mini Cycle.
 * Ensures a valid Mini Cycle is always available in localStorage.
 */

function initialSetup() {
    let lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");
    let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

    console.log("savedMC:", savedMiniCycles);

    while (!lastUsedMiniCycle || lastUsedMiniCycle.trim() === "") {
        lastUsedMiniCycle = prompt("Enter a name for your Mini Cycle:");
        if (!lastUsedMiniCycle || lastUsedMiniCycle.trim() === "") {
            showNotification("⚠ You must enter a valid Mini Cycle name.");
        }
    }

    // ✅ If the Mini Cycle doesn't exist, create it with default values..
    if (!savedMiniCycles[lastUsedMiniCycle]) {
        savedMiniCycles[lastUsedMiniCycle] = { 
            title: lastUsedMiniCycle, 
            tasks: [], 
            autoReset: true,  // ✅ Default AutoReset to true for new Mini Cycles
            deleteCheckedTasks: false, // ✅ Ensure this property always exists
            cycleCount: 0 // ✅ Track how many times a Mini Cycle has been completed
        };
    }

    localStorage.setItem("lastUsedMiniCycle", lastUsedMiniCycle);
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    // ✅ Set title from stored Mini Cycle data
    document.getElementById("mini-cycle-title").textContent = savedMiniCycles[lastUsedMiniCycle].title;

    // ✅ Load AutoReset setting for this Mini Cycle
    toggleAutoReset.checked = savedMiniCycles[lastUsedMiniCycle].autoReset;
    deleteCheckedTasks.checked = savedMiniCycles[lastUsedMiniCycle].deleteCheckedTasks;
}


function setupDarkModeToggle(toggleId, allToggleIds = []) {
    const thisToggle = document.getElementById(toggleId);
    if (!thisToggle) return;

    // Set initial checked state
    const isDark = localStorage.getItem("darkModeEnabled") === "true";
    thisToggle.checked = isDark;
    document.body.classList.toggle("dark-mode", isDark);

    // Event handler
    thisToggle.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        document.body.classList.toggle("dark-mode", enabled);
        localStorage.setItem("darkModeEnabled", enabled.toString());

        // ✅ Sync all other toggles
        allToggleIds.forEach(id => {
            const otherToggle = document.getElementById(id);
            if (otherToggle && otherToggle !== thisToggle) {
                otherToggle.checked = enabled;
            }
        });
    });
}

/**
 * Enables editing of the Mini Cycle title and saves changes to localStorage.
 * Prevents empty titles and restores the previous title if an invalid entry is made.
 */

function setupMiniCycleTitleListener() {
    const titleElement = document.getElementById("mini-cycle-title");
    if (!titleElement) return; // Safety check

    titleElement.contentEditable = true;

    // ✅ Add event listener only once
    if (!titleElement.dataset.listenerAdded) {
        titleElement.addEventListener("blur", () => {
            let newTitle = titleElement.textContent.trim();
            const miniCycleFileName = localStorage.getItem("lastUsedMiniCycle");
            const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

            if (!miniCycleFileName || !savedMiniCycles[miniCycleFileName]) {
                console.warn("⚠ No active Mini Cycle found. Title update aborted.");
                return;
            }

            if (newTitle !== "") {
                savedMiniCycles[miniCycleFileName].title = newTitle;
                localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
                console.log(`✅ Mini Cycle title updated: "${newTitle}"`);
            } else {
                showNotification("⚠ Title cannot be empty. Reverting to the previous title.");
                titleElement.textContent = savedMiniCycles[miniCycleFileName].title;
            }
        });

        titleElement.dataset.listenerAdded = true;
    }
}

/**
 * Saves the current state of the active Mini Cycle to localStorage.
 * Captures task list, completion status, due dates, priority settings, and reminders.
 */

function autoSave() {
    const miniCycleFileName = localStorage.getItem("lastUsedMiniCycle");
    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

    if (!miniCycleFileName || !savedMiniCycles[miniCycleFileName]) {
        console.error(`❌ Error: Mini Cycle "${miniCycleFileName}" not found in storage. Auto-save aborted.`);
        return;
    }

    console.log("🔄 Auto-saving Mini Cycle:", miniCycleFileName);

    let miniCycleTasks = [...document.getElementById("taskList").children].map(task => {
        let taskTextElement = task.querySelector(".task-text");
        let dueDateElement = task.querySelector(".due-date");
        let reminderButton = task.querySelector(".enable-task-reminders");

        if (!taskTextElement) {
            console.warn("⚠ Skipping task: Missing task text element.", task);
            return null;
        }

        return {
            text: taskTextElement.textContent,
            completed: task.querySelector("input[type='checkbox']").checked,
            dueDate: dueDateElement ? dueDateElement.value : null,
            highPriority: task.classList.contains("high-priority"),
            remindersEnabled: reminderButton ? reminderButton.classList.contains("reminder-active") : false  // ✅ Save reminder status
        };
    }).filter(task => task !== null); // ✅ Remove null values from the array

    savedMiniCycles[miniCycleFileName].tasks = miniCycleTasks;
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    console.log("📋 Task Status:");
    miniCycleTasks.forEach(task => {
        console.log(`- ${task.text}: ${task.completed ? "✅ Completed" : "❌ Not Completed"} 
            ${task.dueDate ? `(Due: ${task.dueDate})` : ''} 
            ${task.highPriority ? "🔥 High Priority" : ""} 
            ${task.remindersEnabled ? "🔔 Reminders ON" : "🔕 Reminders OFF"}`);
    });
    
}




/**
 * Loads the last used Mini Cycle from localStorage and updates the UI.
 * Ensures tasks, title, settings, and overdue statuses are properly restored.
 */

function loadMiniCycle() {
    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    let lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");

    if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) {
        console.warn("⚠ No saved Mini Cycle found.");
        return;
    }

    try {
        const miniCycleData = savedMiniCycles[lastUsedMiniCycle];

        if (!Array.isArray(miniCycleData.tasks)) {
            throw new Error(`Invalid task data for "${lastUsedMiniCycle}".`);
        }

        // ✅ 1️⃣ CLEAR PREVIOUS TASKS TO AVOID GLITCHES
        taskList.innerHTML = ""; // Fully clears UI before loading new data

        // ✅ 2️⃣ CLEAR VISUAL STATES TO PREVENT UI GLITCHES
        progressBar.style.width = "0%"; // Reset progress bar
        cycleMessage.style.visibility = "hidden"; // Hide cycle complete message
        cycleMessage.style.opacity = "0";

        // ✅ 3️⃣ LOAD NEW TASKS SAFELY
        miniCycleData.tasks.forEach(task => {
            if (!task.text) {
                console.warn("⚠ Skipping task: No task text found.", task);
                return;
            }
            addTask(task.text, task.completed, false, task.dueDate || null, task.highPriority, true, task.remindersEnabled);
        });

        // ✅ 4️⃣ UPDATE MINI CYCLE TITLE
        const titleElement = document.getElementById("mini-cycle-title");
        titleElement.textContent = miniCycleData.title || "Untitled Mini Cycle"; 

        // ✅ 5️⃣ LOAD SETTINGS FROM STORAGE
        toggleAutoReset.checked = miniCycleData.autoReset || false;
        deleteCheckedTasks.checked = miniCycleData.deleteCheckedTasks || false;

        // ✅ 6️⃣ RESET OVERDUE TASK STATES
        checkOverdueTasks();
        setTimeout(() => {
            remindOverdueTasks();
        }, 1000);

        console.log(`✅ Successfully loaded Mini Cycle: "${lastUsedMiniCycle}"`);

        // ✅ 7️⃣ ENSURE UI UPDATES
        updateMainMenuHeader();
        hideMainMenu();
        updateProgressBar();
        checkCompleteAllButton();

        // ✅ 8️⃣ FINAL SAFEGUARD: Small delay to ensure UI stabilizes before checking reminders
        setTimeout(updateReminderButtons, 200);
    } catch (error) {
        console.error("❌ Error loading Mini Cycle:", error);
    }
}





/**
 * Checks for overdue tasks and visually marks them as overdue.
 * Notifies the user if newly overdue tasks are detected.
 *
 * @param {HTMLElement|null} taskToCheck - The specific task to check, or null to check all tasks.
 */

function checkOverdueTasks(taskToCheck = null) {
    const tasks = taskToCheck ? [taskToCheck] : document.querySelectorAll(".task");
    let autoReset = toggleAutoReset.checked;

    // Retrieve saved overdue states from local storage
    let overdueTaskStates = JSON.parse(localStorage.getItem("overdueTaskStates")) || {};

    // ✅ Track tasks that just became overdue
    let newlyOverdueTasks = [];

    tasks.forEach(task => {
        const taskText = task.querySelector(".task-text").textContent;
        const dueDateInput = task.querySelector(".due-date");
        if (!dueDateInput) return;

        const dueDateValue = dueDateInput.value;
        if (!dueDateValue) {
            // ✅ Date was cleared — remove overdue class
            task.classList.remove("overdue-task");
            delete overdueTaskStates[taskText];
            return;
        }

        const dueDate = new Date(dueDateValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
            if (!autoReset) {
                if (!overdueTaskStates[taskText]) {
                    newlyOverdueTasks.push(taskText); // ✅ Only notify if it just became overdue
                }
                task.classList.add("overdue-task");
                overdueTaskStates[taskText] = true;
            } else if (overdueTaskStates[taskText]) {
                task.classList.add("overdue-task");
            } else {
                task.classList.remove("overdue-task");
            }
        } else {
            task.classList.remove("overdue-task");
            delete overdueTaskStates[taskText];
        }
    });

    // ✅ Save overdue states in local storage
    localStorage.setItem("overdueTaskStates", JSON.stringify(overdueTaskStates));

    // ✅ Show notification ONLY if there are newly overdue tasks
    if (newlyOverdueTasks.length > 0) {
        showNotification(`⚠️ Overdue Tasks:<br>- ${newlyOverdueTasks.join("<br>- ")}`, "error");
    }
}


/**
 * Remindoverduetasks function.
 *
 * @returns {void}
 */

function remindOverdueTasks() {
    let autoReset = toggleAutoReset.checked;
    if (autoReset) return;

    // ✅ Load reminder settings
    const remindersSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
    const dueDatesRemindersEnabled = remindersSettings.dueDatesReminders;
    const remindersFullyEnabled = remindersSettings.enabled; // ✅ Check if reminders are enabled

    // ✅ Only proceed if due date notifications are enabled
    if (!dueDatesRemindersEnabled) {
        console.log("❌ Due date notifications are disabled. Exiting remindOverdueTasks().");
        return;
    }

    let overdueTasks = [...document.querySelectorAll(".task")]
        .filter(task => task.classList.contains("overdue-task"))
        .map(task => task.querySelector(".task-text").textContent);

    if (overdueTasks.length > 0) {
        showNotification(`⚠️ Overdue Tasks:<br>- ${overdueTasks.join("<br>- ")}`, "error");
    }
}








/**
 * Updates the main menu header with the active Mini Cycle title and current date.
 * Ensures proper display of selected Mini Cycle.
 */

function updateMainMenuHeader() {
    const menuHeaderTitle = document.getElementById("main-menu-mini-cycle-title");
    const dateElement = document.getElementById("current-date");
    const lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle") || "No Mini Cycle Selected";

    // ✅ Get Current Date
    const today = new Date();
    const formattedDate = today.toLocaleDateString(undefined, {
        weekday: 'short', // "Mon"
        month: 'short', // "Jan"
        day: '2-digit', // "08"
        year: 'numeric' // "08"
    });

    // ✅ Update Title & Date
    menuHeaderTitle.textContent = lastUsedMiniCycle;
    dateElement.textContent = formattedDate;
}

/**
 * Saves the due date for a specific task in the active Mini Cycle.
 *
 * @param {string} taskText - The text of the task to update.
 * @param {string|null} dueDate - The due date to assign, or null to remove the due date.
 */

function saveTaskDueDate(taskText, dueDate) {
    let miniCycleName = localStorage.getItem("lastUsedMiniCycle");
    let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

    if (savedMiniCycles[miniCycleName]) {
        let task = savedMiniCycles[miniCycleName].tasks.find(t => t.text === taskText);
        if (task) {
            task.dueDate = dueDate;
            localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
            console.log(`📅 Due date updated for task "${taskText}": ${dueDate}`);
        }
    }
}


/**
 * Saves the current Mini Cycle under a new name, creating a separate copy.
 * Ensures that the new name is unique before saving.
 */

function saveMiniCycleAsNew() {
    const currentMiniCycleName = localStorage.getItem("lastUsedMiniCycle");
    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

    if (!currentMiniCycleName || !savedMiniCycles[currentMiniCycleName]) {
        showNotification("⚠ No Mini Cycle found to save.");
        return;
    }

    let newCycleName = prompt("Enter a new name to save this Mini Cycle as:");
    if (!newCycleName || savedMiniCycles[newCycleName]) {
        showNotification("⚠ Invalid name or Mini Cycle already exists.");
        return;
    }

    // ✅ Deep copy of Mini Cycle
    savedMiniCycles[newCycleName] = JSON.parse(JSON.stringify(savedMiniCycles[currentMiniCycleName]));
    savedMiniCycles[newCycleName].title = newCycleName; // ✅ New title = New Mini Cycle name

    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
    localStorage.setItem("lastUsedMiniCycle", newCycleName);

    showNotification(`✅ Mini Cycle "${currentMiniCycleName}" was copied as "${newCycleName}"!`);
    hideMainMenu();
    loadMiniCycle();
}

/**
 * Switchminicycle function.
 *
 * @returns {void}
 */

function switchMiniCycle() {
    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    const switchModal = document.querySelector(".mini-cycle-switch-modal");
    const listContainer = document.getElementById("miniCycleList");
    const switchRow = document.querySelector(".switch-items-row");
    const renameButton = document.getElementById("switch-rename");
    const deleteButton = document.getElementById("switch-delete");
    const previewWindow = document.getElementById("switch-preview-window");

    hideMainMenu();


    if (Object.keys(savedMiniCycles).length === 0) {
        showNotification("No saved Mini Cycles found.");
        return;
    }

    // ✅ Clear previous list and populate with Mini Cycles
    listContainer.innerHTML = "";
    Object.keys(savedMiniCycles).forEach((cycleName) => {
        const listItem = document.createElement("button");
        listItem.classList.add("mini-cycle-switch-item");
        listItem.textContent = cycleName;
        listItem.dataset.cycleName = cycleName;

        // ✅ Click event for selecting a Mini Cycle
        listItem.addEventListener("click", () => {
            document.querySelectorAll(".mini-cycle-switch-item").forEach(item => 
                item.classList.remove("selected"));
            listItem.classList.add("selected");

            // ✅ Ensure Action Row is visible
            switchRow.style.display = "block"; 
            updatePreview(cycleName);
          
        });

        listContainer.appendChild(listItem);
    });

    switchModal.style.display = "flex"; // ✅ Show modal
    switchRow.style.display = "none"; 
       // ✅ Load Mini Cycle List before displaying the modal
       loadMiniCycleList();


    // ✅ Prevent duplicate event listeners
    renameButton.removeEventListener("click", renameMiniCycle);
    renameButton.addEventListener("click", renameMiniCycle);

    deleteButton.removeEventListener("click", deleteMiniCycle);
    deleteButton.addEventListener("click", deleteMiniCycle);

    document.getElementById("miniCycleSwitchConfirm").removeEventListener("click", confirmMiniCycle);
    document.getElementById("miniCycleSwitchConfirm").addEventListener("click", confirmMiniCycle);

    document.getElementById("miniCycleSwitchCancel").removeEventListener("click", closeMiniCycleModal);
    document.getElementById("miniCycleSwitchCancel").addEventListener("click", closeMiniCycleModal);
}

    /***********************
 * 
 * 
 * Menu Management Logic
 * 
 * 
 ************************/

/**
 * Renameminicycle function.
 *
 * @returns {void}
 */

function renameMiniCycle() {
    const selectedCycle = document.querySelector(".mini-cycle-switch-item.selected");

    if (!selectedCycle) {
        showNotification("Please select a Mini Cycle to rename.");
        return;
    }

    let newName = prompt("Enter a new name for this Mini Cycle:", selectedCycle.textContent);
    if (!newName || newName.trim() === "") {
        showNotification("Invalid name! Mini Cycle name cannot be empty.");
        return;
    }

    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

    // ✅ Check if new name already exists
    if (savedMiniCycles[newName]) {
        showNotification("A Mini Cycle with this name already exists. Choose a different name.");
        return;
    }

    // ✅ Rename and update localStorage
    savedMiniCycles[newName] = { ...savedMiniCycles[selectedCycle.dataset.cycleName] };
    delete savedMiniCycles[selectedCycle.dataset.cycleName];

    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    showNotification(`Mini Cycle renamed to: ${newName}`);
    switchMiniCycle(); // ✅ Refresh modal to update the list
}

/**
 * Deleteminicycle function.
 *
 * @returns {void}
 */

function deleteMiniCycle() {
    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    let lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");
    const switchModal = document.querySelector(".mini-cycle-switch-modal"); // ✅ Select modal

    const selectedCycle = document.querySelector(".mini-cycle-switch-item.selected");
    if (!selectedCycle) {
        showNotification("⚠ No Mini Cycle selected for deletion.");
        return;
    }

    const cycleToDelete = selectedCycle.dataset.cycleName;

    // ✅ Confirm deletion before proceeding
    if (!confirm(`❌ Are you sure you want to delete "${cycleToDelete}"? This action cannot be undone.`)) {
        return;
    }

    // ✅ Remove the selected Mini Cycle
    delete savedMiniCycles[cycleToDelete];
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
    console.log(`✅ Mini Cycle "${cycleToDelete}" deleted.`);

    // ✅ If the deleted cycle was the active one, handle fallback
    if (cycleToDelete === lastUsedMiniCycle) {
        const remainingCycles = Object.keys(savedMiniCycles);

        if (remainingCycles.length > 0) {
            // ✅ Switch to the most recent or first available Mini Cycle
            const newActiveCycle = remainingCycles[0];
            localStorage.setItem("lastUsedMiniCycle", newActiveCycle);
            loadMiniCycle(); // Load the new active Mini Cycle
            console.log(`🔄 Switched to Mini Cycle: "${newActiveCycle}".`);
        } else {
            setTimeout(() => {
                hideSwitchMiniCycleModal();
                showNotification("⚠ No Mini Cycles left. Please create a new one.");
                localStorage.removeItem("lastUsedMiniCycle");
        
                // ✅ Manually reset UI instead of reloading
                taskList.innerHTML = "";
                toggleAutoReset.checked = false;
                initialSetup(); // Runs fresh setup
            }, 300);
        }
    }

    hideSwitchMiniCycleModal();
    updateProgressBar();
    checkCompleteAllButton();
}

/**
 * Hideswitchminicyclemodal function.
 *
 * @returns {void}
 */

function hideSwitchMiniCycleModal() {
    const switchModal = document.querySelector(".mini-cycle-switch-modal");
    console.log("🔍 Modal Found?", switchModal); // Debugging log

    if (!switchModal) {
        console.error("❌ Error: Modal not found.");
        return;
    }
    document.querySelector(".mini-cycle-switch-modal").style.display = "none";
    console.log("confirm", switchModal); 
}

/**
 * Confirmminicycle function.
 *
 * @returns {void}
 */

function confirmMiniCycle() {
    const selectedCycle = document.querySelector(".mini-cycle-switch-item.selected");

    if (!selectedCycle) {
        showNotification("Please select a Mini Cycle.");
        return;
    }

    localStorage.setItem("lastUsedMiniCycle", selectedCycle.dataset.cycleName);
    loadMiniCycle();
    document.querySelector(".mini-cycle-switch-modal").style.display = "none"; // ✅ Hide modal after selection
}



/**
 * Closeminicyclemodal function.
 *
 * @returns {void}
 */

function closeMiniCycleModal() {
    document.querySelector(".mini-cycle-switch-modal").style.display = "none";
}


document.addEventListener("click", /**
 * Closeonclickoutside function.
 *
 * @param {any} event - Description. * @returns {void}
 */

/**
 * Closeonclickoutside function.
 *
 * @param {any} event - Description. * @returns {void}
 */

function closeOnClickOutside(event) {
    const switchModalContent = document.querySelector(".mini-cycle-switch-modal-content");
    const switchModal = document.querySelector(".mini-cycle-switch-modal");
    const mainMenu = document.querySelector(".menu-container");

    // ✅ If the modal is open and the clicked area is NOT inside the modal or main menu, close it
    if (
        switchModal.style.display === "flex" &&
        !switchModalContent.contains(event.target) && 
        !mainMenu.contains(event.target)
    ) {
        switchModal.style.display = "none"; 
    }
});


/**
 * Updatepreview function.
 *
 * @param {any} cycleName - Description. * @returns {void}
 */

function updatePreview(cycleName) {
    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    const previewWindow = document.getElementById("switch-preview-window");

    if (!savedMiniCycles[cycleName] || !savedMiniCycles[cycleName].tasks) {
        previewWindow.innerHTML = `<br><strong>No tasks found.</strong>`;
        return;
    }

    // ✅ Create a simple list of tasks for preview
    const tasksPreview = savedMiniCycles[cycleName].tasks
        .map(task => `<div class="preview-task">${task.completed ? "✔️" : "___"} ${task.text}</div>`)
        .join("");

    previewWindow.innerHTML = `<strong>Tasks:</strong><br>${tasksPreview}`;
}

/**
 * Loadminicyclelist function.
 *
 * @returns {void}
 */

function loadMiniCycleList() {
    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    const miniCycleList = document.getElementById("miniCycleList");
    miniCycleList.innerHTML = ""; // Clear the list before repopulating

    Object.keys(savedMiniCycles).forEach((cycleName) => {
        const cycleData = savedMiniCycles[cycleName];
        const listItem = document.createElement("div");
        listItem.classList.add("mini-cycle-switch-item");
        listItem.dataset.cycleName = cycleName;

        // 🏷️ Determine emoji based on Mini Cycle properties
        let emoji = "📋"; // Default to 📋 (Standard Document)
        if (cycleData.autoReset) {
            emoji = "🔃"; // If Auto Reset is ON, show 🔃
        } 

        // 📌 Ensure spacing between emoji and text
        listItem.innerHTML = `${emoji}  <span>${cycleName}</span>`;

        // 🖱️ Handle selection
        listItem.addEventListener("click", function () {
            document.querySelectorAll(".mini-cycle-switch-item").forEach(item => item.classList.remove("selected"));
            this.classList.add("selected");

            // Show preview & buttons
            document.getElementById("switch-items-row").style.display = "block";
            updatePreview(cycleName);
           
        });

        miniCycleList.appendChild(listItem);
    });
}



/**
 * Clearalltasks function.
 *
 * @returns {void}
 */

function clearAllTasks() {
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();

    // ✅ Ensure a valid Mini Cycle exists
    if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) {
        showNotification("⚠ No active Mini Cycle to clear tasks.");
        return;
    }


    // ✅ Uncheck all tasks (DO NOT DELETE)
    savedMiniCycles[lastUsedMiniCycle].tasks.forEach(task => task.completed = false);

    // ✅ Save updated Mini Cycle
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    // ✅ Uncheck tasks in the UI
    document.querySelectorAll("#taskList .task input[type='checkbox']").forEach(checkbox => {
        checkbox.checked = false;
    });

    // ✅ Update UI elements
    updateProgressBar();
    checkCompleteAllButton();
    autoSave(); // Ensure changes persist
    hideMainMenu();

    console.log(`✅ All tasks unchecked for Mini Cycle: "${lastUsedMiniCycle}"`);
}

/**
 * Deletealltasks function.
 *
 * @returns {void}
 */

function deleteAllTasks() {
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();

    // ✅ Ensure a valid Mini Cycle exists
    if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) {
        showNotification("⚠ No active Mini Cycle to delete tasks from.");
        return;
    }

    // ✅ Confirm before deleting all tasks
    if (!confirm(`⚠ Are you sure you want to permanently delete all tasks in "${lastUsedMiniCycle}"? This action cannot be undone.`)) {
        return;
    }

    // ✅ Clear tasks completely
    savedMiniCycles[lastUsedMiniCycle].tasks = [];

    // ✅ Save updated Mini Cycle
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    // ✅ Clear UI & update progress
    taskList.innerHTML = "";
    updateProgressBar();
    checkCompleteAllButton();
    autoSave(); // Ensure changes persist

    console.log(`✅ All tasks deleted for Mini Cycle: "${lastUsedMiniCycle}"`);
}

/**
 * Createnewminicycle function.
 *
 * @returns {void}
 */

function createNewMiniCycle() {
    let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    
    // ✅ Prompt user for a Mini Cycle name
    let newCycleName = prompt("Enter a name for the new Mini Cycle:");
    if (!newCycleName || newCycleName.trim() === "") {
        showNotification("⚠ Mini Cycle name cannot be empty.");
        return;
    }
    newCycleName = newCycleName.trim();

    // ✅ Ensure the Mini Cycle name is unique
    if (savedMiniCycles[newCycleName]) {
        showNotification("⚠ A Mini Cycle with this name already exists. Choose a different name.");
        return;
    }

    // ✅ Create new Mini Cycle with default settings
    savedMiniCycles[newCycleName] = {
        title: newCycleName,
        tasks: [],
        autoReset: true, // ✅ Default Auto Reset to ON
        deleteCheckedTasks: false, // ✅ Default to OFF
    };

    // ✅ Save to localStorage
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
    localStorage.setItem("lastUsedMiniCycle", newCycleName);

    // ✅ Clear UI & Load new Mini Cycle
    taskList.innerHTML = "";
    document.getElementById("mini-cycle-title").textContent = newCycleName;
    toggleAutoReset.checked = savedMiniCycles[newCycleName].autoReset;

    // ✅ Ensure UI updates
    hideMainMenu();
    updateProgressBar();
    checkCompleteAllButton();
    autoSave();

    console.log(`✅ Created and switched to new Mini Cycle: "${newCycleName}"`);
}







enableReminders.addEventListener("change", () => {
    // ✅ Toggle frequency settings visibility
    frequencySection.style.display = enableReminders.checked ? "block" : "none";

    // ✅ Save the new reminder settings in localStorage
    autoSaveReminders();

    // ✅ Dynamically update all tasks to show/hide the reminder button
    updateReminderButtons();
});

indefiniteCheckbox.addEventListener("change", () => {
  // If indefinite, hide the repeatCount row
  repeatCountRow.style.display = indefiniteCheckbox.checked ? "none" : "block";
});



/**
 * 📌 Load saved reminder settings from localStorage and update the UI accordingly.
 */
/**
 * Loadreminderssettings function.
 *
 * @returns {void}
 */

// ✅ Automatically save reminders settings when changed
function autoSaveReminders() {
    const remindersToSave = {
        enabled: document.getElementById("enableReminders").checked,
        indefinite: document.getElementById("indefiniteCheckbox").checked,
        dueDatesReminders: document.getElementById("dueDatesReminders").checked,
        repeatCount: parseInt(document.getElementById("repeatCount").value) || 0,
        frequencyValue: parseInt(document.getElementById("frequencyValue").value) || 0,
        frequencyUnit: document.getElementById("frequencyUnit").value
    };

    // ✅ Save to localStorage
    localStorage.setItem("miniCycleReminders", JSON.stringify(remindersToSave));
    console.log("✅ Reminders settings saved automatically!", remindersToSave);
}

// ✅ Load saved reminders settings on page load
function loadRemindersSettings() {
    const savedReminders = JSON.parse(localStorage.getItem("miniCycleReminders")) || {
        enabled: false,
        indefinite: true,
        dueDatesReminders: false,
        repeatCount: 0,
        frequencyValue: 0,
        frequencyUnit: "hours"
    };

    // ✅ Apply settings to UI
    document.getElementById("enableReminders").checked = savedReminders.enabled;
    document.getElementById("indefiniteCheckbox").checked = savedReminders.indefinite;
    document.getElementById("dueDatesReminders").checked = savedReminders.dueDatesReminders;
    document.getElementById("repeatCount").value = savedReminders.repeatCount;
    document.getElementById("frequencyValue").value = savedReminders.frequencyValue;
    document.getElementById("frequencyUnit").value = savedReminders.frequencyUnit;

    // ✅ Show/hide frequency settings dynamically
    document.getElementById("frequency-section").style.display = savedReminders.enabled ? "block" : "none";
    document.getElementById("repeat-count-row").style.display = savedReminders.indefinite ? "none" : "block";
}

// ✅ Attach auto-save & restart reminders to all reminder settings inputs safely
/*
safeAddEventListenerById("enableReminders", "change", () => {
    document.getElementById("frequency-section").style.display = document.getElementById("enableReminders").checked ? "block" : "none";
    autoSaveReminders();
    startReminders();
});
*/

safeAddEventListenerById("indefiniteCheckbox", "change", () => {
    document.getElementById("repeat-count-row").style.display = document.getElementById("indefiniteCheckbox").checked ? "none" : "block";
    autoSaveReminders();
    startReminders();
});
safeAddEventListenerById("dueDatesReminders", "change", () => {
    // ✅ Load existing reminder settings
    let remindersSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};

    // ✅ Update only the due dates reminders setting
    remindersSettings.dueDatesReminders = document.getElementById("dueDatesReminders").checked;

    // ✅ Save the updated settings to localStorage
    localStorage.setItem("miniCycleReminders", JSON.stringify(remindersSettings));

    console.log(`💾 Saved Due Dates Reminders setting: ${remindersSettings.dueDatesReminders}`);
});


// ✅ Corrected event listeners - Calls both functions properly
safeAddEventListenerById("repeatCount", "input", () => {
    autoSaveReminders();
    startReminders();
});

safeAddEventListenerById("frequencyValue", "input", () => {
    autoSaveReminders();
    startReminders();
});

safeAddEventListenerById("frequencyUnit", "change", () => {
    autoSaveReminders();
    startReminders();
});


/**
 * 📌 Save the current reminder settings into localStorage.
 * @returns {object} The saved reminder settings.
 */
/**
 * Savereminderssettings function.
 *
 * @returns {void}
 */


/**
 * 📌 Save the reminder state for a specific task inside the active Mini Cycle.
 * @param {string} taskText - The text of the task to update.
 * @param {boolean} isEnabled - Whether reminders are enabled for this task.
 */
/**
 * Savetaskreminderstate function.
 *
 * @param {any} taskText - Description.
 * @param {any} isEnabled - Description. * @returns {void}
 */

function saveTaskReminderState(taskText, isEnabled) {
    // ✅ Retrieve saved Mini Cycles from localStorage
    let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    let lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");

    // ✅ Check if the active Mini Cycle exists
    if (!savedMiniCycles[lastUsedMiniCycle]) return;

    // ✅ Find the task inside the Mini Cycle
    let task = savedMiniCycles[lastUsedMiniCycle].tasks.find(t => t.text === taskText);
    if (task) {
        task.remindersEnabled = isEnabled; // ✅ Update task's reminder status
        localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles)); // ✅ Save changes
    }
}

/**
 * 📌 Handle click event for saving reminders settings.
 * - Saves the settings.
 * - Starts the reminders.
 * - Shows a confirmation alert.
 */

/**
 * 📌 Close the reminders settings modal when the close button is clicked.
 */
closeRemindersBtn.addEventListener("click", () => {
    remindersModal.style.display = "none";
});

/**
 * 📌 Close the reminders modal when clicking outside of it.
 */
window.addEventListener("click", (event) => {
    if (event.target === remindersModal) {
        remindersModal.style.display = "none";
    }
});

  
function showNotification(message, type = "default", duration = null) {
    const notificationContainer = document.getElementById("notification-container");
    // ✅ Make it draggable
let offsetX, offsetY;

notificationContainer.addEventListener("mousedown", (e) => {
    notificationContainer.classList.add("dragging");

    offsetX = e.clientX - notification.getBoundingClientRect().left;
    offsetY = e.clientY - notification.getBoundingClientRect().top;

    function onMouseMove(e) {
        notificationContainer.style.top = `${e.clientY - offsetY}px`;
        notificationContainer.style.left = `${e.clientX - offsetX}px`;
        notificationContainer.style.right = "auto"; // 🧼 Reset right so it doesn't conflict
    }

    function onMouseUp() {
        notificationContainer.classList.remove("dragging");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
});

// ✅ Touch drag support
notificationContainer.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    offsetX = touch.clientX - notificationContainer.getBoundingClientRect().left;
    offsetY = touch.clientY - notificationContainer.getBoundingClientRect().top;

    function onTouchMove(e) {
        const touch = e.touches[0];
        notificationContainer.style.top = `${touch.clientY - offsetY}px`;
        notificationContainer.style.left = `${touch.clientX - offsetX}px`;
        notificationContainer.style.right = "auto";
    }

    function onTouchEnd() {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
    }

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
});

    // ✅ Check if a notification with the same message already exists
    const existingNotifications = [...notificationContainer.getElementsByClassName("notification")];
    if (existingNotifications.some(n => n.querySelector("span").innerHTML === message)) {
        console.log("🔄 Notification already exists, skipping duplicate.");
        return; // 🚀 Prevents duplicate notifications
    }

    // ✅ Create new notification
    const notification = document.createElement("div");
    notification.classList.add("notification", "show");

    if (type === "error") notification.classList.add("error");
    if (type === "success") notification.classList.add("success");

    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✖</button>
    `;

    notificationContainer.appendChild(notification);

    // ✅ Auto-remove after duration (if set)
    if (duration) {
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}






  
  /**
 * Startreminders function.
 *
 * @returns {void}
 */

  function startReminders() {
    console.log("🔄 Starting Reminder System...");

    if (reminderIntervalId) clearInterval(reminderIntervalId);

    const remindersSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
    if (!remindersSettings.enabled) return;

    let multiplier = remindersSettings.frequencyUnit === "hours" ? 3600000 :
                     remindersSettings.frequencyUnit === "days" ? 86400000 : 60000;
    const intervalMs = remindersSettings.frequencyValue * multiplier;

    timesReminded = 0;
    lastReminderTime = Date.now();

    reminderIntervalId = setInterval(() => {
        let tasksWithReminders = [...document.querySelectorAll(".task")]
            .filter(task => task.querySelector(".enable-task-reminders.reminder-active"));

        let incompleteTasks = tasksWithReminders
            .filter(task => !task.querySelector("input[type='checkbox']").checked)
            .map(task => task.querySelector(".task-text").textContent);

        if (incompleteTasks.length === 0) {
            console.log("✅ All tasks complete. Stopping reminders.");
            clearInterval(reminderIntervalId);
            return;
        }

        if (!remindersSettings.indefinite && timesReminded >= remindersSettings.repeatCount) {
            console.log("✅ Max reminders sent. Stopping reminders.");
            clearInterval(reminderIntervalId);
            return;
        }
        showNotification(`🔔 You have tasks to complete:<br>- ${incompleteTasks.join("<br>- ")}`, "default");
        timesReminded++;
    }, intervalMs);
}
















/**
 * Setupsettingsmenu function.
 *
 * @returns {void}
 */
function setupSettingsMenu() {
    const settingsModal = document.querySelector(".settings-modal");
    const settingsModalContent = document.querySelector(".settings-modal-content");
    const openSettingsBtn = document.getElementById("open-settings");
    const closeSettingsBtn = document.getElementById("close-settings");

    /**
     * Opens the settings menu.
     *
     * @param {Event} event - The click event.
     */
    function openSettings(event) {
        event.stopPropagation();
        settingsModal.style.display = "flex";
        hideMainMenu();
    }

    /**
     * Closes the settings menu.
     */
    function closeSettings() {
        settingsModal.style.display = "none";
    }

    function closeOnClickOutside(event) {
        if (settingsModal.style.display === "flex" && 
            !settingsModalContent.contains(event.target) && 
            event.target !== openSettingsBtn) {
            settingsModal.style.display = "none";
        }
    }

    // ✅ Remove previous listeners before adding new ones
    openSettingsBtn.removeEventListener("click", openSettings);
    closeSettingsBtn.removeEventListener("click", closeSettings);
    document.removeEventListener("click", closeOnClickOutside);

    // ✅ Add event listeners (only once)
    openSettingsBtn.addEventListener("click", openSettings);
    closeSettingsBtn.addEventListener("click", closeSettings);
    document.addEventListener("click", closeOnClickOutside);

    // ✅ Dark Mode Toggle (Check if the element exists first)
    setupDarkModeToggle("darkModeToggle", ["darkModeToggle", "darkModeToggleThemes"]);

    // ✅ Toggle Move Arrows Setting
    const moveArrowsToggle = document.getElementById("toggle-move-arrows");
    if (moveArrowsToggle) {
        moveArrowsToggle.checked = localStorage.getItem("miniCycleMoveArrows") === "true";
        moveArrowsToggle.addEventListener("change", () => {
            localStorage.setItem("miniCycleMoveArrows", moveArrowsToggle.checked);
            updateMoveArrowsVisibility();
        });
    }

    // ✅ Toggle Three-Dot Menu Setting
    const threeDotsToggle = document.getElementById("toggle-three-dots");
    if (threeDotsToggle) {
        threeDotsToggle.checked = localStorage.getItem("miniCycleThreeDots") === "true";
        threeDotsToggle.addEventListener("change", () => {
            localStorage.setItem("miniCycleThreeDots", threeDotsToggle.checked);
            location.reload();
        });
    }

    // ✅ Backup Mini Cycles
    document.getElementById("backup-mini-cycles").addEventListener("click", () => {
        const backupData = {
            miniCycleStorage: localStorage.getItem("miniCycleStorage"),
            lastUsedMiniCycle: localStorage.getItem("lastUsedMiniCycle"),
        };
        const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
        const backupUrl = URL.createObjectURL(backupBlob);
        const a = document.createElement("a");
        a.href = backupUrl;
        a.download = "mini-cycle-backup.json";
        a.click();
    });

    // ✅ Restore Mini Cycles
    document.getElementById("restore-mini-cycles").addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    if (backupData.miniCycleStorage) {
                        localStorage.setItem("miniCycleStorage", backupData.miniCycleStorage);
                        localStorage.setItem("lastUsedMiniCycle", backupData.lastUsedMiniCycle || "");
                        showNotification("✅ Backup Restored!");
                        location.reload();
                    } else {
                        showNotification("❌ Invalid backup file.");
                    }
                } catch (error) {
                    showNotification("❌ Error restoring backup.");
                }
            };
            reader.readAsText(file);
        });
        input.click();
    });

    // ✅ Factory Reset (Clear All Mini Cycles)
    document.getElementById("factory-reset").addEventListener("click", () => {
        if (confirm("⚠️ This will DELETE ALL Mini Cycles and reset everything. Are you sure?")) {
            localStorage.removeItem("miniCycleStorage");
            localStorage.removeItem("lastUsedMiniCycle");
            showNotification("✅ Factory Reset Complete. Reloading...");
            location.reload();
        }
    });
}



/**
 * Setupdownloadminicycle function.
 *
 * @returns {void}
 */

function setupDownloadMiniCycle() {
    document.getElementById("export-mini-cycle").addEventListener("click", () => {
        const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
        const lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");

        if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) {
            showNotification("⚠ No active Mini Cycle to export.");
            return;
        }

        const cycle = savedMiniCycles[lastUsedMiniCycle];

        const miniCycleData = {
            name: lastUsedMiniCycle,
            tasks: cycle.tasks.map(task => ({
                text: task.text,
                completed: task.completed || false,
                dueDate: task.dueDate || null,
                highPriority: task.highPriority || false
            })),
            autoReset: cycle.autoReset || false,
            cycleCount: cycle.cycleCount || 0,
            deleteCheckedTasks: cycle.deleteCheckedTasks || false,
            title: cycle.title || "New Mini Cycle"
        };

        let fileName = prompt("Enter a name for your Mini Cycle file:", lastUsedMiniCycle || "mini-cycle");
        if (fileName === null) {
            showNotification("❌ Download canceled.");
            return;
        }
        fileName = fileName.trim().replace(/[^a-zA-Z0-9-_ ]/g, "");
        if (!fileName) {
            showNotification("❌ Invalid file name. Download canceled.");
            return;
        }

        const blob = new Blob([JSON.stringify(miniCycleData, null, 2)], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.mcyc`;
        a.click();
        URL.revokeObjectURL(url);
    });
}




/**
 * Setupuploadminicycle function.
 *
 * @returns {void}
 */

function setupUploadMiniCycle() {
    const importButtons = ["import-mini-cycle", "miniCycleUpload"];

    importButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".mcyc";
            input.addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (!file) return;

                if (file.name.endsWith(".tcyc")) {
                    showNotification("❌ Mini Cycle does not support .tcyc files.\nPlease save your Task Cycle as .MCYC to import into Mini Cycle.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);

                        if (!importedData.name || !Array.isArray(importedData.tasks)) {
                            showNotification("❌ Invalid Mini Cycle file format.");
                            return;
                        }

                        const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

                        savedMiniCycles[importedData.name] = {
                            tasks: importedData.tasks.map(task => ({
                                text: task.text,
                                completed: task.completed || false,
                                dueDate: task.dueDate || null,
                                highPriority: task.highPriority || false
                            })),
                            autoReset: importedData.autoReset || false,
                            cycleCount: importedData.cycleCount || 0,
                            deleteCheckedTasks: importedData.deleteCheckedTasks || false,
                            title: importedData.title || "New Mini Cycle"
                        };

                        localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
                        localStorage.setItem("lastUsedMiniCycle", importedData.name);

                        showNotification(`✅ Mini Cycle "${importedData.name}" Imported Successfully!`);
                        location.reload();
                    } catch (error) {
                        showNotification("❌ Error importing Mini Cycle.");
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        });
    });
}




/**
 * Setupfeedbackmodal function.
 *
 * @returns {void}
 */

function setupFeedbackModal() {
    const feedbackModal = document.getElementById("feedback-modal");
    const openFeedbackBtn = document.getElementById("open-feedback-modal");
    const closeFeedbackBtn = document.querySelector(".close-feedback-modal");
    const feedbackForm = document.getElementById("feedback-form");
    const feedbackText = document.getElementById("feedback-text");
    const submitButton = document.getElementById("submit-feedback");
    const thankYouMessage = document.getElementById("thank-you-message");

    // Open Modal
    openFeedbackBtn.addEventListener("click", () => {
        feedbackModal.style.display = "flex";
        hideMainMenu();
        thankYouMessage.style.display = "none"; // Hide thank you message if shown before
    });

    // Close Modal
    closeFeedbackBtn.addEventListener("click", () => {
        feedbackModal.style.display = "none";
    });

    // Close Modal on Outside Click
    window.addEventListener("click", (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = "none";
        }
    });

    // Handle Form Submission via AJAX (Prevent Page Refresh)
    feedbackForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Disable button while sending
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        // Prepare Form Data
        const formData = new FormData(feedbackForm);

        // Send request to Web3Forms API
        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show Thank You Message
                thankYouMessage.style.display = "block";

                // Clear Textarea
                feedbackText.value = "";

                // Hide Form After Submission
                setTimeout(() => {
                    thankYouMessage.style.display = "none";
                    feedbackModal.style.display = "none"; // Close modal after a short delay
                }, 2000);
            } else {
                showNotification("❌ Error sending feedback. Please try again.");
            }
        })
        .catch(error => {
            showNotification("❌ Network error. Please try again later.");
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = "Submit";
        });
    });
}
/**
 * Setupusermanual function.
 *
 * @returns {void}
 */

function setupUserManual() {
    openUserManual.addEventListener("click", () => {
        hideMainMenu(); // Hide the menu when clicking

        // Disable button briefly to prevent multiple clicks
        openUserManual.disabled = true;

        // Redirect to the User Manual page after a short delay
        setTimeout(() => {
            window.location.href = "user-manual.html"; // ✅ Opens the manual page
            
            // Re-enable button after navigation (won't matter much since page changes)
            openUserManual.disabled = false;
        }, 200);
    });
}



/**
 * Setupabout function.
 *
 * @returns {void}
 */

function setupAbout() {
    const aboutModal = document.getElementById("about-modal");
    const openAboutBtn = document.getElementById("open-about-modal");
    const closeAboutBtn = aboutModal.querySelector(".close-modal");

    // Open Modal
    openAboutBtn.addEventListener("click", () => {
        aboutModal.style.display = "flex";
    });

    // Close Modal
    closeAboutBtn.addEventListener("click", () => {
        aboutModal.style.display = "none";
    });

    // Close Modal on Outside Click
    window.addEventListener("click", (event) => {
        if (event.target === aboutModal) {
            aboutModal.style.display = "none";
        }
    });
}


/**
 * Assigncyclevariables function.
 *
 * @returns {void}
 */

function assignCycleVariables() {
    let lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");
    let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

    return { lastUsedMiniCycle, savedMiniCycles };
}
// ✅ Retrieve Mini Cycle variables
const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();

/**
 * Updateprogressbar function.
 *
 * @returns {void}
 */

function updateProgressBar() {
    const totalTasks = taskList.children.length;
    const completedTasks = [...taskList.children].filter(task => task.querySelector("input").checked).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    autoSave();

}



/**
 * Checkminicycle function.
 *
 * @returns {void}
 */

function checkMiniCycle() {
    updateProgressBar();
    const allCompleted = [...taskList.children].every(task => task.querySelector("input").checked);

    // ✅ Retrieve Mini Cycle variables
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
    let cycleData = savedMiniCycles[lastUsedMiniCycle];

    if (!lastUsedMiniCycle || !cycleData) {
        console.warn("⚠ No active Mini Cycle found.");
        return;
    }

    // ✅ Only trigger reset if ALL tasks are completed AND autoReset is enabled
    if (allCompleted && taskList.children.length > 0) {
        console.log(`✅ All tasks completed for "${lastUsedMiniCycle}"`);

        // ✅ Auto-reset: Only reset if AutoReset is enabled
        if (cycleData.autoReset) {
            console.log(`🔄 AutoReset is ON. Resetting tasks for "${lastUsedMiniCycle}"...`);
            setTimeout(() => {
                incrementCycleCount(lastUsedMiniCycle, savedMiniCycles); // ✅ Count first
                resetTasks(); // ✅ Then reset tasks
            }, 1000);
        }
    }

    updateStatsPanel();
    autoSave();
}

/**
 * Incrementcyclecount function.
 *
 * @param {any} miniCycleName - Description.
 * @param {any} savedMiniCycles - Description. * @returns {void}
 */

function incrementCycleCount(miniCycleName, savedMiniCycles) {
    let cycleData = savedMiniCycles[miniCycleName];

    // ✅ Ensure valid data
    if (!cycleData) return;

    // ✅ Increment cycle count
    cycleData.cycleCount = (cycleData.cycleCount || 0) + 1;
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    console.log(`✅ Mini Cycle count updated for "${miniCycleName}": ${cycleData.cycleCount}`);

    // ✅ Check for milestone separately
    checkForMilestone(miniCycleName, cycleData.cycleCount);

    // ✅ NEW CODE: Check if this is the first completed cycle to unlock theme
    if (cycleData.cycleCount >= 5) {
        unlockDarkOceanTheme();
    }
    
       // ✅ Show confirmation animation
       showCompletionAnimation();


    updateStatsPanel();
}

function unlockDarkOceanTheme() {
    console.log("unlock Ocean theme Ran");
    // Load current theme data
    let themesUnlocked = JSON.parse(localStorage.getItem('themesUnlocked')) || {};
    
    // Only proceed if theme isn't already unlocked
    if (!themesUnlocked.darkOcean) {
        console.log("🎨 Unlocking Dark Ocean theme for first cycle completion!");
        
        // Mark theme as unlocked
        themesUnlocked.darkOcean = true;
        localStorage.setItem('themesUnlocked', JSON.stringify(themesUnlocked));
        
        // Show the theme option in menu
        const themeContainer = document.querySelector('.theme-container');
        if (themeContainer) {
            themeContainer.classList.remove('hidden');
        }

        // ✅ Show the Themes Button Immediately
        const themeButton = document.getElementById("open-themes-panel");
        if (themeButton) {
            themeButton.style.display = "block";
        }
        
        // Notify user about unlocked theme
        showNotification('🎉 New theme unlocked: Dark Ocean! Check the menu to activate it.', 'success', 5000);
    }
}




function setupThemes() {
    console.log("setup theme Ran");
    
  
    
    // Check if theme section already exists
    if (!document.querySelector('.theme-container')) {
        // Create theme section if it doesn't exist
        const themeContainer = document.createElement('div');
        themeContainer.className = 'theme-container';
        themeContainer.id = 'theme-container';
        
        const themeOptionContainer = document.createElement('div');
        themeOptionContainer.className = 'theme-option-container';
        
        const themeLabel = document.createElement('label');
        themeLabel.className = 'custom-checkbox';
        themeLabel.innerHTML = `
            <input type="checkbox" id="toggleDarkOceanTheme" class="theme-toggle">
            <span class="checkmark"></span>
            Dark Ocean Theme 🌊
        `;
        
        themeOptionContainer.appendChild(themeLabel);
        themeContainer.appendChild(themeOptionContainer);
        
        
    }
    
    // Load theme unlock status
    const themesUnlocked = JSON.parse(localStorage.getItem('themesUnlocked')) || {};
    const themeContainer = document.getElementById('theme-container');
    
    // Hide theme option if not unlocked yet
    if (!themesUnlocked.darkOcean && themeContainer) {
        themeContainer.classList.add('hidden');
    }
    
    // Set up theme toggle functionality
    const themeToggle = document.getElementById('toggleDarkOceanTheme');
    if (themeToggle) {
        // Check if theme is currently active
        const currentTheme = localStorage.getItem('currentTheme');
        themeToggle.checked = currentTheme === 'dark-ocean';
        
        // Apply theme if it's active
        if (currentTheme === 'dark-ocean') {
            document.body.classList.add('theme-dark-ocean');
        }
        
        // Set up toggle event
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('theme-dark-ocean');
                localStorage.setItem('currentTheme', 'dark-ocean');
            } else {
                document.body.classList.remove('theme-dark-ocean');
                localStorage.setItem('currentTheme', 'default');
            }
        });
    }
}

// ✅ Close Themes Modal when clicking outside of the modal content
window.addEventListener("click", (event) => {
    const themesModal = document.getElementById("themes-modal");
    const modalContent = document.querySelector(".themes-modal-content");

    // Only close if you click on the background (not inside modal)
    if (event.target === themesModal) {
        themesModal.style.display = "none";
    }
});

/**
 * Showcompletionanimation function.
 *
 * @returns {void}
 */

function showCompletionAnimation() {
    const animation = document.createElement("div");
    animation.classList.add("mini-cycle-complete-animation");
  //  animation.innerHTML = "✅ Mini Cycle Completed!"; 
  animation.innerHTML = "✔"; 

    document.body.appendChild(animation);

    // ✅ Remove the animation after 1.5 seconds
    setTimeout(() => {
        animation.remove();
    }, 1500);
}

/**
 * Checkformilestone function.
 *
 * @param {any} miniCycleName - Description.
 * @param {any} cycleCount - Description. * @returns {void}
 */

function checkForMilestone(miniCycleName, cycleCount) {
    const milestoneLevels = [10, 25, 50, 100, 200, 500, 1000];

    if (milestoneLevels.includes(cycleCount)) {
        showMilestoneMessage(miniCycleName, cycleCount);
    }
}

/**
 * Displays a milestone achievement message when a user reaches a specific cycle count.
 *
 * @param {string} miniCycleName - The name of the Mini Cycle.
 * @param {number} cycleCount - The number of cycles completed.
 */

function showMilestoneMessage(miniCycleName, cycleCount) {
    const message = `🎉 You've completed ${cycleCount} cycles for "${miniCycleName}"! Keep going! 🚀`;

    // ✅ Create a notification-like popup
    const milestonePopup = document.createElement("div");
    milestonePopup.classList.add("mini-cycle-milestone");
    milestonePopup.textContent = message;

    document.body.appendChild(milestonePopup);

    // ✅ Automatically remove the message after 3 seconds
    setTimeout(() => {
        milestonePopup.remove();
    }, 3000);
}

    /***********************
 * 
 * 
 * Rearrange Management Logic
 * 
 * 
 ************************/


/**
 * Draganddrop function.
 *
 * @param {any} taskElement - Description. * @returns {void}
 */

function DragAndDrop(taskElement) {
 

    // Prevent text selection on mobile
    taskElement.style.userSelect = "none";
    taskElement.style.webkitUserSelect = "none";
    taskElement.style.msUserSelect = "none";

    let touchStartX = 0;
    let touchStartY = 0;
    let holdTimeout = null;
    let isDragging = false;
    let isLongPress = false;
    let isTap = false;
    let preventClick = false;
    const moveThreshold = 15; // 🚀 Movement threshold for long press

    // 📱 **Touch-based Drag for Mobile**
    taskElement.addEventListener("touchstart", (event) => {
        if (event.target.closest(".task-options")) return;
        isLongPress = false;
        isDragging = false;
        isTap = true; 
        readyToDrag = false; 
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        preventClick = false;

        // ✅ NEW FIX: Remove `.long-pressed` from all other tasks before long press starts
        document.querySelectorAll(".task").forEach(task => {
            if (task !== taskElement) {
                task.classList.remove("long-pressed");
                const options = task.querySelector(".task-options");
                if (options) {
                    options.style.visibility = "hidden";
                    options.style.opacity = "0";
                    options.style.pointerEvents = "none";
                }
            }
        });

        holdTimeout = setTimeout(() => {
            isLongPress = true;
            isTap = false;
            draggedTask = taskElement;
            isDragging = true;
            taskElement.classList.add("dragging", "long-pressed");

            event.preventDefault();

            console.log("📱 Long Press Detected - Showing Task Options", taskElement);

            // ✅ Ensure task options remain visible
            const buttonRow = taskElement.querySelector(".task-options");
            if (buttonRow) {
                buttonRow.style.visibility = "visible"; 
                buttonRow.style.opacity = "1"; 
                buttonRow.style.pointerEvents = "auto"; 
            }

        }, 500); // Long-press delay (500ms)
    });

    taskElement.addEventListener("touchmove", (event) => {
        const touchMoveX = event.touches[0].clientX;
        const touchMoveY = event.touches[0].clientY;
        const deltaX = Math.abs(touchMoveX - touchStartX);
        const deltaY = Math.abs(touchMoveY - touchStartY);

        // ✅ Cancel long press if moving too much
        if (deltaX > moveThreshold || deltaY > moveThreshold) {
            clearTimeout(holdTimeout);
            isLongPress = false;
            isTap = false; // ✅ Prevent accidental taps after dragging
            return;
        }

        // ✅ Allow normal scrolling if moving vertically
        if (deltaY > deltaX) {
            clearTimeout(holdTimeout);
            isTap = false;
            return;
        }

        if (isLongPress && readyToDrag && !isDragging) {
            taskElement.setAttribute("draggable", "true");
            isDragging = true;

            if (event.cancelable) {
                event.preventDefault();
            }
        }

        if (isDragging && draggedTask) {
            if (event.cancelable) {
                event.preventDefault();
            }
            const movingTask = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
            handleRearrange(movingTask, event);
        }
    });

    taskElement.addEventListener("touchend", () => {
        clearTimeout(holdTimeout);

        if (isTap) {
            preventClick = true;
            setTimeout(() => { 
                preventClick = false; 
            }, 100);
        }

        if (draggedTask) {
            draggedTask.classList.remove("dragging", "rearranging");
            draggedTask = null;
        }

        isDragging = false;

        // ✅ Ensure task options remain open only when a long press is detected
        if (isLongPress) {
            console.log("✅ Long Press Completed - Keeping Task Options Open", taskElement);
            return;
        }
    
        taskElement.classList.remove("long-pressed");
    });

    // 🖱️ **Mouse-based Drag for Desktop**
    taskElement.addEventListener("dragstart", (event) => {
        if (event.target.closest(".task-options")) return;
        draggedTask = taskElement;
        event.dataTransfer.setData("text/plain", "");

        // ✅ NEW: Add dragging class for desktop as well
        taskElement.classList.add("dragging");

        // ✅ Hide ghost image on desktop
        if (!isTouchDevice()) {
            const transparentPixel = new Image();
            transparentPixel.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
            event.dataTransfer.setDragImage(transparentPixel, 0, 0);
        }
    });

}


let rearrangeTimeout; // Prevents excessive reordering calls

/**
 * Handles the rearrangement of tasks when dragged.
 *
 * @param {HTMLElement} target - The task element being moved.
 * @param {DragEvent | TouchEvent} event - The event triggering the rearrangement.
 */

function handleRearrange(target, event) {
    if (!target || !draggedTask || target === draggedTask) return;

    clearTimeout(rearrangeTimeout); // Avoid unnecessary rapid reordering
    rearrangeTimeout = setTimeout(() => {
        
    
        if (!draggedTask || !draggedTask.parentNode || !target || !target.parentNode) {
            console.warn("❌ Rearrange skipped: missing elements");
            return;
        }

        const parent = draggedTask.parentNode;

        const bounding = target.getBoundingClientRect();
        const offset = event.clientY - bounding.top;

        // ✅ Remove previous drop indicators to ensure only ONE target at a time
        document.querySelectorAll(".drop-target").forEach(el => el.classList.remove("drop-target"));

        // 🔍 Check if the task is being moved to the FIRST or LAST position
     

        // ✅ Prevent redundant reordering
        if (offset > bounding.height / 3) {
            if (target.nextSibling !== draggedTask) {
                
                parent.insertBefore(draggedTask, target.nextSibling);
            }
        } else {
            if (target.previousSibling !== draggedTask) {
                
                parent.insertBefore(draggedTask, target);
            }
        }

        // ✅ Special case: If dragging to the LAST position
        if (isLastTask && target.nextSibling !== draggedTask) {
            console.log("📌 Moving to last position.");
            parent.appendChild(draggedTask);
        }

        // ✅ Special case: If dragging to the FIRST position
        if (isFirstTask && target.previousSibling !== draggedTask) {
            console.log("📌 Moving to first position.");
            parent.insertBefore(draggedTask, parent.firstChild);
        }

        // ✅ Highlight the drop position
        draggedTask.classList.add("drop-target");

    }, 50); // Small delay to smooth out the reordering process
}



/**
 * Setuprearrange function.
 *
 * @returns {void}
 */

function setupRearrange() {
    if (window.rearrangeInitialized) return;
    window.rearrangeInitialized = true;

    document.addEventListener("dragover", (event) => {
        event.preventDefault();
        requestAnimationFrame(() => {
            handleRearrange(event.target, event);
            autoSave(); // ✅ Auto-save after reordering
        });
    });

    document.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!draggedTask) return;

        const movingTask = document.elementFromPoint(event.clientX, event.clientY)?.closest(".task");
        if (movingTask && movingTask !== draggedTask) {
            handleRearrange(movingTask, event);
            autoSave(); // ✅ Auto-save after dropping a task
        }

        cleanupDragState();
    });
}



/**
 * Cleanupdragstate function.
 *
 * @returns {void}
 */

function cleanupDragState() {
    if (draggedTask) {
        draggedTask.classList.remove("dragging", "rearranging");
        draggedTask = null;
    }

    lastRearrangeTarget = null;
    document.querySelectorAll(".drop-target").forEach(el => el.classList.remove("drop-target"));
}



/**
 * Dragendcleanup function.
 *
 * @returns {void}
 */

function dragEndCleanup () {
    document.addEventListener("drop", cleanupDragState);
    document.addEventListener("dragover", () => {
        document.querySelectorAll(".rearranging").forEach(task => task.classList.remove("rearranging"));
    });
    
    
    }

    /**
 * Updatemovearrowsvisibility function.
 *
 * @returns {void}
 */

function updateMoveArrowsVisibility() {
        const showArrows = localStorage.getItem("miniCycleMoveArrows") === "true";
    
        document.querySelectorAll(".move-btn").forEach(button => {
            button.style.visibility = showArrows ? "visible" : "hidden";
            button.style.opacity = showArrows ? "1" : "0";
        });
    
        // ✅ Ensure `.task-options` remains interactive
        document.querySelectorAll(".task-options").forEach(options => {
            options.style.pointerEvents = "auto"; // 🔥 Fixes buttons becoming unclickable
        });
    
        console.log("✅ Move Arrows Toggled");
        
        toggleArrowVisibility();
        dragEndCleanup ();
    }
    

    
    /**
 * Togglearrowvisibility function.
 *
 * @returns {void}
 */

function toggleArrowVisibility() { 
        const showArrows = localStorage.getItem("miniCycleMoveArrows") === "true"; 
        const allTasks = document.querySelectorAll(".task");
    
        allTasks.forEach((task, index) => {
            const upButton = task.querySelector('.move-up');
            const downButton = task.querySelector('.move-down');
            const taskOptions = task.querySelector('.task-options'); // ✅ Select task options
            const taskButtons = task.querySelectorAll('.task-btn'); // ✅ Select all task buttons
    
            if (upButton) {
                upButton.style.visibility = (showArrows && index !== 0) ? "visible" : "hidden";
                upButton.style.opacity = (showArrows && index !== 0) ? "1" : "0";
                upButton.style.pointerEvents = showArrows ? "auto" : "none"; 
            }
            if (downButton) {
                downButton.style.visibility = (showArrows && index !== allTasks.length - 1) ? "visible" : "hidden";
                downButton.style.opacity = (showArrows && index !== allTasks.length - 1) ? "1" : "0";
                downButton.style.pointerEvents = showArrows ? "auto" : "none"; 
            }
    
            // ✅ Ensure task options remain interactive
        if (taskOptions) {
            taskOptions.style.pointerEvents = "auto";  
        }
    
            // ✅ Ensure individual buttons remain interactive
            taskButtons.forEach(button => {
                button.style.pointerEvents = "auto";
            });
        });
    
        console.log(`✅ Move arrows and buttons are now ${showArrows ? "enabled" : "disabled"}`);
    }
    
    /***********************
 * 
 * 
 * Task Management
 * 
 * 
 ************************/
    /**
     * Adds a new task to the list.
     * @param {string} taskText - The task description.
     * @param {boolean} [completed=false] - Whether the task starts as completed.
     * @param {boolean} [shouldSave=true] - If true, the task is saved.
     * @param {string|null} [dueDate=null] - Optional due date.
     * @param {boolean} [highPriority=false] - If true, the task is marked as high priority.
     * @param {boolean} [isLoading=false] - If true, task is loaded from storage.
     * @param {boolean} [remindersEnabled=false] - If true, reminders are turned on.
     */


    function addTask(taskText, completed = false, shouldSave = true, dueDate = null, highPriority = null, isLoading = false, remindersEnabled = false) {
       
       
        if (typeof taskText !== "string") {
            console.error("❌ Error: taskText is not a string", taskText);
            return;
        }
    
        let taskTextTrimmed = taskText.trim();
        if (!taskTextTrimmed) {
            console.warn("⚠ Skipping empty task.");
            return;
        }
    
        if (taskTextTrimmed.length > TASK_LIMIT) {
            showNotification(`Task must be ${TASK_LIMIT} characters or less.`);
            return;
        }
        // ✅ Get settings before creating task
        const autoResetEnabled = toggleAutoReset.checked;
        const remindersEnabledGlobal = enableReminders.checked; 
        
        // ✅ Create Task Element
        const taskItem = document.createElement("li");
        taskItem.classList.add("task");
        taskItem.setAttribute("draggable", "true");
        if (highPriority) {
            taskItem.classList.add("high-priority");
        }
    
        // ✅ Three Dots Menu (If Enabled)
        const showThreeDots = localStorage.getItem("miniCycleThreeDots") === "true";
        if (showThreeDots) {
            const threeDotsButton = document.createElement("button");
            threeDotsButton.classList.add("three-dots-btn");
            threeDotsButton.innerHTML = "⋮";
            threeDotsButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent click from completing the task
                const taskOptions = taskItem.querySelector(".task-options");
                if (taskOptions) {
                    taskOptions.style.visibility = "visible";
                    taskOptions.style.opacity = "1";
                    taskOptions.style.pointerEvents = "auto";
                }
            });
            taskItem.appendChild(threeDotsButton);
        }
    
        // ✅ Create Button Container
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("task-options");
    
        // ✅ Task Buttons (Including Reminder Button)
        const buttons = [
            { class: "move-up", icon: "▲" },
            { class: "move-down", icon: "▼" },
            ...(autoResetEnabled ? [] : [{ class: "set-due-date", icon: "<i class='fas fa-calendar-alt'></i>" }]), 
            ...(remindersEnabledGlobal || remindersEnabled ? [{ class: "enable-task-reminders", icon: "<i class='fas fa-bell'></i>", toggle: true }] : []), // ✅ Now considers individual task state
            { class: "priority-btn", icon: "<i class='fas fa-exclamation-triangle'></i>" },
            { class: "edit-btn", icon: "<i class='fas fa-edit'></i>" }, 
            { class: "delete-btn", icon: "<i class='fas fa-trash'></i>" } 
        ];
        
        
        

        buttons.forEach(({ class: btnClass, icon, toggle = false }) => {
            const button = document.createElement("button");
            button.classList.add("task-btn", btnClass);
            button.innerHTML = icon;
            if (toggle && remindersEnabledGlobal && remindersEnabled) button.classList.add("reminder-active");
            button.addEventListener("click", (event) => handleTaskButtonClick(event, taskItem));
            buttonContainer.appendChild(button);
        });
    
        const reminderButton = buttonContainer.querySelector(".enable-task-reminders");

        if (reminderButton) {  
            // ✅ Apply saved reminder state
            if (remindersEnabled) {
                reminderButton.classList.add("reminder-active");
            }
        
            reminderButton.addEventListener("click", () => {
                reminderButton.classList.toggle("reminder-active");
                saveTaskReminderState(taskTextTrimmed, reminderButton.classList.contains("reminder-active"));
                autoSaveReminders();
                startReminders();
            });
        }
        
        console.log(`📌 Loading Task: ${taskTextTrimmed}, Reminder Enabled: ${remindersEnabled}`);
      
        
        
        
    
        taskItem.appendChild(buttonContainer);
    
        // ✅ Checkbox for Completion
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = completed;
        safeAddEventListener(checkbox, "change", () => {
            handleTaskCompletionChange(checkbox);
            checkMiniCycle();
            autoSave();
            triggerLogoBackground(checkbox.checked ? 'green' : 'default', 300);
        });
    
        // ✅ Ensure `.task-text` Exists
        const taskLabel = document.createElement("span");
        taskLabel.classList.add("task-text");
        taskLabel.textContent = taskTextTrimmed;
    
        // ✅ Due Date Input (Hidden by Default)
        const dueDateInput = document.createElement("input");
        dueDateInput.type = "date";
        dueDateInput.classList.add("due-date");
    
        if (dueDate) {
            dueDateInput.value = dueDate;
            if (!toggleAutoReset.checked) {
                dueDateInput.classList.remove("hidden"); // Show if Auto Reset is OFF
            } else {
                dueDateInput.classList.add("hidden"); // Hide if Auto Reset is ON
            }
        } else {
            dueDateInput.classList.add("hidden"); // No date set? Keep it hidden
        }
    
        dueDateInput.addEventListener("change", () => {
            saveTaskDueDate(taskTextTrimmed, dueDateInput.value);
        });
    
        const dueDateButton = buttonContainer.querySelector(".set-due-date");
        if (dueDateButton) {
            dueDateButton.addEventListener("click", () => {
                dueDateInput.classList.toggle("hidden");
            });
        }
        
    
        // ✅ Toggle Completion on Click (excluding buttons)
        taskItem.addEventListener("click", (event) => {
            if (event.target === checkbox || buttonContainer.contains(event.target) || event.target === dueDateInput) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event("change")); // Manually trigger change event
            checkMiniCycle();
            autoSave();
            triggerLogoBackground(checkbox.checked ? 'green' : 'default', 300);
        });
    
        const taskContent = document.createElement("div");
        taskContent.classList.add("task-content");
        taskContent.appendChild(checkbox);
        taskContent.appendChild(taskLabel);
    
        taskItem.appendChild(buttonContainer);
    
        // ✅ Ensure Priority Button Reflects Saved State
        const priorityButton = buttonContainer.querySelector(".priority-btn");
        if (highPriority) {
            priorityButton.classList.add("priority-active");
        }
    
        taskItem.appendChild(taskContent);
        taskItem.appendChild(dueDateInput);
        document.getElementById("taskList").appendChild(taskItem);
        taskInput.value = ""; // ✅ FIX: Clear input field after adding task
    
        document.querySelector(".task-list-container").scrollTo({
            top: taskList.scrollHeight,
            behavior: "smooth"
        });
    
        setTimeout(() => { 
            if (completed) {
                taskItem.classList.remove("overdue-task");
            }
        }, 300);
    
        checkCompleteAllButton();
        updateProgressBar();
        updateStatsPanel();
        if (shouldSave) autoSave();
    
        // ✅ Check for overdue tasks after adding a task
        if (!isLoading) setTimeout(() => { remindOverdueTasks(); }, 1000);
    
        // ✅ Enable Drag and Drop
        DragAndDrop(taskItem);
    
        // ✅ Hide Move Arrows if disabled in settings
        updateMoveArrowsVisibility();
    
        // ✅ Show task options on hover
        taskItem.addEventListener("mouseenter", showTaskOptions);
        taskItem.addEventListener("mouseleave", hideTaskOptions);
      

    }
    
    
    /**
 * Updatereminderbuttons function.
 *
 * @returns {void}
 */

    function updateReminderButtons() {
        console.log("🔍 Running updateReminderButtons()...");
    
        const reminderSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
        const notificationsEnabled = reminderSettings.enabled === true;
    
        document.querySelectorAll(".task").forEach(taskItem => {
            const buttonContainer = taskItem.querySelector(".task-options");
            let reminderButton = buttonContainer.querySelector(".enable-task-reminders");
    
            const taskText = taskItem.querySelector(".task-text")?.textContent || "";
            const savedTasks = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
            const lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");
    
            const taskData = savedTasks[lastUsedMiniCycle]?.tasks?.find(t => t.text.trim() === taskText.trim());
    
            console.log(`🔄 Task: ${taskText}`);
            console.log(`   📌 Before Update - Reminder Button Exists: ${!!reminderButton}`);
            console.log(`   📌 Saved Reminder State: ${taskData?.remindersEnabled}`);
    
            if (notificationsEnabled) {
                if (!reminderButton) {
                    // ✅ CREATE REMINDER BUTTON IF IT DOESN'T EXIST
                    reminderButton = document.createElement("button");
                    reminderButton.classList.add("task-btn", "enable-task-reminders");
                    reminderButton.innerHTML = "<i class='fas fa-bell'></i>";
    
                    // ✅ Preserve saved reminder state
                    if (taskData?.remindersEnabled) {
                        reminderButton.classList.add("reminder-active");
                    }
    
                    reminderButton.addEventListener("click", () => {
                        reminderButton.classList.toggle("reminder-active");
                        saveTaskReminderState(taskText, reminderButton.classList.contains("reminder-active"));
                        autoSaveReminders();
                    });
    
                    buttonContainer.insertBefore(reminderButton, buttonContainer.children[2]); // Insert at correct index
                    console.log(`   ✅ Reminder Button Created & Inserted`);
                } else {
                    // ✅ ONLY UPDATE STATE IF IT WASN'T ALREADY SET
                    if (taskData?.remindersEnabled) {
                        reminderButton.classList.add("reminder-active");
                    }
                    console.log(`   🔄 Reminder Button Already Exists - Updated State: ${reminderButton.classList.contains("reminder-active")}`);
                }
            } else {
                if (reminderButton) {
                    // ✅ REMOVE REMINDER BUTTON IF NOTIFICATIONS ARE DISABLED
                    reminderButton.remove();
                    console.log(`   ❌ Reminder Button Removed (Notifications Disabled)`);
                }
            }
    
            console.log(`   📌 After Update - Reminder Button Exists: ${!!buttonContainer.querySelector(".enable-task-reminders")}`);
            console.log(`   📌 Final Reminder Active State: ${buttonContainer.querySelector(".enable-task-reminders")?.classList.contains("reminder-active")}`);
        });
    
        console.log("✅ Finished updateReminderButtons().");
    }
    
    
    
    
    
    

    /**
 * Showtaskoptions function.
 *
 * @param {any} event - Description. * @returns {void}
 */

function showTaskOptions(event) {
        const taskElement = event.currentTarget;
        const taskOptions = taskElement.querySelector(".task-options");
        const taskButtons = taskElement.querySelectorAll(".task-btn");
    
        // ✅ Detect if it's a touch-first device
        const isMobile = isTouchDevice();
    
        if (taskOptions) {
            if (!isMobile || taskElement.classList.contains("long-pressed")) {
                taskOptions.style.visibility = "visible";
                taskOptions.style.opacity = "1";
                taskOptions.style.pointerEvents = "auto";
            }
        }
    
        taskButtons.forEach(button => {
            button.style.visibility = "visible";
            button.style.opacity = "1";
            button.style.pointerEvents = "auto";
        });
    
        updateMoveArrowsVisibility();
        toggleArrowVisibility();
    }
    

function hideTaskOptions(event) {
        const taskElement = event.currentTarget;
        const taskOptions = taskElement.querySelector(".task-options");
        const taskButtons = taskElement.querySelectorAll(".task-btn");
    
        // ✅ Detect if it's a touch-first device
        const isMobile = isTouchDevice();
    
        if (taskOptions) {
            if (!isMobile || !taskElement.classList.contains("long-pressed")) {
                taskOptions.style.visibility = "hidden";
                taskOptions.style.opacity = "0";
                taskOptions.style.pointerEvents = "none";
            }
        }
    
        taskButtons.forEach(button => {
            button.style.visibility = "hidden";
            button.style.opacity = "0";
            button.style.pointerEvents = "none";
        });
    
        updateMoveArrowsVisibility();
        toggleArrowVisibility();
    }
    
    
/**
 * Handles the change event when a task's completion status is toggled.
 *
 * @param {HTMLInputElement} checkbox - The checkbox element of the task.
 */

function handleTaskCompletionChange(checkbox) {
        const taskItem = checkbox.closest(".task");
    
         if (checkbox.checked) {
            taskItem.classList.remove("overdue-task");
        } else {
            checkOverdueTasks(taskItem); // ✅ Only check this specific task
        }
    }
    


    /**
 * Istouchdevice function.
 *
 * @returns {void}
 */

function isTouchDevice() {
        let hasTouchEvents = "ontouchstart" in window;
        let touchPoints = navigator.maxTouchPoints || navigator.msMaxTouchPoints;
        let isFinePointer = window.matchMedia("(pointer: fine)").matches;

        console.log(`touch detected: hasTouchEvents=${hasTouchEvents}, maxTouchPoints=${touchPoints}, isFinePointer=${isFinePointer}`);

        if (isFinePointer) return false;

       
        return hasTouchEvents || touchPoints > 0;
    }
    
 
    

/**
 * Handles button clicks for task-related actions, such as moving, editing, deleting, or changing priority.
 *
 * @param {Event} event - The event triggered by clicking a task button.
 */

function handleTaskButtonClick(event) {
    event.stopPropagation(); // ✅ Prevents click from affecting the whole task

    const button = event.currentTarget;
    const taskItem = button.closest(".task");

    if (!taskItem) return;

    // ✅ Ensure `.task-options` stays interactive
    const taskOptions = taskItem.querySelector(".task-options");
    if (taskOptions) {
        taskOptions.style.pointerEvents = "auto"; // 🔥 FIXES MOBILE CLICK ISSUE
    }

    let shouldSave = false;
    if (button.classList.contains("move-up")) {
        const prevTask = taskItem.previousElementSibling;
        if (prevTask) taskItem.parentNode.insertBefore(taskItem, prevTask);

        toggleArrowVisibility(); // ✅ Update move arrows after movement
        shouldSave = true;
    } 
    else if (button.classList.contains("move-down")) {
        const nextTask = taskItem.nextElementSibling;
        if (nextTask) taskItem.parentNode.insertBefore(taskItem, nextTask.nextSibling);

        toggleArrowVisibility(); // ✅ Update move arrows after movement
        shouldSave = true;
    }
    else if (button.classList.contains("edit-btn")) {
        const taskLabel = taskItem.querySelector("span");
        const newText = prompt("Edit task name:", taskLabel.textContent.trim());
        if (newText) {
            taskLabel.textContent = newText.trim();
            shouldSave = true;
        }
    } 
    else if (button.classList.contains("delete-btn")) {
        const taskName = taskItem.querySelector(".task-text")?.textContent || "Task";
        let confirmDelete = confirm(`Are you sure you want to delete "${taskName}"?`);
    
        if (!confirmDelete) {
            showNotification(`"${taskName}" has not been deleted.`);
            console.log("❌ Task not deleted.");
            return; // ✅ Exits early if the user cancels
        }
    
        // ✅ Remove task from the DOM
        taskItem.remove();
        updateProgressBar();
        updateStatsPanel();
        checkCompleteAllButton();
        toggleArrowVisibility(); // ✅ Update arrows after deletion
    
        showNotification(`"${taskName}" has been deleted.`);
        console.log(`✅ Task deleted: "${taskName}"`);
    
        shouldSave = true; // ✅ Ensures deletion is saved
    }
    
    else if (button.classList.contains("priority-btn")) {
        taskItem.classList.toggle("high-priority");
    
        // ✅ Ensure button reflects task's priority state
        if (taskItem.classList.contains("high-priority")) {
            button.classList.add("priority-active");
        } else {
            button.classList.remove("priority-active");
        }
    
        shouldSave = true;
    }
    
    
    if (shouldSave) autoSave();
    console.log("✅ Task button clicked:", button.className);
}


/**
 * Resettasks function.
 *
 * @returns {void}
 */

function resetTasks() {

    taskList.querySelectorAll(".task").forEach(task => {
        const checkbox = task.querySelector("input[type='checkbox']");
        const dueDateInput = task.querySelector(".due-date");

        if (checkbox) checkbox.checked = false;

        // ✅ Remove overdue styling
        task.classList.remove("overdue-task");

        // ✅ Clear any set due dates
        if (dueDateInput) {
            dueDateInput.value = ""; // Clear the actual date
            dueDateInput.classList.add("hidden"); // Hide the input again if needed
        }
    });

    // ✅ Show cycle complete message
    cycleMessage.style.visibility = "visible";
    cycleMessage.style.opacity = "1";

    progressBar.style.width = "0%";

    setTimeout(() => {
        cycleMessage.style.opacity = "0";
        cycleMessage.style.visibility = "hidden";
    }, 2000);

    updateStatsPanel();

    setTimeout(() => {
        autoSave(); // ✅ Save the fully reset state
    }, 50);
}





/**
 * Checkcompleteallbutton function.
 *
 * @returns {void}
 */

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
    
    
/**
 * Temporarily changes the logo background color to indicate an action, then resets it.
 *
 * @param {string} [color='green'] - The temporary background color for the logo.
 * @param {number} [duration=300] - The duration (in milliseconds) before resetting the background.
 */

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

/**
 * Savetoggleautoreset function.
 *
 * @returns {void}
 */

function saveToggleAutoReset() {
    const toggleAutoReset = document.getElementById("toggleAutoReset");
    const deleteCheckedTasksContainer = document.getElementById("deleteCheckedTasksContainer");
    const deleteCheckedTasks = document.getElementById("deleteCheckedTasks");
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();

    // ✅ Ensure AutoReset reflects the correct state
    if (lastUsedMiniCycle && savedMiniCycles[lastUsedMiniCycle]) {
        toggleAutoReset.checked = savedMiniCycles[lastUsedMiniCycle].autoReset || false;
        deleteCheckedTasks.checked = savedMiniCycles[lastUsedMiniCycle].deleteCheckedTasks || false;
    } else {
        toggleAutoReset.checked = false;
        deleteCheckedTasks.checked = false;
    }

    // ✅ Show "Delete Checked Tasks" only when Auto Reset is OFF
    deleteCheckedTasksContainer.style.display = toggleAutoReset.checked ? "none" : "block";

     // ✅ Remove previous event listeners before adding new ones to prevent stacking
     toggleAutoReset.removeEventListener("change", handleAutoResetChange);
     deleteCheckedTasks.removeEventListener("change", handleDeleteCheckedTasksChange);


// ✅ Define event listener functions
/**
 * Handles changes to the Auto Reset toggle.
 * Updates localStorage with the new Auto Reset state and adjusts the UI accordingly.
 *
 * @param {Event} event - The change event triggered by toggling Auto Reset.
 */

function handleAutoResetChange(event) {
        if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) return;

        savedMiniCycles[lastUsedMiniCycle].autoReset = event.target.checked;
           // ✅ If Auto Reset is turned ON, automatically uncheck "Delete Checked Tasks"
           if (event.target.checked) {
            savedMiniCycles[lastUsedMiniCycle].deleteCheckedTasks = false;
            deleteCheckedTasks.checked = false; // ✅ Update UI
        }
        localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

        // ✅ Show/Hide "Delete Checked Tasks" toggle dynamically
        deleteCheckedTasksContainer.style.display = event.target.checked ? "none" : "block";

              // ✅ Only trigger Mini Cycle reset if AutoReset is enabled
        if (event.target.checked) checkMiniCycle();
    }

    /**
     * Handles changes to the "Delete Checked Tasks" toggle.
     * Updates localStorage with the new state and adjusts the Mini Cycle settings accordingly.
     *
     * @param {Event} event - The change event triggered by toggling "Delete Checked Tasks".
     */

function handleDeleteCheckedTasksChange(event) {
        if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) return;

        savedMiniCycles[lastUsedMiniCycle].deleteCheckedTasks = event.target.checked;
        localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
    }
           

         // ✅ Add new event listeners
    toggleAutoReset.addEventListener("change", handleAutoResetChange);
    deleteCheckedTasks.addEventListener("change", handleDeleteCheckedTasksChange);
    

    }




    /**
 * Checkduedates function.
 *
 * @returns {void}
 */

    function checkDueDates() {
        // Make sure we only attach the listener once
        if (!toggleAutoReset.dataset.listenerAdded) {
            toggleAutoReset.dataset.listenerAdded = true;
    
            toggleAutoReset.addEventListener("change", function () {
                let autoReset = this.checked;
                updateDueDateVisibility(autoReset);
    
                let miniCycleName = localStorage.getItem("lastUsedMiniCycle");
                let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    
                if (savedMiniCycles[miniCycleName]) {
                    savedMiniCycles[miniCycleName].autoReset = autoReset;
                    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
                }
            });
        }
    
        // ✅ Prevent duplicate event listeners before adding a new one
        document.removeEventListener("change", handleDueDateChange);
        document.addEventListener("change", handleDueDateChange);
    }
    
    // ✅ Function to handle due date changes (placed outside to avoid re-declaration)
    function handleDueDateChange(event) {
        if (!event.target.classList.contains("due-date")) return;
    
        let taskItem = event.target.closest(".task");
        let taskText = taskItem.querySelector(".task-text").textContent;
        let dueDateValue = event.target.value;
    
        let miniCycleName = localStorage.getItem("lastUsedMiniCycle");
        let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    
        if (savedMiniCycles[miniCycleName]) {
            let taskData = savedMiniCycles[miniCycleName].tasks.find(task => task.text === taskText);
            if (taskData) {
                taskData.dueDate = dueDateValue;
                localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
                console.log(`📅 Due date updated: "${taskText}" → ${dueDateValue}`);
            }
        }
    
        checkOverdueTasks(taskItem);
    
        // ✅ Load Due Date Notification Setting
        const remindersSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
        const dueDatesRemindersEnabled = remindersSettings.dueDatesReminders;
    
        if (!dueDatesRemindersEnabled) return; // ✅ Skip notifications if toggle is OFF
    
        if (dueDateValue) {
            const today = new Date().setHours(0, 0, 0, 0);
            const selectedDate = new Date(dueDateValue).setHours(0, 0, 0, 0);
    
            if (selectedDate > today) {
                showNotification(`📅 Task "${taskText}" is due soon!`, "default");
            }
        }
    }
    
    
    // ✅ Apply initial visibility state on load
    let autoReset = toggleAutoReset.checked;
    updateDueDateVisibility(autoReset);
    
    

/**
 * Updates the visibility of due date fields and related UI elements based on Auto Reset settings.
 *
 * @param {boolean} autoReset - Whether Auto Reset is enabled.
 */
    function updateDueDateVisibility(autoReset) {
        const dueDatesRemindersOption = document.getElementById("dueDatesReminders").parentNode; // Get the label container
        if (dueDatesRemindersOption) {
            dueDatesRemindersOption.style.display = autoReset ? "none" : "block";
            }
        

        // Toggle visibility of "Set Due Date" buttons
        document.querySelectorAll(".set-due-date").forEach(button => {
            button.classList.toggle("hidden", autoReset);
        });
    
        if (autoReset) {
            
            // Auto Reset ON = hide all due dates
            document.querySelectorAll(".due-date").forEach(input => {
                input.classList.add("hidden");
            });
    
            // Remove overdue visual styling
            document.querySelectorAll(".overdue-task").forEach(task => {
                task.classList.remove("overdue-task");
            });
    
        } else {
            // Auto Reset OFF = show due dates ONLY if they have a value
            document.querySelectorAll(".due-date").forEach(input => {
                if (input.value) {
                    input.classList.remove("hidden");
                } else {
                    input.classList.add("hidden");
                }
            });
    
            // ✅ Dynamically add the "Set Due Date" button to tasks that don’t have it
            document.querySelectorAll(".task").forEach(taskItem => {
                let buttonContainer = taskItem.querySelector(".task-options");
                let existingDueDateButton = buttonContainer.querySelector(".set-due-date");
    
                if (!existingDueDateButton) {
                    const dueDateButton = document.createElement("button");
                    dueDateButton.classList.add("task-btn", "set-due-date");
                    dueDateButton.innerHTML = "<i class='fas fa-calendar-alt'></i>";
                    dueDateButton.addEventListener("click", () => {
                        const dueDateInput = taskItem.querySelector(".due-date");
                        dueDateInput.classList.toggle("hidden");
                    });
    
                    buttonContainer.insertBefore(dueDateButton, buttonContainer.children[2]); // Insert in correct position
                }
            });
    
            // Recheck and reapply overdue classes as needed
            checkOverdueTasks();
        }
    }
    
    
    
    



    


    
    if (!deleteCheckedTasks.dataset.listenerAdded) {
        deleteCheckedTasks.addEventListener("change", (event) => {
            if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) return;

            savedMiniCycles[lastUsedMiniCycle].deleteCheckedTasks = event.target.checked;
            localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
        });

        deleteCheckedTasks.dataset.listenerAdded = true; 

    }



/**
 * Closes the menu when clicking outside of it.
 * Ensures the menu only closes when clicking outside both the menu and menu button.
 *
 * @param {MouseEvent} event - The click event that triggers the check.
 */

function closeMenuOnClickOutside(event) {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
        menu.classList.remove("visible"); // Hide the menu
        document.removeEventListener("click", closeMenuOnClickOutside); // ✅ Remove listener after closing
    }
}



/**
 * Hidemainmenu function.
 *
 * @returns {void}
 */

function hideMainMenu() {
    const menu = document.querySelector(".menu-container");
    menu.classList.remove("visible");
}

/***********************
 * 
 * 
 * Add Event Listeners
 * 
 * 
 ************************/

document.getElementById("open-reminders-modal").addEventListener("click", () => {
    document.getElementById("reminders-modal").style.display = "flex";
  });
  


document.addEventListener("touchstart", () => {
    hasInteracted = true;
}, { once: true });


menuButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevents the event from closing the menu immediately
    saveToggleAutoReset();
    menu.classList.toggle("visible");

    // ✅ If the menu is now visible, add an event listener to close it when clicking outside
    if (menu.classList.contains("visible")) {
        document.addEventListener("click", closeMenuOnClickOutside);
    }
});

addTaskButton.addEventListener("click", () => {
    const taskText = taskInput.value ? taskInput.value.trim() : ""; // ✅ Ensure it's a valid string

    if (!taskText) {
        console.warn("⚠ Cannot add an empty task.");
        return; // ✅ Prevents calling `addTask()` with an invalid value
    }

    addTask(taskText); // ✅ Now `taskText` is always valid
    taskInput.value = ""; // ✅ Clear input after adding the task
});





taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
           const taskText = taskInput.value ? taskInput.value.trim() : ""; // ✅ Ensure it's a valid string

    if (!taskText) {
        console.warn("⚠ Cannot add an empty task.");
        return; // ✅ Prevents calling `addTask()` with an invalid value
    }

    addTask(taskText); // ✅ Now `taskText` is always valid
    taskInput.value = ""; // ✅ Clear input after adding the task
    }
});


completeAllButton.addEventListener("click", () => {
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
    const cycleData = savedMiniCycles[lastUsedMiniCycle];

    // ✅ Ensure there's an active Mini Cycle
    if (!lastUsedMiniCycle || !cycleData) return;

     // ✅ Check if any task has a due date set
     const hasDueDates = [...taskList.querySelectorAll(".due-date")].some(
        dueDateInput => dueDateInput.value
    );

    if (hasDueDates) {
        const confirmReset = confirm(
            "⚠️ This will complete all tasks and reset them to an uncompleted state.\n\nAny assigned Due Dates will be cleared.\n\nProceed?"
        );
        if (!confirmReset) return; // ❌ Stop if user cancels
    }

    if (cycleData.deleteCheckedTasks) {
        // ✅ Delete all checked tasks if the option is enabled
        document.querySelectorAll(".task input:checked").forEach(checkbox => {
            checkbox.closest(".task").remove();
        });

        autoSave(); // ✅ Save changes after deletion
    } else {
        // ✅ If "Delete Checked Tasks" is OFF, just mark all as complete
        taskList.querySelectorAll(".task input").forEach(task => task.checked = true);
        checkMiniCycle();
        
    // ✅ Always reset tasks, even if Auto Reset is off
    setTimeout(resetTasks, 1000);
    }

    
    updateProgressBar();
});






document.addEventListener("click", (event) => {
    let isTaskOrOptionsClick = event.target.closest(".task, .task-options");

    if (!isTaskOrOptionsClick) {
        console.log("✅ Clicking outside - closing task buttons");

        document.querySelectorAll(".task-options").forEach(action => {
            action.style.opacity = "0";
            action.style.visibility = "hidden";
            action.style.pointerEvents = "none";
        });

        document.querySelectorAll(".task").forEach(task => {
            task.classList.remove("long-pressed");
            task.classList.remove("draggable"); // ✅ Remove draggable class
            task.classList.remove("dragging"); // ✅ Remove active dragging state
        });
    }
});


document.addEventListener("click", function(event) {
    const switchModalContent = document.querySelector(".mini-cycle-switch-modal-content");
    const selectedCycle = document.querySelector(".mini-cycle-switch-item.selected");
    const switchItemsRow = document.getElementById("switch-items-row");
    const previewWindow = document.querySelector(".switch-preview-window");

    // ✅ If user clicks inside the modal but outside a selected Mini Cycle AND NOT on the preview
    if (
        switchModalContent.contains(event.target) && 
        selectedCycle && 
        !event.target.classList.contains("mini-cycle-switch-item") &&
        !previewWindow.contains(event.target) // ✅ Prevents unselecting when clicking preview
    ) {
        selectedCycle.classList.remove("selected"); // ✅ Remove selection
        switchItemsRow.style.display = "none"; // ✅ Hide edit/delete buttons
    }
});

document.addEventListener("dragover", (event) => {
    event.preventDefault();
    requestAnimationFrame(() => {
        handleRearrange(event.target, event);
    });
    autoSave();
}); 

document.addEventListener("touchstart", () => {}, { passive: true });



/***********************
 * 
 * 
 * STATS PANEL
 * 
 * 
 ************************/



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



/**
 * Updatestatspanel function.
 *
 * @returns {void}
 */

function updateStatsPanel() {
    let totalTasks = document.querySelectorAll(".task").length;
    let completedTasks = document.querySelectorAll(".task input:checked").length;
    let completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) + "%" : "0%";

    // ✅ Get the active Mini Cycle
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();

    let cycleCount = 0;
    if (lastUsedMiniCycle && savedMiniCycles[lastUsedMiniCycle]) {
        cycleCount = savedMiniCycles[lastUsedMiniCycle].cycleCount || 0; // ✅ Load count from Mini Cycle storage
    }

    // ✅ Update Stats Display
    document.getElementById("total-tasks").textContent = totalTasks;
    document.getElementById("completed-tasks").textContent = completedTasks;
    document.getElementById("completion-rate").textContent = completionRate;
    document.getElementById("mini-cycle-count").textContent = cycleCount; // ✅ Now updates per Mini Cycle
    document.getElementById("stats-progress-bar").style.width = completionRate;

    // ✅ Unlock badges
    document.querySelectorAll(".badge").forEach(badge => {
        const milestone = parseInt(badge.dataset.milestone);
        if (cycleCount >= milestone) {
            badge.classList.add("unlocked");
        } else {
            badge.classList.remove("unlocked");
        }
    });

    updateThemeUnlockStatus(cycleCount);
    
}

function updateThemeUnlockStatus(cycleCount) {
    const themeMessage = document.getElementById("theme-unlock-message");
    const themesUnlocked = JSON.parse(localStorage.getItem("themesUnlocked")) || {};
  
    if (themesUnlocked.darkOcean) {
      themeMessage.textContent = "🌊 Dark Ocean Theme unlocked!🔓";
      themeMessage.classList.add("unlocked-message");
    } else {
      const needed = Math.max(0, 5 - cycleCount);
      themeMessage.textContent = `🔒 Only ${needed} more cycle${needed !== 1 ? "s" : ""} to unlock 🌊 Dark Ocean Theme!`;
      themeMessage.classList.remove("unlocked-message");
    }
  }

  function setupThemesPanel() {
    const themesUnlocked = JSON.parse(localStorage.getItem('themesUnlocked')) || {};
    const themeButton = document.getElementById("open-themes-panel");
    const themesModal = document.getElementById("themes-modal");
    const closeThemesBtn = document.getElementById("close-themes-btn");

    // Show the button if ANY theme is unlocked
    if (themesUnlocked.darkOcean) {
        themeButton.style.display = "block";
    }

    // Open modal
    themeButton.addEventListener("click", () => {
        themesModal.style.display = "flex";
        hideMainMenu(); // Hide the main menu when opening
    });

    // Close modal
    closeThemesBtn.addEventListener("click", () => {
        themesModal.style.display = "none";
    });

    // Dark Mode Toggle inside this panel
    setupDarkModeToggle("darkModeToggleThemes", ["darkModeToggle", "darkModeToggleThemes"]);
    
}
setupThemesPanel();

const themeUnlockMessage = document.getElementById("theme-unlock-message");
const themeUnlockStatus = document.getElementById("theme-unlock-status");


themeUnlockStatus.addEventListener("click", () => {
    themeUnlockMessage.classList.toggle("visible");
    // Toggle the arrow icon
    const toggleIcon = themeUnlockStatus.querySelector(".toggle-icon");
    if (toggleIcon) {
      toggleIcon.textContent = themeUnlockMessage.classList.contains("visible") ? "▲" : "▼";
    }
  });




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


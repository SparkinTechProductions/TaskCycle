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
let reminderIntervalId = null;
let timesReminded = 0;
let lastReminderTime = null;
let isDraggingNotification = false;
let isResetting = false;





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
const themeUnlockMessage = document.getElementById("theme-unlock-message");
const themeUnlockStatus = document.getElementById("theme-unlock-status");
const selectedYearlyDays = {}; // key = month number, value = array of selected days
const yearlyApplyToAllCheckbox = document.getElementById("yearly-apply-days-to-all");


// === 🎯 Constants for event delegation targets ===
const RECURRING_CLICK_TARGETS = [
    ".weekly-day-box",
    ".biweekly-day-box",
    ".monthly-day-box",
    ".yearly-day-box",
    ".yearly-month-box"
  ];
  
  const RECURRING_CHANGE_TARGETS = [
    "input",
    "select",
    "#yearly-apply-days-to-all"
  ];
  
  // === 🔁 Delegated Change Handler ===
  const handleRecurringChange = (e) => {
    const isMatch = RECURRING_CHANGE_TARGETS.some(selector =>
      e.target.matches(selector)
    );
    if (isMatch) {
      updateRecurringSummary();
    }
  };
  
  // === 🔁 Delegated Click Handler ===
  const handleRecurringClick = (e) => {
    const isMatch = RECURRING_CLICK_TARGETS.some(selector =>
      e.target.matches(selector)
    );
    if (isMatch) {
      updateRecurringSummary();
    }
  };
  
  // === 🧠 Attach Delegated Listeners ===
  function attachRecurringSummaryListeners() {
    const panel = document.getElementById("recurring-settings-panel");
    safeAddEventListener(panel, "change", handleRecurringChange);
    safeAddEventListener(panel, "click", handleRecurringClick);
  }


const DRAG_THROTTLE_MS = 50;
const TASK_LIMIT = 50; 




// Run functions on page load
initialSetup();
loadRemindersSettings();
setupReminderToggle();
setupMainMenu();
setupSettingsMenu();
setupAbout();
setupUserManual();
setupFeedbackModal();
updateStatsPanel(); 
applyTheme(localStorage.getItem('currentTheme'));
loadMiniCycle();
setupMiniCycleTitleListener();
setupDownloadMiniCycle();
setupUploadMiniCycle();
setupRearrange();
dragEndCleanup ();
updateMoveArrowsVisibility();
checkDueDates();
initializeThemesPanel();
setupRecurringPanel();
attachRecurringSummaryListeners();
setTimeout(remindOverdueTasks, 2000);
setTimeout(() => {
    updateReminderButtons(); // ✅ This is the *right* place!
    startReminders();
}, 200);






window.onload = () => taskInput.focus();


showOnboarding();


function showOnboarding() {
    const hasSeenOnboarding = localStorage.getItem("miniCycleOnboarding");
    if (hasSeenOnboarding) return;
  
    const steps = [
      `<h2>Welcome to Task Cycle: Mini! 🎉</h2>
       <p>Mini Cycle helps you manage tasks with a powerful reset system!</p>`,
      `<ul>
         <li>✅ Add tasks using the input box</li>
         <li>🔄 Tasks reset automatically (if Auto-Reset is enabled)</li>
         <li>📊 Track your progress and unlock themes</li>
       </ul>`,
      `<ul>
         <li>📱 On mobile, long press a task to open the menu</li>
         <li>📱 Long press and move to rearrange tasks</li>
         <li>📵 Use Settings to show task buttons on older phones</li>
       </ul>`
    ];
  
    let currentStep = 0;
  
    const modal = document.createElement("div");
    modal.id = "onboarding-modal";
    modal.className = "onboarding-modal";
    modal.innerHTML = `
    <div class="onboarding-content theme-${localStorage.getItem("currentTheme") || 'default'}">
      <button id="onboarding-skip" class="onboarding-skip">Skip ✖</button>
      <div id="onboarding-step-content"></div>
      <div class="onboarding-controls">
        <button id="onboarding-prev" class="hidden">⬅ Back</button>
        <button id="onboarding-next">Next ➡</button>
      </div>
    </div>
  `;
  
    document.body.appendChild(modal);
    const stepContent = document.getElementById("onboarding-step-content");
    const nextBtn = document.getElementById("onboarding-next");
    const prevBtn = document.getElementById("onboarding-prev");
    const skipBtn = document.getElementById("onboarding-skip");
  
    function renderStep(index) {
      stepContent.innerHTML = steps[index];
      prevBtn.classList.toggle("hidden", index === 0);
      nextBtn.textContent = index === steps.length - 1 ? "Start 🚀" : "Next ➡";
    }
  
    nextBtn.addEventListener("click", () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep(currentStep);
      } else {
        modal.remove();
        localStorage.setItem("miniCycleOnboarding", "true");
        console.log("✅ Onboarding finished.");
      }
    });
  
    prevBtn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
      }
    });
  
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
        localStorage.setItem("miniCycleOnboarding", "true");
        console.log("❌ Onboarding dismissed.");
      }
    });

    skipBtn.addEventListener("click", () => {
    modal.remove();
    localStorage.setItem("miniCycleOnboarding", "true");
    console.log("⏭️ Onboarding skipped.");
    });
  
    renderStep(currentStep);
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





// 🔧 Utility Function (can go at top of your scripts)
function generateNotificationId(message) {
    return message
        .replace(/<br\s*\/?>/gi, '\n')   // Convert <br> to newline
        .replace(/<[^>]*>/g, '')         // Remove all HTML tags
        .replace(/\s+/g, ' ')            // Collapse whitespace
        .trim()
        .toLowerCase();                  // Normalize case
}

function generateHashId(message) {
    const text = generateNotificationId(message);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0; // Force 32-bit int
    }
    return `note-${Math.abs(hash)}`;
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
    checkGamesUnlock();
    safeAddEventListener(exitMiniCycle, "click", () => {
        window.location.href = "../index.html";
    });
    
}


function checkGamesUnlock() {
    const unlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};
    if (unlocks.taskOrderGame) {
        document.getElementById("games-menu-option").style.display = "block";
    }
}

document.getElementById("open-games-panel").addEventListener("click", () => {
    document.getElementById("games-panel").style.display = "flex";
    setupGamesModalOutsideClick();

});

document.getElementById("close-games-panel").addEventListener("click", () => {
    document.getElementById("games-panel").style.display = "none";
});

document.getElementById("open-task-order-game").addEventListener("click", () => {
    // Load game into container or open in new modal

        window.location.href = "miniCycleGames/miniCycle-taskOrder.html";
   
});
/*
function loadTaskOrderGame() {
    const container = document.getElementById("taskOrderGameContainer");
    if (!container) return;

    fetch("/miniCycleGames/miniCycle-taskOrder.html")
        .then(res => res.text())
        .then(html => {
            container.innerHTML = html;
            container.style.display = "block";
        });
}
*/


function setupGamesModalOutsideClick() {
    const gamesPanel = document.getElementById("games-panel");
    const gamesContent = document.querySelector(".games-modal-content");
    const openButton = document.getElementById("open-games-panel");
  
    if (!gamesPanel || !gamesContent || !openButton) return;
  
    console.log("✅ Games outside click ready");
  
    safeAddEventListener(document, "click", function (event) {
      const isOpen = gamesPanel.style.display === "flex";
      const clickedOutside =
        !gamesContent.contains(event.target) && event.target !== openButton;
  
      if (isOpen && clickedOutside) {
        gamesPanel.style.display = "none";
      }
    });
  }

function closeMainMenu() {
if (menu) { menu.classList.remove("visible");}
}



/**
 * Initializes the Mini Cycle app by loading or creating a saved Mini Cycle.
 * Ensures a valid Mini Cycle is always available in localStorage.
 */

async function initialSetup() {
    let lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");
    let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
  
    console.log("📦 Loaded miniCycleStorage:", savedMiniCycles);
  
    while (!lastUsedMiniCycle || lastUsedMiniCycle.trim() === "") {
      lastUsedMiniCycle = prompt("Enter a name for your Mini Cycle:");
  
      if (!lastUsedMiniCycle || lastUsedMiniCycle.trim() === "") {
        // 🧩 Fallback to loading a default sample
        await preloadGettingStartedCycle();
        return;
      }
    }
  
    // ✅ Create Mini Cycle if it doesn't exist
    if (!savedMiniCycles[lastUsedMiniCycle]) {
      savedMiniCycles[lastUsedMiniCycle] = {
        title: lastUsedMiniCycle,
        tasks: [],
        autoReset: true,
        deleteCheckedTasks: false,
        cycleCount: 0
      };
    }
  
    // ✅ Save and continue
    localStorage.setItem("lastUsedMiniCycle", lastUsedMiniCycle);
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
  
    document.getElementById("mini-cycle-title").textContent = savedMiniCycles[lastUsedMiniCycle].title;
    toggleAutoReset.checked = savedMiniCycles[lastUsedMiniCycle].autoReset;
    deleteCheckedTasks.checked = savedMiniCycles[lastUsedMiniCycle].deleteCheckedTasks;
  
    const reminderSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
    enableReminders.checked = reminderSettings.enabled === true;
  
    if (enableReminders.checked) {
      frequencySection.classList.remove("hidden");
      startReminders();
    }
  }

  async function preloadGettingStartedCycle() {
    try {
      const response = await fetch("data/getting-started.mcyc"); // adjust path as needed
      const sample = await response.json();
  
      const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
  
      savedMiniCycles[sample.name] = {
        title: sample.title || sample.name,
        tasks: sample.tasks || [],
        autoReset: sample.autoReset || false,
        cycleCount: sample.cycleCount || 0,
        deleteCheckedTasks: sample.deleteCheckedTasks || false
      };
  
      localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
      localStorage.setItem("lastUsedMiniCycle", sample.name);
  
      showNotification("✨ A sample Mini Cycle has been preloaded to help you get started!", "success", 5000);
      loadMiniCycle();
    } catch (err) {
      showNotification("❌ Failed to load sample Mini Cycle.", "error");
      console.error("Sample load error:", err);
    }
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


function applyTheme(themeName) {
    console.log("ran Apply Theme");
    // Step 1: Remove all theme classes
    const allThemes = ['theme-dark-ocean', 'theme-golden-glow'];
    allThemes.forEach(theme => document.body.classList.remove(theme));
  
    // Step 2: Add selected theme class if it's not 'default'
    if (themeName && themeName !== 'default') {
      document.body.classList.add(`theme-${themeName}`);
    }
  
    // Step 3: Save to localStorage
    localStorage.setItem('currentTheme', themeName || 'default');
  
    // Step 4: Uncheck all theme checkboxes
    document.querySelectorAll('.theme-toggle').forEach(cb => {
      cb.checked = cb.id === `toggle${capitalize(themeName)}Theme`;
    });
  }
  
  // Optional helper to format checkbox IDs
  function capitalize(str) {
    return str
      ? str.charAt(0).toUpperCase() + str.slice(1).replace(/-./g, s => s.charAt(1).toUpperCase())
      : '';
  }
/**
 * Enables editing of the Mini Cycle title and saves changes to localStorage.
 * Prevents empty titles and restores the previous title if an invalid entry is made.
 */

function setupMiniCycleTitleListener() {
    const titleElement = document.getElementById("mini-cycle-title");
    if (!titleElement) return; // Safety check

    titleElement.contentEditable = true;

    // ✅ Only add listener once
    if (!titleElement.dataset.listenerAdded) {
        titleElement.addEventListener("blur", () => {
            // ⛑️ Sanitize input before saving
            let newTitle = sanitizeInput(titleElement.textContent.trim());

            const miniCycleFileName = localStorage.getItem("lastUsedMiniCycle");
            const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

            if (!miniCycleFileName || !savedMiniCycles[miniCycleFileName]) {
                console.warn("⚠ No active Mini Cycle found. Title update aborted.");
                return;
            }

            if (newTitle !== "") {
                titleElement.textContent = newTitle; // ✨ Make sure sanitized title is reflected
                savedMiniCycles[miniCycleFileName].title = newTitle;
                localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
                console.log(`✅ Mini Cycle title updated: "${newTitle}"`);
            } else {
                showNotification("⚠ Title cannot be empty. Reverting to previous title.");
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

    let miniCycleTasks = [...document.getElementById("taskList").children].map((taskElement) => {
        const taskTextElement = taskElement.querySelector(".task-text");
        const dueDateElement = taskElement.querySelector(".due-date");
        const reminderButton = taskElement.querySelector(".enable-task-reminders");
    
        const taskId = taskElement.dataset.taskId;
    
        if (!taskTextElement || !taskId) {
            console.warn("⚠ Skipping task (missing text or ID):", taskElement);
            return null;
        }
    
        const previousTask = savedMiniCycles[miniCycleFileName].tasks.find(t => t.id === taskId);
        
        return {
            id: taskId, // ✅ STORE THE ID!
            text: taskTextElement.textContent,
            completed: taskElement.querySelector("input[type='checkbox']").checked,
            dueDate: dueDateElement ? dueDateElement.value : null,
            highPriority: taskElement.classList.contains("high-priority"),
            remindersEnabled: reminderButton ? reminderButton.classList.contains("reminder-active") : false,
            recurring: taskElement.querySelector(".recurring-btn")?.classList.contains("active") || false, // ✅ NEW: read from DOM
 
            // 🔁 Recurring Info (preserve saved values)
            recurFrequency: previousTask?.recurFrequency,
            recurCount: previousTask?.recurCount,
            recurIndefinitely: previousTask?.recurIndefinitely,
            dailyTime: previousTask?.dailyTime,
            weeklyDays: previousTask?.weeklyDays,
            weeklyTime: previousTask?.weeklyTime,
            biweeklyDays: previousTask?.biweeklyDays,
            biweeklyTime: previousTask?.biweeklyTime,
            monthlyDays: previousTask?.monthlyDays,
            monthlyTime: previousTask?.monthlyTime,
            yearlyMonths: previousTask?.yearlyMonths,
            yearlyDays: previousTask?.yearlyDays,
            yearlyTime: previousTask?.yearlyTime,
            specificDates: previousTask?.specificDates,
            specificTime: previousTask?.specificTime
        };
    }).filter(task => task !== null);
    savedMiniCycles[miniCycleFileName].tasks = miniCycleTasks;
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    console.log("📋 Task Status:");
    miniCycleTasks.forEach(task => {
        console.log(`- ${task.text}: ${task.completed ? "✅ Completed" : "❌ Not Completed"} 
            ${task.dueDate ? `(Due: ${task.dueDate})` : ''} 
            ${task.highPriority ? "🔥 High Priority" : ""} 
            ${task.remindersEnabled ? "🔔 Reminders ON" : "🔕 Reminders OFF"} 
            ${task.recurring ? "🔁 Recurring ON" : "↩️ Not Recurring"}`);
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

            // ✅ 5️⃣ LOAD SETTINGS FROM STORAGE
        toggleAutoReset.checked = miniCycleData.autoReset || false;
        deleteCheckedTasks.checked = miniCycleData.deleteCheckedTasks || false;

        
            // 🛠️ Now fully includes recurring!
            addTask(task.text, task.completed, false, task.dueDate, task.highPriority, true, task.remindersEnabled, task.recurring, task.id);
        });

        // ✅ 4️⃣ UPDATE MINI CYCLE TITLE
        const titleElement = document.getElementById("mini-cycle-title");
        titleElement.textContent = miniCycleData.title || "Untitled Mini Cycle"; 

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
        updateRecurringPanel?.();
        updateRecurringButtonVisibility();
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
  /***********************
 * 
 * 
 * Menu Management Logic
 * 
 * 
 ************************/

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

    const oldName = selectedCycle.dataset.cycleName;

    let newName = prompt("Enter a new name for this Mini Cycle:", oldName);
    if (!newName || newName.trim() === "") {
        showNotification("Invalid name! Mini Cycle name cannot be empty.");
        return;
    }
    newName = sanitizeInput(newName.trim());
    newName = newName.trim();

    const savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};

    if (savedMiniCycles[newName]) {
        showNotification("A Mini Cycle with this name already exists. Choose a different name.");
        return;
    }

    // ✅ Rename and update localStorage
    savedMiniCycles[newName] = { ...savedMiniCycles[oldName] };
    savedMiniCycles[newName].title = newName;
    delete savedMiniCycles[oldName];

    // ✅ Update last used Mini Cycle reference if necessary
    const currentActive = localStorage.getItem("lastUsedMiniCycle");
    if (currentActive === oldName) {
        localStorage.setItem("lastUsedMiniCycle", newName);
    }

    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    // ✅ Update UI label directly (preserve emoji)
    selectedCycle.dataset.cycleName = newName;
    const nameSpan = selectedCycle.querySelector("span");
    if (nameSpan) {
        nameSpan.textContent = newName;
    }

    loadMiniCycleList();
    updatePreview(newName);
    setTimeout(() => {
        const updatedItem = [...document.querySelectorAll(".mini-cycle-switch-item")]
            .find(item => item.dataset.cycleName === newName);
        if (updatedItem) {
            updatedItem.classList.add("selected");
            updatedItem.click(); // ✅ trigger preview
        }
    }, 50);
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

    loadMiniCycleList();
    setTimeout(updateProgressBar,500);
    setTimeout(updateStatsPanel,500);
    checkCompleteAllButton();
    setTimeout(() => {
        const firstCycle = document.querySelector(".mini-cycle-switch-item");
        if (firstCycle) {
            firstCycle.classList.add("selected");
            firstCycle.click(); // ✅ Triggers preview and button row
        }
    }, 50);
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

    function escapeHTML(str) {
        const temp = document.createElement("div");
        temp.textContent = str;
        return temp.innerHTML;
      }

    if (!savedMiniCycles[cycleName] || !savedMiniCycles[cycleName].tasks) {
        previewWindow.innerHTML = `<br><strong>No tasks found.</strong>`;
        return;
    }

    // ✅ Create a simple list of tasks for preview
    const tasksPreview = savedMiniCycles[cycleName].tasks
        .map(task => `<div class="preview-task">${task.completed ? "✔️" : "___"} ${escapeHTML(task.text)}</div>`)
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
        listItem.textContent = emoji + " ";
        const nameSpan = document.createElement("span");
        nameSpan.textContent = cycleName;
        listItem.appendChild(nameSpan);

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

    updateReminderButtons();
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
    newCycleName = sanitizeInput(newCycleName.trim());

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



indefiniteCheckbox.addEventListener("change", () => {
  // If indefinite, hide the repeatCount row
  repeatCountRow.style.display = indefiniteCheckbox.checked ? "none" : "block";
});



function handleReminderToggle() {
    const isEnabled = enableReminders.checked;
  
    // 🧠 Read previous state from localStorage
    const previousSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
    const wasEnabled = previousSettings.enabled === true;
  
    // ✅ Update the visibility of the frequency section
    frequencySection.classList.toggle("hidden", !isEnabled);
  
    // ✅ Save updated settings and get the current global state
    const globalReminderState = autoSaveReminders();
  
    // ✅ Update the 🔔 task buttons
    updateReminderButtons();
  
    // ✅ Start or stop reminders
    if (globalReminderState) {
      console.log("🔔 Global Reminders Enabled — Starting reminders...");
      if (!wasEnabled) {
        showNotification("🔔 Task reminders enabled!", "success", 2500);
      }
      setTimeout(() => startReminders(), 200);
    } else {
      console.log("🔕 Global Reminders Disabled — Stopping reminders...");
      if (wasEnabled) {
        showNotification("🔕 Task reminders disabled.", "error", 2500);
      }
      stopReminders();
    }
  }
  
  function setupReminderToggle() {
    safeAddEventListener(enableReminders, "change", handleReminderToggle);

    const reminderSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
    enableReminders.checked = reminderSettings.enabled === true;
    frequencySection.classList.toggle("hidden", !reminderSettings.enabled);

    // ✅ 🧠 Reminder system will re-run if already enabled
    if (reminderSettings.enabled) {
        updateReminderButtons();
        startReminders();
    }
}

  function stopReminders() {
    if (reminderIntervalId) {
      clearInterval(reminderIntervalId);
      reminderIntervalId = null;
      console.log("🛑 Reminder system stopped.");
    }
  }







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

    return remindersToSave.enabled; 
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
    frequencySection.classList.toggle("hidden", !savedReminders.enabled);
    document.getElementById("repeat-count-row").style.display = savedReminders.indefinite ? "none" : "block";

    // ✅ 🔔 NEW: Show/hide reminder buttons on load
    updateReminderButtons(); // <- This will loop through all tasks and show/hide buttons correctly
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


["repeatCount", "frequencyValue", "frequencyUnit"].forEach(id => {
    safeAddEventListenerById(id, "input", () => {
      const settings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
      if (settings.enabled) {
        autoSaveReminders();
        startReminders();
      }
    });
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



function saveTaskReminderState(taskId, isEnabled) {
    let savedMiniCycles = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
    let lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");
    if (!savedMiniCycles[lastUsedMiniCycle]) return;

    // Look up the task using its unique id instead of text
    let task = savedMiniCycles[lastUsedMiniCycle].tasks.find(t => t.id === taskId);
    if (task) {
        task.remindersEnabled = isEnabled;
        localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
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
    try {
      const notificationContainer = document.getElementById("notification-container");
      if (!notificationContainer) {
        console.warn("⚠️ Notification container not found.");
        return;
      }
  
      // 💡 Sanitize + Fallback message
      if (typeof message !== "string" || message.trim() === "") {
        console.warn("⚠️ Invalid or empty message passed to showNotification().");
        message = "⚠️ Unknown notification";
      }
  
      const newId = generateHashId(message); // 🔐 Use hash-based ID
      const existing = [...notificationContainer.querySelectorAll(".notification")];
  
      // ✅ Prevent duplicates
      if (existing.some(n => n.dataset.id === newId)) {
        console.log("🔄 Notification already exists, skipping duplicate.");
        return;
      }
  
      // ✅ Build notification
      const notification = document.createElement("div");
      notification.classList.add("notification", "show");
      notification.dataset.id = newId;
  
      if (type === "error") notification.classList.add("error");
      if (type === "success") notification.classList.add("success");
  
      notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✖</button>
      `;
  
      notificationContainer.appendChild(notification);
  
      // ✅ Restore saved position safely
      try {
        const savedPosition = JSON.parse(localStorage.getItem("miniCycleNotificationPosition"));
        if (savedPosition && savedPosition.top && savedPosition.left) {
          notificationContainer.style.top = savedPosition.top;
          notificationContainer.style.left = savedPosition.left;
          notificationContainer.style.right = "auto";
        }
      } catch (posError) {
        console.warn("⚠️ Failed to apply saved notification position.", posError);
      }
  
      // ✅ Auto-remove logic
      if (duration) {
        setTimeout(() => {
          notification.classList.remove("show");
          setTimeout(() => notification.remove(), 300);
        }, duration);
      }
  
      // ✅ Dragging (Mouse)
      notificationContainer.addEventListener("mousedown", (e) => {
        try {
          isDraggingNotification = true;
          notificationContainer.classList.add("dragging");
  
          const offsetX = e.clientX - notification.getBoundingClientRect().left;
          const offsetY = e.clientY - notification.getBoundingClientRect().top;
  
          const onMouseMove = (e) => {
            const top = `${e.clientY - offsetY}px`;
            const left = `${e.clientX - offsetX}px`;
            notificationContainer.style.top = top;
            notificationContainer.style.left = left;
            notificationContainer.style.right = "auto";
            localStorage.setItem("miniCycleNotificationPosition", JSON.stringify({ top, left }));
          };
  
          const onMouseUp = () => {
            isDraggingNotification = false;
            notificationContainer.classList.remove("dragging");
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };
  
          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        } catch (dragErr) {
          console.error("❌ Mouse drag error:", dragErr);
        }
      });
  
      // ✅ Touch dragging
      notificationContainer.addEventListener("touchstart", (e) => {
        try {
          isDraggingNotification = true;
          const touch = e.touches[0];
          const offsetX = touch.clientX - notificationContainer.getBoundingClientRect().left;
          const offsetY = touch.clientY - notificationContainer.getBoundingClientRect().top;
  
          const onTouchMove = (e) => {
            const touch = e.touches[0];
            const top = `${touch.clientY - offsetY}px`;
            const left = `${touch.clientX - offsetX}px`;
            notificationContainer.style.top = top;
            notificationContainer.style.left = left;
            notificationContainer.style.right = "auto";
            localStorage.setItem("miniCycleNotificationPosition", JSON.stringify({ top, left }));
          };
  
          const onTouchEnd = () => {
            isDraggingNotification = false;
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
          };
  
          document.addEventListener("touchmove", onTouchMove);
          document.addEventListener("touchend", onTouchEnd);
        } catch (touchErr) {
          console.error("❌ Touch drag error:", touchErr);
        }
      });
  
    } catch (err) {
      console.error("❌ showNotification failed:", err);
    }
  }


  
  
  function resetNotificationPosition() {
    localStorage.removeItem("miniCycleNotificationPosition");
  
    const container = document.getElementById("notification-container");
    container.style.top = ""; // Revert to default
    container.style.left = "";
    container.style.right = ""; // Reset right as a fallback
  
    console.log("🔄 Notification position reset.");
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
            console.log("🔍 Tasks With Active Reminders:", tasksWithReminders);
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



  updateRecurringPanelButtonVisibility();


  function setupRecurringPanel() {
    const overlay = document.getElementById("recurring-panel-overlay");
    const panel = document.getElementById("recurring-panel");
    const closeBtn = document.getElementById("close-recurring-panel");
    const openBtn = document.getElementById("open-recurring-panel");
    const yearlyApplyToAllCheckbox = document.getElementById("yearly-apply-days-to-all");
    const specificDatesCheckbox = document.getElementById("recur-specific-dates");
    const specificDatesPanel = document.getElementById("specific-dates-panel"); // ✅ fixed ID
    const toggleBtn = document.getElementById("toggle-advanced-settings");
   
  
    let advancedVisible = false; // Start true if you want it shown on open
    setAdvancedVisibility(advancedVisible, toggleBtn); // Initial state
  
    toggleBtn.addEventListener("click", () => {
      advancedVisible = !advancedVisible;
      setAdvancedVisibility(advancedVisible, toggleBtn);
    });
  
  
    // Modal behavior
    if (!overlay || !panel || !closeBtn || !openBtn) return;
  
    openBtn.addEventListener("click", () => {
        updateRecurringPanel(); // Rebuild task list
        document.getElementById("recurring-settings-panel")?.classList.add("hidden"); // 🔒 Always start hidden
        overlay.classList.remove("hidden");
        updateRecurringSettingsVisibility();
      });
  
    closeBtn.addEventListener("click", () => {
        updateRecurringSettingsVisibility();
      overlay.classList.add("hidden");
    });
  
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        updateRecurringSettingsVisibility();
        overlay.classList.add("hidden");
      }
    });
  
    // Frequency change handler
    const frequencySelect = document.getElementById("recur-frequency");
    if (frequencySelect) {
      frequencySelect.addEventListener("change", () => {
        const selectedFrequency = frequencySelect.value;
        const frequencyMap = {
          hourly: document.getElementById("hourly-options"),
          daily: document.getElementById("daily-options"),
          weekly: document.getElementById("weekly-options"),
          biweekly: document.getElementById("biweekly-options"),
          monthly: document.getElementById("monthly-options"),
          yearly: document.getElementById("yearly-options")
        };
        Object.values(frequencyMap).forEach(section => section?.classList.add("hidden"));
        frequencyMap[selectedFrequency]?.classList.remove("hidden");
      });
      updateRecurringSummary();
    }
  
    // Toggle helper
    const toggleVisibility = (triggerId, contentId) => {
      const trigger = document.getElementById(triggerId);
      const content = document.getElementById(contentId);
      if (trigger && content) {
        trigger.addEventListener("change", () => {
          content.classList.toggle("hidden", !trigger.checked);
        });
      }
    };
  
    // Individual toggle groups
    toggleVisibility("hourly-specific-time", "hourly-minute-container");
    toggleVisibility("daily-specific-time", "daily-time-container");
    toggleVisibility("weekly-specific-days", "weekly-day-container");
    toggleVisibility("weekly-specific-time", "weekly-time-container");
    toggleVisibility("biweekly-specific-days", "biweekly-day-container");
    toggleVisibility("biweekly-specific-time", "biweekly-time-container");
    toggleVisibility("monthly-specific-days", "monthly-day-container");
    toggleVisibility("monthly-specific-time", "monthly-time-container");
    toggleVisibility("yearly-specific-months", "yearly-month-container");
    toggleVisibility("yearly-specific-time", "yearly-time-container");
  
    const yearlySpecificDaysCheckbox = document.getElementById("yearly-specific-days");
    const yearlyDayContainer = document.getElementById("yearly-day-container");
    const yearlyMonthSelect = document.getElementById("yearly-month-select");
  
    if (yearlySpecificDaysCheckbox && yearlyDayContainer) {
      yearlySpecificDaysCheckbox.addEventListener("change", () => {
        const hasMonthSelected = getSelectedYearlyMonths().length > 0;
        yearlyDayContainer.classList.toggle("hidden", !yearlySpecificDaysCheckbox.checked || !hasMonthSelected);
      });
    }
    setupTimeConversion({ hourInputId: "specific-date-hour", minuteInputId: "specific-date-minute", meridiemSelectId: "specific-date-meridiem", militaryCheckboxId: "specific-date-military" });
    setupTimeConversion({ hourInputId: "daily-hour", minuteInputId: "daily-minute", meridiemSelectId: "daily-meridiem", militaryCheckboxId: "daily-military" });
    setupTimeConversion({ hourInputId: "weekly-hour", minuteInputId: "weekly-minute", meridiemSelectId: "weekly-meridiem", militaryCheckboxId: "weekly-military" });
    setupTimeConversion({ hourInputId: "biweekly-hour", minuteInputId: "biweekly-minute", meridiemSelectId: "biweekly-meridiem", militaryCheckboxId: "biweekly-military" });
    setupTimeConversion({ hourInputId: "monthly-hour", minuteInputId: "monthly-minute", meridiemSelectId: "monthly-meridiem", militaryCheckboxId: "monthly-military" });
    setupTimeConversion({ hourInputId: "yearly-hour", minuteInputId: "yearly-minute", meridiemSelectId: "yearly-meridiem", militaryCheckboxId: "yearly-military" });
  
    setupMilitaryTimeToggle("daily");
    setupMilitaryTimeToggle("weekly");
    setupMilitaryTimeToggle("biweekly");
    setupMilitaryTimeToggle("monthly");
    setupMilitaryTimeToggle("yearly");
  
    setupWeeklyDayToggle();
    generateMonthlyDayGrid();
    generateYearlyMonthGrid();

  
    if (yearlyMonthSelect) {
      yearlyMonthSelect.addEventListener("change", (e) => {
        const selectedMonth = parseInt(e.target.value);
        generateYearlyDayGrid(selectedMonth);
      });
      generateYearlyDayGrid(1); // Default to January
    }
  
    yearlyApplyToAllCheckbox?.addEventListener("change", handleYearlyApplyToAllChange);
    // Handles specific date visibility and disables advanced options when active
    setupSpecificDatesPanel();
    updateRecurringSummary();
  }

// Define the helper first
function setAdvancedVisibility(visible, toggleBtn) {
    advancedVisible = visible;
    toggleBtn.textContent = visible ? "Hide Advanced Options" : "Show Advanced Options";
  
    // Show/hide all `.frequency-options` panels
    document.querySelectorAll(".frequency-options").forEach(option => {
      option.style.display = visible ? "block" : "none";
    });
  
    // Always show frequency dropdown container
    const frequencyContainer = document.getElementById("recur-frequency-container");
    if (frequencyContainer) frequencyContainer.style.display = "block";
  
    // Handle extras like 'Recur indefinitely' and 'Specific Dates'
    const advancedControls = [
        { checkboxId: "recur-indefinitely" },
        { checkboxId: "recur-specific-dates" }
      ];


    advancedControls.forEach(({ checkboxId, panelId }) => {
      const checkbox = document.getElementById(checkboxId);
      if (!checkbox) return;
  
      const label = checkbox.closest("label");
      if (label) {
        label.style.display = visible ? "flex" : "none";
        
      }
    });
  }

  function updateRecurringPanel() {
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
    const cycleData = savedMiniCycles?.[lastUsedMiniCycle];
    const recurringList = document.getElementById("recurring-task-list");
  
    if (!cycleData || !Array.isArray(cycleData.tasks)) return;
  
    const recurringTasks = cycleData.tasks.filter(task => task.recurring);
  
    // Clear the panel
    recurringList.innerHTML = "";
  
    if (recurringTasks.length === 0) {
      const overlay = document.getElementById("recurring-panel-overlay");
      if (overlay) overlay.classList.add("hidden");
      return;
    }
  
    // Clear selection on rebuild
    document.querySelectorAll(".recurring-task-item").forEach(el => {
      el.classList.remove("selected");
    });
  
    recurringTasks.forEach(task => {
      const item = document.createElement("li");
      item.className = "recurring-task-item";
      item.setAttribute("data-task-id", task.id);
  
      item.innerHTML = `
        <input type="checkbox" 
               class="recurring-check" 
               id="recurring-check-${task.id}" 
               name="recurring-check-${task.id}" 
               aria-label="Mark this task temporarily">
        <span class="recurring-task-text">${task.text}</span>
        <button title="Remove from Recurring" class="recurring-remove-btn"><i class='fas fa-trash recurring-trash-icon'></i></button>
      `;
  
      const checkbox = item.querySelector(".recurring-check");
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        item.classList.toggle("checked");
      });
      checkbox.classList.add("hidden"); // ⬅️ add this after creating the checkbox
  
      item.querySelector("button").addEventListener("click", () => {
        const confirmRemove = confirm(`Are you sure you want to remove "${task.text}" from recurring tasks?`);
        if (!confirmRemove) return;
  
        const matchingTaskItem = document.querySelector(`.task[data-task-id="${task.id}"]`);
        if (matchingTaskItem) {
          const recurringBtn = matchingTaskItem.querySelector(".recurring-btn");
          if (recurringBtn) {
            recurringBtn.click();
          }
        }
  
        item.remove();
        updateRecurringPanelButtonVisibility();
  
        const stillRecurring = cycleData.tasks.some(t => t.recurring);
        if (!stillRecurring) {
          const overlay = document.getElementById("recurring-panel-overlay");
          if (overlay) overlay.classList.add("hidden");
        }
      });


      item.addEventListener("click", (e) => {
        if (e.target.closest(".recurring-remove-btn")) return;
      
        // 👇 If checkbox was clicked, let the checkbox logic handle it
        if (e.target.closest("input[type='checkbox']")) return;
      
        // 🎯 Otherwise: user clicked the task text/row -> mark as selected only
        document.querySelectorAll(".recurring-task-item").forEach(el => {
          el.classList.remove("selected");
        });
        item.classList.add("selected");
      
        // 🧠 Update preview without modifying checkboxes
        const taskId = item.dataset.taskId;
        const task = savedMiniCycles?.[lastUsedMiniCycle]?.tasks.find(t => t.id === taskId);
        if (task) {
          showTaskSummaryPreview(task);
        }
      });


      recurringList.appendChild(item);
    });

    updateRecurringSummary();
  }
  
  function openRecurringSettingsPanelForTask(taskIdToPreselect) {
    updateRecurringPanel(); // Render panel fresh
  
    // Find and preselect the correct task
    const itemToSelect = document.querySelector(`.recurring-task-item[data-task-id="${taskIdToPreselect}"]`);
    if (itemToSelect) {
      itemToSelect.classList.add("selected");
  
      const checkbox = itemToSelect.querySelector("input[type='checkbox']");
      if (checkbox) {
        checkbox.checked = true;
        itemToSelect.classList.add("checked");
      }
  
      // Update the preview
      const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
      const task = savedMiniCycles?.[lastUsedMiniCycle]?.tasks.find(t => t.id === taskIdToPreselect);
      if (task) showTaskSummaryPreview(task);
    }
  
    // Show panel
    document.getElementById("recurring-panel-overlay")?.classList.remove("hidden");
  
    // Make sure checkboxes and toggle show correctly
    updateRecurringSettingsVisibility();
  }



  function updateRecurringSettingsVisibility() {
    const anySelected = document.querySelector(".recurring-task-item.selected");
    const settingsPanel = document.getElementById("recurring-settings-panel");
    const checkboxes = document.querySelectorAll(".recurring-check");
    const changeBtns = document.querySelectorAll(".change-recurring-btn");
    const toggleContainer = document.getElementById("recurring-toggle-actions");
    const toggleBtn = document.getElementById("toggle-check-all");
    const taskCount = document.querySelectorAll(".recurring-task-item").length;
  
    const show = !!anySelected;
  
    if (settingsPanel) {
      settingsPanel.classList.toggle("hidden", !show);
  
      // Show or hide checkboxes
      checkboxes.forEach(box => {
        box.classList.toggle("hidden", !show);
      });
  
      // Hide change buttons when panel is open
      changeBtns.forEach(btn => {
        btn.classList.toggle("hidden", show);
      });
    }
  
    // ✅ Only show toggle if panel is open AND checkboxes are visible AND more than one task
    const checkboxesVisible = Array.from(checkboxes).some(cb => !cb.classList.contains("hidden"));
    const shouldShowToggle = show && taskCount > 1 && checkboxesVisible;
    toggleContainer?.classList.toggle("hidden", !shouldShowToggle);
  
    // Update button label (optional)
    if (toggleBtn && shouldShowToggle) {
      const anyUnchecked = Array.from(checkboxes).some(cb => !cb.checked && !cb.classList.contains("hidden"));
      toggleBtn.textContent = anyUnchecked ? "Check All" : "Uncheck All";
    }
  
    updateRecurringSummary();
  }

  document.getElementById("toggle-check-all").addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".recurring-check:not(.hidden)");
    const anyUnchecked = Array.from(checkboxes).some(cb => !cb.checked);
  
    checkboxes.forEach(cb => {
      cb.checked = anyUnchecked;
      cb.closest(".recurring-task-item").classList.toggle("checked", anyUnchecked);
    });
  
    // 🔁 Update the label based on what you just did
    const toggleCheckAllBtn = document.getElementById("toggle-check-all");
    toggleCheckAllBtn.textContent = anyUnchecked ? "Uncheck All" : "Check All";
  
    updateRecurringSummary();
  });
  
  function loadRecurringSettingsForTask(task) {
    if (!task) return;
  
    const freqSelect = document.getElementById("recur-frequency");
    const recurCheckbox = document.getElementById("recur-indefinitely");
    const recurCountInput = document.getElementById("recur-count-input");
    const countContainer = document.getElementById("recur-count-container");
  
    if (freqSelect && task.recurFrequency) {
        freqSelect.value = task.recurFrequency;
        const changeEvent = new Event("change");
        freqSelect.dispatchEvent(changeEvent);
      }
  
    if (recurCheckbox) {
      recurCheckbox.checked = task.recurIndefinitely ?? true;
    }
  
    if (recurCountInput && task.recurCount != null) {
      recurCountInput.value = task.recurCount;
    }
    updateRecurCountVisibility();
    updateRecurringSummary();
  }

  document.getElementById("specific-date-specific-time").addEventListener("change", (e) => {
    const timeContainer = document.getElementById("specific-date-time-container");
    timeContainer.classList.toggle("hidden", !e.target.checked);
    updateRecurringSummary();
  });
  












  const applyBtn = document.getElementById("apply-recurring-settings");

  applyBtn?.addEventListener("click", () => {
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
  
    // 1️⃣ Collect all checked tasks from the recurring list
    const checkedEls = document.querySelectorAll(".recurring-check:checked");
    if (checkedEls.length === 0) {
      showNotification("⚠ No tasks checked to apply settings.");
      return;
    }
  
    // 2️⃣ Get values from the recurring settings panel
    const recurFrequency = document.getElementById("recur-frequency").value;
    const recurIndefinitely = document.getElementById("recur-indefinitely").checked;
    const recurCount = recurIndefinitely ? null :
      parseInt(document.getElementById("recur-count-input").value) || 1;
  
    const specificDatesEnabled = document.getElementById("recur-specific-dates").checked;
  
    // 3️⃣ Loop through all checked tasks and apply settings
    checkedEls.forEach(checkbox => {
      const taskId = checkbox.closest(".recurring-task-item")?.dataset.taskId;
      const task = savedMiniCycles?.[lastUsedMiniCycle]?.tasks.find(t => t.id === taskId);
      if (!task) return;
  
      task.recurFrequency = recurFrequency;
      task.recurIndefinitely = recurIndefinitely;
      task.recurCount = recurCount;
  
      if (specificDatesEnabled) {
        const dateInputs = Array.from(document.querySelectorAll("#specific-date-list input[type='date']"));
        task.specificDates = dateInputs.map(input => input.value).filter(Boolean);
  
        const usesTime = document.getElementById("specific-date-specific-time").checked;
        const hour = parseInt(document.getElementById("specific-date-hour").value) || 0;
        const minute = parseInt(document.getElementById("specific-date-minute").value) || 0;
        const meridiem = document.getElementById("specific-date-meridiem").value;
        const military = document.getElementById("specific-date-military").checked;
  
        task.specificTime = usesTime ? { hour, minute, meridiem, military } : null;
      } else {
        // Delegate to the frequency-specific helper
        switch (task.recurFrequency) {
          case "daily":
            applyDailySettings(task);
            break;
          case "weekly":
            applyWeeklySettings(task);
            break;
          case "biweekly":
            applyBiweeklySettings(task);
            break;
          case "monthly":
            applyMonthlySettings(task);
            break;
          case "yearly":
            applyYearlySettings(task);
            break;
          case "hourly":
            applyHourlySettings(task);
            break;
        }
  
        // Clear any specificDates/specificTime if they were previously set
        task.specificDates = null;
        task.specificTime = null;
      }
    });
  
    autoSave(); // 💾 Save to localStorage
    updateRecurringSummary(); // 🔁 Update UI summary
    showNotification("✅ Recurring settings applied!", "success", 2000);
  });





function applyDailySettings(task) {
    const useTime = document.getElementById("daily-specific-time").checked;
    if (!useTime) {
      task.dailyTime = null;
      return;
    }
  
    const hour = parseInt(document.getElementById("daily-hour").value) || 0;
    const minute = parseInt(document.getElementById("daily-minute").value) || 0;
    const meridiem = document.getElementById("daily-meridiem").value;
    const military = document.getElementById("daily-military").checked;
  
    task.dailyTime = {
      hour,
      minute,
      meridiem,
      military
    };
  }














  const cancelBtn = document.getElementById("cancel-recurring-settings");

  cancelBtn?.addEventListener("click", () => {
    const settingsPanel = document.getElementById("recurring-settings-panel");
    settingsPanel?.classList.add("hidden");
  
    // Deselect all selected tasks
    document.querySelectorAll(".recurring-task-item").forEach(el => {
      el.classList.remove("selected");
      el.querySelector("input[type='checkbox']").checked = false;
    });
  
    // Hide checkboxes and uncheck them
    document.querySelectorAll(".recurring-check").forEach(cb => {
      cb.checked = false;
      cb.classList.add("hidden");
      cb.closest(".recurring-task-item")?.classList.remove("checked");
    });
  
    // Hide the summary preview if visible
    const preview = document.getElementById("recurring-summary-preview");
    if (preview) preview.classList.add("hidden");
  
    updateRecurringSettingsVisibility();
  });





  document.getElementById("recur-indefinitely").addEventListener("change", (e) => {
    const countContainer = document.getElementById("recur-count-container");
    const recurCount = document.getElementById("recur-count-input");
    const hidden = e.target.checked;
    countContainer.classList.toggle("hidden", hidden);
    updateRecurCountVisibility();
    updateRecurringSummary();
  });

  function setupBiweeklyDayToggle() {
    document.querySelectorAll(".biweekly-day-box").forEach(box => {
      box.addEventListener("click", () => {
        box.classList.toggle("selected");
      });
    });
  }

  setupBiweeklyDayToggle();
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("recurring-panel");
    const taskList = document.getElementById("recurring-task-list");
    const settingsPanel = document.getElementById("recurring-settings-panel");
    const overlay = document.getElementById("recurring-panel-overlay");
    const summaryPreview = document.getElementById("recurring-summary-preview");
  
    if (!overlay || overlay.classList.contains("hidden")) return;
  
    if (taskList.contains(e.target) || settingsPanel.contains(e.target)) return;
  
    // 🔽 New block for hiding summary preview
    if (summaryPreview && !summaryPreview.contains(e.target) && !taskList.contains(e.target)) {
      summaryPreview.classList.add("hidden");
      document.querySelectorAll(".recurring-task-item").forEach(el => el.classList.remove("selected"));
    }
  });









  function setupMilitaryTimeToggle(prefix) {
    const toggle = document.getElementById(`${prefix}-military`);
    const hourInput = document.getElementById(`${prefix}-hour`);
    const meridiemSelect = document.getElementById(`${prefix}-meridiem`);
  
    if (!toggle || !hourInput || !meridiemSelect) return;
  
    toggle.addEventListener("change", () => {
      const is24Hour = toggle.checked;
  
      // Change hour range
      hourInput.min = is24Hour ? 0 : 1;
      hourInput.max = is24Hour ? 23 : 12;
  
      // Hide or show meridiem selector
      meridiemSelect.classList.toggle("hidden", is24Hour);
    });
  }

  function setupTimeConversion({
    hourInputId,
    minuteInputId,
    meridiemSelectId,
    militaryCheckboxId
  }) {
    const hourInput = document.getElementById(hourInputId);
    const minuteInput = document.getElementById(minuteInputId);
    const meridiemSelect = document.getElementById(meridiemSelectId);
    const militaryToggle = document.getElementById(militaryCheckboxId);
  
    if (!hourInput || !minuteInput || !meridiemSelect || !militaryToggle) return;
  
    militaryToggle.addEventListener("change", () => {
      const is24Hour = militaryToggle.checked;
      let hour = parseInt(hourInput.value) || 0;
      let meridiem = meridiemSelect.value;
  
      if (is24Hour) {
        // Convert from 12h to 24h
        if (meridiem === "AM") {
          hour = hour === 12 ? 0 : hour;
        } else {
          hour = hour === 12 ? 12 : hour + 12;
        }
        hourInput.value = hour;
        meridiemSelect.classList.add("hidden");
      } else {
        // Convert from 24h to 12h
        if (hour === 0) {
          hourInput.value = 12;
          meridiemSelect.value = "AM";
        } else if (hour < 12) {
          hourInput.value = hour;
          meridiemSelect.value = "AM";
        } else if (hour === 12) {
          hourInput.value = 12;
          meridiemSelect.value = "PM";
        } else {
          hourInput.value = hour - 12;
          meridiemSelect.value = "PM";
        }
        meridiemSelect.classList.remove("hidden");
      }
    });
  }






  function generateMonthlyDayGrid() {
    const container = document.querySelector(".monthly-days");
    if (!container) return;
  
    container.innerHTML = "";
  
    for (let i = 1; i <= 31; i++) {
      const dayBox = document.createElement("div");
      dayBox.className = "monthly-day-box";
      dayBox.setAttribute("data-day", i);
      dayBox.textContent = i;
  
      // Toggle selection on click
      dayBox.addEventListener("click", () => {
        dayBox.classList.toggle("selected");
      });
  
      container.appendChild(dayBox);
    }
  }

  

  function setupWeeklyDayToggle() {
    document.querySelectorAll(".weekly-day-box").forEach(box => {
      box.addEventListener("click", () => {
        box.classList.toggle("selected");
      });
    });
  }



  function generateYearlyMonthGrid() {
    const container = document.querySelector(".yearly-months");
    if (!container) return;
  
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    container.innerHTML = "";
  
    monthNames.forEach((name, index) => {
      const monthBox = document.createElement("div");
      monthBox.className = "yearly-month-box";
      monthBox.setAttribute("data-month", index + 1);
      monthBox.textContent = name;
  
      monthBox.addEventListener("click", () => {
        // Toggle selection
        monthBox.classList.toggle("selected");
  
        const selectedMonths = getSelectedYearlyMonths();
  
        // ✅ Reveal or hide the specific-days checkbox label
        const specificDaysLabel = document.getElementById("yearly-specific-days-label");
        if (specificDaysLabel) {
          specificDaysLabel.classList.toggle("hidden", selectedMonths.length === 0);
        }
  
        // Show/hide day container based on selection + checkbox state
        const yearlySpecificDaysCheckbox = document.getElementById("yearly-specific-days");
        const yearlyDayContainer = document.getElementById("yearly-day-container");
  
        if (yearlySpecificDaysCheckbox && yearlyDayContainer) {
          const shouldShow = yearlySpecificDaysCheckbox.checked && selectedMonths.length > 0;
          yearlyDayContainer.classList.toggle("hidden", !shouldShow);
        }
  
        // Update dropdown
        const yearlyMonthSelect = document.getElementById("yearly-month-select");
        if (yearlyMonthSelect) {
          yearlyMonthSelect.innerHTML = "";
  
          selectedMonths.forEach((monthNum) => {
            const option = document.createElement("option");
            option.value = monthNum;
            option.textContent = new Date(0, monthNum - 1).toLocaleString('default', { month: 'long' });
            yearlyMonthSelect.appendChild(option);
          });
  
          if (selectedMonths.length > 0) {
            const currentMonth = index + 1;
            yearlyMonthSelect.value = currentMonth;
            generateYearlyDayGrid(currentMonth);
          } else {
            document.querySelector(".yearly-days").innerHTML = "";
          }
        }
      });
  
      container.appendChild(monthBox);
    });
  }

  
  function generateYearlyDayGrid(monthNumber) {
    const container = document.querySelector(".yearly-days");
    if (!container) return;
  
    container.innerHTML = "";
  
    const daysInMonth = new Date(2025, monthNumber, 0).getDate();
    const selectedDays = selectedYearlyDays[monthNumber] || [];
  const applyToAll = yearlyApplyToAllCheckbox?.checked;
const activeMonths = getSelectedYearlyMonths();

// If "apply to all" is checked, use the shared day list
const sharedDays = selectedYearlyDays["all"] || [];

for (let i = 1; i <= daysInMonth; i++) {
  const dayBox = document.createElement("div");
  dayBox.className = "yearly-day-box";
  dayBox.setAttribute("data-day", i);
  dayBox.textContent = i;

  const isSelected = applyToAll
    ? sharedDays.includes(i)
    : selectedDays.includes(i);

  if (isSelected) {
    dayBox.classList.add("selected");
  }

  dayBox.addEventListener("click", () => {
    dayBox.classList.toggle("selected");
    const isNowSelected = dayBox.classList.contains("selected");

    if (applyToAll) {
      // Update sharedDays
      if (isNowSelected && !sharedDays.includes(i)) {
        sharedDays.push(i);
      } else if (!isNowSelected && sharedDays.includes(i)) {
        const idx = sharedDays.indexOf(i);
        sharedDays.splice(idx, 1);
      }

      selectedYearlyDays["all"] = sharedDays;

      // Sync all selected months
      activeMonths.forEach(month => {
        selectedYearlyDays[month] = [...sharedDays];
      });
    } else {
      // Regular mode, per-month
      const current = selectedYearlyDays[monthNumber] || [];
      if (isNowSelected && !current.includes(i)) {
        current.push(i);
      } else if (!isNowSelected && current.includes(i)) {
        const idx = current.indexOf(i);
        current.splice(idx, 1);
      }
      selectedYearlyDays[monthNumber] = current;
    }
  });

  container.appendChild(dayBox);
}

  }
  
  function handleYearlyApplyToAllChange() {
    const checkbox = document.getElementById("yearly-apply-days-to-all");
    const dropdown = document.getElementById("yearly-month-select");
    const selectedMonths = getSelectedYearlyMonths();
  
    if (!checkbox || !dropdown) return;
  
    if (checkbox.checked) {
      dropdown.classList.add("hidden");
      if (selectedMonths.length > 0) {
        generateYearlyDayGrid(selectedMonths[0]); // Use any selected month for grid
      }
    } else {
      dropdown.classList.remove("hidden");
      const selectedMonth = parseInt(dropdown.value);
      generateYearlyDayGrid(selectedMonth);
    }
  }


  function getSelectedYearlyMonths() {
    return Array.from(document.querySelectorAll(".yearly-month-box.selected"))
                .map(el => parseInt(el.dataset.month));
  }

  function getSelectedMonthlyDays() {
    return Array.from(document.querySelectorAll(".monthly-day-box.selected"))
                .map(el => parseInt(el.dataset.day));
  }
  

function setupSpecificDatesPanel() {
  const checkbox = document.getElementById("recur-specific-dates");
  const panel = document.getElementById("specific-dates-panel");
  const timeOptions = document.getElementById("specific-date-time-options"); // ⬅️ New
  const addBtn = document.getElementById("add-specific-date");
  const list = document.getElementById("specific-date-list");

  const createDateInput = (isFirst = false) => {
    const wrapper = document.createElement("div");
    wrapper.className = "specific-date-item";

    const input = document.createElement("input");
    input.type = "date";
    const index = list.children.length;
    input.setAttribute("aria-label", isFirst ? "First specific date" : `Specific date ${index + 1}`);
    input.required = true;
    input.valueAsDate = getTomorrow();

    if (isFirst) {
        input.classList.add("first-specific-date");
      }

    input.addEventListener("change", () => {
      if (isFirst && !input.value) {
        input.valueAsDate = getTomorrow();
      }
    });

    wrapper.appendChild(input);

    if (!isFirst) {
      const trash = document.createElement("button");
      trash.type = "button";
      trash.className = "trash-btn";
      trash.innerHTML = "<i class='fas fa-trash recurring-date-trash-icon'></i>";
      trash.title = "Remove this date";


      trash.addEventListener("click", () => {
        wrapper.remove();
        updateRecurCountVisibility();
        updateRecurringSummary();
      });
      wrapper.appendChild(trash);
    }

    list.appendChild(wrapper);
  };

  checkbox.addEventListener("change", () => {
    const shouldShow = checkbox.checked;
  
    panel.classList.toggle("hidden", !shouldShow);
    timeOptions.classList.toggle("hidden", !shouldShow);
  
    // Hide all other recurrence panels
    document.querySelectorAll(".frequency-options").forEach(panel => {
      panel.classList.add("hidden");
    });
  
    document.getElementById("recur-frequency-container").classList.toggle("hidden", shouldShow);
    document.getElementById("recur-indefinitely").closest("label").classList.toggle("hidden", shouldShow);
  
    const advancedBtn = document.getElementById("toggle-advanced-settings");
    if (advancedBtn) {
      advancedBtn.classList.toggle("hidden", shouldShow);
    }
  
    if (shouldShow && list.children.length === 0) {
      createDateInput(true); // Add first date
    }
  
    if (!shouldShow) {
      document.getElementById("specific-date-specific-time").checked = false;
      document.getElementById("specific-date-time-container").classList.add("hidden");
  
      // ✅ Re-show frequency options by triggering dropdown change event
      const freqSelect = document.getElementById("recur-frequency");
      if (freqSelect) {
        const event = new Event("change");
        freqSelect.dispatchEvent(event);
      }
    }
  
    updateRecurCountVisibility();
    updateRecurringSummary();
  });

  addBtn.addEventListener("click", () => {
    createDateInput(false);
    updateRecurringSummary();
  });

  updateRecurringSummary();
}
  
  function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  function updateRecurCountVisibility() {
    const isIndefinite = document.getElementById("recur-indefinitely").checked;
    const isUsingSpecificDates = document.getElementById("recur-specific-dates").checked;
    const countContainer = document.getElementById("recur-count-container");
  
    // Only show if NOT using specific dates AND NOT recurring indefinitely
    const shouldShow = !isUsingSpecificDates && !isIndefinite;
    countContainer.classList.toggle("hidden", !shouldShow);
  }





  function updateRecurringButtonVisibility() {
    const autoReset = toggleAutoReset.checked;
    const deleteCheckedEnabled = deleteCheckedTasks.checked;
  
    document.querySelectorAll(".task").forEach(taskItem => {
      const recurringButton = taskItem.querySelector(".recurring-btn");
      if (!recurringButton) return;
  
      if (!autoReset && deleteCheckedEnabled) {
        recurringButton.classList.remove("hidden");
      } else {
        recurringButton.classList.add("hidden");
      }
    });
  }
  
  function updateRecurringPanelButtonVisibility() {
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
    const cycleData = savedMiniCycles?.[lastUsedMiniCycle];
    const button = document.getElementById("open-recurring-panel");
  
    if (!cycleData || !Array.isArray(cycleData.tasks) || !button) return;
  
    const hasRecurring = cycleData.tasks.some(task => task.recurring);
    button.classList.toggle("hidden", !hasRecurring);
  }
  

  function updateRecurringSummary() {
    const summaryEl = document.getElementById("recurring-summary");
    if (!summaryEl) return;
  
    const isSpecificDates = document.getElementById("recur-specific-dates").checked;
    const indefinitely = document.getElementById("recur-indefinitely").checked;
    const recurCount = document.getElementById("recur-count-input").value;
  
    // === ✅ SPECIFIC DATES HANDLING ===
    if (isSpecificDates) {
      const dateInputs = document.querySelectorAll("#specific-date-list input[type='date']");
      const dates = Array.from(dateInputs)
        .map(input => input.value)
        .filter(Boolean)
        .map(dateStr => {
          const date = parseDateAsLocal(dateStr);
          return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            weekday: "short"
          });
        });
  
      const usesTime = document.getElementById("specific-date-specific-time").checked;
      const hour = document.getElementById("specific-date-hour")?.value || "--";
      const minute = document.getElementById("specific-date-minute")?.value || "--";
      const meridiem = document.getElementById("specific-date-meridiem")?.value || "";
      const isMilitary = document.getElementById("specific-date-military")?.checked;
  
      let summary = `📅 Specific dates: `;
      summary += dates.length ? dates.join(", ") : "No dates selected yet.";
  
      if (usesTime && hour && minute) {
        const formattedTime = isMilitary
          ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
          : `${hour}:${minute.padStart(2, "0")} ${meridiem}`;
        summary += ` ⏰ Time: ${formattedTime}`;
      }
  
      summaryEl.textContent = summary;
      summaryEl.classList.remove("hidden");
      return;
    }
  
    // === 🔁 GENERAL FREQUENCY HANDLING ===
    const frequency = document.getElementById("recur-frequency").value;
    let summaryText = `⏱ Repeats ${frequency}`;
  
    if (!indefinitely && recurCount) {
      summaryText += ` for ${recurCount} time${recurCount !== "1" ? "s" : ""}`;
    } else {
      summaryText += ` indefinitely`;
    }
  
    // === 🕒 TIME HANDLING FOR EACH FREQUENCY ===
    const addTimeSummary = (prefix, freq) => {
      const use24h = document.getElementById(`${freq}-military`)?.checked;
      const hour = document.getElementById(`${freq}-hour`)?.value;
      const minute = document.getElementById(`${freq}-minute`)?.value;
      const meridiem = document.getElementById(`${freq}-meridiem`)?.value;
  
      if (hour && minute) {
        const time = use24h
          ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
          : `${hour}:${minute.padStart(2, "0")} ${meridiem}`;
        summaryText += ` at ${time}`;
      }
    };
  
    const addDaySummary = (freq) => {
      const selectedDays = Array.from(document.querySelectorAll(`.${freq}-day-box.selected`)).map(el => el.dataset.day);
      if (selectedDays.length) {
        summaryText += ` on ${selectedDays.join(", ")}`;
      }
    };
  
    const addMonthlyDaySummary = () => {
      const selected = Array.from(document.querySelectorAll(".monthly-day-box.selected")).map(el => el.textContent);
      if (selected.length) {
        summaryText += ` on day${selected.length > 1 ? "s" : ""} ${selected.join(", ")}`;
      }
    };
  
    const addYearlyMonthDaySummary = () => {
      const selectedMonths = Array.from(document.querySelectorAll(".yearly-month-box.selected")).map(el => el.textContent);
      const selectedDays = Array.from(document.querySelectorAll(".yearly-day-box.selected")).map(el => el.textContent);
  
      if (selectedMonths.length) {
        summaryText += ` in ${selectedMonths.join(", ")}`;
      }
  
      if (selectedDays.length) {
        summaryText += ` on day${selectedDays.length > 1 ? "s" : ""} ${selectedDays.join(", ")}`;
      }
    };
  
    switch (frequency) {
      case "hourly":
        const useSpecificMinute = document.getElementById("hourly-specific-time")?.checked;
        const minuteVal = document.getElementById("hourly-minute")?.value;
        if (useSpecificMinute && minuteVal !== "") {
          summaryText += ` every hour at :${minuteVal.padStart(2, "0")}`;
        }
        break;
  
      case "daily":
        if (document.getElementById("daily-specific-time")?.checked) {
          addTimeSummary("at", "daily");
        }
        break;
  
      case "weekly":
      case "biweekly":
        if (document.getElementById(`${frequency}-specific-days`)?.checked) {
          addDaySummary(frequency);
        }
        if (document.getElementById(`${frequency}-specific-time`)?.checked) {
          addTimeSummary("at", frequency);
        }
        break;
  
      case "monthly":
        if (document.getElementById("monthly-specific-days")?.checked) {
          addMonthlyDaySummary();
        }
        if (document.getElementById("monthly-specific-time")?.checked) {
          addTimeSummary("at", "monthly");
        }
        break;
  
        case "yearly":
            const monthsSelected = getSelectedYearlyMonths();
            const applyAll = document.getElementById("yearly-apply-days-to-all")?.checked;
          
            if (monthsSelected.length) {
              const monthNames = monthsSelected.map(m =>
                new Date(0, m - 1).toLocaleString("default", { month: "short" })
              );
          
              summaryText += ` in ${monthNames.join(", ")}`;
            }
          
            if (document.getElementById("yearly-specific-days")?.checked) {
              if (applyAll) {
                const days = selectedYearlyDays["all"] || [];
                if (days.length) {
                  summaryText += ` on day${days.length > 1 ? "s" : ""} ${days.join(", ")}`;
                }
              } else {
                const parts = monthsSelected.map(month => {
                  const days = selectedYearlyDays[month] || [];
                  if (days.length === 0) return null;
          
                  const monthName = new Date(0, month - 1).toLocaleString("default", { month: "short" });
                  return `${monthName}: ${days.join(", ")}`;
                }).filter(Boolean);
          
                if (parts.length) {
                  summaryText += ` on ${parts.join("; ")}`;
                }
              }
            }
          
            if (document.getElementById("yearly-specific-time")?.checked) {
              addTimeSummary("at", "yearly");
            }
            break;
    }
  
    summaryEl.textContent = summaryText;
    summaryEl.classList.remove("hidden");
  }

  function parseDateAsLocal(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }


  
  function attachRecurringSummaryListeners() {
    const panel = document.getElementById("recurring-settings-panel");
    safeAddEventListener(panel, "change", handleRecurringChange);
    safeAddEventListener(panel, "click", handleRecurringClick);
  }





  function showTaskSummaryPreview(task) {
    const summaryContainer = document.getElementById("recurring-summary-preview") || createTaskSummaryPreview();
    
    // Clear out the container first
    summaryContainer.innerHTML = "";
  
    // Add label/header
    const label = document.createElement("div");
    label.textContent = "Current Recurring Settings:";
    label.className = "summary-label";
    summaryContainer.appendChild(label);
  
    // Add summary text
    const summaryText = document.createElement("div");
    summaryText.className = "summary-text";
    summaryText.textContent = getRecurringSummaryText(task);
    summaryContainer.appendChild(summaryText);
  
    // Add change button
    const changeBtn = document.createElement("button");
    changeBtn.textContent = "Change Recurring Settings";
    changeBtn.className = "change-recurring-btn";
  
    const settingsPanel = document.getElementById("recurring-settings-panel");
    if (!settingsPanel.classList.contains("hidden")) {
      changeBtn.classList.add("hidden");
    }
  
  
    changeBtn.addEventListener("click", () => {
        openRecurringSettingsPanelForTask(task.id);
      });


    summaryContainer.appendChild(changeBtn);
    summaryContainer.classList.remove("hidden");
  }

  
  // Helper to create the preview container if it doesn’t exist yet
  function createTaskSummaryPreview() {
    const container = document.createElement("div");
    container.id = "recurring-summary-preview";
    container.className = "recurring-summary recurring-summary-preview hidden";
    document.getElementById("recurring-panel").appendChild(container);
    return container;
  }
  
  // Utility to build a readable summary string (simplified)
  function getRecurringSummaryText(task) {
    const freq = task.recurFrequency || "daily";
    const count = task.recurCount;
    const indefinitely = task.recurIndefinitely;
    let text = `⏱ Repeats ${freq}`;
    if (!indefinitely && count) text += ` for ${count} time${count !== 1 ? "s" : ""}`;
    else text += " indefinitely";
    return text;
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
                id: task.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // ✅ Add fallback if old task had no ID
                text: task.text,
                completed: task.completed || false,
                dueDate: task.dueDate || null,
                highPriority: task.highPriority || false,
                remindersEnabled: task.remindersEnabled || false,
                recurring: task.recurring || false
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
                                id: task.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // ✅ Generate fallback ID
                                text: task.text,
                                completed: task.completed || false,
                                dueDate: task.dueDate || null,
                                highPriority: task.highPriority || false,
                                remindersEnabled: task.remindersEnabled || false,
                                recurring: task.recurring || false
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
                        console.error("Import error:", error);
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


document.getElementById("feedback-form").addEventListener("submit", (e) => {
    const textarea = document.getElementById("feedback-text");
    textarea.value = sanitizeInput(textarea.value);
});


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
                resetTasks(); // ✅ Then reset tasks
            }, 1000);
            return;
        }
    }
    console.log("ran check MiniCyle function");
    updateProgressBar();
    updateStatsPanel();
    autoSave();
    console.log("ran check MiniCyle function2");
}

/**
 * Incrementcyclecount function.
 *
 * @param {any} miniCycleName - Description.
 * @param {any} savedMiniCycles - Description. * @returns {void}
 */

function incrementCycleCount(miniCycleName, savedMiniCycles) {
    let cycleData = savedMiniCycles[miniCycleName];
    if (!cycleData) return;

    cycleData.cycleCount = (cycleData.cycleCount || 0) + 1;
    localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));

    console.log(`✅ Mini Cycle count updated for "${miniCycleName}": ${cycleData.cycleCount}`);

    // ✅ Handle milestone rewards
    handleMilestoneUnlocks(miniCycleName, cycleData.cycleCount);

    // ✅ Show animation + update stats
    showCompletionAnimation();
    updateStatsPanel();
}


function handleMilestoneUnlocks(miniCycleName, cycleCount) {
    // ✅ Show milestone achievement message
    checkForMilestone(miniCycleName, cycleCount);

    // ✅ Theme unlocks
    if (cycleCount >= 5) {
        unlockDarkOceanTheme();
    }
    if (cycleCount >= 50) {
        unlockGoldenGlowTheme();
    }

    // ✅ Game unlock
    if (cycleCount >= 100) {
        const unlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};
        if (!unlocks.taskOrderGame) {
            showNotification("🎮 Game Unlocked! 'Task Order' is now available in the Games menu.", "success", 6000);
            unlockMiniGame();
        }
    }
}

function unlockMiniGame() {
    let unlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};
    unlocks.taskOrderGame = true;
    localStorage.setItem("milestoneUnlocks", JSON.stringify(unlocks));
    checkGamesUnlock();
}


function unlockDarkOceanTheme() {
    console.log("unlock Ocean theme Ran");
    // Load current theme data
    let milestoneUnlocks = JSON.parse(localStorage.getItem('milestoneUnlocks')) || {};
    
    // Only proceed if theme isn't already unlocked
    if (!milestoneUnlocks.darkOcean) {
        console.log("🎨 Unlocking Dark Ocean theme for first cycle completion!");
        
        // Mark theme as unlocked
        milestoneUnlocks.darkOcean = true;
        localStorage.setItem('milestoneUnlocks', JSON.stringify(milestoneUnlocks));
        refreshThemeToggles();
        
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
    refreshThemeToggles();
}

function unlockGoldenGlowTheme() {
    console.log("unlock Golden Glow theme Ran");
    let milestoneUnlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};

    if (!milestoneUnlocks.goldenGlow) {
        console.log("🎨 Unlocking Golden Glow theme at 50 cycles!");

        milestoneUnlocks.goldenGlow = true;
        localStorage.setItem("milestoneUnlocks", JSON.stringify(milestoneUnlocks));
        refreshThemeToggles();

        // Show the theme container (if hidden)
        const themeContainer = document.querySelector('.theme-container');
        if (themeContainer) {
            themeContainer.classList.remove('hidden');
        }

        // Show the theme toggle if it exists
        const themeButton = document.getElementById("open-themes-panel");
        if (themeButton) {
            themeButton.style.display = "block";
        }

        showNotification("🌟 New theme unlocked: Golden Glow! Check the themes menu to activate it.", "success", 5000);
    }
}



function initializeThemesPanel() {
    console.log("🌈 Initializing Theme Panel");

    const existingContainer = document.querySelector('.theme-container');
    if (existingContainer) return; // Prevent duplicates

    const themeContainer = document.createElement('div');
    themeContainer.className = 'theme-container';
    themeContainer.id = 'theme-container';

    const themeOptionContainer = document.createElement('div');
    themeOptionContainer.className = 'theme-option-container';
    themeOptionContainer.id = 'theme-option-container'; // 👈 We'll update this later

    themeContainer.appendChild(themeOptionContainer);

    // Inject into modal
    const themeSection = document.getElementById("theme-options-section");
    themeSection.appendChild(themeContainer);

    // Setup toggle logic
    refreshThemeToggles(); // ⬅ Run this on load
}

// ✅ Rebuild toggles based on unlocked themes
function refreshThemeToggles() {
    const container = document.getElementById("theme-option-container");
    container.innerHTML = ""; // 🧹 Clear current options

    const milestoneUnlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};
    const currentTheme = localStorage.getItem("currentTheme");

    const themeList = [
        {
          id: "DarkOcean",
          class: "dark-ocean",
          label: "Dark Ocean Theme 🌊",
          storageKey: "darkOcean"
        },
        {
          id: "GoldenGlow",
          class: "golden-glow",
          label: "Golden Glow Theme 🌟",
          storageKey: "goldenGlow"
        }
      ];

    themeList.forEach(theme => {
        if (!milestoneUnlocks[theme.storageKey]) return;

        const label = document.createElement("label");
        label.className = "custom-checkbox";
        label.innerHTML = `
            <input type="checkbox" id="toggle${theme.id}Theme" class="theme-toggle">
            <span class="checkmark"></span>
            ${theme.label}
        `;

        container.appendChild(label);

        const checkbox = label.querySelector("input");
        checkbox.checked = currentTheme === theme.class;

        checkbox.addEventListener("change", function () {
            if (this.checked) {
                document.querySelectorAll(".theme-toggle").forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
                applyTheme(theme.class);
            } else {
                applyTheme("default");
            }
        });
    });
}

// ✅ Close Themes Modal when clicking outside of the modal content
window.addEventListener("click", (event) => {
    const themesModal = document.getElementById("themes-modal");
    

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

    
    function addTask(taskText, completed = false, shouldSave = true, dueDate = null, highPriority = null, isLoading = false, remindersEnabled = false, recurring = false, taskId = null) {
       
       
        if (typeof taskText !== "string") {
            console.error("❌ Error: taskText is not a string", taskText);
            return;
        }
        
        // ⛑️ Sanitize input early to avoid unsafe values spreading
        let taskTextTrimmed = sanitizeInput(taskText.trim());
        if (!taskTextTrimmed) {
            console.warn("⚠ Skipping empty or unsafe task.");
            return;
        }
        
        if (taskTextTrimmed.length > TASK_LIMIT) {
            showNotification(`Task must be ${TASK_LIMIT} characters or less.`);
            return;
        }

        
        // ✅ Get settings before creating task
        const autoResetEnabled = toggleAutoReset.checked;
        const reminderSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
        const remindersEnabledGlobal = reminderSettings.enabled === true;
        
        // ✅ Create Task Element
        const taskItem = document.createElement("li");
        taskItem.classList.add("task");
        taskItem.setAttribute("draggable", "true");
   

    // ✅ Use the passed-in taskId if it exists, otherwise generate a new one
        const assignedTaskId = taskId || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        taskItem.dataset.taskId = assignedTaskId;
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

       // ✅ Prep logic first
        const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
        const cycleData = savedMiniCycles?.[lastUsedMiniCycle] ?? {};
        const deleteCheckedEnabled = cycleData.deleteCheckedTasks;

        // ✅ Then define your condition:
        const showRecurring = !autoResetEnabled && deleteCheckedEnabled;
    
        // ✅ Task Buttons (Including Reminder Button)
        const buttons = [
            { class: "move-up", icon: "▲", show: true },
            { class: "move-down", icon: "▼", show: true },
            { class: "recurring-btn", icon: "<i class='fas fa-repeat'></i>", show: showRecurring },
            { class: "set-due-date", icon: "<i class='fas fa-calendar-alt'></i>", show: !autoResetEnabled },
            { class: "enable-task-reminders", icon: "<i class='fas fa-bell'></i>", show: remindersEnabled || remindersEnabledGlobal, toggle: true },
            { class: "priority-btn", icon: "<i class='fas fa-exclamation-triangle'></i>", show: true },
            { class: "edit-btn", icon: "<i class='fas fa-edit'></i>", show: true },
            { class: "delete-btn", icon: "<i class='fas fa-trash'></i>", show: true }
          ];
        
          buttons.forEach(({ class: btnClass, icon, toggle = false, show }) => {
            const button = document.createElement("button");
            button.classList.add("task-btn", btnClass);
            button.innerHTML = icon;
                // ✅ Prevent it from behaving like a submit button in a form
             button.setAttribute("type", "button")
            // Always add it to keep button order stable
            if (!show) button.classList.add("hidden"); // ✅ Keeps layout stable
 
            // ⌨️ Keyboard: Enter/Space Activation
            button.setAttribute("tabindex", "0");
            button.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                button.click();
                }

                // ⬅️➡️ Left/Right Arrow Navigation
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const focusable = Array.from(buttonContainer.querySelectorAll("button.task-btn"));
                const currentIndex = focusable.indexOf(e.target);
                const nextIndex = e.key === "ArrowRight"
                    ? (currentIndex + 1) % focusable.length
                    : (currentIndex - 1 + focusable.length) % focusable.length;
                focusable[nextIndex].focus();
                e.preventDefault();
                }
            });
                    
            // ARIA label setup
            const ariaLabels = {
                "move-up": "Move task up",
                "move-down": "Move task down",
                "recurring-btn": "Toggle recurring task",
                "set-due-date": "Set due date",
                "enable-task-reminders": "Toggle reminders for this task",
                "priority-btn": "Mark task as high priority",
                "edit-btn": "Edit task",
                "delete-btn": "Delete task"
            };
            button.setAttribute("aria-label", ariaLabels[btnClass] || "Task action");
        
            // ARIA toggle state setup
            if (btnClass === "enable-task-reminders") {
                const isActive = remindersEnabled === true;
                button.classList.toggle("reminder-active", isActive);
                button.setAttribute("aria-pressed", isActive.toString());
            } else if (["recurring-btn", "priority-btn"].includes(btnClass)) {
                const isActive = btnClass === "recurring-btn" ? !!recurring : !!highPriority;
                button.classList.toggle("active", isActive);
                button.setAttribute("aria-pressed", isActive.toString());
            }
            
        
            // Custom logic for specific buttons
            if (btnClass === "recurring-btn") {
                button.addEventListener("click", () => {
                    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
                    const taskList = savedMiniCycles?.[lastUsedMiniCycle]?.tasks;
                    const taskIdFromDom = taskItem.dataset.taskId;
        
                    if (!taskList) return;
                    const targetTask = taskList.find(task => task.id === taskIdFromDom);
                    if (!targetTask) return;
        
                    targetTask.recurring = !targetTask.recurring;
                    button.classList.toggle("active", targetTask.recurring);
                    button.setAttribute("aria-pressed", targetTask.recurring.toString());
        
                    autoSave();
                    updateRecurringPanelButtonVisibility();
                    updateRecurringPanel?.();
                });
            } else if (btnClass === "enable-task-reminders") {
                button.addEventListener("click", () => {
                    const isActive = button.classList.toggle("reminder-active");
                    button.setAttribute("aria-pressed", isActive.toString());
                    saveTaskReminderState(assignedTaskId, isActive);
                    autoSaveReminders();
                    startReminders();
                    
                });
            } else {
                // All other buttons use the shared handler
                button.addEventListener("click", handleTaskButtonClick);
            }
        
            buttonContainer.appendChild(button);
        });
    
 
        
        console.log(`📌 Loading Task: ${taskTextTrimmed}, Reminder Enabled: ${remindersEnabled}`);
      
        
        
        
    
        taskItem.appendChild(buttonContainer);
    
        // ✅ Checkbox for Completion
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.setAttribute("id", `checkbox-${assignedTaskId}`);
        checkbox.setAttribute("name", `task-complete-${assignedTaskId}`);
        checkbox.checked = completed;
        checkbox.setAttribute("aria-label", `Mark task "${taskTextTrimmed}" as complete`);
        checkbox.setAttribute("role", "checkbox");
        checkbox.setAttribute("aria-checked", checkbox.checked);
        safeAddEventListener(checkbox, "change", () => {
            handleTaskCompletionChange(checkbox);
            checkMiniCycle();
            autoSave();
            triggerLogoBackground(checkbox.checked ? 'green' : 'default', 300);
        });
        safeAddEventListener(checkbox, "keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); // Prevent scrolling or default behavior
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change")); // Reuse your logic above!
            }
        });
    
        // ✅ Ensure `.task-text` Exists
        const taskLabel = document.createElement("span");
        taskLabel.classList.add("task-text");
        taskLabel.textContent = taskTextTrimmed;
        taskLabel.setAttribute("tabindex", "0");
        taskLabel.setAttribute("role", "text"); // optional for semantics
            
        // ✅ Due Date Input (Hidden by Default)
        const dueDateInput = document.createElement("input");
        dueDateInput.type = "date";
        dueDateInput.classList.add("due-date");
        dueDateInput.setAttribute("aria-describedby", `task-desc-${assignedTaskId}`);
        taskLabel.id = `task-desc-${assignedTaskId}`;   
    
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
                dueDateButton.classList.toggle("active", !dueDateInput.classList.contains("hidden"));
            });
        }
        
    
        // ✅ Toggle Completion on Click (excluding buttons)
        taskItem.addEventListener("click", (event) => {
            if (event.target === checkbox || buttonContainer.contains(event.target) || event.target === dueDateInput) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event("change")); // Manually trigger change event
            checkbox.setAttribute("aria-checked", checkbox.checked);
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
            priorityButton.setAttribute("aria-pressed", "true");
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


        safeAddEventListener(taskItem, "focus", () => {
            const options = taskItem.querySelector(".task-options");
            if (options) {
                options.style.opacity = "1";
                options.style.visibility = "visible";
                options.style.pointerEvents = "auto";
            }
        });
        // ⌨️ Accessibility: show task buttons on keyboard focus
    attachKeyboardTaskOptionToggle(taskItem);
    }
    

/**
 * ✅ Sanitize user input to prevent XSS attacks or malformed content.
 * @param {string} input - The user input to be sanitized.
 * @returns {string} - Cleaned and safe string, trimmed and limited in length.
 */
function sanitizeInput(input) {
    if (typeof input !== "string") return "";
    const temp = document.createElement("div");
    temp.textContent = input; // Set as raw text (sanitized)
    return temp.textContent.trim().substring(0, TASK_LIMIT); // <-- use textContent here too
  }

    /**
 * ⌨️ Accessibility Helper: Toggles visibility of task buttons when task item is focused or blurred.
 * 
 * When navigating with the keyboard (e.g., using Tab), this ensures that the task option buttons
 * (edit, delete, reminders, etc.) are shown while the task is focused and hidden when it loses focus.
 * 
 * This provides a keyboard-accessible experience similar to mouse hover.
 *
 * @param {HTMLElement} taskItem - The task <li> element to attach listeners to.
 */
function attachKeyboardTaskOptionToggle(taskItem) {
    safeAddEventListener(taskItem, "focus", () => {
        const options = taskItem.querySelector(".task-options");
        if (options) {
            options.style.opacity = "1";
            options.style.visibility = "visible";
            options.style.pointerEvents = "auto";
        }
    });

/**
 * ⌨️ Enhanced Accessibility: Keep task buttons visible while tabbing inside the same task.
 * Only hide when focus moves outside the task entirely.
 */
safeAddEventListener(taskItem, "focusin", () => {
    const options = taskItem.querySelector(".task-options");
    if (options) {
        options.style.opacity = "1";
        options.style.visibility = "visible";
        options.style.pointerEvents = "auto";
    }
});

// ✅ Use 'focusout' and check if focus moved outside the task
safeAddEventListener(taskItem, "focusout", (e) => {
    // If the newly focused element is still inside the task, do nothing
    if (taskItem.contains(e.relatedTarget)) return;

    const options = taskItem.querySelector(".task-options");
    if (options) {
        options.style.opacity = "0";
        options.style.visibility = "hidden";
        options.style.pointerEvents = "none";
    }
});
}



    /**
 * Updatereminderbuttons function.
 *
 * @returns {void}
 */

  
    function updateReminderButtons() {
        console.log("🔍 Running updateReminderButtons()...");
      
        const reminderSettings = JSON.parse(localStorage.getItem("miniCycleReminders")) || {};
        const remindersGloballyEnabled = reminderSettings.enabled === true;
      
        document.querySelectorAll(".task").forEach(taskItem => {
          const buttonContainer = taskItem.querySelector(".task-options");
          let reminderButton = buttonContainer.querySelector(".enable-task-reminders");
      
          const taskId = taskItem.dataset.taskId;
          if (!taskId) {
            console.warn("⚠ Skipping task with missing ID:", taskItem);
            return;
          }
      
          const savedTasks = JSON.parse(localStorage.getItem("miniCycleStorage")) || {};
          const lastUsedMiniCycle = localStorage.getItem("lastUsedMiniCycle");
          const taskData = savedTasks[lastUsedMiniCycle]?.tasks?.find(t => t.id === taskId);
      
          const isActive = taskData?.remindersEnabled === true;
      
          if (remindersGloballyEnabled) {
            if (!reminderButton) {
              // ✅ Create Reminder Button
              reminderButton = document.createElement("button");
              reminderButton.classList.add("task-btn", "enable-task-reminders");
              reminderButton.innerHTML = "<i class='fas fa-bell'></i>";
      
              // Add click event
              reminderButton.addEventListener("click", () => {
                const nowActive = reminderButton.classList.toggle("reminder-active");
                reminderButton.setAttribute("aria-pressed", nowActive.toString());
                saveTaskReminderState(taskId, nowActive);
                autoSaveReminders();
              });
      
              buttonContainer.insertBefore(reminderButton, buttonContainer.children[2]);
              console.log("   ✅ Reminder Button Created & Inserted");
            }
      
            // ✅ Ensure correct state and make it visible
            reminderButton.classList.toggle("reminder-active", isActive);
            reminderButton.setAttribute("aria-pressed", isActive.toString());
            reminderButton.classList.remove("hidden");
      
            console.log(`   🔄 Reminder Button Visible - Active: ${isActive}`);
          } else {
            // ❌ Hide button if reminders are disabled globally
            if (reminderButton) {
              reminderButton.classList.add("hidden"); // Don't remove it; just hide for layout consistency
              reminderButton.classList.remove("reminder-active");
              reminderButton.setAttribute("aria-pressed", "false");
      
              console.log("   🔕 Reminder Button Hidden (Global toggle OFF)");
            }
          }
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
    
        // ✅ Only show options/buttons if on desktop or long-pressed on mobile
        const allowShow = !isMobile || taskElement.classList.contains("long-pressed");
    
        if (allowShow) {
            if (taskOptions) {
                taskOptions.style.visibility = "visible";
                taskOptions.style.opacity = "1";
                taskOptions.style.pointerEvents = "auto";
            }
    
            taskButtons.forEach(button => {
                button.style.visibility = "visible";
                button.style.opacity = "1";
                button.style.pointerEvents = "auto";
            });
        }
    
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
            const cleanText = sanitizeInput(newText.trim());
            taskLabel.textContent = cleanText;
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
    if (isResetting) return; // Prevent double-call
    isResetting = true;
    

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

    // ✅ Count this as a completed cycle
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
    if (lastUsedMiniCycle && savedMiniCycles[lastUsedMiniCycle]) {
        incrementCycleCount(lastUsedMiniCycle, savedMiniCycles);
    }

    updateStatsPanel();

    // ✅ Show cycle complete message
    cycleMessage.style.visibility = "visible";
    cycleMessage.style.opacity = "1";

    progressBar.style.width = "0%";

    setTimeout(() => {
        cycleMessage.style.opacity = "0";
        cycleMessage.style.visibility = "hidden";
        isResetting = false; 
    }, 2000);

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
            const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
            
            if (!lastUsedMiniCycle || !savedMiniCycles[lastUsedMiniCycle]) return;
    
            savedMiniCycles[lastUsedMiniCycle].deleteCheckedTasks = event.target.checked;
            localStorage.setItem("miniCycleStorage", JSON.stringify(savedMiniCycles));
    
            // ✅ Update recurring button visibility in real-time
            updateRecurringButtonVisibility();
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



// ✅ Function to complete all tasks and handle reset
function handleCompleteAllTasks() {
    const { lastUsedMiniCycle, savedMiniCycles } = assignCycleVariables();
    const cycleData = savedMiniCycles[lastUsedMiniCycle];

    // ✅ Ensure there's an active Mini Cycle
    if (!lastUsedMiniCycle || !cycleData) return;


// ✅ Only show alert if tasks will be reset (not deleted)
if (!cycleData.deleteCheckedTasks) {
    const hasDueDates = [...taskList.querySelectorAll(".due-date")].some(
        dueDateInput => dueDateInput.value
    );

    if (hasDueDates) {
        const confirmReset = confirm(
            "⚠️ This will complete all tasks and reset them to an uncompleted state.\n\nAny assigned Due Dates will be cleared.\n\nProceed?"
        );
        if (!confirmReset) return; // ❌ Stop if user cancels
    }
}

    if (cycleData.deleteCheckedTasks) {
        const checkedTasks = document.querySelectorAll(".task input:checked");
        if (checkedTasks.length === 0) {
            showNotification("⚠️ No tasks were selected for deletion.", "default", 3000);
            return; // ✅ Stop early
        }

        checkedTasks.forEach(checkbox => {
            checkbox.closest(".task").remove();
        });

        autoSave();
        // ✅ Delete all checked tasks if the option is enabled
        document.querySelectorAll(".task input:checked").forEach(checkbox => {
            checkbox.closest(".task").remove();
        });

        autoSave(); // ✅ Save changes after deletion
    } else {
        // ✅ If "Delete Checked Tasks" is OFF, just mark all as complete
        taskList.querySelectorAll(".task input").forEach(task => task.checked = true);
        checkMiniCycle();

        // ✅ Only call resetTasks() if autoReset is OFF
        if (!cycleData.autoReset) {
            setTimeout(resetTasks, 1000);
        }
    }
}

// ✅ Use the new function with safe listener
safeAddEventListener(completeAllButton, "click", handleCompleteAllTasks);


/***********************
 * 
 * 
 * Add Event Listeners
 * 
 * 
 ************************/
// 🟢 Add Task Button (Click)
safeAddEventListener(addTaskButton, "click", () => {
    const taskText = taskInput.value ? taskInput.value.trim() : "";
    if (!taskText) {
        console.warn("⚠ Cannot add an empty task.");
        return;
    }
    addTask(taskText);
    taskInput.value = "";
});

// 🟢 Task Input (Enter Key)
safeAddEventListener(taskInput, "keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const taskText = taskInput.value ? taskInput.value.trim() : "";
        if (!taskText) {
            console.warn("⚠ Cannot add an empty task.");
            return;
        }
        addTask(taskText);
        taskInput.value = "";
    }
});

// 🟢 Menu Button (Click)
safeAddEventListener(menuButton, "click", (event) => {
    event.stopPropagation();
    saveToggleAutoReset();
    menu.classList.toggle("visible");

    if (menu.classList.contains("visible")) {
        document.addEventListener("click", closeMenuOnClickOutside);
    }
});


safeAddEventListenerById("reset-notification-position", "click", resetNotificationPosition);


document.getElementById("open-reminders-modal").addEventListener("click", () => {
    document.getElementById("reminders-modal").style.display = "flex";
  });
  

  safeAddEventListenerById("reset-onboarding", "click", () => {
    localStorage.removeItem("miniCycleOnboarding");
    showNotification("✅ Onboarding will show again next time you open the app.");
  });


// 🟢 Safe Global Click for Hiding Task Buttons
safeAddEventListener(document, "click", (event) => {
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
            task.classList.remove("draggable");
            task.classList.remove("dragging");
        });
    }
});

// 🟢 Safe Global Click for Deselecting Mini Cycle in Switch Modal
safeAddEventListener(document, "click", (event) => {
    const switchModalContent = document.querySelector(".mini-cycle-switch-modal-content");
    const selectedCycle = document.querySelector(".mini-cycle-switch-item.selected");
    const switchItemsRow = document.getElementById("switch-items-row");
    const previewWindow = document.querySelector(".switch-preview-window");

    if (
        switchModalContent?.contains(event.target) &&
        selectedCycle &&
        !event.target.classList.contains("mini-cycle-switch-item") &&
        !previewWindow?.contains(event.target)
    ) {
        selectedCycle.classList.remove("selected");
        switchItemsRow.style.display = "none";
    }
});




// ✅ Modal Utility Functions
function closeAllModals() {
    document.querySelectorAll("[data-modal]").forEach(modal => {
        // Special handling for menu
        if (modal.dataset.menu !== undefined) {
            modal.classList.remove("visible");
        } else {
            modal.style.display = "none";
        }
    });

    // Optionally close task options too
    document.querySelectorAll(".task-options").forEach(action => {
        action.style.opacity = "0";
        action.style.visibility = "hidden";
        action.style.pointerEvents = "none";
    });

    document.querySelectorAll(".task").forEach(task => {
        task.classList.remove("long-pressed", "draggable", "dragging");
    });
}

// ✅ ESC key listener to close modals and reset task UI
safeAddEventListener(document, "keydown", (e) => {
    if (e.key === "Escape") {
        closeAllModals();
    }
});











/*****SPEACIAL EVENT LISTENERS *****/

document.addEventListener("dragover", (event) => {
    event.preventDefault();
    requestAnimationFrame(() => {
        handleRearrange(event.target, event);
    });
    autoSave();
}); 

document.addEventListener("touchstart", () => {
    hasInteracted = true;
}, { once: true });



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
const liveRegion = document.getElementById("live-region");

// Detect swipe start
document.addEventListener("touchstart", (event) => {
    if (isDraggingNotification) return;
    startX = event.touches[0].clientX;
    isSwiping = true;
});

// Detect swipe move
document.addEventListener("touchmove", (event) => {
    if (!isSwiping || isDraggingNotification) return;
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





function handleThemeToggleClick() {
    const themeMessage = document.getElementById("theme-unlock-message");
    const goldenMessage = document.getElementById("golden-unlock-message");
    const gameMessage = document.getElementById("game-unlock-message");
    const toggleIcon = document.querySelector("#theme-unlock-status .toggle-icon");
  
    const milestoneUnlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};
  
    // 🔁 Always toggle theme message
    themeMessage.classList.toggle("visible");
  
    // 🔁 Toggle golden glow if present
    if (goldenMessage.textContent && goldenMessage.textContent !== "Loading...") {
      goldenMessage.classList.toggle("visible");
    }
  
    // 🔒 Only toggle game message if Golden Glow has been unlocked
    if (milestoneUnlocks.goldenGlow && gameMessage.textContent && gameMessage.textContent !== "Loading...") {
      gameMessage.classList.toggle("visible");
    }
  
    // ⬇️ Update toggle arrow
    if (toggleIcon) {
      const anyVisible =
        themeMessage.classList.contains("visible") ||
        goldenMessage.classList.contains("visible") ||
     gameMessage.classList.contains("visible");
  
      toggleIcon.textContent = anyVisible ? "▲" : "▼";
    }
  }

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
        const isUnlocked = cycleCount >= milestone;
    
        badge.classList.toggle("unlocked", isUnlocked);
    
        // Reset theme badge classes
        badge.classList.remove("ocean-theme", "golden-theme", "game-unlocked"); // 🆕 Reset game-unlocked
    
        // Assign custom theme class if applicable
        if (isUnlocked) {
            if (milestone === 5) {
                badge.classList.add("ocean-theme");
            } else if (milestone === 50) {
                badge.classList.add("golden-theme");
            } else if (milestone === 100) {
                badge.classList.add("game-unlocked"); 
            }
        }
    });
    updateThemeUnlockStatus(cycleCount);
    
}

function updateThemeUnlockStatus(cycleCount) {
    const milestoneUnlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};
  
    const themeMessage = document.getElementById("theme-unlock-message");
    const goldenMessage = document.getElementById("golden-unlock-message");
    const gameMessage = document.getElementById("game-unlock-message");
    const themeSection = document.getElementById("theme-unlock-status");
    const toggleIcon = themeSection.querySelector(".toggle-icon");
  
    // === 🌊 DARK OCEAN THEME ===
    if (milestoneUnlocks.darkOcean) {
      themeMessage.textContent = "🌊 Dark Ocean Theme unlocked! 🔓";
      themeMessage.classList.add("unlocked-message");
    } else {
      const needed = Math.max(0, 5 - cycleCount);
      themeMessage.textContent = `🔒 Only ${needed} more cycle${needed !== 1 ? "s" : ""} to unlock 🌊 Dark Ocean Theme!`;
      themeMessage.classList.remove("unlocked-message");
    }
  
    // === 🌟 GOLDEN GLOW THEME === (Only show if Ocean is unlocked)
    if (milestoneUnlocks.darkOcean) {
      if (cycleCount >= 50) {
        goldenMessage.textContent = "🌟 Golden Glow Theme unlocked! 🔓";
        goldenMessage.classList.add("unlocked-message");
  
        if (!milestoneUnlocks.goldenGlow) {
          milestoneUnlocks.goldenGlow = true;
          localStorage.setItem("milestoneUnlocks", JSON.stringify(milestoneUnlocks));
        }
      } else {
        const needed = 50 - cycleCount;
        goldenMessage.textContent = `🔒 ${needed} more cycle${needed !== 1 ? "s" : ""} to unlock 🌟 Golden Glow Theme!`;
        goldenMessage.classList.remove("unlocked-message");
      }
    } else {
      goldenMessage.textContent = "";
      goldenMessage.classList.remove("unlocked-message", "visible");
    }
  
    // === 🎮 TASK ORDER GAME === (Only show if Golden Glow unlocked)
    const showGameHint = milestoneUnlocks.goldenGlow;
    if (showGameHint && gameMessage) {
      const cyclesLeft = Math.max(0, 100 - cycleCount);
    
      if (milestoneUnlocks.taskOrderGame) {
        gameMessage.textContent = "🎮 Task Whack-a-Order Game unlocked! 🔓";
        gameMessage.classList.add("unlocked-message");
      } else {
        gameMessage.textContent = `🔒 Only ${cyclesLeft} more cycle${cyclesLeft !== 1 ? "s" : ""} to unlock 🎮 Task Order Game!`;
        gameMessage.classList.remove("unlocked-message");
      }
    } else {
      gameMessage.textContent = "";
      gameMessage.classList.remove("unlocked-message", "visible");
    }
  
    // === 🧠 Toggle all unlock messages ===
    themeSection.replaceWith(themeSection.cloneNode(true));
    const newThemeSection = document.getElementById("theme-unlock-status");
  
    newThemeSection.addEventListener("click", () => {
      themeMessage.classList.toggle("visible");
  
      if (goldenMessage.textContent && goldenMessage.textContent !== "Loading...") {
        goldenMessage.classList.toggle("visible");
      }
      if (gameMessage.textContent && gameMessage.textContent !== "Loading...") {
        gameMessage.classList.toggle("visible");
      }
  
      if (toggleIcon) {
        toggleIcon.textContent = themeMessage.classList.contains("visible") ? "▲" : "▼";
      }
    });

    safeAddEventListenerById("theme-unlock-status", "click", handleThemeToggleClick);
  }

  function setupThemesPanel() {
    const milestoneUnlocks = JSON.parse(localStorage.getItem("milestoneUnlocks")) || {};
    const themeButton = document.getElementById("open-themes-panel");
    const themesModal = document.getElementById("themes-modal");
    const closeThemesBtn = document.getElementById("close-themes-btn");
  
    // ✅ Show the button if ANY theme is unlocked
    if (milestoneUnlocks.darkOcean || milestoneUnlocks.goldenGlow) {
      themeButton.style.display = "block";
    }
  
    // ✅ Open modal
    themeButton.addEventListener("click", () => {
      themesModal.style.display = "flex";
      hideMainMenu(); // Hide the main menu when opening
    });
  
    // ✅ Close modal
    closeThemesBtn.addEventListener("click", () => {
      themesModal.style.display = "none";
    });
  
    // ✅ Setup dark mode toggle inside themes modal
    setupDarkModeToggle("darkModeToggleThemes", ["darkModeToggle", "darkModeToggleThemes"]);
  }
setupThemesPanel();







// Hook into existing task functions to update stats when tasks change
document.getElementById("taskList").addEventListener("change", updateStatsPanel);
document.getElementById("addTask").addEventListener("click", updateStatsPanel);


const slideLeft = document.getElementById("slide-left");
const slideRight = document.getElementById("slide-right");


slideLeft.classList.add("hide");
slideLeft.classList.remove("show");


// ✅ Optional screen reader support
function announceViewChange(message) {
    if (liveRegion) liveRegion.textContent = message;
}

// ✅ Unified function to show task view
function showTaskView() {
    statsPanel.classList.add("hide");
    statsPanel.classList.remove("show");

    taskView.classList.add("show");
    taskView.classList.remove("hide");

    slideRight.classList.add("show");
    slideRight.classList.remove("hide");

    slideLeft.classList.add("hide");
    slideLeft.classList.remove("show");

    isStatsVisible = false;
    announceViewChange("Task view opened");
}

// ✅ Unified function to show stats panel
function showStatsPanel() {
    statsPanel.classList.add("show");
    statsPanel.classList.remove("hide");

    taskView.classList.add("hide");
    taskView.classList.remove("show");

    slideRight.classList.add("hide");
    slideRight.classList.remove("show");

    slideLeft.classList.add("show");
    slideLeft.classList.remove("hide");

    isStatsVisible = true;
    announceViewChange("Stats panel opened");
}

// 🔄 Initially hide the left slide
slideLeft.classList.add("hide");
slideLeft.classList.remove("show");

// ✅ Use safe listeners
safeAddEventListener(slideRight, "click", showStatsPanel);
safeAddEventListener(slideLeft, "click", showTaskView);

// ⌨️ Shift + Arrow Keyboard Shortcuts
safeAddEventListener(document, "keydown", (e) => {
    if (!e.shiftKey) return;

    if (e.key === "ArrowRight" && isStatsVisible) {
        e.preventDefault();
        showTaskView();
    } else if (e.key === "ArrowLeft" && !isStatsVisible) {
        e.preventDefault();
        showStatsPanel();
    }
});





});


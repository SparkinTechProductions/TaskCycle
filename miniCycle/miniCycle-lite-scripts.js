// ==========================================
// 📱 miniCycle LITE - Fixed for Maximum Compatibility
// ==========================================

// ✅ Global Variables
var draggedTask = null;
var touchStartTime = 0;
var isLongPress = false;
var touchStartY = 0;
var touchEndY = 0;
var holdTimeout = null;
var moved = false;
var isDragging = false;
var hasInteracted = false;
var undoStack = [];
var redoStack = [];
var UNDO_LIMIT = 4;
var TASK_LIMIT = 100;

// ✅ Core Element References (with null checks)
var taskInput = null;
var addTaskButton = null;
var taskList = null;
var progressBar = null;
var completeAllButton = null;
var menuButton = null;
var menu = null;

// ✅ Device Detection
function detectDeviceCapabilities() {
  var capabilities = {
    isOldDevice: true,
    supportsLocalStorage: typeof(Storage) !== "undefined",
    supportsMutationObserver: typeof MutationObserver !== "undefined",
    userAgent: navigator.userAgent
  };

  console.log('📱 Lite Mode - Device Capabilities:', capabilities);
  return capabilities;
}

var deviceCapabilities = detectDeviceCapabilities();
console.log('📱 miniCycle Lite Mode Activated for maximum compatibility!');

// ✅ CORRECTED DOMContentLoaded - ADD setupModeSelector():
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing miniCycle Lite...!!');
  
  // ✅ Initialize element references with null checks
  initializeElements();
  
  // ✅ Only proceed if core elements exist
  if (!taskInput || !taskList) {
    console.error('❌ Required elements not found in DOM');
    return;
  }
 
  // Initialize features
  loadMiniCycle();
  updateProgressBar();
  setupBasicEventListeners();
  setupModeSelector(); // ✅ ADD THIS LINE
  setupMenuSystem();
  setupBasicTheme();
  setupBasicSwipe();
  setupStatsUpdating();
  setupStatsMenuButton();
  setupEnhancedNavigation(); 
  updateNavigationState();
    setupFeedbackModal(); // ✅ ADD THIS LINE
  setupFeedbackKeyboardSupport();

  // ✅ Initial stats update
  setTimeout(function() {
    updateStats();
  }, 1000);
  
  // Auto-focus input
  if (taskInput) taskInput.focus();
  
 // ✅ ADD: Initialize badge system
  initializeBadgeSystem();
  
  console.log('✅ miniCycle Lite initialized successfully');
});

// ✅ NEW function to initialize badge system
function initializeBadgeSystem() {
  // ✅ Set initial badge states
  setTimeout(function() {
    var stats = calculateTaskStats();
    updateProgressBadges(stats);
  }, 1000);
  
  // ✅ If no lifetime stats exist, initialize to 0
  if (getLifetimeCompletedTasks() === 0 && localStorage.getItem('miniCycleLiteLifetimeCompleted') === null) {
    try {
      localStorage.setItem('miniCycleLiteLifetimeCompleted', '0');
      console.log('🏅 Initialized lifetime completed tasks counter');
    } catch (e) {
      console.warn('⚠️ Could not initialize lifetime stats:', e);
    }
  }
  
  console.log('🏅 Badge system initialized - Lifetime completed:', getLifetimeCompletedTasks());
}


// ✅ CORRECTED initializeElements function:
function initializeElements() {
  try {
    taskInput = document.getElementById("taskInput");
    addTaskButton = document.getElementById("addTask");
    taskList = document.getElementById("taskList");
    progressBar = document.getElementById("progressBar");
    completeAllButton = document.getElementById("completeAll");
    menuButton = document.getElementById("menu-button"); // ✅ Changed from querySelector
    menu = document.querySelector(".menu-container");
    
    console.log('📋 Elements initialized:', {
      taskInput: !!taskInput,
      addTaskButton: !!addTaskButton,
      taskList: !!taskList,
      progressBar: !!progressBar,
      completeAllButton: !!completeAllButton,
      menuButton: !!menuButton,
      menu: !!menu
    });
    
  } catch (error) {
    console.error('❌ Error initializing elements:', error);
  }
}

// ✅ CORRECTED setupModeSelector function:
function setupModeSelector() {
  // ✅ Try both desktop and mobile selectors
  var modeSelect = document.getElementById('mode-selector') || document.getElementById('mobile-mode-selector');
  
  if (modeSelect) {
    // ✅ Load saved mode preference
    var savedMode = localStorage.getItem('miniCycleLiteMode') || 'manual-cycle';
    modeSelect.value = savedMode;
    
    // ✅ Save mode changes
    modeSelect.addEventListener('change', function() {
      var selectedMode = modeSelect.value;
      localStorage.setItem('miniCycleLiteMode', selectedMode);
      
      // ✅ Sync both selectors if they exist
      var desktopSelect = document.getElementById('mode-selector');
      var mobileSelect = document.getElementById('mobile-mode-selector');
      
      if (desktopSelect && desktopSelect !== modeSelect) {
        desktopSelect.value = selectedMode;
      }
      if (mobileSelect && mobileSelect !== modeSelect) {
        mobileSelect.value = selectedMode;
      }
      
      // ✅ Update button text AND visibility based on mode
      updateCompleteAllButtonText();
      checkCompleteAllButton();
      
      showNotification('Mode changed to: ' + getModeDisplayName(selectedMode), 'info');
      console.log('🎛️ Mode changed to:', selectedMode);
    });
    
    // ✅ Setup the other selector if it exists
    var otherSelect = modeSelect === document.getElementById('mode-selector') 
      ? document.getElementById('mobile-mode-selector')
      : document.getElementById('mode-selector');
      
    if (otherSelect) {
      otherSelect.value = savedMode;
      otherSelect.addEventListener('change', function() {
        modeSelect.dispatchEvent(new Event('change'));
      });
    }
    
    // ✅ Set initial button visibility and text
    updateCompleteAllButtonText();
    checkCompleteAllButton();
    
    console.log('✅ Mode selector initialized:', savedMode);
  } else {
    console.log('⚠️ Mode selector not found - using manual mode');
  }
}


// ✅ UPDATE the getModeDisplayName function to handle both formats
function getModeDisplayName(mode) {
  switch(mode) {
    case 'auto':
    case 'auto-cycle': 
      return 'Auto Cycle';
    case 'manual':
    case 'manual-cycle': 
      return 'Manual Cycle';
    case 'todo':
    case 'todo-mode': 
      return 'To-Do Mode';
    default: 
      return 'Manual Cycle';
  }
}

function updateCompleteAllButtonText() {
  if (!completeAllButton || !taskList) return;
  
  var mode = getCurrentCycleMode();
  
  // ✅ Hide button completely in auto-cycle mode
  if (mode === 'auto' || mode === 'auto-cycle') {
    completeAllButton.style.display = 'none';
    return;
  }
  
  var totalTasks = taskList.children.length;
  var completedTasks = 0;
  
  // Count completed tasks
  for (var i = 0; i < taskList.children.length; i++) {
    var checkbox = taskList.children[i].querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      completedTasks++;
    }
  }
  
  // ✅ Show button for manual and to-do modes
  completeAllButton.style.display = 'block';
  
  if (totalTasks === 0) {
    completeAllButton.textContent = getEmptyButtonText(mode);
    completeAllButton.disabled = true;
  } else if (completedTasks === totalTasks) {
    completeAllButton.textContent = getCompleteButtonText(mode);
    completeAllButton.disabled = false;
  } else {
    completeAllButton.textContent = getIncompleteButtonText(mode, totalTasks - completedTasks);
    completeAllButton.disabled = false;
  }
}

// ✅ UPDATED button text functions for clearer to-do mode behavior
function getEmptyButtonText(mode) {
  switch(mode) {
    case 'auto':
    case 'auto-cycle': 
      return 'Complete All (Auto Reset)';
    case 'manual':
    case 'manual-cycle': 
      return 'Complete All (Manual)';
    case 'todo':
    case 'todo-mode': 
      return 'Complete All (To-Do)';
    default: 
      return 'Complete All';
  }
}

function getCompleteButtonText(mode) {
  switch(mode) {
    case 'auto':
    case 'auto-cycle': 
      return 'Auto-Reset Active ⚡';
    case 'manual':
    case 'manual-cycle': 
      return 'Start New Cycle';
    case 'todo':
    case 'todo-mode': 
      return 'Delete Completed Tasks 🗑️';
    default: 
      return 'All Complete!';
  }
}

function getIncompleteButtonText(mode, remaining) {
  switch(mode) {
    case 'auto':
    case 'auto-cycle': 
      return 'Complete All (' + remaining + ' left, auto-reset)';
    case 'manual':
    case 'manual-cycle': 
      return 'Complete All (' + remaining + ' left, manual)';
    case 'todo':
    case 'todo-mode': 
      return 'Delete Completed (' + (taskList.children.length - remaining) + ' checked)';
    default: 
      return 'Complete All (' + remaining + ' left)';
  }
}


// ✅ CORRECTED getCurrentCycleMode function:
function getCurrentCycleMode() {
  var modeSelect = document.getElementById('mode-selector') || document.getElementById('mobile-mode-selector');
  if (modeSelect) {
    return modeSelect.value;
  }
  
  // ✅ Fallback: check localStorage for saved preference
  var savedMode = localStorage.getItem('miniCycleLiteMode');
  return savedMode || 'manual-cycle'; // Default to manual
}

// ✅ REMOVE duplicate showTaskView function and keep only this one:
function showTaskView() {
  var statsPanel = document.getElementById("stats-panel");
  var taskView = document.getElementById("task-view");
  
  if (statsPanel && taskView) {
    // ✅ IE-compatible class management
    removeClass(statsPanel, 'show');
    addClass(statsPanel, 'hide');
    removeClass(taskView, 'hide');
    addClass(taskView, 'show');
    
    updateNavigationState();
    
    console.log('📝 Task view shown');
  }
}
// ==========================================
// 📝 CORE TASK MANAGEMENT (Fixed)
// ==========================================

function addTask(taskText, completed, shouldSave, dueDate, highPriority, isLoading) {
  if (!taskList) {
    console.error('❌ Task list element not found');
    return;
  }

  // ✅ Validation
  if (typeof taskText !== "string" || !taskText.trim()) {
    console.warn("⚠ Cannot add empty task");
    return;
  }

  var cleanText = sanitizeInput(taskText.trim());
  if (cleanText.length > TASK_LIMIT) {
    showNotification("Task too long (max " + TASK_LIMIT + " characters)", "warning");
    return;
  }

  // ✅ Create task element
  var taskItem = document.createElement("li");
  taskItem.className = "task"; // ✅ IE-compatible
  
  var taskId = 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  taskItem.setAttribute('data-task-id', taskId); // ✅ IE-compatible

  // ✅ Checkbox
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed || false;
  
  // ✅ IE-compatible event listener
  checkbox.addEventListener("change", function(e) {
    handleTaskCompletionChange(e);
    updateProgressBar();
    checkCompleteAllButton();
    autoSave();
  });

  // ✅ Task text
  var taskLabel = document.createElement("span");
  taskLabel.className = "task-text";
  taskLabel.textContent = cleanText;

  
  // ✅ Enhanced Task options with three dots menu
  var buttonContainer = document.createElement("div");
  buttonContainer.className = "task-options";

  // Three dots trigger (mobile-friendly)
  var threeDots = document.createElement("button");
  threeDots.className = "task-btn three-dots-btn";
  threeDots.innerHTML = "⋯";
  threeDots.title = "Task options";
  threeDots.setAttribute('aria-label', 'Task options');

  // Options menu container
  var optionsMenu = document.createElement("div");
  optionsMenu.className = "options-menu hidden";

// Move up button
var moveUpBtn = document.createElement("button");
moveUpBtn.className = "task-btn move-btn move-up-btn";
moveUpBtn.innerHTML = "↑"; // ✅ Add text for clarity
moveUpBtn.title = "Move up";
  moveUpBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    moveTaskUp(taskItem);
    hideTaskOptions(taskItem);
  });

// Move down button  
var moveDownBtn = document.createElement("button");
moveDownBtn.className = "task-btn move-btn move-down-btn";
moveDownBtn.innerHTML = "↓"; // ✅ Add text for clarity
moveDownBtn.title = "Move down";
  moveDownBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    moveTaskDown(taskItem);
    hideTaskOptions(taskItem);
  });

// Edit button
var editBtn = document.createElement("button");
editBtn.className = "task-btn edit-btn";
editBtn.innerHTML = "✏️"; // ✅ Add text for clarity
editBtn.title = "Edit task";
  editBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    editTask(taskItem);
    hideTaskOptions(taskItem);
  });

// Delete button
var deleteBtn = document.createElement("button");
deleteBtn.className = "task-btn delete-btn";
deleteBtn.innerHTML = "🗑️"; // ✅ Add text for clarity
deleteBtn.title = "Delete task";
  deleteBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    deleteTask(taskItem);
  });

  // Assemble options menu
  optionsMenu.appendChild(moveUpBtn);
  optionsMenu.appendChild(moveDownBtn);
  optionsMenu.appendChild(editBtn);
  optionsMenu.appendChild(deleteBtn);

  buttonContainer.appendChild(threeDots);
  buttonContainer.appendChild(optionsMenu);

  // ✅ Task content assembly
  var taskContent = document.createElement("div");
  taskContent.className = "task-content";
  taskContent.appendChild(checkbox);
  taskContent.appendChild(taskLabel);

  taskItem.appendChild(buttonContainer);
  taskItem.appendChild(taskContent);

  // ✅ Add to list
  taskList.appendChild(taskItem);

  // ✅ Setup enhanced interactions
  setupEnhancedTaskInteraction(taskItem);
  updateMoveButtonsVisibility();

  // ✅ Update UI
  updateProgressBar();
  checkCompleteAllButton();
  if (shouldSave !== false) autoSave();

  console.log('✅ Task added:', cleanText);
  return taskItem;
}

// ✅ Replace your setupTaskInteraction function with this enhanced version:

function setupEnhancedTaskInteraction(taskItem) {
  if (!taskItem) return;
  
  var threeDots = taskItem.querySelector(".three-dots-btn");
  var optionsMenu = taskItem.querySelector(".options-menu");
  
  // Three dots click handler
  if (threeDots) {
    threeDots.addEventListener("click", function(e) {
      e.stopPropagation();
      e.preventDefault();
      
      // Hide all other open menus first
      hideAllTaskOptions();
      
      // Toggle this menu
      if (optionsMenu) {
        optionsMenu.classList.toggle('hidden');
        updateMoveButtonsVisibility();
      }
    });
  }

  // Mobile touch handling for task completion
  var touchStartTime = 0;
  var touchTimeoutId = null;
  
  taskItem.addEventListener("touchstart", function(e) {
    // Don't interfere with three dots menu
    if (e.target.closest(".task-options")) return;
    
    touchStartTime = Date.now();
  });

  taskItem.addEventListener("touchend", function(e) {
    // Don't interfere with three dots menu
    if (e.target.closest(".task-options")) return;
    
    var touchDuration = Date.now() - touchStartTime;
    
    // Short tap - toggle task completion
    if (touchDuration < 300) {
      if (e.target.type !== "checkbox") {
        var checkbox = taskItem.querySelector("input[type='checkbox']");
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          triggerEvent(checkbox, "change");
        }
      }
    }
  });

  // Desktop click handling
  taskItem.addEventListener("click", function(e) {
    // Don't interfere with three dots menu or checkbox
    if (e.target.closest(".task-options") || e.target.type === "checkbox") return;
    
    var checkbox = taskItem.querySelector("input[type='checkbox']");
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      triggerEvent(checkbox, "change");
    }
  });
}

// ✅ IE-compatible event triggering
function triggerEvent(element, eventType) {
  if (document.createEvent) {
    var event = document.createEvent('Event');
    event.initEvent(eventType, true, true);
    element.dispatchEvent(event);
  } else if (element.fireEvent) {
    // IE8 and below
    element.fireEvent('on' + eventType);
  }
}

// ✅ Add these new functions for moving tasks:

function moveTaskUp(taskItem) {
  if (!taskItem || !taskList) return;
  
  var previousSibling = taskItem.previousElementSibling;
  if (previousSibling) {
    saveUndoState('move');
    taskList.insertBefore(taskItem, previousSibling);
    autoSave();
    updateMoveButtonsVisibility();
    showNotification("Task moved up", "info");
  }
}

function moveTaskDown(taskItem) {
  if (!taskItem || !taskList) return;
  
  var nextSibling = taskItem.nextElementSibling;
  if (nextSibling) {
    saveUndoState('move');
    taskList.insertBefore(nextSibling, taskItem);
    autoSave();
    updateMoveButtonsVisibility();
    showNotification("Task moved down", "info");
  }
}

function updateMoveButtonsVisibility() {
  if (!taskList) return;
  
  var taskItems = taskList.children;
  var totalTasks = taskItems.length;
  
  // Hide move buttons if only one task
  if (totalTasks <= 1) {
    var allMoveButtons = taskList.querySelectorAll('.move-btn');
    for (var i = 0; i < allMoveButtons.length; i++) {
      allMoveButtons[i].style.display = 'none';
    }
    return;
  }
  
  // Show move buttons and update visibility
  for (var i = 0; i < taskItems.length; i++) {
    var taskItem = taskItems[i];
    var moveUpBtn = taskItem.querySelector('.move-up-btn');
    var moveDownBtn = taskItem.querySelector('.move-down-btn');
    
    if (moveUpBtn && moveDownBtn) {
      // Show both buttons first
      moveUpBtn.style.display = 'inline-block';
      moveDownBtn.style.display = 'inline-block';
      
      // Hide up button for first task
      if (i === 0) {
        moveUpBtn.style.display = 'none';
      }
      
      // Hide down button for last task
      if (i === taskItems.length - 1) {
        moveDownBtn.style.display = 'none';
      }
    }
  }
}

function hideTaskOptions(taskItem) {
  var optionsMenu = taskItem.querySelector('.options-menu');
  if (optionsMenu) {
    optionsMenu.classList.add('hidden');
  }
}

function hideAllTaskOptions() {
  var allOptionsMenus = document.querySelectorAll('.options-menu');
  for (var i = 0; i < allOptionsMenus.length; i++) {
    allOptionsMenus[i].classList.add('hidden');
  }
}

// ==========================================
// 💾 ENHANCED DATA MANAGEMENT
// ==========================================

function autoSave() {
  if (!taskList || !deviceCapabilities.supportsLocalStorage) {
    console.warn('⚠ Cannot save - localStorage not supported');
    return;
  }

  try {
    var tasks = [];
    var taskElements = taskList.children;
    
    for (var i = 0; i < taskElements.length; i++) {
      var taskElement = taskElements[i];
      var taskText = taskElement.querySelector(".task-text");
      var checkbox = taskElement.querySelector("input[type='checkbox']");
      
      if (taskText && checkbox) {
        tasks.push({
          id: taskElement.getAttribute('data-task-id') || ('task-' + i),
          text: taskText.textContent,
          completed: checkbox.checked
        });
      }
    }

    var titleElement = document.getElementById("mini-cycle-title");
    var miniCycleData = {
      title: (titleElement ? titleElement.textContent : null) || "My Tasks",
      tasks: tasks,
      autoReset: true,
      cycleCount: parseInt(localStorage.getItem("miniCycleLiteCount")) || 0,
      lastSaved: new Date().getTime()
    };

    localStorage.setItem("miniCycleLite", JSON.stringify(miniCycleData));
    console.log('💾 Data saved:', tasks.length + ' tasks');
    
  } catch (error) {
    console.error('❌ Error saving data:', error);
    showNotification("⚠️ Failed to save data", "error");
  }
}

function loadMiniCycle() {
  if (!deviceCapabilities.supportsLocalStorage) {
    console.warn('⚠ localStorage not supported');
    return;
  }

  var savedData = localStorage.getItem("miniCycleLite");
  
  if (!savedData) {
    console.log('📱 No saved data found - starting fresh');
    return;
  }

  try {
    var data = JSON.parse(savedData);
    
    // Set title
    var titleElement = document.getElementById("mini-cycle-title");
    if (titleElement && data.title) {
      titleElement.textContent = data.title;
    }

    // Clear current tasks
    if (taskList) {
      taskList.innerHTML = "";
    }

    // Load tasks
    if (data.tasks && Array.isArray(data.tasks)) {
      for (var i = 0; i < data.tasks.length; i++) {
        var task = data.tasks[i];
        if (task.text) {
          addTask(task.text, task.completed, false);
        }
      }
    }

    console.log('✅ Loaded ' + (data.tasks ? data.tasks.length : 0) + ' tasks');
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
    showNotification("⚠️ Error loading saved data", "error");
  }

  updateProgressBar();
  checkCompleteAllButton();
}
// ==========================================
// 📊 FIXED STATS SYSTEM - CORRECTED VERSION
// ==========================================

// ✅ SINGLE, COMPREHENSIVE setupStatsUpdating function
function setupStatsUpdating() {
  // ✅ Use MutationObserver if available, fallback to event listeners + polling
  if (deviceCapabilities.supportsMutationObserver && taskList) {
    try {
      var observer = new MutationObserver(function(mutations) {
        setTimeout(updateStats, 50);
      });
      
      observer.observe(taskList, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['checked']
      });
      
      console.log('✅ MutationObserver active for stats updating');
    } catch (error) {
      console.warn('⚠ MutationObserver failed, using fallback methods');
      setupEventBasedStatsUpdate();
    }
  } else {
    console.log('📊 Using event-based stats updates (legacy compatibility)');
    setupEventBasedStatsUpdate();
  }
  
  // ✅ Also monitor checkbox changes directly
  if (taskList) {
    taskList.addEventListener('change', function(e) {
      if (e.target.type === 'checkbox') {
        setTimeout(updateStats, 100);
      }
    });
  }
  
  // ✅ Initial stats update
  setTimeout(updateStats, 500);
  
  console.log('✅ Stats updating system initialized');
}

function setupEventBasedStatsUpdate() {
  // ✅ Enhanced fallback for older browsers
  var lastTaskCount = 0;
  var lastCompletedCount = 0;
  
  setInterval(function() {
    if (!taskList) return;
    
    var currentTaskCount = taskList.children.length;
    var currentCompletedCount = 0;
    
    for (var i = 0; i < taskList.children.length; i++) {
      var checkbox = taskList.children[i].querySelector("input[type='checkbox']");
      if (checkbox && checkbox.checked) {
        currentCompletedCount++;
      }
    }
    
    // Only update if something changed
    if (currentTaskCount !== lastTaskCount || currentCompletedCount !== lastCompletedCount) {
      updateStats();
      lastTaskCount = currentTaskCount;
      lastCompletedCount = currentCompletedCount;
    }
  }, 1000);
}

// ✅ CORRECTED updateStats function
function updateStats() {
  if (!taskList) {
    console.warn('⚠️ Cannot update stats - taskList not found');
    return;
  }
  
  var stats = calculateTaskStats();
  
  // ✅ Update basic stats
  updateStatElement('total-tasks', stats.total);
  updateStatElement('completed-tasks', stats.completed);
  updateStatElement('completion-rate', stats.completionRate + '%');
  
  // ✅ Update progress badges
  updateProgressBadges(stats);
  
  // ✅ Update cycles completed
  updateCyclesCompleted(stats);
  
  console.log('📊 Stats updated:', stats);
}

// ✅ CORRECTED updateStatElement with IE compatibility
function updateStatElement(elementId, value) {
  var element = document.getElementById(elementId);
  if (element) {
    // ✅ Add animation class for value changes (IE-compatible)
    if (element.textContent !== value.toString()) {
      addClass(element, 'stat-updating'); // Use IE-compatible helper
      setTimeout(function() {
        removeClass(element, 'stat-updating'); // Use IE-compatible helper
      }, 300);
    }
    
    element.textContent = value;
    element.setAttribute('aria-live', 'polite');
  } else {
    console.warn('⚠️ Stat element not found:', elementId);
  }
}

// ✅ CORRECTED updateProgressBadges function - tracks CYCLES completed, not individual tasks
function updateProgressBadges(stats) {
  var badges = document.querySelectorAll('.badge[data-milestone]');
  
  if (badges.length === 0) {
    console.log('📅 No badges found in DOM');
    return;
  }
  
  // ✅ Get cycles completed (not individual tasks)
  var cyclesCompleted = getCyclesCompletedFromStorage();
  
  console.log('🏅 Updating badges - Cycles completed:', cyclesCompleted);
  
  for (var i = 0; i < badges.length; i++) {
    var badge = badges[i];
    var milestone = parseInt(badge.getAttribute('data-milestone'), 10);
    
    if (cyclesCompleted >= milestone) {
      // ✅ Achievement unlocked
      if (hasClass(badge, 'locked') || (!hasClass(badge, 'unlocked') && !hasClass(badge, 'celebrated'))) {
        // ✅ This is a newly unlocked badge
        removeClass(badge, 'locked');
        addClass(badge, 'unlocked');
        addClass(badge, 'celebrating');
        
        badge.setAttribute('aria-label', milestone + ' cycles milestone - ACHIEVED!');
        badge.title = 'Achievement unlocked: ' + milestone + ' cycles completed!';
        
        // ✅ Show celebration notification
        setTimeout(function(milestoneValue) {
          return function() {
            showNotification('🏅 Achievement unlocked: ' + milestoneValue + ' cycles completed!', 'success');
          };
        }(milestone), 300);
        
        // ✅ After celebration animation, mark as celebrated
        setTimeout(function(badgeElement) {
          return function() {
            removeClass(badgeElement, 'celebrating');
            addClass(badgeElement, 'celebrated');
          };
        }(badge), 1000);
        
        console.log('🎉 Badge unlocked:', milestone, 'cycles');
      }
    } else {
      // ✅ Still locked
      removeClass(badge, 'unlocked');
      removeClass(badge, 'celebrating');
      removeClass(badge, 'celebrated');
      addClass(badge, 'locked');
      badge.setAttribute('aria-label', milestone + ' cycles milestone - ' + (milestone - cyclesCompleted) + ' cycles remaining');
      badge.title = 'Complete ' + (milestone - cyclesCompleted) + ' more cycles to unlock this achievement';
    }
  }
}

// ✅ REMOVE the lifetime task tracking functions since we don't need them anymore
// Remove: getLifetimeCompletedTasks(), incrementLifetimeCompletedTasks()

// ✅ SIMPLIFIED handleTaskCompletionChange function - no more lifetime tracking
function handleTaskCompletionChange(event) {
  // ✅ Check if we're in auto-cycle mode and all tasks are now complete
  var cycleMode = getCurrentCycleMode();
  
  if (cycleMode === 'auto' || cycleMode === 'auto-cycle') {
    // ✅ Small delay to ensure DOM is updated
    setTimeout(function() {
      checkForAutoReset();
    }, 100);
  }
  
  console.log('✅ Task completion changed');
}

// ✅ ENHANCED incrementCycleCount to trigger badge updates
function incrementCycleCount() {
  var currentCycles = getCyclesCompletedFromStorage();
  var newCycleCount = currentCycles + 1;
  
  saveCyclesCompletedToStorage(newCycleCount);
  
  // ✅ Update badges when cycle count changes
  setTimeout(function() {
    var stats = calculateTaskStats();
    updateProgressBadges(stats);
    updateStats();
  }, 100);
  
  console.log('🎯 Cycle count incremented to:', newCycleCount);
  
  return newCycleCount;
}

// ✅ NEW function to track lifetime completed tasks across cycles
function getLifetimeCompletedTasks() {
  try {
    var lifetimeCount = localStorage.getItem('miniCycleLiteLifetimeCompleted');
    return lifetimeCount ? parseInt(lifetimeCount, 10) : 0;
  } catch (e) {
    console.warn('⚠️ Could not read lifetime completed tasks:', e);
    return 0;
  }
}

// ✅ NEW function to increment lifetime completed tasks
function incrementLifetimeCompletedTasks(count) {
  count = count || 1;
  try {
    var currentLifetime = getLifetimeCompletedTasks();
    var newLifetime = currentLifetime + count;
    localStorage.setItem('miniCycleLiteLifetimeCompleted', newLifetime.toString());
    console.log('📈 Lifetime completed tasks updated:', newLifetime);
    return newLifetime;
  } catch (e) {
    console.warn('⚠️ Could not save lifetime completed tasks:', e);
    return getLifetimeCompletedTasks();
  }
}


// ✅ ENHANCED resetAllTasks to NOT affect lifetime stats (tasks were already counted as completed)
function resetAllTasks() {
  if (!taskList) return;
  
  var taskItems = taskList.children;
  var resetCount = 0;
  
  // ✅ Uncheck all tasks (but don't decrement lifetime counter - they were already completed)
  for (var i = 0; i < taskItems.length; i++) {
    var checkbox = taskItems[i].querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      checkbox.checked = false;
      // ✅ Don't trigger change event to avoid affecting lifetime counter
      resetCount++;
    }
  }
  
  console.log('🔄 Reset ' + resetCount + ' tasks for new cycle');
  
  updateProgressBar();
  checkCompleteAllButton();
  autoSave();
  
  return resetCount;
}

// ✅ ENHANCED deleteCompletedTasks to handle lifetime stats properly
function deleteCompletedTasks() {
  if (!taskList) return;
  
  var taskItems = Array.prototype.slice.call(taskList.children); // Convert to array
  var deletedCount = 0;
  
  // ✅ Remove completed tasks from DOM (lifetime stats already counted when tasks were completed)
  for (var i = 0; i < taskItems.length; i++) {
    var taskItem = taskItems[i];
    var checkbox = taskItem.querySelector("input[type='checkbox']");
    
    if (checkbox && checkbox.checked) {
      taskList.removeChild(taskItem);
      deletedCount++;
    }
  }
  
  console.log('🗑️ Deleted ' + deletedCount + ' completed tasks');
  
  updateProgressBar();
  checkCompleteAllButton();
  autoSave();
  
  return deletedCount;
}

// ✅ ADD function to manually recalculate lifetime stats (for migration or debugging)
function recalculateLifetimeStats() {
  var cyclesCompleted = getCyclesCompletedFromStorage();
  var currentCompleted = 0;
  
  // Add current session completed tasks
  if (taskList) {
    for (var i = 0; i < taskList.children.length; i++) {
      var checkbox = taskList.children[i].querySelector("input[type='checkbox']");
      if (checkbox && checkbox.checked) {
        currentCompleted++;
      }
    }
  }
  
  // Estimate based on cycles (rough calculation)
  var estimatedLifetime = Math.max(getLifetimeCompletedTasks(), cyclesCompleted * 5 + currentCompleted);
  
  try {
    localStorage.setItem('miniCycleLiteLifetimeCompleted', estimatedLifetime.toString());
    console.log('🔄 Recalculated lifetime stats:', estimatedLifetime);
  } catch (e) {
    console.warn('⚠️ Could not save recalculated stats:', e);
  }
  
  return estimatedLifetime;
}

// ✅ ENHANCED calculateTaskStats function
function calculateTaskStats() {
  if (!taskList) {
    return {
      total: 0,
      completed: 0,
      incomplete: 0,
      completionRate: 0,
      tasksCreatedToday: 0,
      tasksCompletedToday: 0
    };
  }
  
  var taskItems = taskList.children;
  var total = taskItems.length;
  var completed = 0;
  var tasksCreatedToday = 0;
  var tasksCompletedToday = 0;
  
  // ✅ Get today's date for filtering
  var today = new Date();
  var todayString = today.toDateString();
  
  for (var i = 0; i < taskItems.length; i++) {
    var taskItem = taskItems[i];
    var checkbox = taskItem.querySelector("input[type='checkbox']");
    
    if (checkbox && checkbox.checked) {
      completed++;
    }
    
    // ✅ Try to get creation date from task ID (if available)
    var taskId = taskItem.getAttribute('data-task-id');
    if (taskId) {
      var timestamp = taskId.split('-')[1];
      if (timestamp && !isNaN(timestamp)) {
        var taskDate = new Date(parseInt(timestamp));
        if (taskDate.toDateString() === todayString) {
          tasksCreatedToday++;
          if (checkbox && checkbox.checked) {
            tasksCompletedToday++;
          }
        }
      }
    }
  }
  
  var completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total: total,
    completed: completed,
    incomplete: total - completed,
    completionRate: completionRate,
    tasksCreatedToday: tasksCreatedToday,
    tasksCompletedToday: tasksCompletedToday
  };
}

// ✅ ENHANCED updateCyclesCompleted function
function updateCyclesCompleted(stats) {
  var cyclesCompleted = getCyclesCompletedFromStorage();
  
  // ✅ Check if we just completed a cycle
  if (stats.total > 0 && stats.completed === stats.total) {
    var lastCompletionCheck = null;
    try {
      lastCompletionCheck = localStorage.getItem('lastCompletionCheck');
    } catch (e) {
      console.warn('⚠️ Could not read lastCompletionCheck from storage');
    }
    
    var currentTasksString = JSON.stringify(getAllTaskTexts());
    
    // ✅ Only count as new cycle if tasks have changed since last completion
    if (lastCompletionCheck !== currentTasksString) {
      cyclesCompleted++;
      saveCyclesCompletedToStorage(cyclesCompleted);
      
      try {
        localStorage.setItem('lastCompletionCheck', currentTasksString);
      } catch (e) {
        console.warn('⚠️ Could not save lastCompletionCheck to storage');
      }
      
      // ✅ Celebrate cycle completion
      setTimeout(function() {
        showNotification('🎉 Cycle completed! Total cycles: ' + cyclesCompleted, 'success');
      }, 500);
    }
  }
  
  updateStatElement('mini-cycle-count', cyclesCompleted);
}

// ✅ ENHANCED getAllTaskTexts function
function getAllTaskTexts() {
  var texts = [];
  if (!taskList) return texts;
  
  var taskItems = taskList.children;
  
  for (var i = 0; i < taskItems.length; i++) {
    var taskText = taskItems[i].querySelector('.task-text');
    if (taskText && taskText.textContent) {
      texts.push(taskText.textContent.trim());
    }
  }
  
  return texts.sort(); // Sort for consistent comparison
}

// ✅ ENHANCED storage functions with better error handling
function getCyclesCompletedFromStorage() {
  if (!deviceCapabilities.supportsLocalStorage) {
    console.warn('⚠️ localStorage not supported');
    return 0;
  }
  
  try {
    var stored = localStorage.getItem('miniCycleLiteCycles');
    var parsed = stored ? parseInt(stored, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  } catch (e) {
    console.warn('⚠️ Could not read cycles from storage:', e);
    return 0;
  }
}

function saveCyclesCompletedToStorage(cycles) {
  if (!deviceCapabilities.supportsLocalStorage) {
    console.warn('⚠️ localStorage not supported');
    return;
  }
  
  try {
    localStorage.setItem('miniCycleLiteCycles', cycles.toString());
  } catch (e) {
    console.warn('⚠️ Could not save cycles to storage:', e);
  }
}

// ✅ Add stats menu button functionality (unchanged but with error handling)
function setupStatsMenuButton() {
  var statsBtn = document.getElementById('show-stats');
  if (statsBtn) {
    statsBtn.addEventListener('click', function() {
      try {
        showStatsPanel();
        closeMenu();
      } catch (e) {
        console.error('⚠️ Error showing stats panel:', e);
      }
    });
  } else {
    console.log('📊 Stats button not found - menu integration disabled');
  }
}

// ✅ REMOVE this duplicate function - it's redundant with the enhanced updateStatElement
/*
function updateStatsDOM(totalTasks, completedTasks, completionRate, cycleCount) {
  // This function is now handled by updateStatElement calls in updateStats()
}
*/
// ==========================================
// 🔄 ENHANCED SWIPE SUPPORT
// ==========================================

function setupBasicSwipe() {
  var startX = 0;
  var startY = 0;
  var isStatsVisible = false;
  var statsPanel = document.getElementById("stats-panel");
  var taskView = document.getElementById("task-view");
  var minSwipeDistance = 50;

  if (!statsPanel || !taskView) {
    console.log('📱 Swipe disabled - required elements not found');
    return;
  }

  document.addEventListener("touchstart", function(e) {
    if (e.touches && e.touches.length > 0) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  });

  document.addEventListener("touchend", function(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;
      var differenceX = startX - endX;
      var differenceY = Math.abs(startY - endY);

      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(differenceX) > minSwipeDistance && differenceY < Math.abs(differenceX)) {
        if (differenceX > 0 && !isStatsVisible) {
          // Swipe left - show stats
          showStatsPanel();
          isStatsVisible = true;
        } else if (differenceX < 0 && isStatsVisible) {
          // Swipe right - show tasks
          showTaskView();
          isStatsVisible = false;
        }
      }
    }
  });

  function showStatsPanel() {
    if (statsPanel && taskView) {
      statsPanel.className = statsPanel.className.replace(/\bhide\b/g, '') + ' show';
      taskView.className = taskView.className.replace(/\bshow\b/g, '') + ' hide';
      updateStats();
    }
  }

  function showTaskView() {
    if (statsPanel && taskView) {
      statsPanel.className = statsPanel.className.replace(/\bshow\b/g, '') + ' hide';
      taskView.className = taskView.className.replace(/\bhide\b/g, '') + ' show';
    }
  }

  console.log('✅ Swipe support initialized'); 
}

// ✅ Add these missing functions to your script

// ==========================================
// 🛡️ INPUT SANITIZATION & VALIDATION
// ==========================================

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove dangerous characters but keep emoji and international text
  return input
    .replace(/[<>\"']/g, '') // Remove HTML/script dangerous chars
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .substring(0, TASK_LIMIT); // Enforce length limit
}

// ==========================================
// 📝 MISSING TASK MANAGEMENT FUNCTIONS
// ==========================================

function deleteTask(taskItem) {
  if (!taskItem || !taskList) return;
  
  // Save state for undo
  saveUndoState('delete');
  
  // Remove from DOM
  taskList.removeChild(taskItem);
  
  // Update UI
  updateProgressBar();
  checkCompleteAllButton();
  autoSave();
  
  showNotification("Task deleted", "info");
}

function editTask(taskItem) {
  if (!taskItem) return;
  
  var taskText = taskItem.querySelector('.task-text');
  if (!taskText) return;
  
  var currentText = taskText.textContent;
  var newText = prompt('Edit task:', currentText);
  
  if (newText !== null && newText.trim() !== '') {
    var cleanText = sanitizeInput(newText.trim());
    if (cleanText !== currentText) {
      saveUndoState('edit');
      taskText.textContent = cleanText;
      autoSave();
      showNotification("Task updated", "success");
    }
  }
}




// ✅ ADD this new function to check for auto reset
function checkForAutoReset() {
  if (!taskList) return;
  
  var totalTasks = taskList.children.length;
  var completedTasks = 0;
  
  // Count completed tasks
  for (var i = 0; i < taskList.children.length; i++) {
    var checkbox = taskList.children[i].querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      completedTasks++;
    }
  }
  
  // ✅ If all tasks are complete in auto mode, trigger automatic reset
  if (totalTasks > 0 && completedTasks === totalTasks) {
    var cycleMode = getCurrentCycleMode();
    
    if (cycleMode === 'auto' || cycleMode === 'auto-cycle') {
      console.log('🔄 Auto-cycle mode: All tasks complete, triggering automatic reset...');
      
      // ✅ Brief celebration before reset
      showNotification('🎉 All tasks complete! Auto-resetting...', 'success');
      
      // ✅ Auto reset after short delay for user feedback
      setTimeout(function() {
        resetAllTasks();
        incrementCycleCount();
        showCycleCompletionAnimation();
        showNotification('🔄 New cycle started automatically!', 'info');
      }, 1500); // 1.5 second delay for user to see completion
    }
  }
}



function checkCompleteAllButton() {
  if (!completeAllButton || !taskList) {
    console.log('⚠️ Complete all button or task list not found');
    return;
  }
  
  var cycleMode = getCurrentCycleMode();
  
  // ✅ Hide button completely in auto-cycle mode
  if (cycleMode === 'auto' || cycleMode === 'auto-cycle') {
    completeAllButton.style.display = 'none';
    console.log('🔄 Auto-cycle mode: Complete All button hidden');
    return;
  }
  
  var totalTasks = taskList.children.length;
  var completedTasks = 0;
  
  for (var i = 0; i < taskList.children.length; i++) {
    var checkbox = taskList.children[i].querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      completedTasks++;
    }
  }
  
  console.log('📊 Tasks:', totalTasks, 'Completed:', completedTasks);
  
  // ✅ Show the button for manual and to-do modes
  completeAllButton.style.display = 'block';
  
  if (totalTasks === 0) {
    completeAllButton.textContent = getEmptyButtonText(cycleMode);
    completeAllButton.disabled = true;
  } else if (completedTasks === totalTasks) {
    completeAllButton.textContent = getCompleteButtonText(cycleMode);
    completeAllButton.disabled = false;
  } else {
    completeAllButton.textContent = getIncompleteButtonText(cycleMode, totalTasks - completedTasks);
    completeAllButton.disabled = false;
  }
}

function updateProgressBar() {
  if (!progressBar || !taskList) return;
  
  var totalTasks = taskList.children.length;
  var completedTasks = 0;
  
  for (var i = 0; i < taskList.children.length; i++) {
    var checkbox = taskList.children[i].querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      completedTasks++;
    }
  }
  
  var percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  progressBar.style.width = percentage + "%";
}

// ==========================================
// 🎮 EVENT LISTENERS SETUP
// ==========================================

// ✅ CORRECTED setupBasicEventListeners function (remove the duplicate setupModeSelector call):
function setupBasicEventListeners() {
  // Add task button
  if (addTaskButton) {
    addTaskButton.addEventListener("click", function() {
      handleAddTask();
    });
  }
  
  // Task input enter key
  if (taskInput) {
    taskInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        handleAddTask();
      }
    });
  }
  
  // Complete all button
  if (completeAllButton) {
    completeAllButton.addEventListener("click", function() {
      handleCompleteAll();
    });
  }
  
  // Title editing
  var titleElement = document.getElementById("mini-cycle-title");
  if (titleElement) {
    titleElement.addEventListener("blur", function() {
      autoSave();
    });
    
    titleElement.addEventListener("keypress", function(e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        titleElement.blur();
      }
    });
  }
  
  // ✅ Dark mode toggle button
  var darkToggle = document.getElementById('quick-dark-toggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', function() {
      toggleTheme();
    });
    
    // ✅ Keyboard activation
    darkToggle.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13 || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // ✅ Close task options when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.task-options')) {
      hideAllTaskOptions();
    }
  });
  
  console.log('✅ Basic event listeners setup complete');
}

// ✅ CORRECTED handleAddTask function (remove nested function):
function handleAddTask() {
  if (!taskInput) return;
  
  var taskText = taskInput.value.trim();
  
  if (taskText) {
    // ✅ Add input sanitization before adding task
    var cleanText = sanitizeInput(taskText);
    
    if (cleanText.length === 0) {
      showNotification("Invalid characters in task", "warning");
      return;
    }
    
    if (cleanText.length > TASK_LIMIT) {
      showNotification("Task too long (max " + TASK_LIMIT + " characters)", "warning");
      return;
    }
    
    // ✅ Check task limit
    if (taskList && taskList.children.length >= TASK_LIMIT) {
      showNotification("Maximum tasks reached (" + TASK_LIMIT + ")", "warning");
      return;
    }
    
    // ✅ Save undo state before adding
    saveUndoState('add');
    
    // Add the task
    addTask(cleanText, false, true);
    
    // Clear input and focus
    taskInput.value = "";
    
    // ✅ IE-compatible focus with error handling
    try {
      taskInput.focus();
    } catch (e) {
      console.log('Focus failed - continuing anyway');
    }
    
    // ✅ Success feedback
    showNotification("Task added", "success");
    
  } else {
    showNotification("Please enter a task", "warning");
    
    // ✅ Focus input even when empty (better UX)
    try {
      taskInput.focus();
    } catch (e) {
      console.log('Focus failed - continuing anyway');
    }
  }
}

// ✅ CORRECTED handleCompleteAll function for proper to-do mode behavior
function handleCompleteAll() {
  if (!taskList) return;
  
  saveUndoState('completeAll');
  
  var totalTasks = taskList.children.length;
  var completedTasks = 0;
  var checkboxes = taskList.querySelectorAll("input[type='checkbox']");
  
  // Count completed tasks
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      completedTasks++;
    }
  }
  
  var cycleMode = getCurrentCycleMode();
  
  if (completedTasks === totalTasks && totalTasks > 0) {
    // ✅ All tasks are complete - handle according to mode
    if (cycleMode === 'auto' || cycleMode === 'auto-cycle') {
      // ✅ In auto mode, the reset should have already happened automatically
      showNotification('⚡ Auto-cycle mode is active - tasks reset automatically when completed!', 'info');
    } else {
      handleAllTasksComplete(cycleMode);
    }
  } else {
    // ✅ Some tasks incomplete - behavior depends on mode
    if (cycleMode === 'todo' || cycleMode === 'todo-mode') {
      // ✅ TO-DO MODE: Only delete already completed tasks, don't complete incomplete ones
      if (completedTasks > 0) {
        deleteCompletedTasks();
        showNotification("Completed tasks deleted! 🗑️", "success");
      } else {
        showNotification("No completed tasks to delete", "info");
      }
    } else {
      // ✅ AUTO/MANUAL MODES: Complete all remaining tasks
      for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].checked = true;
          triggerEvent(checkboxes[i], "change");
        }
      }
      
      // ✅ In auto mode, the automatic reset will be triggered by handleTaskCompletionChange
      if (cycleMode !== 'auto' && cycleMode !== 'auto-cycle') {
        showNotification("All tasks completed! 🎉", "success");
      }
    }
  }
  
  updateProgressBar();
  updateCompleteAllButtonText(); // ✅ Use the dynamic button text update
  autoSave();
}

// ✅ CORRECTED handleAllTasksComplete function
function handleAllTasksComplete(mode) {
  if (!taskList) return;
  
  var completedTaskCount = taskList.children.length;
  
  switch(mode) {
    case 'auto':
    case 'auto-cycle':
      // ✅ Auto mode - reset automatically
      resetAllTasks();
      incrementCycleCount();
      showCycleCompletionAnimation();
      showNotification('🔄 Cycle completed! Tasks reset automatically.', 'success');
      break;
      
    case 'manual':
    case 'manual-cycle':
      // ✅ MANUAL CYCLE: Reset tasks when user clicks "Start New Cycle"
      resetAllTasks();
      incrementCycleCount();
      showCycleCompletionAnimation();
      showNotification('🔄 New cycle started! All tasks have been reset.', 'success');
      break;
      
    case 'todo':
    case 'todo-mode':
      // ✅ TO-DO MODE: Delete all completed tasks
      deleteCompletedTasks();
      showNotification('🗑️ Completed tasks deleted!', 'success');
      break;
      
    default:
      console.warn('Unknown cycle mode:', mode);
      // Default to manual behavior
      resetAllTasks();
      incrementCycleCount();
      showNotification('🔄 New cycle started!', 'success');
  }
  
  // ✅ Update UI after handling completion
  updateProgressBar();
  updateCompleteAllButtonText();
  autoSave();
}
// ✅ ADD function to get current cycle mode:
function getCurrentCycleMode() {
  var modeSelect = document.getElementById('cycle-mode-select');
  if (modeSelect) {
    return modeSelect.value;
  }
  
  // ✅ Fallback: check localStorage for saved preference
  var savedMode = localStorage.getItem('miniCycleLiteMode');
  return savedMode || 'manual-cycle'; // Default to manual
}

// ✅ ADD function to reset all tasks (for cycle modes):
function resetAllTasks() {
  if (!taskList) return;
  
  var taskItems = taskList.children;
  var resetCount = 0;
  
  // ✅ Uncheck all tasks
  for (var i = 0; i < taskItems.length; i++) {
    var checkbox = taskItems[i].querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      checkbox.checked = false;
      triggerEvent(checkbox, "change");
      resetCount++;
    }
  }
  
  console.log('🔄 Reset ' + resetCount + ' tasks for new cycle');
  
  updateProgressBar();
  checkCompleteAllButton();
  autoSave();
  
  return resetCount;
}

// ✅ ADD function to delete completed tasks (for to-do mode):
function deleteCompletedTasks() {
  if (!taskList) return;
  
  var taskItems = Array.prototype.slice.call(taskList.children); // Convert to array
  var deletedCount = 0;
  
  // ✅ Remove completed tasks from DOM
  for (var i = 0; i < taskItems.length; i++) {
    var taskItem = taskItems[i];
    var checkbox = taskItem.querySelector("input[type='checkbox']");
    
    if (checkbox && checkbox.checked) {
      taskList.removeChild(taskItem);
      deletedCount++;
    }
  }
  
  console.log('🗑️ Deleted ' + deletedCount + ' completed tasks');
  
  updateProgressBar();
  checkCompleteAllButton();
  autoSave();
  
  return deletedCount;
}


// ✅ ADD cycle completion animation:
function showCycleCompletionAnimation() {
  var animation = document.createElement('div');
  animation.className = 'cycle-complete-animation';
  animation.innerHTML = '🎉<br><span style="font-size: 14px;">Cycle Complete!</span>';
  animation.style.cssText = [
    'position: fixed',
    'top: 50%',
    'left: 50%',
    'transform: translate(-50%, -50%)',
    'background: rgba(76, 175, 80, 0.95)',
    'color: white',
    'padding: 20px 30px',
    'border-radius: 10px',
    'z-index: 2000',
    'font-size: 24px',
    'text-align: center',
    'box-shadow: 0 4px 20px rgba(0,0,0,0.3)',
    'animation: bounceIn 0.5s ease'
  ].join(';');
  
  document.body.appendChild(animation);
  
  // Auto remove after 2 seconds
  setTimeout(function() {
    if (animation.parentNode) {
      animation.parentNode.removeChild(animation);
    }
  }, 2000);
}

// ==========================================
// 🎨 THEME & UI FUNCTIONS
// ==========================================

function setupBasicTheme() {
  // Apply saved theme or default
  var savedTheme = localStorage.getItem('miniCycleLiteTheme') || 'default';
  document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
  
  console.log('🎨 Theme applied:', savedTheme);
}

function toggleTheme() {
  var isDark = document.body.classList.contains('dark-mode');
  var darkToggle = document.getElementById('quick-dark-toggle');
  
  if (isDark) {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('miniCycleLiteTheme', 'default');
    if (darkToggle) darkToggle.textContent = '🌙'; // Moon emoji for light mode
  } else {
    document.body.classList.add('dark-mode');
    localStorage.setItem('miniCycleLiteTheme', 'dark');
    if (darkToggle) darkToggle.textContent = '☀️'; // Sun emoji for dark mode
  }
  
  showNotification('Theme changed to ' + (isDark ? 'light' : 'dark') + ' mode', 'info');
}

// ==========================================
// 📱 MENU SYSTEM
// ==========================================

// ✅ CORRECTED setupMenuSystem function:
function setupMenuSystem() {
  if (!menuButton || !menu) {
    console.log('📱 Menu system disabled - elements not found');
    console.log('MenuButton:', !!menuButton, 'Menu:', !!menu);
    return;
  }
  
  // Menu toggle
  menuButton.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });
  
  // Close button inside menu (corrected ID)
  var closeBtn = document.getElementById('close-main-menu');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }
  
  // Close menu when clicking outside
  document.addEventListener("click", function(e) {
    if (!menu.contains(e.target) && !menuButton.contains(e.target)) {
      closeMenu();
    }
  });
  
  // Escape key to close menu
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" || e.keyCode === 27) {
      closeMenu();
    }
  });
  
  // Setup menu button handlers
  setupMenuButtons();
  
  console.log('✅ Menu system initialized successfully');
}

function toggleMenu() {
  if (!menu) return;
  
  var isVisible = menu.classList.contains('visible');
  if (isVisible) {
    closeMenu();
  } else {
    openMenu();
  }
}

function openMenu() {
  if (!menu) return;
  
  menu.classList.add('visible');
  updateCurrentDate();
}

function closeMenu() {
  if (!menu) return;
  
  menu.classList.remove('visible');
}

function setupMenuButtons() {
  // Delete all tasks
  var deleteAllBtn = document.getElementById('delete-all-mini-cycle-tasks');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', function() {
      if (confirm('Delete all tasks? This cannot be undone.')) {
        deleteAllTasks();
        closeMenu();
      }
    });
  }

    // ✅ ADD THIS: Clear completed tasks
  var clearCompletedBtn = document.getElementById('clear-mini-cycle-tasks');
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', function() {
      if (confirm('Clear all completed tasks? This cannot be undone.')) {
        clearCompletedTasks();
        closeMenu();
      }
    });
  }
  
  // Exit mini cycle
  var exitBtn = document.getElementById('exit-mini-cycle');
  if (exitBtn) {
    exitBtn.addEventListener('click', function() {
      if (confirm('Exit miniCycle? Your data will be saved.')) {
        window.close();
      }
    });
  }
  
  // Stats button
  var statsBtn = document.getElementById('show-stats');
  if (statsBtn) {
    statsBtn.addEventListener('click', function() {
      showStatsPanel();
      closeMenu();
    });
  }
}

function deleteAllTasks() {
  if (!taskList) return;
  
  saveUndoState('deleteAll');
  taskList.innerHTML = '';
  updateProgressBar();
  checkCompleteAllButton();
  autoSave();
  showNotification('All tasks deleted', 'info');
}

function updateCurrentDate() {
  var dateElement = document.getElementById('current-date');
  if (dateElement) {
    var now = new Date();
    var dateString = now.toLocaleDateString();
    dateElement.textContent = dateString;
  }
}




// ✅ REPLACE the clearCompletedTasks function with this:

function clearCompletedTasks() {
  if (!taskList) return;
  
  var taskItems = taskList.children;
  var uncheckedCount = 0;
  
  // ✅ Save undo state before clearing
  saveUndoState('clearCompleted');
  
  // ✅ Find all completed tasks and uncheck them
  for (var i = 0; i < taskItems.length; i++) {
    var taskItem = taskItems[i];
    var checkbox = taskItem.querySelector("input[type='checkbox']");
    
    if (checkbox && checkbox.checked) {
      checkbox.checked = false; // ✅ Uncheck instead of delete
      uncheckedCount++;
      
      // ✅ Trigger change event to update any listeners
      triggerEvent(checkbox, "change");
    }
  }
  
  // ✅ Update UI and save
  updateProgressBar();
  checkCompleteAllButton();
  autoSave();
  
  if (uncheckedCount > 0) {
    showNotification('Unchecked ' + uncheckedCount + ' completed task' + (uncheckedCount === 1 ? '' : 's'), 'success');
  } else {
    showNotification('No completed tasks to clear', 'info');
  }
  
  console.log('🔄 Unchecked ' + uncheckedCount + ' completed tasks');
}
// ==========================================
// 🔔 NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type) {
  console.log('🔔 ' + (type || 'info').toUpperCase() + ':', message);
  
  // Simple visual notification (you can enhance this)
  var notification = document.createElement('div');
  notification.className = 'notification notification-' + (type || 'info');
  notification.textContent = message;
  notification.style.cssText = [
    'position: fixed',
    'top: 20px',
    'left: 50%',
    'transform: translateX(-50%)',
    'background: rgba(0,0,0,0.8)',
    'color: white',
    'padding: 10px 20px',
    'border-radius: 5px',
    'z-index: 1000',
    'font-size: 14px'
  ].join(';');
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(function() {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// ==========================================
// 🎉 ANIMATIONS
// ==========================================

function showCompleteAllAnimation() {
  var animation = document.createElement('div');
  animation.className = 'lite-complete-animation';
  animation.textContent = '🎉';
  
  document.body.appendChild(animation);
  
  setTimeout(function() {
    if (animation.parentNode) {
      animation.parentNode.removeChild(animation);
    }
  }, 2000);
}

// ==========================================
// ↩️ UNDO/REDO SYSTEM
// ==========================================

function saveUndoState(action) {
  if (undoStack.length >= UNDO_LIMIT) {
    undoStack.shift(); // Remove oldest
  }
  
  var state = {
    action: action,
    timestamp: Date.now(),
    tasks: getCurrentTasksState()
  };
  
  undoStack.push(state);
  redoStack = []; // Clear redo stack
  updateUndoRedoButtons();
}

function getCurrentTasksState() {
  if (!taskList) return [];
  
  var tasks = [];
  var taskElements = taskList.children;
  
  for (var i = 0; i < taskElements.length; i++) {
    var taskElement = taskElements[i];
    var taskText = taskElement.querySelector(".task-text");
    var checkbox = taskElement.querySelector("input[type='checkbox']");
    
    if (taskText && checkbox) {
      tasks.push({
        text: taskText.textContent,
        completed: checkbox.checked
      });
    }
  }
  
  return tasks;
}

function updateUndoRedoButtons() {
  var undoBtn = document.getElementById('undo-btn');
  var redoBtn = document.getElementById('redo-btn');
  
  if (undoBtn) {
    undoBtn.disabled = undoStack.length === 0;
  }
  
  if (redoBtn) {
    redoBtn.disabled = redoStack.length === 0;
  }
}

// ==========================================
// 💬 FEEDBACK MODAL SYSTEM (ES5 Compatible)
// ==========================================

// ✅ FIXED setupFeedbackModal function - handle button click instead of form submit
function setupFeedbackModal() {
  var openFeedbackBtn = document.getElementById('open-feedback-modal');
  var feedbackModal = document.getElementById('feedback-modal');
  var closeFeedbackBtns = document.querySelectorAll('.close-feedback-modal');
  var submitButton = document.getElementById('submit-feedback'); // ✅ Get submit button directly
  var thankYouMessage = document.getElementById('thank-you-message');
  
  if (!openFeedbackBtn || !feedbackModal) {
    console.log('💬 Feedback modal elements not found - skipping setup');
    return;
  }
  
  // ✅ Open feedback modal
  openFeedbackBtn.addEventListener('click', function() {
    openFeedbackModal();
    closeMenu(); // Close main menu if open
  });
  
  // ✅ Close feedback modal handlers
  for (var i = 0; i < closeFeedbackBtns.length; i++) {
    closeFeedbackBtns[i].addEventListener('click', function() {
      closeFeedbackModal();
    });
  }
  
  // ✅ Close on background click
  feedbackModal.addEventListener('click', function(e) {
    if (e.target === feedbackModal) {
      closeFeedbackModal();
    }
  });
  
  // ✅ Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      if (feedbackModal.style.display === 'flex') {
        closeFeedbackModal();
      }
    }
  });
  
  // ✅ FIXED: Handle submit button click instead of form submit
  if (submitButton) {
    submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      handleFeedbackSubmission(e);
    });
  }
  
  console.log('✅ Feedback modal system initialized');
}

// ✅ Open feedback modal function
function openFeedbackModal() {
  var feedbackModal = document.getElementById('feedback-modal');
  var feedbackText = document.getElementById('feedback-text');
  var thankYouMessage = document.getElementById('thank-you-message');
  var feedbackForm = document.getElementById('feedback-form');
  
  if (feedbackModal) {
    // ✅ Reset modal state
    if (thankYouMessage) thankYouMessage.style.display = 'none';
    if (feedbackForm) feedbackForm.style.display = 'block';
    
    // ✅ Show modal
    feedbackModal.style.display = 'flex';
    
    // ✅ Focus on textarea for better UX
    if (feedbackText) {
      setTimeout(function() {
        try {
          feedbackText.focus();
        } catch (e) {
          console.log('Focus failed - continuing anyway');
        }
      }, 100);
    }
    
    console.log('💬 Feedback modal opened');
  }
}

// ✅ Close feedback modal function
function closeFeedbackModal() {
  var feedbackModal = document.getElementById('feedback-modal');
  
  if (feedbackModal) {
    feedbackModal.style.display = 'none';
    console.log('💬 Feedback modal closed');
  }
}

// ✅ ENHANCED handleFeedbackSubmission to handle button clicks
function handleFeedbackSubmission(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  
  var feedbackForm = document.getElementById('feedback-form');
  var submitButton = document.getElementById('submit-feedback');
  var thankYouMessage = document.getElementById('thank-you-message');
  var feedbackText = document.getElementById('feedback-text');
  
  if (!feedbackForm) {
    console.error('Feedback form not found');
    return;
  }
  
  console.log('🔄 Processing feedback submission...');
  
  // ✅ Validate input
  var messageText = feedbackText ? feedbackText.value.trim() : '';
  if (!messageText) {
    showNotification('Please enter your feedback before submitting', 'warning');
    return;
  }
  
  // ✅ Show loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    console.log('🔄 Submit button disabled, showing loading state');
  }
  
  // ✅ Create form data (ES5 compatible)
  var formData = new FormData(feedbackForm);
  
  // ✅ Add additional data to match full version
  formData.append('subject', 'miniCycle Lite Feedback');
  formData.append('user_agent', navigator.userAgent);
  formData.append('timestamp', new Date().toISOString());
  formData.append('app_version', 'miniCycle Lite v1.0');
  
  console.log('📤 Sending feedback to:', feedbackForm.action);
  
  // ✅ Submit using XMLHttpRequest (ES5 compatible)
  var xhr = new XMLHttpRequest();
  xhr.open('POST', feedbackForm.action, true);
  
  xhr.onreadystatechange = function() {
    console.log('📡 XHR State:', xhr.readyState, 'Status:', xhr.status);
    
    if (xhr.readyState === 4) {
      // ✅ Reset button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
      }
      
      if (xhr.status === 200) {
        console.log('✅ Feedback submitted successfully');
        // ✅ Success - hide form and show thank you message
        if (feedbackForm) feedbackForm.style.display = 'none';
        if (thankYouMessage) {
          thankYouMessage.style.display = 'block';
          thankYouMessage.innerHTML = '✅ Thank you for your feedback!';
        }
        
        // ✅ Clear the form for next time
        if (feedbackText) feedbackText.value = '';
        var emailInput = document.querySelector('input[name="email"]');
        if (emailInput) emailInput.value = '';
        
        // ✅ Show success notification
        showNotification('Feedback sent successfully! Thank you!', 'success');
        
        // ✅ Auto-close modal after 3 seconds
        setTimeout(function() {
          closeFeedbackModal();
          // Reset form display for next time
          if (feedbackForm) feedbackForm.style.display = 'block';
          if (thankYouMessage) thankYouMessage.style.display = 'none';
        }, 3000);
      } else {
        console.error('❌ Feedback submission failed with status:', xhr.status);
        // ✅ Error
        handleFeedbackError();
      }
    }
  };
  
  xhr.onerror = function() {
    console.error('❌ Network error during feedback submission');
    // ✅ Network error
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
    handleFeedbackError();
  };
  
  // ✅ Send the form data
  try {
    xhr.send(formData);
    console.log('📤 Feedback data sent via XHR');
  } catch (error) {
    console.error('❌ Failed to submit feedback:', error);
    handleFeedbackError();
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  }
}

// ✅ Handle successful feedback submission
function handleFeedbackSuccess() {
  var feedbackForm = document.getElementById('feedback-form');
  var thankYouMessage = document.getElementById('thank-you-message');
  var feedbackText = document.getElementById('feedback-text');
  
  // ✅ Hide form and show thank you message
  if (feedbackForm) feedbackForm.style.display = 'none';
  if (thankYouMessage) {
    thankYouMessage.style.display = 'block';
    thankYouMessage.innerHTML = '✅ Thank you for your feedback!<br>We appreciate your input.';
  }
  
  // ✅ Clear the form for next time
  if (feedbackText) feedbackText.value = '';
  
  // ✅ Show success notification
  showNotification('Feedback sent successfully! Thank you!', 'success');
  
  // ✅ Auto-close modal after 3 seconds
  setTimeout(function() {
    closeFeedbackModal();
  }, 3000);
  
  console.log('✅ Feedback submitted successfully');
}

// ✅ Handle feedback submission error
function handleFeedbackError() {
  showNotification('Failed to send feedback. Please try again later.', 'error');
  
  var thankYouMessage = document.getElementById('thank-you-message');
  if (thankYouMessage) {
    thankYouMessage.style.display = 'block';
    thankYouMessage.innerHTML = '❌ Failed to send feedback.<br>Please try again later or contact support.';
    thankYouMessage.style.color = 'red';
  }
  
  console.error('❌ Failed to submit feedback');
}

// ✅ Add keyboard support for feedback modal
function setupFeedbackKeyboardSupport() {
  var feedbackText = document.getElementById('feedback-text');
  
  if (feedbackText) {
    // ✅ Ctrl+Enter to submit (like many apps)
    feedbackText.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.keyCode === 13)) {
        e.preventDefault();
        var submitButton = document.getElementById('submit-feedback');
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      }
    });
  }
}

// ==========================================
// 📊 STATS PANEL FUNCTIONS
// ==========================================



function showStatsPanel() {
  var statsPanel = document.getElementById("stats-panel");
  var taskView = document.getElementById("task-view");
  
  if (statsPanel && taskView) {
    // ✅ IE-compatible class management
    removeClass(statsPanel, 'hide');
    addClass(statsPanel, 'show');
    removeClass(taskView, 'show');
    addClass(taskView, 'hide');
    
    updateStats();
    updateNavigationState();
    
    console.log('📊 Stats panel shown');
  }
}

function showTaskView() {
  var statsPanel = document.getElementById("stats-panel");
  var taskView = document.getElementById("task-view");
  
  if (statsPanel && taskView) {
    // ✅ IE-compatible class management
    removeClass(statsPanel, 'show');
    addClass(statsPanel, 'hide');
    removeClass(taskView, 'hide');
    addClass(taskView, 'show');
    
    updateNavigationState();
    
    console.log('📝 Task view shown');
  }
}
function showTaskView() {
  var statsPanel = document.getElementById("stats-panel");
  var taskView = document.getElementById("task-view");
  
  if (statsPanel && taskView) {
    statsPanel.classList.remove('show');
    statsPanel.classList.add('hide');
    taskView.classList.remove('hide');
    taskView.classList.add('show');
  }
}

// ✅ ADD this enhanced navigation setup function:

function setupEnhancedNavigation() {
  var slideLeft = document.getElementById('slide-left');
  var slideRight = document.getElementById('slide-right');
  var dots = document.querySelectorAll('.navigation-dots .dot');
  
  // ✅ Slide arrow handlers
  if (slideRight) {
    slideRight.addEventListener('click', function() {
      showStatsPanel();
      updateNavigationState();
    });
    
    // Keyboard support
    slideRight.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13 || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
        showStatsPanel();
        updateNavigationState();
      }
    });
  }
  
  if (slideLeft) {
    slideLeft.addEventListener('click', function() {
      showTaskView();
      updateNavigationState();
    });
    
    // Keyboard support
    slideLeft.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13 || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
        showTaskView();
        updateNavigationState();
      }
    });
  }
  
  // ✅ Navigation dots handlers
  for (var i = 0; i < dots.length; i++) {
    (function(dot) {
      dot.addEventListener('click', function() {
        var view = dot.getAttribute('data-view');
        if (view === 'tasks') {
          showTaskView();
        } else if (view === 'stats') {
          showStatsPanel();
        }
        updateNavigationState();
      });
      
      // Keyboard support for dots
      dot.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13 || e.key === ' ' || e.keyCode === 32) {
          e.preventDefault();
          var view = dot.getAttribute('data-view');
          if (view === 'tasks') {
            showTaskView();
          } else if (view === 'stats') {
            showStatsPanel();
          }
          updateNavigationState();
        }
      });
    })(dots[i]);
  }
  
  console.log('✅ Enhanced navigation initialized');
}

// ✅ ADD this function to manage navigation states:

function updateNavigationState() {
  var statsPanel = document.getElementById("stats-panel");
  var taskView = document.getElementById("task-view");
  var slideLeft = document.getElementById('slide-left');
  var slideRight = document.getElementById('slide-right');
  var dots = document.querySelectorAll('.navigation-dots .dot');
  
  // ✅ Determine current view
  var isStatsView = statsPanel && hasClass(statsPanel, 'show');
  var isTaskView = taskView && hasClass(taskView, 'show');
  
  // ✅ Update slide arrows visibility and states
  if (slideLeft && slideRight) {
    if (isStatsView) {
      // On stats view - show left arrow, hide right arrow
      slideLeft.style.display = 'block';
      slideRight.style.display = 'none';
      slideLeft.setAttribute('aria-pressed', 'false');
    } else {
      // On task view - show right arrow, hide left arrow
      slideRight.style.display = 'block';
      slideLeft.style.display = 'none';
      slideRight.setAttribute('aria-pressed', 'false');
    }
  }
  
  // ✅ Update navigation dots
  for (var i = 0; i < dots.length; i++) {
    var dot = dots[i];
    var view = dot.getAttribute('data-view');
    
    if ((view === 'stats' && isStatsView) || (view === 'tasks' && isTaskView)) {
      // ✅ Active dot
      removeClass(dot, 'inactive');
      addClass(dot, 'active');
      dot.setAttribute('aria-selected', 'true');
      dot.setAttribute('tabindex', '0');
    } else {
      // ✅ Inactive dot
      removeClass(dot, 'active');
      addClass(dot, 'inactive');
      dot.setAttribute('aria-selected', 'false');
      dot.setAttribute('tabindex', '-1');
    }
  }
  
  console.log('🎯 Navigation state updated - Stats view:', isStatsView, 'Task view:', isTaskView);
}


// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

// IE-compatible classList methods
function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ' ' + className;
  }
}

function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}

function hasClass(element, className) {
  if (element.classList) {
    return element.classList.contains(className);
  } else {
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
  }
}

// ==========================================
// 🚀 ENHANCED ERROR HANDLING
// ==========================================

window.addEventListener('error', function(e) {
  console.error('💥 JavaScript Error:', e.error);
  showNotification('An error occurred. Please refresh the page.', 'error');
});

// ==========================================
// 📱 BACK BUTTON HANDLER
// ==========================================




console.log('🎉 miniCycle Lite fully initialized with enhanced compatibility!');
// End of miniCycle-lite-scripts.js
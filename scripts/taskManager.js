// TASK MANAGER: Handles all task types and subtasks

/* --------------------
   IMPORT FROM OTHER FILES
----------------------- */


import { 
    updateProgressBar, 
    resetTaskProgress, 
    updateProgressColor 
} from './progressManager.js';


import { 
    currentTaskElement,
    selectedTask,
    activeTask,
    dragDirection,
    draggedItem,
    isRearrangeModeActive,
    activeRearrangeTask,
    counter,
    isResetting,
    errorN,
    isStopWatchRunning,
    startTime,
    elapsedTime,
    checkboxContainermain
} from './state.js';

/* --------------------
   MAIN TASK MANAGEMENT
----------------------- */



function addCheckboxmain(id){
    checkboxContainermain = document.createElement('div');
    checkboxContainermain.className = 'checkbox-container-main';
    checkboxContainermain.id = id + '-container';
    checkboxContainermain.setAttribute('data-task-id', id);


  };


    // Function to add a new checkbox to the list
    function addCheckbox(id, label) {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-container';
        checkboxContainer.id = id + '-container';
    
        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', id);
        checkboxLabel.className = 'checkbox-label';
        checkboxLabel.textContent = label;
    
        // Three-dot Menu button
        const menuButton = document.createElement('button');
        menuButton.innerHTML = '&#8230;'; // Three dots
        menuButton.className = 'menu-button';
    
        menuButton.addEventListener('click', function(event) {
          event.stopPropagation();
          currentTaskElement = event.target.closest('.checkbox-container');
          console.log('Setting currentTaskElement:', currentTaskElement);
    
          showHorizontalMenu(event, currentTaskElement, true);  // Pass `currentTaskElement` instead of `taskElement`
          console.log('Setting currentTaskElement:', currentTaskElement);
    
      });
    
        // Menu options
        const taskMenu = document.createElement('div');
        taskMenu.className = 'task-menu hidden';
    
        const editOption = document.createElement('button');
        editOption.textContent = 'Edit';
        editOption.addEventListener('click', () => { renameTask(id); hideHorizontalMenu(); });
        
        const detailsOption = document.createElement('button');
        detailsOption.textContent = 'Details';
        detailsOption.addEventListener('click', () => { showDetails(currentTaskElement.id.replace('-container', '')); });
        console.log('Setting currentTaskElement:', currentTaskElement);
    
    
        taskMenu.appendChild(detailsOption);
        taskMenu.appendChild(editOption);
    
    
        // Append to the main container
        checkboxContainer.appendChild(checkboxLabel);
        checkboxContainer.appendChild(menuButton);
        checkboxContainer.appendChild(taskMenu);
        checkboxContainermain.appendChild(checkboxContainer);
    
        const moveUpButton = document.createElement('button');
        moveUpButton.className = 'move-up hidden';
        moveUpButton.innerHTML = '&#x25B2;'; // Up Arrow
        // Add an event listener for the move-up button, if needed
    
        // Create the move-down button
        const moveDownButton = document.createElement('button');
        moveDownButton.className = 'move-down hidden';
        moveDownButton.innerHTML = '&#x25BC;'; // Down Arrow
        // Add an event listener for the move-down button, if needed
    
        // Append the buttons to the task container
        checkboxContainer.appendChild(moveUpButton);
        checkboxContainer.appendChild(moveDownButton);
    
       
        checkboxContainer.addEventListener('click', (event) => {
           // First, find the parent .checkbox-container-main
           const parentContainerMain = checkboxContainer.closest('.checkbox-container-main');
        
          if (isRearrangeModeActive) {
    
    
             
                if (activeRearrangeTask !== parentContainerMain) {
                  
                  hideArrowsForAllTasks();
                  
                    // Activate rearrange mode for this task
                    activeRearrangeTask = parentContainerMain;
                    toggleArrowVisibility(parentContainerMain, true);  // Show arrows
                } 
              console.log("Task completion disabled during rearrange mode.");
              return;
          }
          
          // Check if the clicked element is the three-dot button or a child of it
          if (event.target === menuButton || menuButton.contains(event.target)) {
              // If the three-dot button or its children were clicked, don't proceed further
              return;
          }
        
         
          // Then, within that, find the .subtask-container
          const associatedSubtaskContainerMain = parentContainerMain.querySelector('.subtask-container');
        
          // Check if there are any subtasks in the associatedSubtaskContainerMain
          const subtasks = associatedSubtaskContainerMain.querySelectorAll('.subtask-row');
        
          if (subtasks.length > 0) {
            // Toggle the visibility of the subtaskContainermain if subtasks exist
            associatedSubtaskContainerMain.classList.toggle('hidden');
        } else {
            // If there are no subtasks, toggle the completed state
            checkboxContainer.classList.toggle('completed');
            updateProgressBar();
            //triggerLogoBackground('#4790df', 300); 
            
            changebglogocolor(checkboxContainer);
            checkCompletion();
        
            // Log the task completion change in the timeline
            const taskLabel = checkboxContainer.querySelector('.checkbox-label').textContent;
            const isCompleted = checkboxContainer.classList.contains('completed');
            const action = isCompleted ? 'Task Marked as Completed' : 'Task Marked as Uncompleted';
            const entryType = isCompleted ? 'completed' : 'uncompleted'; // Specify entry type based on completion status
        
            // Add entry to timeline with the specified entry type
            addToTimeline(action, taskLabel, entryType);
    
          
        
            // Update the visibility of the clear button
            updateClearButtonVisibility();
        }
        
    
      // Find the associated subtask container
      const associatedSubtaskContainer = checkboxContainer.closest('.checkbox-container-main').querySelector('.subtask-container');
    
    
            // Check if there are no subtasks
      if (!associatedSubtaskContainer || associatedSubtaskContainer.querySelectorAll('.subtask-row').length === 0) {
        if (!checkboxContainer.classList.contains('completed')) {
            // Task is being uncompleted and has no subtasks
            resetTaskProgress(checkboxContainer);
            updateProgressColor(checkboxContainer);
            checkboxContainer.style.backgroundColor = ''; // Reset background color
        }
    }
    
        });
      
        
    
    
    
    // Updated Three-Dot Menu Button click event listener
    menuButton.addEventListener('click', function(event) {
      event.stopPropagation(); // Prevent other click events from hiding the menu immediately
      const menu = menuButton.nextElementSibling;
    
      menu.classList.toggle('hidden');
    });
    
        updateProgressBar();
    }
    
    
// Function to create a new checkbox if its label isn't empty
function createCheckboxIfNotEmpty() {
    const newLabel = newCheckboxLabelInput.value;
    if (newLabel.trim() !== '') {
      const newCheckboxContainerId = `checkbox-container${checkboxCounter}`;
      addCheckboxmain(newCheckboxContainerId);
  
      const newCheckboxId = `checkbox${checkboxCounter}`;
      addCheckbox(newCheckboxId, newLabel);
  
      const newSubtaskContainerLabelID = `Subtask-Container${checkboxCounter}`; 
      addSubtaskContainer(newSubtaskContainerLabelID);
  
      // Append the main checkbox container to the list
      checkboxList.appendChild(checkboxContainermain);
  
      // Add this line to log task creation
      addToTimeline('Task Created', newLabel); // Log the creation of the task
      updateClearButtonVisibility();
  
      // Increment the checkboxCounter after creating the subtask container
      checkboxCounter++;
  
      // Reset the input field for new checkbox label
      newCheckboxLabelInput.value = '';
      newCheckboxLabelInput.style.display = 'none';
      taskNumber++;
        // Update stats button visibility
        updateStatsButtonVisibility();
    }
  }
  

    // Function to rename a task
    function renameTask(id) {
        const checkboxContainer = document.getElementById(id + '-container');
        const labelElement = checkboxContainer.querySelector('.checkbox-label');
        const currentLabel = labelElement.textContent;
    
        labelElement.textContent = ''; // Clear current label
    
        const renameInput = document.createElement('input');
        renameInput.type = 'text';
        renameInput.className = 'rename-input';
        renameInput.value = currentLabel;
        renameInput.placeholder = "Enter new name for task";
        renameInput.addEventListener('blur', () => {
            const newLabel = renameInput.value ? renameInput.value : currentLabel;
            if (newLabel !== currentLabel) {
                addToTimeline('Task Renamed', `From '${currentLabel}' to '${newLabel}'`,'edited');
                updateClearButtonVisibility();
            }
            labelElement.textContent = newLabel;
            renameInput.remove(); // Remove input field
        });
    
        labelElement.appendChild(renameInput);
        renameInput.focus();
    }

    function deleteTask(e) {
        console.log('delete button clicked');
        e.stopPropagation();
        
        if (selectedTask) {
            console.log('Found task to delete:', selectedTask);
            const parentContainer = selectedTask.closest('.checkbox-container-main');
            if (parentContainer) {
            // Extract the task label text before deleting the task
            const taskLabelElement = selectedTask.querySelector('.checkbox-label');
            const taskLabel = taskLabelElement ? taskLabelElement.textContent : 'Unknown Task';
      
              // Log the deletion of the task before removing it
            addToTimeline('Task Deleted', taskLabel); // Log the deletion of the task
            updateClearButtonVisibility();
                parentContainer.remove();
            } else {
                selectedTask.remove(); // Fallback to remove the selectedTask itself if parent is not found (just to be safe)
            }
            
        } else {
            console.log('No task found to delete');
        }
        hideHorizontalMenu();
      
          // Update stats button visibility
          updateStatsButtonVisibility();
          updateProgressBar();
      
      }
      
        // Event listener for the add button to show input for a new checkbox
        addButton.addEventListener('click', () => {
            newCheckboxLabelInput.style.display = 'block';
            // TTO-10 newCheckboxLabelInput.value = 'Task Item '+ taskNumber;
            newCheckboxLabelInput.focus();
            newCheckboxLabelInput.addEventListener('blur', createCheckboxIfNotEmpty);
        });
  

          
/* --------------------
   SUBTASK MANAGEMENT
----------------------- */
function addSubtaskContainer(id, priority = '') {
    // Create a container for the subtasks (to be scrollable)
    let subtasksScrollContainer = document.createElement('div');
    subtasksScrollContainer.className = 'subtasks-scroll-container';
  
    // Create a container for the subtask
    let subtaskContainer = document.createElement('div');
    subtaskContainer.className = 'subtask-container hidden';
    subtaskContainer.id = id + '-container';
  
    // Add data-task-id to the subtask container
    subtaskContainer.setAttribute('data-task-id', id);
  
    // Create a container to hold all subtask rows
    let subtaskList = document.createElement('div');
    subtaskList.className = 'subtask-list';
  
    const addSubtaskButton = document.createElement('button');
    addSubtaskButton.textContent = 'Add Subtask';
  // Add event listener for logging generic timeline event
  addSubtaskButton.addEventListener('click', () => {
    logGenericSubtaskCreation(); // Log that a subtask was created
  });
  
    addSubtaskButton.addEventListener('click', () => {
      const newSubtaskLabelID = `Subtask${subtaskCounter}`;
      addSubtaskCheckbox(newSubtaskLabelID, "", subtaskContainer, true);
    });
  
    const completeTaskButton = document.createElement('button');
    completeTaskButton.textContent = 'Complete Task';
    completeTaskButton.className = 'complete-task-button hidden'; // initially hidden
    completeTaskButton.addEventListener('click', () => {
      toggleTaskCompletion(completeTaskButton, subtaskContainer);
    });
  
    // Modify the class of subtaskContainer based on priority
    if (priority === 'high') {
      subtaskContainer.classList.add('subtask-container-high');
    } else if (priority === 'low') {
      subtaskContainer.classList.add('subtask-container-low');
    }
  
    // Append the subtask list to the subtaskContainer
    subtaskContainer.appendChild(subtaskList);
  
    // Append the scrollable container for subtasks
    subtaskContainer.appendChild(subtasksScrollContainer);
  
    // Append the button to add more subtasks
    subtaskContainer.appendChild(addSubtaskButton);
  
    // Append the complete task button
    subtaskContainer.appendChild(completeTaskButton);
  
    // Attach the subtaskContainermain to checkboxContainermain
    checkboxContainermain.appendChild(subtaskContainer);
  }
       

  function addSubtaskCheckbox(_id, label, subtaskContainer, isNew = false) {
    console.log('addSubtaskCheckbox created');
    const subtaskList = subtaskContainer.querySelector('.subtask-list');
    
    // Create a container for each subtask
    let subtaskRow = document.createElement('div');
    subtaskRow.className = 'subtask-row';

    
    // Add a unique data-subtask-id to the subtask row
    subtaskRow.setAttribute('data-subtask-id', `subtask-${subtaskCounter}`);
  
    // Add data-task-id to the subtask row (inherit from parent container)
    const parentTaskId = subtaskContainer.getAttribute('data-task-id');
    subtaskRow.setAttribute('data-task-id', parentTaskId);
  
    // Create the checkbox for the main subtask
    let subtaskCheckbox = document.createElement('input');
    subtaskCheckbox.type = 'checkbox';
    subtaskCheckbox.id = 'subtask-main-' + subtaskCounter;
    subtaskCheckbox.className = 'subtask-checkbox';
    subtaskCheckbox.addEventListener('change', function () {
      handleSubtaskChange(subtaskContainer);
    });
  
    // Create the label for the main subtask
    const subtaskLabel = document.createElement('label');
    subtaskLabel.setAttribute('for', subtaskCheckbox.id);
    subtaskLabel.className = 'subtask-label';
    subtaskLabel.textContent = label;

  
  
    if (isNew) {
      editSubtaskName(subtaskLabel);
    }
  
    // Create the "Rename" button for the subtask
    const renameButton = document.createElement('button');
    renameButton.innerHTML = '<i class="fas fa-edit"></i>';
    renameButton.addEventListener('click', function () {
      editSubtaskName(subtaskLabel);
    });
  


  function editSubtaskName(labelElement, subtaskContainer) {
    const currentText = labelElement.textContent;
    labelElement.textContent = ''; // Clear current label

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;

    // Set placeholder
    editInput.placeholder = "Enter Subtask Name";

    // Handle blur event
    editInput.addEventListener('blur', () => {
        const newSubtaskName = editInput.value.trim() !== '' ? editInput.value : currentText;
        labelElement.textContent = newSubtaskName; 
        editInput.remove();
        

        // Add to the timeline if the name changed
        if (newSubtaskName !== currentText) {
            addToTimeline('Subtask Name Set', newSubtaskName, 'edited');
        }

    });

    // Listen for Enter key press
    editInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            editInput.blur(); // Trigger the blur event to finalize the name
        }
        
    });

    labelElement.appendChild(editInput);
    editInput.focus();
}
  
    // Create the "Delete" button for the subtask
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.addEventListener('click', function () {
      const subtaskLabel = subtaskRow.querySelector('.subtask-label').textContent;
      addToTimeline('Subtask Deleted', subtaskLabel);
      updateClearButtonVisibility();
  
      subtaskRow.remove();
      const remainingSubtasks = subtaskContainer.querySelectorAll('.subtask-row');
      const parentContainerMain = subtaskContainer.closest('.checkbox-container-main');
      const mainCheckboxContainer = parentContainerMain.querySelector('.checkbox-container');
      const completeTaskButton = parentContainerMain.querySelector('.complete-task-button');
    
      if (remainingSubtasks.length === 0) {
        resetTaskProgress(mainCheckboxContainer); 
        // Reset task completion status and update button state
        mainCheckboxContainer.classList.remove('completed', 'manually-completed');
        completeTaskButton.textContent = 'Complete Task';
        completeTaskButton.classList.add('hidden');
        subtaskContainer.classList.add('hidden');
    
        // Reset background color and update progress
        mainCheckboxContainer.style.backgroundColor = '';
        updateProgressColor(mainCheckboxContainer);
      } else {
        // Adjust visibility of 'Complete Task' button
        if (remainingSubtasks.length < 2) {
          completeTaskButton.classList.add('hidden');
        } else {
          completeTaskButton.classList.remove('hidden');
        }
      }
      handleSubtaskChange(subtaskContainer);
    });

  
  
    // Append the checkbox, label, rename button, and delete button to the subtaskRow
    subtaskRow.appendChild(subtaskCheckbox);
    subtaskRow.appendChild(subtaskLabel);
    subtaskRow.appendChild(renameButton);
    subtaskRow.appendChild(deleteButton);
  
    // Append the subtask row to the subtask list
    subtaskList.appendChild(subtaskRow);
  


    
   // After adding a subtask, check the number of subtasks
   const totalSubtasks = subtaskContainer.querySelectorAll('.subtask-row').length;
   const completeTaskButton = subtaskContainer.querySelector('.complete-task-button');
   const mainCheckboxContainer = subtaskContainer.closest('.checkbox-container-main').querySelector('.checkbox-container');
  
   if (totalSubtasks === 1) {
    completeTaskButton.classList.add('hidden');
    mainCheckboxContainer.classList.remove('completed', 'manually-completed');
    updateProgressColor(mainCheckboxContainer);
  } else {
    completeTaskButton.classList.remove('hidden');
  }

  // Call handleSubtaskChange to update the progress bar and other UI elements
  handleSubtaskChange(subtaskContainer);

  
    // Increment the subtask counter
    subtaskCounter++;
  }


function handleSubtaskChange(subtaskContainer, shouldCheckCompletion = true) {
    const parentContainerMain = subtaskContainer.closest('.checkbox-container-main');
    const mainCheckboxContainer = parentContainerMain.querySelector('.checkbox-container');

        // Skip progress updates if the task is manually completed
        if (mainCheckboxContainer.classList.contains('manually-completed')) {
          return;
      }

    // Attach event listeners to subtask checkboxes if not already attached
    subtaskContainer.querySelectorAll('.subtask-checkbox').forEach(subtaskCheckbox => {
        if (!subtaskCheckbox.classList.contains('listener-attached')) {
            subtaskCheckbox.addEventListener('change', () => {
                const subtaskLabel = subtaskCheckbox.nextElementSibling
                    ? subtaskCheckbox.nextElementSibling.textContent
                    : 'Unnamed Subtask';
                const isCompleted = subtaskCheckbox.checked;
                const action = isCompleted ? 'Subtask Marked as Completed' : 'Subtask Marked as Uncompleted';
                const entryType = isCompleted ? 'completed' : 'uncompleted';

                addToTimeline(action, subtaskLabel, entryType);
                updateClearButtonVisibility();
            });

            // Mark the checkbox to avoid duplicate event listeners
            subtaskCheckbox.classList.add('listener-attached');
        }
    });

    // Skip progress updates if the task is manually completed
    if (mainCheckboxContainer.classList.contains('manually-completed')) {
        return;
    }

    const allSubtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox');
    const checkedSubtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox:checked');

    // Handle case where no subtasks exist
    if (allSubtaskCheckboxes.length === 0) {
        mainCheckboxContainer.classList.remove('completed');
        subtaskContainer.classList.add('hidden');
        resetTaskProgress(mainCheckboxContainer);
        updateProgressColor(mainCheckboxContainer);
        mainCheckboxContainer.style.backgroundColor = '';
        return;
    }

    // Calculate and apply completion percentage
    const completionPercentage = (checkedSubtaskCheckboxes.length / allSubtaskCheckboxes.length) * 100;
    mainCheckboxContainer.style.setProperty('--progress', `${completionPercentage}%`);

    // Update completion status of the main task
    const isAllSubtasksCompleted = checkedSubtaskCheckboxes.length === allSubtaskCheckboxes.length;

    if (isAllSubtasksCompleted) {
        if (!mainCheckboxContainer.classList.contains('completed')) {
            mainCheckboxContainer.classList.add('completed');
            subtaskContainer.classList.add('hidden'); // Hide subtasks when completed
            logMainTaskCompletionStatus(mainCheckboxContainer, true);
        }
    } else {
        if (mainCheckboxContainer.classList.contains('completed')) {
            mainCheckboxContainer.classList.remove('completed');
            subtaskContainer.classList.remove('hidden'); // Show subtasks if not fully completed
            logMainTaskCompletionStatus(mainCheckboxContainer, false);
        }
    }

    // Update UI elements
    updateProgressColor(mainCheckboxContainer);
    updateProgressBar();

    // Check overall completion status if required
    if (shouldCheckCompletion) {
        checkCompletion();
    }
}

function resetSubtaskCheckboxes() {
    const allSubtasks = document.querySelectorAll('.subtask-checkbox');
    allSubtasks.forEach(subtask => {
        subtask.checked = false;
    });
    updateProgressBar();
  }

  function resetSubtaskState() {
    // Get all completeTaskButtons
    const completeTaskButtons = document.querySelectorAll('.complete-task-button');
  
    // Iterate over each button and reset it if it's labeled "Uncomplete Task"
    completeTaskButtons.forEach(button => {
      if (button.textContent === 'Uncomplete Task') {
        button.textContent = 'Complete Task';
  
        // Get the associated subtaskContainer
        const subtaskContainer = button.closest('.subtask-container');
  
        // Uncheck all subtasks within this container
        const subtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox');
        subtaskCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
  
      }
    });
  }

    function logGenericSubtaskCreation() {
    addToTimeline('A new subtask was created', null, 'info');
}



/* --------------------
TASK CYCLE MANAGEMENT
----------------------- */


function initiateTaskCycle() {
    const mainTaskContainers = document.querySelectorAll('.checkbox-container-main');
  
    // Mark all tasks as completed
    mainTaskContainers.forEach(mainContainer => {
        const taskCheckbox = mainContainer.querySelector('.checkbox-container');
        taskCheckbox.classList.add('completed');
        taskCheckbox.classList.remove('manually-completed'); // Remove manually-completed class
  
        // Correctly construct subtask container ID
        const subtaskContainerId = mainContainer.id.replace('checkbox-container', 'Subtask-Container');
        const subtaskContainer = document.getElementById(subtaskContainerId);
  
        if (subtaskContainer) {
            // Hide the subtask container
            subtaskContainer.classList.add('hidden');
            
            // Reset the Complete Task button text
            const completeTaskButton = subtaskContainer.querySelector('.complete-task-button');
            if (completeTaskButton) {
                completeTaskButton.textContent = 'Complete Task';
            }
        }
    });
  
    // Log the initiation of a new task cycle in the timeline
    addToTimeline('Task Cycle Initiated', 'All tasks reset to uncompleted');
    updateClearButtonVisibility();
  
    updateProgressBar();
    counter += 1;
    updateCounter();
    completeMessage.style.display = 'block';
  
  
    // After a short delay, reset all tasks to the uncompleted state
    setTimeout(() => {
        mainTaskContainers.forEach(mainContainer => {
            const taskCheckbox = mainContainer.querySelector('.checkbox-container');
            taskCheckbox.classList.remove('completed', 'manually-completed'); // Also remove manually-completed class here
            taskCheckbox.style.setProperty('--progress', '0%');
            taskCheckbox.style.setProperty('--progress-color', '#4790df'); // Reset to default color
            taskCheckbox.style.backgroundColor = ''; // Reset background color to default
  
            // Reset subtask checkboxes and hide subtask container
            const subtaskContainer = document.getElementById(mainContainer.id.replace('checkbox-container', 'Subtask-Container'));
            if (subtaskContainer) {
                subtaskContainer.classList.add('hidden');
                const subtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox');
                subtaskCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        });
  
        resetSubtaskCheckboxes();
        completeMessage.style.display = 'none'; // Hide the "complete" message
    }, 1000);
  }
  

function checkCompletion() {
    console.log("checkCompletion called"); // To confirm the function is being called
    const parentTasks = document.querySelectorAll('#checkbox-list .checkbox-container');
  
    console.log("Checking completion for all tasks.");
    const allCompleted = Array.from(parentTasks).every(container => container.classList.contains('completed'));
  
    if (allCompleted) {
        console.log("Initiating task cycle as all tasks are completed.");
        initiateTaskCycle();
        triggerLogoBackground('green', 1000);
    } else {
        console.log("Not all tasks are completed, task cycle will not be initiated.");
    }
  }
  

  function toggleTaskCompletion(button, subtaskContainer) {
    const parentContainerMain = subtaskContainer.closest('.checkbox-container-main');
    const mainCheckboxContainer = parentContainerMain.querySelector('.checkbox-container');
    const taskLabel = mainCheckboxContainer.querySelector('.checkbox-label').textContent;

    if (button.textContent === 'Complete Task') {
        // Mark the task as completed and manually completed
        mainCheckboxContainer.classList.add('completed', 'manually-completed');
        button.textContent = 'Uncomplete Task';
        subtaskContainer.classList.add('hidden');

        // Add timeline entry for completing the task
        addToTimeline('Task Marked as Completed', taskLabel, 'completed');
        updateClearButtonVisibility();
    } else {
        // Unmark the task as completed and manually completed
        mainCheckboxContainer.classList.remove('completed', 'manually-completed');
        button.textContent = 'Complete Task';
        handleSubtaskChange(subtaskContainer, false); // Reflect current subtask progress

        // Reset the background color
        mainCheckboxContainer.style.backgroundColor = '';

        // Add timeline entry for uncompleting the task
        addToTimeline('Task Marked as Uncompleted', taskLabel);
        updateClearButtonVisibility();
    }

    // Update the progress color based on the current state
    updateProgressColor(mainCheckboxContainer);
    updateProgressBar();
    checkCompletion();
    //triggerLogoBackground('#4790df', 300);  // Change to blue for 2 seconds
    changebglogocolor(mainCheckboxContainer);
;
}
  
function completeAllTasks() {
    const allCompleteTaskButtons = document.querySelectorAll('.complete-task-button');
    
    // Debugging: Check if we have any `.complete-task-button` elements
    console.log("Total .complete-task-button elements:", allCompleteTaskButtons.length);
  
    allCompleteTaskButtons.forEach(button => {
        const parentContainer = button.closest('.checkbox-container-main');
        
        // Debugging: Check if parentContainer is found
        if (!parentContainer) {
            console.error('parentContainer not found for button:', button);
            return;  // skip this iteration
        }
  
        const mainCheckboxContainer = parentContainer.querySelector('.checkbox-container');
  
        // Debugging: Check if mainCheckboxContainer is found
        if (!mainCheckboxContainer) {
            console.error('mainCheckboxContainer not found for parentContainer:', parentContainer);
            return;  // skip this iteration
        }
      
        // Check if the main task is marked as completed
        if (mainCheckboxContainer.classList.contains('completed')) {
            const associatedSubtaskContainer = parentContainer.querySelector('.subtask-container');
            // Toggle completion
            toggleTaskCompletion(button, associatedSubtaskContainer, false);
        }
    });
    updateProgressBar();
  }
  
          
  completeButton.addEventListener('click', () => {
    const checkboxContainers = document.querySelectorAll('.checkbox-container');
  
    // Find all tasks that are marked as completed
    const completedTasks = Array.from(checkboxContainers).filter(container => container.classList.contains('completed'));
  
    // If at least one task is completed
    if (completedTasks.length > 0) {
        completeAllTasks();
        initiateTaskCycle();
        triggerLogoBackground('green', 1000);
    } else {
        errorN = 0;
        completeTooltip.style.display = 'none';
        // If no tasks are completed, show an error message
        errorMessage.textContent = 'No tasks selected for completion';
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
            errorN = 1;
        }, 5000);  // Hide the error message after 5 seconds
    }
    // Reset subtask buttons and checkboxes
  
    resetSubtaskState();
  
  });

  
  
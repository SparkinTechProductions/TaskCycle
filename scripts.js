
let currentTaskElement = null;
let dragDirection = null;
let timerInterval;
let timeInSeconds = 0;
let taskNumber = 1;
let checkboxCounter = 1;
let subtaskCounter = 0;
let subtaskCountermain = 0;
let checkboxContainermain;
let counter = 0;
var errorN = 1;
let selectedTask = null;
let draggedItem = 0;


document.addEventListener('DOMContentLoaded', (event) => {
    attachEventListeners();
});


function attachEventListeners(){
  // DOM element references and global variables
  const timerToggleButton = document.getElementById('timer-toggle-button');
  const timerContainer = document.getElementById('timer-container');
  const notesButton = document.getElementById('notes-button');
  const notesPanel = document.getElementById('notes-panel');
  const addNoteButton = document.getElementById('add-note');
  const newNoteTextarea = document.getElementById('new-note-textarea');
  const notesList = document.getElementById('notes-list');
  const closeButton = document.getElementById('close-notes');
  const menuRearrange = document.getElementById('menuRearrange');
  const detailsTextarea = document.getElementById('detailsTextarea');
  const editDetailsButton = document.getElementById('editDetailsButton');  
  const addButton = document.getElementById('add-button');
  const completeButton = document.getElementById('complete-button');
  const addTooltip = document.getElementById('add-button-tooltip');
  const completeTooltip = document.getElementById('complete-button-tooltip');
  const errorMessage = document.getElementById('error-message');
  const newCheckboxLabelInput = document.getElementById('new-checkbox-label');
  const checkboxList = document.getElementById('checkbox-list');
  const completeMessage = document.getElementById('complete-message');
  const resetButton = document.getElementById('reset-button');
  const counterDiv = document.getElementById('counter');
  const counterContainer = document.getElementById('counter-container');
  const detailsModal = document.getElementById('detailsModal');


  updateCounter() ;


//This creates the subtask window
function addSubtaskContainer(id) {
  // Create a container for the subtasks (to be scrollable)
  let subtasksScrollContainer = document.createElement('div');
  subtasksScrollContainer.className = 'subtasks-scroll-container';

  // Create a container for the subtask
  let subtaskContainer = document.createElement('div');
  subtaskContainer.className = 'subtask-container hidden';
  subtaskContainer.id = id + '-container';

  // Create a container to hold all subtask rows
  let subtaskList = document.createElement('div');
  subtaskList.className = 'subtask-list';

  const addSubtaskButton = document.createElement('button');
  addSubtaskButton.textContent = 'Add Subtask';
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



  
  // Append the subtask list to the subtaskContainer
  subtaskContainer.appendChild(subtaskList);
  
  // Append the scrollable container for subtasks
  subtaskContainer.appendChild(subtasksScrollContainer);
  
  // Append the button to add more subtasks
  subtaskContainer.appendChild(addSubtaskButton);

  subtaskContainer.appendChild(completeTaskButton);


  // Attach the subtaskContainermain to checkboxContainermain
  checkboxContainermain.appendChild(subtaskContainer);
}





function addSubtaskCheckbox(_id, label, subtaskContainer, isNew = false) {
  console.log('addsubtaskCheckbox created');
  const subtaskList = subtaskContainer.querySelector('.subtask-list');
     // Create a container for each subtask
     let subtaskRow = document.createElement('div');
     subtaskRow.className = 'subtask-row';

    // Create the checkbox for the main subtask
    let subtaskCheckbox = document.createElement('input');
    subtaskCheckbox.type = 'checkbox';
    subtaskCheckbox.id = 'subtask-main-' + subtaskCounter;
    subtaskCheckbox.className = 'subtask-checkbox';
    subtaskCheckbox.addEventListener('change', function() {
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
    renameButton.addEventListener('click', function() {
      editSubtaskName(subtaskLabel);
  });
  function editSubtaskName(labelElement) {
    const currentText = labelElement.textContent;
    labelElement.textContent = ''; // Clear current label

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;

    // Set placeholder
    editInput.placeholder = "Enter Subtask Name";

    editInput.addEventListener('blur', () => {
        labelElement.textContent = editInput.value.trim() !== '' ? editInput.value : currentText; 
        editInput.remove();
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
// Inside your 'deleteButton' event listener
// Inside your 'deleteButton' event listener
deleteButton.addEventListener('click', function() {
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




/*
    subtaskRow.setAttribute("draggable", true);
subtaskRow.addEventListener('dragstart', handleDragStart);
subtaskRow.addEventListener('dragover', handleDragOver);
subtaskRow.addEventListener('drop', handleDrop);
subtaskRow.addEventListener('dragend', handleDragEnd);
*/
    

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

    subtaskCounter++;

  }



  function updateProgressBar() {
    let totalTasks = 0;
    let completedTasksWeight = 0;
  
    const mainTaskContainers = document.querySelectorAll('.checkbox-container-main');
  
    mainTaskContainers.forEach(container => {
      const mainTaskCompleted = container.querySelector('.checkbox-container').classList.contains('completed');
      const subtasks = container.querySelectorAll('.subtask-checkbox');
      const completedSubtasks = container.querySelectorAll('.subtask-checkbox:checked');
      
      // Each main task, regardless of the number of subtasks, has a weight of 1
      totalTasks += 1;
  
      if (mainTaskCompleted) {
        // If the main task is completed, it contributes its full weight
        completedTasksWeight += 1;
      } else if (subtasks.length > 0) {
        // If the main task is not completed, each completed subtask contributes a fraction of the main task's weight
        completedTasksWeight += (completedSubtasks.length / subtasks.length);
      }
    });
  
    const completionPercentage = (completedTasksWeight / totalTasks) * 100;
    document.getElementById('progress-bar').style.width = `${completionPercentage}%`;
}

  


    function addCheckboxmain(id){
      checkboxContainermain = document.createElement('div');
      checkboxContainermain.className = 'checkbox-container-main';
      checkboxContainermain.id = id + '-container';



    };

    
   
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

    // Increment the checkboxCounter after creating the subtask container
    checkboxCounter++;

    // Reset the input field for new checkbox label
    newCheckboxLabelInput.value = '';
    newCheckboxLabelInput.style.display = 'none';
    taskNumber++;
  }
}


    function handleBlur(event) {
      if (event.target.value.trim() === '') {
          newCheckboxLabelInput.style.display = 'none';
      } 
    }
      // Handling input blur for new checkbox label
      newCheckboxLabelInput.addEventListener('blur', handleBlur);
  
    


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

   
    checkboxContainer.addEventListener('click', (event) => {
      // Check if the clicked element is the three-dot button or a child of it
      if (event.target === menuButton || menuButton.contains(event.target)) {
          // If the three-dot button or its children were clicked, don't proceed further
          return;
      }
    
      // First, find the parent .checkbox-container-main
      const parentContainerMain = checkboxContainer.closest('.checkbox-container-main');
    
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
          checkCompletion();
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



function handleDragStart(e) {
  draggedItem = this;
  setTimeout(() => {
    this.style.display = 'none';
  }, 0);
}

function handleDragEnd() {
  setTimeout(() => {
    draggedItem.style.display = 'block';
    draggedItem = null;
  }, 0);
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop() {
  if (this !== draggedItem) {
    this.parentElement.insertBefore(draggedItem, this);
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
    renameInput.addEventListener('blur', () => {
      labelElement.textContent = renameInput.value ? renameInput.value : currentLabel; // Update label
        renameInput.remove(); // Remove input field
    });

    labelElement.appendChild(renameInput);
    renameInput.focus();
  }

  function handleBlur(event) {
    if (event.target.value.trim() === '') {
        newCheckboxLabelInput.style.display = 'none';
    } 
    }


    function handleSubtaskChange(subtaskContainer, shouldCheckCompletion = true) {
      const parentContainerMain = subtaskContainer.closest('.checkbox-container-main');
      const mainCheckboxContainer = parentContainerMain.querySelector('.checkbox-container');
      
      // Ignore subtask changes if task is manually completed
      if (mainCheckboxContainer.classList.contains('manually-completed')) {
          return;
      }
  
      const allSubtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox');
      const checkedSubtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox:checked');
  
      // Handle the scenario where all subtasks are deleted
      if (allSubtaskCheckboxes.length === 0) {
          mainCheckboxContainer.classList.remove('completed');
          subtaskContainer.classList.add('hidden');
          updateProgressColor(mainCheckboxContainer); // Reset the progress color
          mainCheckboxContainer.style.backgroundColor = ''; // Reset to default background color
          return; // Exit the function early as there are no subtasks to consider
      }
  
      // Calculate completion percentage for existing subtasks
      const completionPercentage = (checkedSubtaskCheckboxes.length / allSubtaskCheckboxes.length) * 100;
      mainCheckboxContainer.style.setProperty('--progress', `${completionPercentage}%`);
  
      // Update completion status based on subtasks
      if (checkedSubtaskCheckboxes.length === allSubtaskCheckboxes.length) {
          mainCheckboxContainer.classList.add('completed');
          subtaskContainer.classList.add('hidden');
      } else {
          mainCheckboxContainer.classList.remove('completed');
          subtaskContainer.classList.remove('hidden');
      }
      updateProgressColor(mainCheckboxContainer);
  
      updateProgressBar();
       if (shouldCheckCompletion) {
        checkCompletion();
    }
  }
  
    
    function updateProgressColor(mainCheckboxContainer) {
      console.log('updateProgressColor called for:', mainCheckboxContainer);
    
      // Determine the correct color based on priority classes
      let color = '#4790df'; // Default color
      if (mainCheckboxContainer.classList.contains('marked-high')) {
          color = '#c22323'; // High priority color
      } else if (mainCheckboxContainer.classList.contains('marked-low')) {
          color = '#00C851'; // Low priority color
      }
    
      // Set the progress color variable
      mainCheckboxContainer.style.setProperty('--progress-color', color);
      console.log('Progress color set to:', color);
    
      // Update the background color based on completion and priority
      if (mainCheckboxContainer.classList.contains('completed')) {
          mainCheckboxContainer.style.backgroundColor = color;
          console.log('Updated completed task background color');
      } else {
          mainCheckboxContainer.style.backgroundColor = ''; // Reset for uncompleted task
          console.log('Reset background color for uncompleted task');
      }
    }
    
    function resetTaskProgress(mainCheckboxContainer) {
      // Logic to reset the progress bar, potentially setting --progress to 0%
      mainCheckboxContainer.style.setProperty('--progress', '0%');
      console.log('Task progress reset');
    }
    
  
  
  function toggleTaskCompletion(button, subtaskContainer) {
    const parentContainerMain = subtaskContainer.closest('.checkbox-container-main');
    const mainCheckboxContainer = parentContainerMain.querySelector('.checkbox-container');

    if (button.textContent === 'Complete Task') {
        // Mark the task as completed and manually completed
        mainCheckboxContainer.classList.add('completed', 'manually-completed');
        button.textContent = 'Uncomplete Task';
        subtaskContainer.classList.add('hidden');
    } else {
        // Unmark the task as completed and manually completed
        mainCheckboxContainer.classList.remove('completed', 'manually-completed');
        button.textContent = 'Complete Task';
        handleSubtaskChange(subtaskContainer, false); // Reflect current subtask progress

        // Reset the background color
        mainCheckboxContainer.style.backgroundColor = '';
    }

    // Update the progress color based on the current state
    updateProgressColor(mainCheckboxContainer);
    updateProgressBar();
    checkCompletion();
}



  
  
  
  function allSubtasksCompleted(container) {
    const subtasks = container.querySelectorAll('.subtask-checkbox');
    return Array.from(subtasks).every(checkbox => checkbox.checked);
  }
  

    // Updates the task counter display
    function updateCounter() {
      if (counter === 0) {
        counterContainer.classList.add('hidden');
        resetButton.classList.add('hidden');
        counterDiv.textContent = '';
      } else {
        counterContainer.classList.remove('hidden');
        resetButton.classList.remove('hidden')
        counterDiv.textContent = counter;
      }
    }
      // Timer logic
function updateTimer() {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    document.getElementById('timer').textContent = 
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
  

function checkCompletion() {
  console.log("checkCompletion called"); // To confirm the function is being called
  const parentTasks = document.querySelectorAll('#checkbox-list .checkbox-container');

  console.log("Checking completion for all tasks.");
  const allCompleted = Array.from(parentTasks).every(container => container.classList.contains('completed'));

  if (allCompleted) {
      console.log("Initiating task cycle as all tasks are completed.");
      initiateTaskCycle();
  } else {
      console.log("Not all tasks are completed, task cycle will not be initiated.");
  }
}


  
function editNote(noteElement) {
  const noteTextElement = noteElement.querySelector('.note-text');
  
  // Convert <br> tags to newlines for the textarea
  let currentText = noteTextElement.innerHTML.replace(/<br>/g, "\n");
  
  noteTextElement.innerHTML = '';

  const textarea = document.createElement('textarea');
  textarea.value = currentText;
  noteTextElement.appendChild(textarea);
  textarea.focus();

  // Save changes when the textarea loses focus
  textarea.addEventListener('blur', function() {
      saveChanges();
  });

  // Save changes when Ctrl + Enter is pressed
  textarea.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && event.ctrlKey) {
          saveChanges();
      }
  });

  function saveChanges() {
    // Convert newlines to <br> tags for the div display
    let updatedText = textarea.value.replace(/\n/g, '<br>');
    noteTextElement.innerHTML = updatedText;

    // Ensure buttons are still present
    const buttonContainer = noteElement.querySelector('.note-button-container');
    if (!buttonContainer) {
        const newButtonContainer = document.createElement('div');
        newButtonContainer.className = 'note-button-container';
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'note-edit';
        editButton.addEventListener('click', function() {
            editNote(noteElement);
        });
        newButtonContainer.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'note-delete';
        deleteButton.addEventListener('click', function() {
            noteElement.remove();
        });
        newButtonContainer.appendChild(deleteButton);
        
        noteElement.appendChild(newButtonContainer);
    }
}
}


function showHorizontalMenu(event, taskElement, isThreeDotClick = false, showOnlyPriority=false) {
  selectedTask = taskElement; // Set the global variable when showing the menu
  lastMenuShownTime = Date.now();
  const menu = document.getElementById('horizontalMenu');
  const taskRect = taskElement.getBoundingClientRect();

  // Initially display the menu to calculate dimensions, but keep it hidden
  menu.style.display = 'flex';
  menu.style.visibility = 'hidden';

  // Calculate the center position of the task element
  const taskCenterX = taskRect.left + (taskRect.width / 2);

  // Position the menu directly above the task and center it
  menu.style.left = `${taskCenterX - (menu.offsetWidth / 2)}px`;
  menu.style.top = `${taskRect.top - menu.offsetHeight}px`;

  // Now set the visibility to visible
  menu.style.visibility = 'visible';

  // Display the menu
  menu.style.display = 'flex';
  
  const allTasks = document.querySelectorAll('.checkbox-container');
  if (allTasks.length > 1) {
      menuRearrange.style.display = "block";
  } else {
      menuRearrange.style.display = "none";
  }
  updateMarkButtonText(); 
  const allMenuItems = document.querySelectorAll('#horizontalMenu button');
  allMenuItems.forEach(item => {
      if (showOnlyPriority) {
          if (item.id === 'markHigh' || item.id === 'markLow') {
              item.style.display = 'block';
          } else {
              item.style.display = 'none';
          }
      } else {
          if (item.id === 'menuRearrange') {
              // Check the number of tasks before displaying the rearrange button
              const allTasks = document.querySelectorAll('.checkbox-container');
              item.style.display = allTasks.length > 1 ? 'block' : 'none';
          } else {
              // Display all other buttons
              item.style.display = 'block';
          }
      }
  });
  
  if (showOnlyPriority) {
      document.getElementById('priorityMenu').style.display = 'flex';
  } else {
      document.getElementById('priorityMenu').style.display = 'none';
  }
  


}

function hideHorizontalMenu() {
  document.getElementById('horizontalMenu').style.display = 'none';
}
function deleteTask(e) {
  console.log('delete button clicked');
  e.stopPropagation();
  if (selectedTask) {
      console.log('Found task to delete:', selectedTask);
      const parentContainer = selectedTask.closest('.checkbox-container-main');
      if (parentContainer) {
          parentContainer.remove();
      } else {
          selectedTask.remove(); // Fallback to remove the selectedTask itself if parent is not found (just to be safe)
      }
  } else {
      console.log('No task found to delete');
  }
  hideHorizontalMenu();
}

function disableTaskDragging() {
  const allTasks = document.querySelectorAll('.checkbox-container-main'); // Updated to .checkbox-container-main
  allTasks.forEach(task => {
      task.setAttribute("draggable", false);
      task.classList.remove('draggable');
      task.classList.remove('dragover');  // Ensure dragover class is removed as well
  });
}
function hidePriorityMenu() {
  document.getElementById('priorityMenu').style.display = 'none';
}
function updateMarkButtonText() {
  const menuMarkButton = document.getElementById('menuMark');
  if (currentTaskElement.classList.contains('marked-high') || currentTaskElement.classList.contains('marked-low')) {
    console.log('Setting currentTaskElement:', currentTaskElement);

      menuMarkButton.textContent = 'Unmark';
  } else {
      menuMarkButton.textContent = 'Mark';
  }
}


  // Toggle timer visibility
  timerToggleButton.addEventListener('click', () => {
    if (timerContainer.style.display === 'none' || timerContainer.style.display === '') {
        timerContainer.style.display = 'flex';
    } else {
        timerContainer.style.display = 'none';
    }
});
    
    
// Event listener for the add button to show input for a new checkbox
addButton.addEventListener('click', () => {
  newCheckboxLabelInput.style.display = 'block';
  newCheckboxLabelInput.value = 'Task Item '+ taskNumber;
  newCheckboxLabelInput.focus();
  newCheckboxLabelInput.addEventListener('blur', createCheckboxIfNotEmpty);
});


//Handling Enter key for new checkbox label input
newCheckboxLabelInput.addEventListener('keypress', (event) => {
if (event.key === 'Enter') {
// Prevent the blur event from being triggered after Enter is pressed
newCheckboxLabelInput.removeEventListener('blur', createCheckboxIfNotEmpty);
createCheckboxIfNotEmpty();
// Re-attach the blur event listener
newCheckboxLabelInput.addEventListener('blur', createCheckboxIfNotEmpty);
// Prevent form submission if this is inside a form
event.preventDefault();
}
});




addButton.addEventListener('mouseover', () => {
  if(errorN==1){
  addTooltip.textContent = 'Create new task';
  addTooltip.style.display = 'block';
}else{
  addTooltip.style.display = 'none';
}
  });

addButton.addEventListener('mouseout', () => {
  addTooltip.style.display = 'none';
});

completeButton.addEventListener('mouseover', () => {
  if(errorN==1){
  completeTooltip.innerHTML = 'Complete Cycle<br>(complete all available tasks)';
  completeTooltip.style.display = 'flex';
}else{
  completeTooltip.style.display = 'none';
}
  });

completeButton.addEventListener('mouseout', () => {
  completeTooltip.style.display = 'none';
});

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


function resetSubtaskContainer(subtaskContainer) {
  // Hide the subtask container
  subtaskContainer.classList.add('hidden');

  // Reset the Complete Task button text
  const completeTaskButton = subtaskContainer.querySelector('.complete-task-button');
  if (completeTaskButton) {
      completeTaskButton.textContent = 'Complete Task';
  }

  // Uncheck all subtasks
  const subtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox');
  subtaskCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
  });
}


function resetSubtaskCheckboxes() {
  const allSubtasks = document.querySelectorAll('.subtask-checkbox');
  allSubtasks.forEach(subtask => {
      subtask.checked = false;
  });
  updateProgressBar();
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




completeButton.addEventListener('click', () => {
  const checkboxContainers = document.querySelectorAll('.checkbox-container');

  // Find all tasks that are marked as completed
  const completedTasks = Array.from(checkboxContainers).filter(container => container.classList.contains('completed'));

  // If at least one task is completed
  if (completedTasks.length > 0) {
      completeAllTasks();
      initiateTaskCycle();
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



  // Logic for resetting task counter
  resetButton.addEventListener('click', () => {
    counter = 0;
    updateCounter();
  });

    //Event listener for right click context menu
document.addEventListener('contextmenu', function(e) {
  
  // If the right-clicked element is within a checkbox-container
  if (e.target.closest('.checkbox-container')) {
    e.preventDefault(); // Prevent default right-click menu
      currentTaskElement = e.target.closest('.checkbox-container');
      console.log('Setting currentTaskElement:', currentTaskElement);

      showHorizontalMenu(e, currentTaskElement);
      console.log('Setting currentTaskElement:', currentTaskElement);

  } else {
      hideHorizontalMenu();
  }
});


notesButton.addEventListener('click', () => {
  notesPanel.classList.toggle('hidden');
});


addNoteButton.addEventListener('click', () => {
let noteText = newNoteTextarea.value.trim();
// Convert newline characters to <br> elements for display
noteText = noteText.replace(/\n/g, '<br>');

if (noteText) {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    
    const noteTextDiv = document.createElement('div');
    noteTextDiv.className = 'note-text';
    noteTextDiv.innerHTML = noteText; // Use innerHTML here since we're inserting <br> elements
    noteItem.appendChild(noteTextDiv);
    
    const noteButtonContainer = document.createElement('div');
    noteButtonContainer.className = 'note-button-container';

       
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function() {
        editNote(noteItem);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        notesList.removeChild(noteItem);
    });

    
    // Append the buttons to the button container
    noteButtonContainer.appendChild(editButton);
    noteButtonContainer.appendChild(deleteButton);

    // Append the button container to the note item
    noteItem.appendChild(noteButtonContainer);
    
    notesList.appendChild(noteItem);
    newNoteTextarea.value = '';
}
});

document.getElementById('start-button').addEventListener('click', () => {
  //clearInterval(timerInterval);  // Clear any existing interval
  timerInterval = setInterval(() => {
      timeInSeconds++;
      updateTimer();
  }, 1000);
});

document.getElementById('stop-button').addEventListener('click', () => {
  clearInterval(timerInterval);
});

document.getElementById('reset-timer-button').addEventListener('click', () => {
  clearInterval(timerInterval);
  timeInSeconds = 0;
  updateTimer();
});


closeButton.addEventListener('click', () => {
  notesPanel.classList.add('hidden'); // Assuming 'hidden' class hides the panel
});

// Hide the horizontal menu if clicked anywhere else on the document
document.addEventListener('click', function(e) {
  // Check if the click was outside the checkbox-list element
  if (!e.target.closest('#checkbox-list') && !e.target.closest('#horizontalMenu')) {
   // Turn off rearrange feature
   disableTaskDragging();
}
 if (!e.target.closest('#horizontalMenu')) {
     document.getElementById('horizontalMenu').style.display = 'none';
 }
});



// Event listener for the "Details" button in the horizontal menu
document.getElementById('menuDetails').addEventListener('click', function() {
  const existingDetails = currentTaskElement.getAttribute('data-details');
  console.log('Setting currentTaskElement:', currentTaskElement);

  
  if (existingDetails) {
      detailsTextarea.value = existingDetails;
  } else {
      detailsTextarea.value = '';
  }
  
  detailsModalBackdrop.style.display = "flex";
  hideHorizontalMenu();
});

document.getElementById('menuRename').addEventListener('click', function() {
  console.log('Rename clicked. Current Task Element:', currentTaskElement);
  console.log('Setting currentTaskElement:', currentTaskElement);

  if (currentTaskElement) {
    console.log('Setting currentTaskElement:', currentTaskElement);

      renameTask(currentTaskElement.id.replace('-container', ''));
      console.log('Setting currentTaskElement:', currentTaskElement);

  }
  hideHorizontalMenu();
});

// Hide the priority menu if clicked anywhere else on the document
document.addEventListener('click', function(e) {
  if (!e.target.closest('#priorityMenu') && !e.target.closest('#menuMark')) {
      hidePriorityMenu();
  }
});



document.getElementById('menuMark').addEventListener('click', function(e) {
  if (currentTaskElement.classList.contains('marked-high') || currentTaskElement.classList.contains('marked-low')) {
      // If the task is already marked, unmark it
      currentTaskElement.classList.remove('marked-high', 'marked-low');
      
      // Update the progress color to default
      updateProgressColor(currentTaskElement); // Update the progress color

      hideHorizontalMenu();
  } else {
      // Otherwise, show the priority options (your existing logic)
      showHorizontalMenu(e, currentTaskElement, true, true);
  }
  updateMarkButtonText();
});


document.getElementById('markHigh').addEventListener('click', function() {
  if (currentTaskElement) {
    console.log('Marking as high priority:', currentTaskElement);
    currentTaskElement.classList.remove('marked-low');
    currentTaskElement.classList.add('marked-high');
    updateProgressColor(currentTaskElement); // Update the progress color
    hideHorizontalMenu();
  }
});

document.getElementById('markLow').addEventListener('click', function() {
  if (currentTaskElement) {
    console.log('Marking as low priority:', currentTaskElement);
    currentTaskElement.classList.remove('marked-high');
    currentTaskElement.classList.add('marked-low');
    updateProgressColor(currentTaskElement); // Update the progress color
    hideHorizontalMenu();
  }
});



document.body.addEventListener('click', function(e) {
  if (e.target.id === 'menuDelete') {
      console.log('Delete button clicked via delegation');
      deleteTask(e); // Call the deleteTask function
  }
});

document.getElementById('menuSubtasks').addEventListener('click', () => {
  console.log('Subtasks clicked. Current Task Element:', currentTaskElement);
  console.log('Setting currentTaskElement:', currentTaskElement);


  if (currentTaskElement) {
    console.log('Setting currentTaskElement:', currentTaskElement);

      // First, find the parent .checkbox-container-main
      const parentContainer = currentTaskElement.closest('.checkbox-container-main');
      console.log('Setting currentTaskElement:', currentTaskElement);

      
      // Then, within that, find the .subtask-container
      const associatedSubtaskContainer = parentContainer.querySelector('.subtask-container');

      if (associatedSubtaskContainer) {
          associatedSubtaskContainer.classList.toggle('hidden');
      }

      hideHorizontalMenu();
  }
});



// Click outside the modal to close it
detailsModalBackdrop.addEventListener('click', function(e) {
  if (e.target === detailsModalBackdrop) {
      detailsModalBackdrop.style.display = "none";
  }
});

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Automatically resize the textarea when its content changes
detailsTextarea.addEventListener('input', function() {
  autoResizeTextarea(this);
});


editDetailsButton.addEventListener('click', function() {
    if (detailsTextarea.hasAttribute('disabled')) {
        detailsTextarea.removeAttribute('disabled');
        detailsTextarea.focus();
        editDetailsButton.textContent = 'Save';
    } else {
        const details = detailsTextarea.value;
        currentTaskElement.setAttribute('data-details', details);
        console.log('Setting currentTaskElement:', currentTaskElement);

        detailsTextarea.setAttribute('disabled', '');
        editDetailsButton.textContent = 'Edit';
    }
});

document.addEventListener('dragstart', function(e) {
  if (e.target.classList.contains('checkbox-container-main')) {
      e.dataTransfer.setData("text/plain", e.target.id);
      document.body.style.cursor = 'move';  // Set cursor to 'move'
  }
});


document.addEventListener('dragend', function(e) {
  document.body.style.cursor = 'default';  // Reset cursor to 'default'
});

document.getElementById('checkbox-list').addEventListener('dragover', function(e) {
  e.preventDefault(); // Necessary to allow dropping
  const target = e.target.closest('.checkbox-container-main'); // Updated to .checkbox-container-main
  
  if (target) {
      const rect = target.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      if (offsetY < rect.height / 2) {
          dragDirection = 'up';
      } else {
          dragDirection = 'down';
      }
      target.classList.add('dragover'); // Add a CSS class
  }
});

document.getElementById('checkbox-list').addEventListener('dragleave', function(e) {
  const target = e.target.closest('.checkbox-container-main'); // Updated to .checkbox-container-main
  if (target) {
      target.classList.remove('dragover');  // Remove the CSS class
  }
});

document.getElementById('checkbox-list').addEventListener('drop', function(e) {
  e.preventDefault();
  
  const draggedID = e.dataTransfer.getData("text/plain");
  const draggedElement = document.getElementById(draggedID);

  const dropTarget = e.target.closest('.checkbox-container-main'); // Updated to .checkbox-container-main
  if (dropTarget && draggedElement !== dropTarget) {
      if (dragDirection === 'up') {
          dropTarget.before(draggedElement);
      } else {
          dropTarget.after(draggedElement);
      }
  }
  // Turn off rearrange feature
  disableTaskDragging();
});


menuRearrange.addEventListener('click', function(e) {
  e.stopPropagation(); // Prevent event from propagating up to the document click listener

  const allTasks = document.querySelectorAll('.checkbox-container-main'); // Updated to .checkbox-container-main
  allTasks.forEach(task => {
      if (task.getAttribute("draggable") === "true") {
          task.setAttribute("draggable", false);
          task.classList.remove('draggable');  // Remove the draggable class
      } else {
          task.setAttribute("draggable", true);
          task.classList.add('draggable');  // Add the draggable class
      }
  });
  hideHorizontalMenu();
});

  
  updateCounter();

}

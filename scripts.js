let lastMenuShownTime = 0;
let currentTaskElement = null;

let justShownHorizontalMenu = true;


  let timerInterval;
      let timeInSeconds = 0;

  // Code that runs once the document is completely loaded
  document.addEventListener('DOMContentLoaded', (event) => {
  // DOM element references
    const checkboxList = document.getElementById('checkbox-list');
    const completeMessage = document.getElementById('complete-message');
    const addButton = document.getElementById('add-button');
    const completeButton = document.getElementById('complete-button');
    const resetButton = document.getElementById('reset-button');
    const newCheckboxLabelInput = document.getElementById('new-checkbox-label');
    const counterDiv = document.getElementById('counter');
    const counterContainer = document.getElementById('counter-container');
    const addTooltip = document.getElementById('add-button-tooltip');
    const completeTooltip = document.getElementById('complete-button-tooltip');
    const errorMessage = document.getElementById('error-message');

    
    
    function updateProgressBar() {
      const checkboxContainers = document.querySelectorAll('.checkbox-container');
      const completedTasks = Array.from(checkboxContainers).filter(container => container.classList.contains('completed'));
      
      const percentageCompleted = (completedTasks.length / checkboxContainers.length) * 100;
      document.getElementById('progress-bar').style.width = `${percentageCompleted}%`;
  }



  // Initial values for task number and tooltip timeout
    let taskNumber=1;

  // Toggle timer visibility
    const timerToggleButton = document.getElementById('timer-toggle-button');
    const timerContainer = document.getElementById('timer-container');

    timerToggleButton.addEventListener('click', () => {
        if (timerContainer.style.display === 'none' || timerContainer.style.display === '') {
            timerContainer.style.display = 'flex';
        } else {
            timerContainer.style.display = 'none';
        }
    });
    
    // Function to create a new checkbox if its label isn't empty
    function createCheckboxIfNotEmpty() {
    const newLabel = newCheckboxLabelInput.value;
    if (newLabel.trim() !== '') {
        const newCheckboxId = `checkbox${checkboxCounter}`;
        addCheckbox(newCheckboxId, newLabel);
        checkboxCounter++;
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

    let checkboxCounter = 1;
    let counter = 0;

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
  
      // Timer logic
function updateTimer() {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    document.getElementById('timer').textContent = 
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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

updateTimer();  // Initialize the timer display

    }

    
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


var errorN = 1;




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



completeButton.addEventListener('click', () => {
  const checkboxContainers = document.querySelectorAll('.checkbox-container');
  
  // Find all tasks that are marked as completed
  const completedTasks = Array.from(checkboxContainers).filter(container => container.classList.contains('completed'));

  // If at least one task is completed
  if (completedTasks.length > 0) {
      // Mark all tasks as completed
      checkboxContainers.forEach(container => {
          container.classList.add('completed');
      });
      updateProgressBar();

      // Increment the counter since all tasks were completed together
      counter += 1;
      updateCounter();

      // Display a "complete" message
      completeMessage.style.display = 'block';

      // After a short delay, reset all tasks to the uncompleted state
      setTimeout(() => {
          checkboxContainers.forEach(container => {
              container.classList.remove('completed');
          });
          updateProgressBar();

          completeMessage.style.display = 'none';  // Hide the "complete" message
      }, 1000);
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
});

     // Logic for resetting task counter
    resetButton.addEventListener('click', () => {
      counter = 0;
      updateCounter();
    });

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
      showHorizontalMenu(event, currentTaskElement, true);  // Pass `currentTaskElement` instead of `taskElement`
  });
  
    // Menu options
    const taskMenu = document.createElement('div');
    taskMenu.className = 'task-menu hidden';
    const editOption = document.createElement('button');
    editOption.textContent = 'Edit';
    editOption.addEventListener('click', () => { renameTask(id); hideHorizontalMenu(); });
    const deleteOption = document.createElement('button');
    deleteOption.textContent = 'Delete';
    deleteOption.addEventListener('click', () => { removeCheckbox(id); hideHorizontalMenu(); });
    taskMenu.appendChild(editOption);
    taskMenu.appendChild(deleteOption);

    // Append to the main container
    checkboxContainer.appendChild(checkboxLabel);
    checkboxContainer.appendChild(menuButton);
    checkboxContainer.appendChild(taskMenu);
    checkboxList.appendChild(checkboxContainer);

   
    checkboxContainer.addEventListener('click', (event) => {
      // Check if the clicked element is the three-dot button or a child of it
      if (event.target === menuButton || menuButton.contains(event.target)) {
          // If the three-dot button or its children were clicked, don't proceed further
          return;
      }
  
      checkboxContainer.classList.toggle('completed');
      updateProgressBar();
      checkCompletion(); 
  });


// Updated Three-Dot Menu Button click event listener
menuButton.addEventListener('click', function(event) {
  event.stopPropagation(); // Prevent other click events from hiding the menu immediately
  const menu = menuButton.nextElementSibling;

  menu.classList.toggle('hidden');
});

    updateProgressBar();
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

        // Function to remove a checkbox
    function removeCheckbox(id) {
      const checkboxContainer = document.getElementById(id + '-container');
      checkboxContainer.remove();
      checkCompletion();
    }

   // Check if all tasks are completed
    function checkCompletion() {
   const checkboxContainers = document.querySelectorAll('#checkbox-list .checkbox-container');
    if (checkboxContainers.length > 0 && Array.from(checkboxContainers).every(container => container.classList.contains('completed'))) {
      counter++;
      updateCounter();
      completeMessage.style.display = 'block';
      setTimeout(() => {
          Array.from(checkboxContainers).forEach(container => {
              container.classList.remove('completed');
          });
          completeMessage.style.display = 'none';
          updateProgressBar();  // Reset the progress bar
      }, 1000);
  }
  }
    // Initial setup for counter and button visibility
    updateCounter();
   


    const contextMenu = document.getElementById('contextMenu');
    const renameOption = document.getElementById('renameOption');
    const deleteOption = document.getElementById('deleteOption');


// The global variable to store the current checkbox container
let currentCheckboxContainer = null;

//Event listener for right click context menu
document.addEventListener('contextmenu', function(e) {
  
  // If the right-clicked element is within a checkbox-container
  if (e.target.closest('.checkbox-container')) {
    e.preventDefault(); // Prevent default right-click menu
      currentTaskElement = e.target.closest('.checkbox-container');
      showHorizontalMenu(e, currentTaskElement);
  } else {
      hideHorizontalMenu();
  }
});

  const notesButton = document.getElementById('notes-button');
  const notesPanel = document.getElementById('notes-panel');
  const addNoteButton = document.getElementById('add-note');
  const newNoteTextarea = document.getElementById('new-note-textarea');
  const notesList = document.getElementById('notes-list');
  
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


const closeButton = document.getElementById('close-notes');

closeButton.addEventListener('click', () => {
    notesPanel.classList.add('hidden'); // Assuming 'hidden' class hides the panel
});

function showHorizontalMenu(event, taskElement, isThreeDotClick = false) {
  lastMenuShownTime = Date.now();
  const menu = document.getElementById('horizontalMenu');
  const taskRect = taskElement.getBoundingClientRect();
  menu.style.display = 'flex'; // Ensure the menu is displayed to get accurate dimensions
  
  if (isThreeDotClick) {
      const taskCenterX = taskRect.left + (taskRect.width / 2);
      menu.style.left = `${taskCenterX - (menu.offsetWidth / 2)}px`;
      menu.style.top = `${taskRect.top - menu.offsetHeight}px`;
  } else {
      menu.style.left = `${Math.min(event.pageX, window.innerWidth - menu.offsetWidth)}px`;
      menu.style.top = `${taskRect.top - menu.offsetHeight}px`;
  }
  menu.style.display = 'flex';
}
function hideHorizontalMenu() {
  document.getElementById('horizontalMenu').style.display = 'none';
}


// Hide the horizontal menu if clicked anywhere else on the document
document.addEventListener('click', function(e) {
  if (!e.target.closest('#horizontalMenu')) {
      document.getElementById('horizontalMenu').style.display = 'none';
  }
});




document.getElementById('menuRename').addEventListener('click', function() {
  console.log('Rename clicked. Current Task Element:', currentTaskElement);
  if (currentTaskElement) {
      renameTask(currentTaskElement.id.replace('-container', ''));
  }
  hideHorizontalMenu(); // Hide the menu after the action
});

document.getElementById('menuDelete').addEventListener('click', function() {
  console.log('Delete clicked. Current Task Element:', currentTaskElement);
  if (currentTaskElement) {
      removeCheckbox(currentTaskElement.id.replace('-container', ''));
  }
  hideHorizontalMenu(); // Hide the menu after the action
});


  });
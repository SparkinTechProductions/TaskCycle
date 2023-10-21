
    // Updates the visibility of the delete and rename buttons based on the number of checkbox containers
    function updateDeleteButtonVisibility() {
    const deleteButton = document.getElementById('delete-button');
    const checkboxContainers = document.querySelectorAll('#checkbox-list .checkbox-container');
   // Show or hide delete button based on the presence of checkboxes
    deleteButton.style.display = checkboxContainers.length > 0 ? 'block' : 'none';
    const renameButton = document.getElementById('rename-button');
     // Show or hide rename button based on the presence of checkboxes
    renameButton.style.display = checkboxContainers.length > 0 ? 'block' : 'none';
    }
    // Declare a variable to track if the application is in "rename mode"
    let renameMode = false;

    // Function to toggle the rename mode on and off
    function toggleRenameMode() {
    renameMode = !renameMode;
    const renameIcons = document.querySelectorAll('.rename-icon');
    renameIcons.forEach(icon => {
        icon.style.display = renameMode ? 'inline' : 'none'; // Toggle visibility of rename icons
    });
  }

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
    const renameButton = document.getElementById('rename-button');
    const addTooltip = document.getElementById('add-button-tooltip');
    const completeTooltip = document.getElementById('complete-button-tooltip');
    const errorMessage = document.getElementById('error-message');
    
    function updateProgressBar() {
      const checkboxContainers = document.querySelectorAll('.checkbox-container');
      const completedTasks = Array.from(checkboxContainers).filter(container => container.classList.contains('completed'));
      
      const percentageCompleted = (completedTasks.length / checkboxContainers.length) * 100;
      document.getElementById('progress-bar').style.width = `${percentageCompleted}%`;
  }


    renameButton.addEventListener('click', toggleRenameMode);

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
      let timerInterval;
      let timeInSeconds = 0;

      // Timer logic
function updateTimer() {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    document.getElementById('timer').textContent = 
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

  document.getElementById('start-button').addEventListener('click', () => {
    clearInterval(timerInterval);  // Clear any existing interval
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

// Delete mode toggle and its logic
let deleteMode = false;
const deleteButton = document.getElementById('delete-button');

deleteButton.addEventListener('click', (event) => {
    event.stopPropagation();  // Prevent the document click handler from being triggered
    deleteMode = !deleteMode;  // Toggle delete mode
    deleteButton.className = deleteMode ? 'red' : 'blue';  // Update button color
    const removeButtons = document.querySelectorAll('.remove-button');
    removeButtons.forEach(button => {
        button.style.display = deleteMode ? 'block' : 'none';  // Toggle visibility of remove buttons
    });
});


// Hide the remove buttons when clicking outside the checkbox list
document.addEventListener('click', (event) => {
  if (!event.path.includes(document.getElementById('checkbox-list')) && deleteMode) {
      deleteMode = false;
      deleteButton.className = 'blue';
      const removeButtons = document.querySelectorAll('.remove-button');
      removeButtons.forEach(button => {
        button.style.display = 'none';
    });
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

    /*const checkboxDiv = document.createElement('div');
    checkboxDiv.id = id;
    checkboxDiv.className = 'checkbox-div';  // You can name this class as you prefer
    */

    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', id);
    checkboxLabel.className = 'checkbox-label';
    checkboxLabel.textContent = label;

    //Delete Buttons
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.textContent = '\uD83D\uDDD1';
    removeButton.addEventListener('click', function() { removeCheckbox(id); });
    removeButton.style.display = deleteMode ? 'block' : 'none';

    //Remove Buttons
    const renameIcon = document.createElement('span');
    renameIcon.className = 'rename-icon hidden'; // hidden initially
    renameIcon.textContent = '✏️';
    renameIcon.addEventListener('click', () => { renameTask(id); });

    checkboxContainer.appendChild(renameIcon);
    /*checkboxContainer.appendChild(checkboxDiv);*/
    checkboxContainer.appendChild(checkboxLabel);
    checkboxContainer.appendChild(removeButton);
    checkboxList.appendChild(checkboxContainer);
    updateDeleteButtonVisibility(); 

    checkboxContainer.addEventListener('click', () => {
      checkboxContainer.classList.toggle('completed');
      updateProgressBar();
      checkCompletion(); 
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
      updateDeleteButtonVisibility();  // Add this line
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
    updateDeleteButtonVisibility();

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (e.target.closest('.checkbox-container')) {
          contextMenu.style.left = `${e.pageX}px`;
          contextMenu.style.top = `${e.pageY}px`;
          contextMenu.style.display = 'block';
      }
  });

  const contextMenu = document.getElementById('contextMenu');
  const renameOption = document.getElementById('renameOption');
  const deleteOption = document.getElementById('deleteOption');

  renameOption.addEventListener('event', () => {
      const checkboxContainer = event.target.closest('.checkbox-container');
      if (checkboxContainer) {
          const id = checkboxContainer.id.replace('-container', '');
          renameTask(id);
          contextMenu.style.display = 'none';  // Hide context menu after action
      }
  });

  deleteOption.addEventListener('event', () => {
      const checkboxContainer = event.target.closest('.checkbox-container');
      if (checkboxContainer) {
          const id = checkboxContainer.id.replace('-container', '');
          removeCheckbox(id);
          contextMenu.style.display = 'none';  // Hide context menu after action
      }
  });

  // Hide the Custom Menu
  document.addEventListener('click', () => {
      contextMenu.style.display = 'none';
  });

  });
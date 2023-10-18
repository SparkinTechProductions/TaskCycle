
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
    const doneButton = document.getElementById('done-button');
    const resetButton = document.getElementById('reset-button');
    const newCheckboxLabelInput = document.getElementById('new-checkbox-label');
    const counterDiv = document.getElementById('counter');
    const counterContainer = document.getElementById('counter-container');
    const buttonWithTooltip = document.querySelector('.button-with-tooltip');
    const tooltip = buttonWithTooltip.querySelector('.tooltip');
    const renameButton = document.getElementById('rename-button');
    renameButton.addEventListener('click', toggleRenameMode);

  // Initial values for task number and tooltip timeout
    let taskNumber=1;
    let tooltipTimeout;

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

     // Event listeners for tooltip show/hide
    buttonWithTooltip.addEventListener('mouseover', () => {
        tooltip.classList.remove('tooltip-hidden');
        tooltipTimeout = setTimeout(() => {
            tooltip.classList.add('tooltip-hidden');
        }, 2000);  // 2 seconds
      });


    buttonWithTooltip.addEventListener('mouseout', () => {
        clearTimeout(tooltipTimeout);
      });
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


// Logic for marking tasks as done
    doneButton.addEventListener('click', () => {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      if (checkboxes.some(checkbox => checkbox.checked)) {
        counter++;
        updateCounter();
      } else {
        
    // Show the alert if no tasks completed
    const popupMessage = document.getElementById('popup-message');
    popupMessage.classList.remove('hidden');

  // Hide the pop-up after 5 seconds
    setTimeout(() => {
    popupMessage.classList.add('hidden');
    }, 5000);

      }

      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      completeMessage.style.display = 'none';
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

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.id = id;

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
    checkboxContainer.appendChild(checkboxInput);
    checkboxContainer.appendChild(checkboxLabel);
    checkboxContainer.appendChild(removeButton);

    checkboxList.appendChild(checkboxContainer);
    updateDeleteButtonVisibility(); 
    checkboxInput.addEventListener('change', checkCompletion);
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
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      if (checkboxes.length > 0 && checkboxes.every(checkbox => checkbox.checked)) {
        counter++;
        updateCounter();
        completeMessage.style.display = 'block';
        setTimeout(() => {
          checkboxes.forEach(checkbox => {
            checkbox.checked = false;
          });
          completeMessage.style.display = 'none';
        }, 2000);
      }
    }
    
    // Initial setup for counter and button visibility
    updateCounter();
    updateDeleteButtonVisibility();
  });
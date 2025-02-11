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
        const newSubtaskName = editInput.value.trim() !== '' ? editInput.value : currentText;
        labelElement.textContent = newSubtaskName; 
        editInput.remove();
        // Add this line to log subtask name update in the timeline
        addToTimeline('Subtask Name Set', newSubtaskName, 'edited');
        updateClearButtonVisibility();
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
   // Log the deletion of the subtask
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
  
     // Add this line right after the subtask is appended
     addToTimeline('Subtask Added', label);
     updateClearButtonVisibility();
  
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
  










  function addSubtaskCheckbox(_id, label, subtaskContainer, isNew = false) {
    console.log('addSubtaskCheckbox created');
    const subtaskList = subtaskContainer.querySelector('.subtask-list');
    
    // Create a container for each subtask
    let subtaskRow = document.createElement('div');
    subtaskRow.className = 'subtask-row';
  
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
        const newSubtaskName = editInput.value.trim() !== '' ? editInput.value : currentText;
        labelElement.textContent = newSubtaskName; 
        editInput.remove();
        // Add this line to log subtask name update in the timeline
        addToTimeline('Subtask Name Set', newSubtaskName, 'edited');
        updateClearButtonVisibility();
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
  
    // Log the addition of the subtask in the timeline
    addToTimeline('Subtask Added', label);
    updateClearButtonVisibility();
  
    // Increment the subtask counter
    subtaskCounter++;
  }
  
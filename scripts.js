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
let isRearrangeModeActive = false;
let activeRearrangeTask = null;
let activeTask = null; 

document.addEventListener('DOMContentLoaded', (event) => {
  console.log("DOM fully loaded and parsed");
    attachEventListeners();
   /* startupPage();*/
    
});


function startupPage () { const startupPage = document.getElementById('startup-page');
  const taskCyclePage = document.getElementById('task-cycle-page');
  const newCycleButton = document.getElementById('new-cycle-button');
  const loadCycleButton = document.getElementById('load-cycle-button');

  // Default: Show task cycle page
  startupPage.classList.add('hidden');
  taskCyclePage.classList.remove('hidden');

  // Event listener to create a new task cycle (future)
  newCycleButton?.addEventListener('click', () => {
      startupPage.classList.add('hidden');
      taskCyclePage.classList.remove('hidden');
  });

  // Event listener to load a saved task cycle (future)
  loadCycleButton?.addEventListener('click', () => {
      alert("Load Task Cycle clicked!"); // Placeholder functionality
  });


/* TTO-1 
function showStartupPage() {
    document.getElementById('startup-page').classList.remove('hidden');
    document.getElementById('task-cycle-page').classList.add('hidden');
}

function showTaskCyclePage() {
    document.getElementById('startup-page').classList.add('hidden');
    document.getElementById('task-cycle-page').classList.remove('hidden');
}
*/

}

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
  const notesTooltip = document.getElementById('notes-button-tooltip');
  const statsTooltip = document.getElementById('stats-button-tooltip');
  const mainMenuTooltip = document.getElementById('main-menu-button-tooltip');
  const completeTooltip = document.getElementById('complete-button-tooltip');
  const errorMessage = document.getElementById('error-message');
  const newCheckboxLabelInput = document.getElementById('new-checkbox-label');
  const checkboxList = document.getElementById('checkbox-list');
  const completeMessage = document.getElementById('complete-message');
  const resetButton = document.getElementById('reset-button');
  const counterDiv = document.getElementById('counter');
  const counterContainer = document.getElementById('counter-container');
  const detailsModal = document.getElementById('detailsModal');
  const newCycleButton = document.getElementById('new-cycle'); 
  const progressBar = document.getElementById('progress-bar');
  const mainMenuButton = document.getElementById('main-menu-button');

  updateCounter() ;

  const timeline = document.getElementById('timeline-content');
    const modal = document.getElementById('entry-modal');
    const modalContent = modal.querySelector('.entry-text');
    const closeModal = modal.querySelector('.close');
    const prevButton = modal.querySelector('.prev');
    const nextButton = modal.querySelector('.next');
    let currentEntryIndex = -1;

    function updateModalContent(index) {
        const entries = Array.from(timeline.getElementsByClassName('timeline-entry'));
        if (index >= 0 && index < entries.length) {
            modalContent.textContent = entries[index].textContent;
            currentEntryIndex = index;
        }
    }
   // Add click event to the "New" button
   newCycleButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to start a new task cycle? All current tasks will be lost.")) {
        // Clear the task list
        checkboxList.innerHTML = '';

        // Reset task counters
        taskNumber = 1;
        checkboxCounter = 1;
        subtaskCounter = 0;

        // Hide any completion messages
        completeMessage.style.display = 'none';

        // Reset progress bar
        progressBar.style.width = '0%';

        alert("New task cycle created!");
    }
});


    timeline.addEventListener('click', (e) => {
        if (e.target.classList.contains('timeline-entry')) {
            const entries = Array.from(timeline.getElementsByClassName('timeline-entry'));
            const index = entries.indexOf(e.target);
            updateModalContent(index);
            modal.style.display = 'block';
        }
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    prevButton.addEventListener('click', () => {
        updateModalContent(currentEntryIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        updateModalContent(currentEntryIndex + 1);
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });






/*  TTO-1
    document.getElementById('add-button').addEventListener('click', () => {
      const newCheckboxLabelInput = document.getElementById('new-checkbox-label');
      const completeButton = document.getElementById('complete-button');
      const taskWindow = document.getElementById('checkbox-list'); // The container for tasks
  
      // Get the bounding rectangles of the Complete button and task window
      const completeButtonRect = completeButton.getBoundingClientRect();
      const taskWindowRect = taskWindow.getBoundingClientRect();
  
      // Set input position dynamically below the Complete button and centered to task window
      newCheckboxLabelInput.style.position = 'absolute';
      newCheckboxLabelInput.style.top = `${completeButtonRect.bottom + window.scrollY + 30}px`; // 30px below Complete button
      newCheckboxLabelInput.style.left = `${taskWindowRect.left + taskWindowRect.width / 2 - newCheckboxLabelInput.offsetWidth / 2}px`; // Centered horizontally
      newCheckboxLabelInput.style.display = 'block';
  
      // Ensure the label input appears fully rendered before calculating width
      setTimeout(() => {
          newCheckboxLabelInput.style.left = `${taskWindowRect.left + taskWindowRect.width / 2 - newCheckboxLabelInput.offsetWidth / 2}px`;
      }, 0);
  
      newCheckboxLabelInput.focus();
  });
  
*/








    // Load Pro version state
let isProVersion = JSON.parse(localStorage.getItem('isProVersion')) || false;

mainMenuPanel();


function mainMenuPanel() {
    const menuPanel = document.getElementById('menu-panel');
    const settingsMenu = document.getElementById('settings-menu');
    const settingsButton = document.getElementById('open-settings');
    const closeSettingsButton = document.getElementById('close-settings');


    // Elements
const proToggle = document.getElementById('pro-version-toggle');
const proLabel = document.getElementById('pro-version-label');

// Initialize toggle state
proToggle.checked = isProVersion;
proLabel.textContent = isProVersion ? 'Pro Version Enabled' : 'Switch to Pro';

// Toggle Pro version
proToggle.addEventListener('change', () => {
    isProVersion = proToggle.checked;

    if (isProVersion) {
        alert('Pro Version Activated! Enjoy unlimited savings!');
        proLabel.textContent = 'Pro Version Enabled';
    } else {
        alert('Switched to Free Version. Save limit applied.');
        proLabel.textContent = 'Switch to Pro';
    }

    // Save state to localStorage
    localStorage.setItem('isProVersion', JSON.stringify(isProVersion));
});

    // Toggle Main Menu visibility
    mainMenuButton.addEventListener('click', () => {
        if (menuPanel.classList.contains('hidden')) {
            menuPanel.classList.remove('hidden');
            menuPanel.classList.add('show'); // Add the show class for smooth animation
            settingsMenu.classList.add('hidden'); // Ensure settings menu is hidden
        } else {
            menuPanel.classList.remove('show');
            menuPanel.classList.add('hidden');
        }
    });

    
// Close the menu panel when clicking outside of it
document.addEventListener('click', (event) => {
  const isClickInsideMenu = menuPanel.contains(event.target);
  const isClickOnMenuButton = mainMenuButton.contains(event.target);

  if (!isClickInsideMenu && !isClickOnMenuButton) {
      menuPanel.classList.remove('show');
      menuPanel.classList.add('hidden');
  }
});


    // Toggle Settings Menu visibility
    settingsButton?.addEventListener('click', () => {
        if (settingsMenu.classList.contains('hidden')) {
            settingsMenu.classList.remove('hidden');
            settingsMenu.classList.add('show'); // Add the show class for smooth animation
            menuPanel.classList.add('hidden'); // Ensure main menu is hidden
        } else {
            settingsMenu.classList.remove('show');
            settingsMenu.classList.add('hidden');
        }
    });

    // Close Settings Menu
    closeSettingsButton?.addEventListener('click', () => {
        settingsMenu.classList.remove('show');
        settingsMenu.classList.add('hidden');
    });
    
        // Enhanced Load Task Cycle
        document.getElementById('load-cycle')?.addEventListener('click', () => {
            const savedCycles = JSON.parse(localStorage.getItem('taskCycles')) || [];
            if (savedCycles.length === 0) {
                alert('No saved task cycles found.');
                return;
            }
    
            // Load the original "cycle list" container
            let cycleListContainer = document.getElementById('cycle-list-container');
            if (!cycleListContainer) {
                cycleListContainer = document.createElement('div');
                cycleListContainer.id = 'cycle-list-container';
                cycleListContainer.style.cssText = `
                    position: fixed;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 10px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                `;
                document.body.appendChild(cycleListContainer);
            }
            cycleListContainer.innerHTML = ''; // Clear previous content
    
            // Title
            const title = document.createElement('h3');
            title.textContent = 'Saved Task Cycles';
            cycleListContainer.appendChild(title);
    
            // File Actions (Delete/Rename Buttons)
            const fileActions = document.createElement('div');
            fileActions.id = 'file-actions';
            fileActions.innerHTML = `
                <button id="delete-files">Delete</button>
                <button id="rename-files">Rename</button>
            `;
            cycleListContainer.appendChild(fileActions);
    
            const listContainer = document.createElement('div');
            listContainer.id = 'file-list-container';
            cycleListContainer.appendChild(listContainer);
    
            // Close Button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                cycleListContainer.style.display = 'none';
            });
            cycleListContainer.appendChild(closeButton);
    
            // Render the List
            const renderList = (cycles) => {
                listContainer.innerHTML = ''; // Clear content
                const list = document.createElement('ul');
                cycles.forEach((cycle, index) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${cycle.name} (Modified: ${new Date(cycle.timestamp).toLocaleString()})`;
                    listItem.addEventListener('click', () => {
                        document.querySelector('#checkbox-list').innerHTML = '';
                        cycle.tasks.forEach(({ task, subtasks }) => {
                            addTask(task);
                            subtasks.forEach(({ name, completed }) => addSubtask(task, name, completed));
                        });
                        alert(`Task cycle "${cycle.name}" loaded successfully!`);
                        cycleListContainer.style.display = 'none';
                    });
                    list.appendChild(listItem);
                });
                listContainer.appendChild(list);
            };
    
            renderList(savedCycles);
            cycleListContainer.style.display = 'block';
        });
    
    }
    



    let currentCycleName = null; // Track the name of the currently saved file

    const saveCycle = () => {
        const tasks = document.querySelectorAll('.checkbox-container-main');
        const taskCycle = [];
    
        // Collect tasks and subtasks
        tasks.forEach(task => {
            const taskLabel = task.querySelector('.checkbox-label').textContent;
            const subtasks = Array.from(task.querySelectorAll('.subtask-checkbox')).map(subtask => ({
                name: subtask.nextElementSibling.textContent,
                completed: subtask.checked
            }));
            taskCycle.push({ task: taskLabel, subtasks });
        });
    
        const savedCycles = JSON.parse(localStorage.getItem('taskCycles')) || [];
    
        if (!currentCycleName) {
            // Prompt user for a file name on first save
            currentCycleName = prompt('Enter a name for this task cycle:');
            if (!currentCycleName) return; // Exit if no name is entered
        }
    
        // Check if the cycle already exists
        const existingIndex = savedCycles.findIndex(cycle => cycle.name === currentCycleName);
        if (existingIndex !== -1) {
            // Update existing file
            savedCycles[existingIndex] = {
                name: currentCycleName,
                tasks: taskCycle,
                timestamp: new Date().toISOString()
            };
        } else {
            // Save new file
            savedCycles.push({
                name: currentCycleName,
                tasks: taskCycle,
                timestamp: new Date().toISOString()
            });
        }
    
        // Save to localStorage
        localStorage.setItem('taskCycles', JSON.stringify(savedCycles));
        alert(`Task cycle "${currentCycleName}" saved successfully!`);
    };
    
    const saveCycleAs = () => {
        // Always prompt for a new file name
        const newCycleName = prompt('Enter a new name for this task cycle:');
        if (!newCycleName) return;
    
        const tasks = document.querySelectorAll('.checkbox-container-main');
        const taskCycle = [];
    
        tasks.forEach(task => {
            const taskLabel = task.querySelector('.checkbox-label').textContent;
            const subtasks = Array.from(task.querySelectorAll('.subtask-checkbox')).map(subtask => ({
                name: subtask.nextElementSibling.textContent,
                completed: subtask.checked
            }));
            taskCycle.push({ task: taskLabel, subtasks });
        });
    
        const savedCycles = JSON.parse(localStorage.getItem('taskCycles')) || [];
    
        savedCycles.push({
            name: newCycleName,
            tasks: taskCycle,
            timestamp: new Date().toISOString()
        });
    
        // Save to localStorage and update the current cycle name
        localStorage.setItem('taskCycles', JSON.stringify(savedCycles));
        currentCycleName = newCycleName;
        alert(`Task cycle "${newCycleName}" saved successfully!`);
    };
    
    // Connect the Save/Save As buttons to their functions
    document.getElementById('save-cycle').addEventListener('click', saveCycle);
    document.getElementById('save-as-cycle').addEventListener('click', saveCycleAs);
  

  document.getElementById('load-cycle')?.addEventListener('click', () => {
    loadCycle();
});

    









function updateBarChart() {
  const barChartContainer = document.getElementById('bar-chart-container');
  const ctx = document.getElementById('bar-chart').getContext('2d');
  const taskContainers = document.querySelectorAll('.checkbox-container-main');
  const labels = [];
  const completedData = [];
  const uncompletedData = [];

  let subtasksExist = false;

  // Collect task labels and completion percentages
  taskContainers.forEach(taskContainer => {
      const taskLabel = taskContainer.querySelector('.checkbox-label').textContent;
      const subtasks = taskContainer.querySelectorAll('.subtask-checkbox');
      const completedSubtasks = taskContainer.querySelectorAll('.subtask-checkbox:checked').length;

      if (subtasks.length > 0) {
          const totalSubtasks = subtasks.length;
          const completedPercentage = (completedSubtasks / totalSubtasks) * 100;
          const uncompletedPercentage = 100 - completedPercentage;

          labels.push(taskLabel);
          completedData.push(completedPercentage);
          uncompletedData.push(uncompletedPercentage);
          subtasksExist = true;
      }
  });

  // Hide the chart if no subtasks exist
  if (!subtasksExist) {
      barChartContainer.style.display = 'none';
      return;
  }

  barChartContainer.style.display = 'block';

  // Destroy existing chart instance if it exists
  if (window.myBarChart) {
      window.myBarChart.destroy();
  }

  // Create a stacked bar chart
  
  window.myBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [
              {
                  label: 'Subtasks Completed',
                  data: completedData,
                  backgroundColor: '#4790df',
                  borderWidth: 1,
                  barThickness: 20, // Fixed bar width.
                  
                  borderRadius: 5, // Rounded corners.
              },
              {
                  label: 'Pending',
                  data: uncompletedData,
                  backgroundColor: '#e74c3c',
                  borderWidth: 1,
                  barThickness: 20, // Fixed bar width.
                  
                  borderRadius: 5, // Rounded corners.
              }
          ]
      },
      options: {
          indexAxis: 'y', // Makes the bars horizontal
          responsive: true,
          scales: {
              x: {
                  beginAtZero: true,
                  max: 100,
                  stacked: true, // Stack the bars
                  display: false, // Hides the x-axis (0-100 scale)
              },
              y: {
                  stacked: true, // Stack the bars
                  display: true, // Hides the y-axis (task labels)
              }
          },
          plugins: {
            legend: {
                display: true,
                position: 'bottom', // Position legend beneath the chart
                labels: {
                    usePointStyle: true, // Use circle icons for better appearance
                    boxWidth: 12, // Adjust the icon size
                    padding: 15, // Add padding for spacing
                }
            },
              tooltip: {
                  enabled: true, // Keeps tooltips for interaction
              }
          },
          animation: {
            
            easing: 'easeOut', // Animation easing effect.
        }
        
      }
  });
  

  /* TTO-1
  window.myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels, // Task names
        datasets: [
            {
                label: 'Subtasks Completed',
                data: completedData, // Completed subtasks data
                backgroundColor: '#4790df',
                borderWidth: 1,
                barThickness: 20, // Fixed bar width
                borderRadius: 5, // Rounded corners
            },
            {
                label: 'Pending',
                data: uncompletedData, // Pending subtasks data
                backgroundColor: '#e74c3c',
                borderWidth: 1,
                barThickness: 20, // Fixed bar width
                borderRadius: 5, // Rounded corners
            }
        ]
    },
    options: {
        indexAxis: 'y', // Makes the bars horizontal
        responsive: true,
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                stacked: true, // Stack the bars
                display: false, // Hides the x-axis (0-100 scale)
            },
            y: {
                stacked: true, // Stack the bars
                display: true, // Show the y-axis with task labels
            }
        },
        plugins: {
            tooltip: {
                enabled: true, // Enable tooltips
                callbacks: {
                    label: function(context) {
                        const value = context.raw; // Get the raw value of the bar
                        return `${context.dataset.label}: ${value}%`; // Append % sign to the value
                    }
                }
            },
            legend: {
                display: true,
                position: 'bottom', // Position legend beneath the chart
                labels: {
                    usePointStyle: true, // Use circle icons for better appearance
                    boxWidth: 12, // Adjust the icon size
                    padding: 15, // Add padding for spacing
                }
            }
        },
        animation: {
            easing: 'easeOut', // Animation easing effect
        }
    }
});
*/

}






function updateStatistics() {
  // TASK STATS
  const totalTasks = document.querySelectorAll('.checkbox-container').length;
  const completedTasks = document.querySelectorAll('.checkbox-container.completed').length;
  const pendingTasks = totalTasks - completedTasks;

  // SUBTASK STATS
  const totalSubtasks = document.querySelectorAll('.subtask-checkbox').length;
  const completedSubtasks = document.querySelectorAll('.subtask-checkbox:checked').length;
  const pendingSubtasks = totalSubtasks - completedSubtasks;


  
  // WEIGHTED CALCULATIONS
  const mainTasks = document.querySelectorAll('.checkbox-container-main');
  let totalWeight = 0;
  let completedWeight = 0;

  mainTasks.forEach((taskContainer) => {
      const mainTask = taskContainer.querySelector('.checkbox-container');
      const subtasks = taskContainer.querySelectorAll('.subtask-checkbox');
      const completedSubtasks = taskContainer.querySelectorAll('.subtask-checkbox:checked');

      totalWeight += 1; // Each main task contributes a weight of 1
      if (mainTask.classList.contains('completed')) {
          completedWeight += 1; // Fully completed task contributes fully
      } else if (subtasks.length > 0) {
          completedWeight += completedSubtasks.length / subtasks.length; // Partial contribution from subtasks
      }
  });

  // COMPLETION PERCENTAGE
  const completionPercentage = ((completedWeight / totalWeight) * 100).toFixed(2);

  // UPDATE TASK STATS IN DOM
  const statsContent = document.getElementById('stats-content-tasks');
  let statsHTML = `
      <div>
          <h3>Tasks Overview</h3>
          <p><span>Total Tasks:</span> ${totalTasks}</p>
          <p class="completed"><span>Completed Tasks:</span> ${completedTasks}</p>
          <p class="pending"><span>Pending Tasks:</span> ${pendingTasks}</p>
      </div>
  `;

  statsContent.innerHTML = statsHTML;

  // UPDATE COMPLETION PERCENTAGE IN DOM
  const percentageContainer = document.getElementById('completion-percentage');
  percentageContainer.innerHTML = `
      <span class="percentage-label">Current Task Cycle Completion</span>
      <span class="percentage-number">${completionPercentage}%</span>
  `;

  // PIE CHART DATA
  const pieChartData = {
      labels: ['Tasks Completed', 'Pending'],
      values: [completedWeight, totalWeight - completedWeight], // Use weighted metrics
  };
  renderPieChart(pieChartData);

  const totalTaskCycles = counter;
  const statsTaskCycles = document.getElementById('stats-content-taskcycles');
  let statsTotalTaskCycles = `
      <div class="task-cycle-container">
          <p><span class="stats-total-task-cycles">Total Task Cycles Completed:</span> ${totalTaskCycles}</p>
      </div>
  `;
  
  statsTaskCycles.innerHTML = statsTotalTaskCycles;
  
  // Optional: Add conditional styling
  if (totalTaskCycles > 10) {
      statsTaskCycles.classList.add('highlight');
  } else {
      statsTaskCycles.classList.remove('highlight');
  }
  


}





function renderPieChart(data) {
  const container = document.getElementById('pie-chart-container');
  container.innerHTML = ''; // Clear previous chart

  const canvas = document.createElement('canvas');
  canvas.id = 'stats-chart';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: data.labels,
          datasets: [{
              data: data.values,
              backgroundColor: ['#4790df', '#e74c3c'], // Completed and Pending colors
              borderColor: 'white',
              borderWidth: 2,
          }],
      },
      options: {
          responsive: true,
          cutout: '60%', //Adjust inner radius
          plugins: {
              legend: {
                  position: 'bottom',
              },
          },
      },
  });
}

/* TTO-1
const displayStats = () => {
  const statsContentTasks = document.getElementById('stats-content-tasks');

  // Use the built-in counter for total task cycles
  const totalTaskCycles = taskCycleCounter || 0; // Replace with your actual built-in counter variable

  // Display the stats
  statsContentTasks.innerHTML = `
      <h3>Task Statistics</h3>
      <p>Total Task Cycles Completed: <strong>${totalTaskCycles}</strong></p>
  `;
};
*/

document.getElementById('chart-button').addEventListener('click', () => {
  const statsWindow = document.getElementById('stats-window');
  statsWindow.classList.toggle('show');

  if (statsWindow.classList.contains('show')) {
      updateStatistics();  // Update Task Stats
      updateSubtaskStats();  // Update Subtask Stats
      updateBarChart();  // Update Bar Chart
      displayStats(); // Update the stats content
  }
});

const statsButton = document.getElementById('chart-button'); // The button that opens the stats panel
const statsPanel = document.getElementById('stats-window');   // The stats panel container


// Close the stats panel when clicking outside of it
document.addEventListener('click', (event) => {
    const isClickInsideStats = statsPanel.contains(event.target);
    const isClickOnStatsButton = statsButton.contains(event.target);

    // Close the panel if the click is outside the stats panel and the stats button
    if (!isClickInsideStats && !isClickOnStatsButton) {
        statsPanel.classList.remove('show');
        statsPanel.classList.add('hidden');
    }
});

/* TTO-1
function updateSubtaskStats() {
  const subtaskStatsContainer = document.getElementById('stats-content-subtasks');
  const totalSubtasks = document.querySelectorAll('.subtask-checkbox').length;
  const completedSubtasks = document.querySelectorAll('.subtask-checkbox:checked').length;
  const allMainTasks = document.querySelectorAll('.checkbox-container-main').length;
  
  let tasksWithSubtasksCount = 0;

  allMainTasks.forEach(task => {
    const subtasks = task.querySelectorAll('.subtask-checkbox');
    if (subtasks.length > 0) {
      tasksWithSubtasksCount++;
    }
  });

  // Check if subtasks exist
  if (totalSubtasks === 0) {
      subtaskStatsContainer.classList.add('hidden'); // Hide container if no subtasks exist
      return;
  }

  subtaskStatsContainer.classList.remove('hidden'); // Show container if subtasks exist

  const pendingSubtasks = totalSubtasks - completedSubtasks;

  // Update HTML content for subtask stats
  subtaskStatsContainer.innerHTML = `
      <div>
          <h3>Subtask Overview</h3>
          <p><span>Total Tasks with Subtasks:</span> ${tasksWithSubtasksCount}</p>
          <p><span>Total Subtasks:</span> ${totalSubtasks}</p>
          <p class="completed"><span>Completed Subtasks:</span> ${completedSubtasks}</p>
          <p class="pending"><span>Pending Subtasks:</span> ${pendingSubtasks}</p>
      </div>
  `;
}
*/


function updateSubtaskStats() {
  const subtaskStatsContainer = document.getElementById('stats-content-subtasks');
  const subtaskPanel = document.getElementById('subtasks-overview'); // Subtask panel container
  const allMainTasks = document.querySelectorAll('.checkbox-container-main');
  let tasksWithSubtasksCount = 0;

  // Count tasks with subtasks
  allMainTasks.forEach(task => {
      const subtasks = task.querySelectorAll('.subtask-checkbox');
      if (subtasks.length > 0) {
          tasksWithSubtasksCount++;
      }
  });

  const totalSubtasks = document.querySelectorAll('.subtask-checkbox').length;
  const completedSubtasks = document.querySelectorAll('.subtask-checkbox:checked').length;

  // Check if subtasks exist
  if (totalSubtasks === 0) {
      subtaskStatsContainer.classList.add('hidden'); // Hide stats content
      subtaskPanel.classList.add('hidden'); // Hide the entire subtask panel (including border)
      return;
  }

  subtaskStatsContainer.classList.remove('hidden'); // Show stats content
  subtaskPanel.classList.remove('hidden'); // Show the subtask panel (including border)

  const pendingSubtasks = totalSubtasks - completedSubtasks;

  // Update HTML content for subtask stats
  subtaskStatsContainer.innerHTML = `
      <div>
          <h3>Subtask Overview</h3>
          <p><span>Total Tasks with Subtasks:</span> ${tasksWithSubtasksCount}</p>
          <p><span>Total Subtasks:</span> ${totalSubtasks}</p>
          <p class="completed"><span>Completed Subtasks:</span> ${completedSubtasks}</p>
          <p class="pending"><span>Pending Subtasks:</span> ${pendingSubtasks}</p>
      </div>
  `;
}








function updateStatsButtonVisibility() {
  const totalTasks = document.querySelectorAll('.checkbox-container').length;
  const statsButton = document.getElementById('chart-button');
  
  if (totalTasks > 0) {
      statsButton.style.display = 'block'; // Show the button
  } else {
      statsButton.style.display = 'none'; // Hide the button
  }
}





  
    // Event listener for close button in stats window
    document.getElementById('close-stats').addEventListener('click', function() {
        document.getElementById('stats-window').classList.remove('show');
    });

// Event listener for 'View Timeline' button
document.getElementById('view-timeline-button').addEventListener('click', () => {
  const timeline = document.getElementById('timeline');
  const viewTimelineButton = document.getElementById('view-timeline-button');
  const closeTimelineButton = document.getElementById('close-timeline-button');

  // Show the timeline and hide the button
  timeline.classList.remove('hidden');
  viewTimelineButton.classList.add('hidden');
  closeTimelineButton.classList.remove('hidden');
});

// Event listener for 'Close Timeline' button
document.getElementById('close-timeline-button').addEventListener('click', () => {
  const timeline = document.getElementById('timeline');
  const viewTimelineButton = document.getElementById('view-timeline-button');
  const closeTimelineButton = document.getElementById('close-timeline-button');

  // Hide the timeline and show the button
  timeline.classList.add('hidden');
  viewTimelineButton.classList.remove('hidden');
  closeTimelineButton.classList.add('hidden');
});

// Reset timeline visibility when opening the stats window
document.getElementById('chart-button').addEventListener('click', () => {
  const timeline = document.getElementById('timeline');
  const closeTimelineButton = document.getElementById('close-timeline-button');
  const viewTimelineButton = document.getElementById('view-timeline-button');

  // Ensure the timeline is hidden and the button is visible
  timeline.classList.add('hidden');
  closeTimelineButton.classList.add('hidden');
  viewTimelineButton.classList.remove('hidden');
});

    
    function addToTimeline(action, description, entryType) {
      const timeline = document.getElementById('timeline-content');
      const timestamp = new Date().toLocaleString(); // Gets the current date and time
      const entry = document.createElement('div');
  
      // Add the 'timeline-entry' class and the specific type class (if provided)
      entry.classList.add('timeline-entry');
      if (entryType) {
          entry.classList.add(entryType);
      }
  
      // Construct the entry's inner HTML
      entry.innerHTML = `<strong>${timestamp}</strong>: ${action} - ${description}`;
  
      // Append the new entry to the timeline
      timeline.appendChild(entry);

          // Add click listener to the entry
    entry.addEventListener('click', () => {
      showPopup(entry);
  });
  
      // Update the visibility of the clear button after adding an entry
      updateClearButtonVisibility();
  }
  

// Function to update the visibility of the clear button
function updateClearButtonVisibility() {
  const timelineEntries = document.querySelectorAll('.timeline-entry');
  const clearButton = document.getElementById('clear-timeline-button');
  if (timelineEntries.length > 0) {
      clearButton.classList.add('visible');
  } else {
      clearButton.classList.remove('visible');
  }
}

// Function to clear the timeline
function clearTimeline() {
  const timeline = document.getElementById('timeline-content'); // Adjust ID as per your timeline container
  timeline.innerHTML = ''; // Clear all entries
  updateClearButtonVisibility(); // Update button visibility
}

// Event listener for the clear button
document.getElementById('clear-timeline-button').addEventListener('click', clearTimeline);

// Call updateClearButtonVisibility initially and after every operation





document.querySelector('#checkbox-list').addEventListener('change', () => {
  checkIfAllTasksComplete(); // Check if all tasks are completed
});



//This creates the subtask window
function addSubtaskContainer(id, priority = '') {
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


function hideArrowsForAllTasks() {
  document.querySelectorAll('.checkbox-container').forEach(task => {
      const upButton = task.querySelector('.move-up');
      const downButton = task.querySelector('.move-down');
      if (upButton) upButton.classList.remove('visible');
      if (downButton) downButton.classList.remove('visible');
  });
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
  

  function handleBlur(event) {
    if (event.target.value.trim() === '') {
        newCheckboxLabelInput.style.display = 'none';
    } 
    }


    function handleSubtaskChange(subtaskContainer, shouldCheckCompletion = true) {
      const parentContainerMain = subtaskContainer.closest('.checkbox-container-main');
      const mainCheckboxContainer = parentContainerMain.querySelector('.checkbox-container');
  
      // Iterate over subtask checkboxes and attach event listener only if not already attached
      subtaskContainer.querySelectorAll('.subtask-checkbox').forEach(subtaskCheckbox => {
          // Check if the listener flag class is not present
          if (!subtaskCheckbox.classList.contains('listener-attached')) {
              subtaskCheckbox.addEventListener('change', () => {
                  const subtaskLabel = subtaskCheckbox.nextElementSibling.textContent;
                  const isCompleted = subtaskCheckbox.checked;
                  const action = isCompleted ? 'Subtask Marked as Completed' : 'Subtask Marked as Uncompleted';
                  const entryType = isCompleted ? 'completed' : 'uncompleted';
  
                  addToTimeline(action, subtaskLabel, entryType);
                  updateClearButtonVisibility();
              });
              // Mark the checkbox with a flag class indicating that the listener has been attached
              subtaskCheckbox.classList.add('listener-attached');
          }
      });

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

          // Use helper function to log the completion status
          logMainTaskCompletionStatus(mainCheckboxContainer, true);
          
      } else {
          mainCheckboxContainer.classList.remove('completed');
          subtaskContainer.classList.remove('hidden');

          // Use helper function to log the uncompletion status
          logMainTaskCompletionStatus(mainCheckboxContainer, false);
      }
      updateProgressColor(mainCheckboxContainer);
  
      updateProgressBar();
       if (shouldCheckCompletion) {
        checkCompletion();
    }
  }
  
  function logMainTaskCompletionStatus(mainCheckboxContainer, isCompleted) {
    const taskLabel = mainCheckboxContainer.querySelector('.checkbox-label').textContent;
    const action = isCompleted ? 'Task Marked as Completed' : 'Task Marked as Uncompleted';
    const entryType = isCompleted ? 'completed' : 'uncompleted'; // Specify entry type based on completion status

    // Add entry to timeline with the specified entry type
    addToTimeline(action, taskLabel, entryType);

    // Update the visibility of the clear button
    updateClearButtonVisibility();
}

/* TTO-1
function editTaskName(taskLabelElement) {
  //Get current Task Name
   const currentTaskName = taskLabelElement.textContent;
   //Clear task name
   taskLabelElement.textContent = '';

   //Create an input field for renaming the main task
   const editInput = document.createElement('input');
   editInput.type = ('input');
   editInput.className = 'edit-main-task-input';
   //Pre-fill with the current task name
   editInput.value = currentTaskName;

   //When the input loses focus, save the new name
    editInput.addEventListener('blur',() => {
      //Update the label with the new name
      const newTaskname = editInput.value.trim() !==''? editInput : currentTaskName;
      taskLabelElement.text.Content = newTaskname;
      //Remove the input field
      editInput.remove();

      // Log the name change in the timeline
      addToolTimeline('Task Renamed', newTaskname,'edited');
      // Update visibility of the clear button
      updateClearButtonVisibility(); 
    });

    //Add input field to the task label element
    taskLabelElement.appendChild(editInput);
    //Automatically focus on the input for editing
    editInput.focus();
   
}

document.getElementById('renameOption')?.addEventListener('click',() => {
  //Check if a task selected  
  if (selectedTask) {
    const taskLable = selectedTask.querySelector('.checkbox-label');
    editTaskName(taskLabel);
  }
});
*/
    
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
    // Capture the original text and the new text
    let originalText = noteTextElement.textContent.trim();
    let updatedText = textarea.value.replace(/\n/g, '<br>').trim();
    noteTextElement.innerHTML = updatedText;

    // Log the editing action if the text has changed
    if (originalText !== updatedText) {
        addToTimeline('Note Edited', originalText, 'edited');
        updateClearButtonVisibility();
    }

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
  // TTO-10 newCheckboxLabelInput.value = 'Task Item '+ taskNumber;
  newCheckboxLabelInput.focus();
  newCheckboxLabelInput.addEventListener('blur', createCheckboxIfNotEmpty);
});



/* TTO-1

document.getElementById('add-button').addEventListener('click', () => {
  const newCheckboxLabelInput = document.getElementById('new-checkbox-label');
  const completeButton = document.getElementById('complete-button');
  const taskWindow = document.getElementById('checkbox-list'); // The container for tasks

  // Get the bounding rectangles of the Complete button and task window
  const completeButtonRect = completeButton.getBoundingClientRect();
  const taskWindowRect = taskWindow.getBoundingClientRect();

  // Set input position dynamically below the Complete button and centered to task window
  newCheckboxLabelInput.style.position = 'absolute';
  newCheckboxLabelInput.style.top = `${completeButtonRect.bottom + window.scrollY + 30}px`; // 30px below Complete button
  newCheckboxLabelInput.style.left = `${taskWindowRect.left + taskWindowRect.width / 2 - newCheckboxLabelInput.offsetWidth / 2}px`; // Centered horizontally
  newCheckboxLabelInput.style.display = 'block';

  // Ensure the label input appears fully rendered before calculating width
  setTimeout(() => {
      newCheckboxLabelInput.style.left = `${taskWindowRect.left + taskWindowRect.width / 2 - newCheckboxLabelInput.offsetWidth / 2}px`;
  }, 0);

  // Set the default value and focus the input field
  newCheckboxLabelInput.value = `Task Item ${taskNumber}`;
  newCheckboxLabelInput.focus();

  // Attach the blur event listener for creating a checkbox if the input is not empty
  newCheckboxLabelInput.addEventListener('blur', () => {
    const newLabel = newCheckboxLabelInput.value.trim();
    if (newLabel !== '') {
      // Call the function to create a new checkbox
      createCheckboxIfNotEmpty(); // Assuming this is already defined in your script
    }
    newCheckboxLabelInput.style.display = 'none';
  });
});
*/


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

notesButton.addEventListener('mouseover', () => {
  if(errorN==1){
  notesTooltip.textContent = 'Notes Panel\n(Create and edit notes)';
  notesTooltip.style.display = 'block';
}else{
  notesTooltip.style.display = 'none';
}
  });

notesButton.addEventListener('mouseout', () => {
  notesTooltip.style.display = 'none';
});

statsButton.addEventListener('mouseover', () => {
  if(errorN==1){
  statsTooltip.textContent = 'Stats Panel\n(View insights)';
  statsTooltip.style.display = 'block';
}else{
  statsTooltip.style.display = 'none';
}
  });

statsButton.addEventListener('mouseout', () => {
  statsTooltip.style.display = 'none';
});

mainMenuButton.addEventListener('mouseover', () => {
  if(errorN==1){
  mainMenuTooltip.textContent = 'Main Menu';
  mainMenuTooltip.style.display = 'block';
}else{
  mainMenuTooltip.style.display = 'none';
}
  });

mainMenuButton.addEventListener('mouseout', () => {
  mainMenuTooltip.style.display = 'none';
});




completeButton.addEventListener('mouseover', () => {
  if(errorN==1){
  completeTooltip.innerHTML = 'Complete Cycle <br> (complete all available tasks)';
  completeTooltip.style.display = 'block';
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
      // Get note text before removing
      let noteText = noteItem.querySelector('.note-text').textContent;
  
      // Remove the note item
      notesList.removeChild(noteItem);
  
      // Add to timeline
      addToTimeline('Note Deleted', noteText);
      updateClearButtonVisibility();
  });

    
    // Append the buttons to the button container
    noteButtonContainer.appendChild(editButton);
    noteButtonContainer.appendChild(deleteButton);

    // Append the button container to the note item
    noteItem.appendChild(noteButtonContainer);
    
    notesList.appendChild(noteItem);
    newNoteTextarea.value = '';

     // Add to timeline
     addToTimeline('Note Added', noteText);
     updateClearButtonVisibility();
}
});


closeButton.addEventListener('click', () => {
  notesPanel.classList.add('hidden'); // Assuming 'hidden' class hides the panel
});
/* TTO-1
// Close the notes panel when clicking outside of it
document.addEventListener('click', (event) => {
  const isClickInsideNotes = notesPanel.contains(event.target);
  const isClickOnNotesButton = notesButton.contains(event.target);

  // Close the panel if the click is outside the notes panel and the notes button
  if (!isClickInsideNotes && !isClickOnNotesButton) {
      notesPanel.classList.remove('show');
      notesPanel.classList.add('hidden');
  }
});
*/

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




// Hide the horizontal menu if clicked anywhere else on the document
document.addEventListener('click', function(e) {
  // Check if the click was outside the checkbox-list element and horizontal menu
  if (!e.target.closest('#checkbox-list') && !e.target.closest('#horizontalMenu')) {
      // Deactivate rearrange mode and update the UI
      isRearrangeModeActive = false;
      toggleRearrangeMode(isRearrangeModeActive);
      hideArrows();
  }
  // Logic to hide the horizontal menu if it's not clicked
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
  let targetElement = currentTaskElement; // Or another way to get the target element

  if (isSubtask(targetElement)) {
      // Logic to handle marking of subtasks
      markSubtaskPriority(targetElement, 'high'); // Or 'low', depending on the button clicked
  } else {
      // Existing logic for tasks
      if (targetElement.classList.contains('marked-high') || targetElement.classList.contains('marked-low')) {
        // Unmarking priority
        const taskLabel = targetElement.querySelector('.checkbox-label').textContent;
        addToTimeline('Priority Unmarked', taskLabel); // Log unmarking priority
        updateClearButtonVisibility();
          targetElement.classList.remove('marked-high', 'marked-low');
          updateProgressColor(targetElement);
          hideHorizontalMenu();
      } else {
          showHorizontalMenu(e, targetElement, true, true);
      }
      updateMarkButtonText();
  }
});


document.getElementById('markHigh').addEventListener('click', function() {
  if (currentTaskElement) {
      const taskLabel = currentTaskElement.querySelector('.checkbox-label').textContent;
      addToTimeline('Priority Set to High', taskLabel); // Update timeline
      updateClearButtonVisibility();
      currentTaskElement.classList.remove('marked-low');
      currentTaskElement.classList.add('marked-high');
      updateProgressColor(currentTaskElement); // Update the progress color
      hideHorizontalMenu();
  }
});



document.getElementById('markLow').addEventListener('click', function() {
  if (currentTaskElement) {
      const taskLabel = currentTaskElement.querySelector('.checkbox-label').textContent;
      addToTimeline('Priority Set to Low', taskLabel); // Update timeline
      updateClearButtonVisibility();
      currentTaskElement.classList.remove('marked-high');
      currentTaskElement.classList.add('marked-low');
      updateProgressColor(currentTaskElement); // Update the progress color
      hideHorizontalMenu();
  }
});



document.body.addEventListener('click', function(e) {
  if (e.target.id === 'menuDelete') {
    isRearrangeModeActive = false;
    toggleRearrangeMode(false);
    hideArrows();
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


document.getElementById('editDetailsButton').addEventListener('click', function() {
  if (detailsTextarea.hasAttribute('disabled')) {
      detailsTextarea.removeAttribute('disabled');
      detailsTextarea.focus();
      editDetailsButton.textContent = 'Save';
  } else {
      const newDetails = detailsTextarea.value;
      const oldDetails = currentTaskElement.getAttribute('data-details') || '';
      if (newDetails !== oldDetails) {
          addToTimeline('Task Details Updated', `For task '${currentTaskElement.querySelector('.checkbox-label').textContent}'`);
          updateClearButtonVisibility();
      }
      currentTaskElement.setAttribute('data-details', newDetails);
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
  // Deactivate rearrange mode
  isRearrangeModeActive = false;

  // Call the function to update the UI
  toggleRearrangeMode(isRearrangeModeActive);

  hideArrows();
  document.body.style.cursor = 'default';
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
    const draggedTaskLabel = draggedElement.querySelector('.checkbox-label').textContent;
    const targetTaskLabel = dropTarget.querySelector('.checkbox-label').textContent;
    if (dragDirection === 'up') {
      dropTarget.before(draggedElement);
      addToTimeline('Task Rearranged', `${draggedTaskLabel} moved above ${targetTaskLabel}`);
      updateClearButtonVisibility();
    } else {
      dropTarget.after(draggedElement);k
      addToTimeline('Task Rearranged', `${draggedTaskLabel} moved below ${targetTaskLabel}`);
      updateClearButtonVisibility();
    }

  }
// Deactivate rearrange mode and update the UI
isRearrangeModeActive = false;
toggleRearrangeMode(isRearrangeModeActive);
hideArrows();
});

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('move-up')) {
      const currentTask = e.target.closest('.checkbox-container-main');
      const previousTask = currentTask.previousElementSibling;
      if (previousTask) {
          currentTask.parentNode.insertBefore(currentTask, previousTask);
          // Update arrows for both the moved task and its new previous sibling
          toggleArrowVisibility(currentTask, true);
          toggleArrowVisibility(previousTask, false); // Update for the task that moved down

          // Log the rearrangement in the timeline
          const taskLabel = currentTask.querySelector('.checkbox-label').textContent;
          addToTimeline('Task Moved Up', taskLabel);
          updateClearButtonVisibility();
      }
  } else if (e.target.classList.contains('move-down')) {
      const currentTask = e.target.closest('.checkbox-container-main');
      const nextTask = currentTask.nextElementSibling;
      if (nextTask) {
          currentTask.parentNode.insertBefore(nextTask, currentTask);
          // Update arrows for both the moved task and its new next sibling
          toggleArrowVisibility(currentTask, true);
          toggleArrowVisibility(nextTask, false); // Update for the task that moved up

          // Log the rearrangement in the timeline
          const taskLabel = currentTask.querySelector('.checkbox-label').textContent;
          addToTimeline('Task Moved Down', taskLabel);
          updateClearButtonVisibility();
      }
  }
});


menuRearrange.addEventListener('click', function(e) {
  // Toggle the current state of rearrange mode
  isRearrangeModeActive = !isRearrangeModeActive;
  toggleRearrangeMode(isRearrangeModeActive);

  // Show or hide arrows based on the Rearrange Mode state for the selected task
  if (isRearrangeModeActive) {
      showArrowsForSelectedTask();
      setActiveTask(selectedTask);
  } else {
      hideArrowsForAllTasks();
  }

  hideHorizontalMenu();
});


function toggleRearrangeMode(enable) {
  const allTasks = document.querySelectorAll('.checkbox-container-main');
  allTasks.forEach(task => {

      if (enable) {
          // Enable Rearrange Mode
          task.setAttribute("draggable", true);
          task.classList.add('draggable');
      } else {
          // Disable Rearrange Mode
          task.setAttribute("draggable", false);
          task.classList.remove('draggable');
          disableTaskDragging();
      }
  });
}


function showArrowsForSelectedTask() {
  if (selectedTask) {
      const container = selectedTask.closest('.checkbox-container-main');
      if (container) {
        activeRearrangeTask = container;
          toggleArrowVisibility(container, true);
      }
  }
}


function toggleArrowVisibility(taskElement, showArrows) {
  const upButton = taskElement.querySelector('.move-up');
  const downButton = taskElement.querySelector('.move-down');
  const allTasks = document.querySelectorAll('.checkbox-container-main');
  const isFirstTask = taskElement === allTasks[0];
  const isLastTask = taskElement === allTasks[allTasks.length - 1];

  if (showArrows) {
      if (upButton) upButton.classList.toggle('visible', !isFirstTask);
      if (downButton) downButton.classList.toggle('visible', !isLastTask);
  } else {
      if (upButton) upButton.classList.remove('visible');
      if (downButton) downButton.classList.remove('visible');
  }
}


document.querySelectorAll('.checkbox-container-main').forEach(task => {
  task.addEventListener('click', function(e) {
      if (isRearrangeModeActive) {
          // Hide arrows for all tasks
          hideArrowsForAllTasks();
          // Show arrows only for the clicked task
          toggleArrowVisibility(this, true);
      }
  });
});




function hideArrows() {
  document.querySelectorAll('.checkbox-container-main').forEach(task => {
    toggleArrowVisibility(task, isRearrangeModeActive);
});
}


// Variable to keep track of the currently active task

document.addEventListener('keydown', function(e) {

  if (!activeTask || !isRearrangeModeActive) {
    return; // Do nothing if no task is active or if not in rearrange mode
}
const currentTask = activeTask.closest('.checkbox-container-main');
    if (!currentTask) {
        return; // Exit if currentTask is null
    }
    
    if (e.key === 'ArrowUp') {
      const currentTask = e.target.closest('.checkbox-container-main');
      const previousTask = currentTask.previousElementSibling;
      if (previousTask) {
          currentTask.parentNode.insertBefore(currentTask, previousTask);
          // Update arrows for both the moved task and its new previous sibling
          toggleArrowVisibility(currentTask, true);
          toggleArrowVisibility(previousTask, false);
          
      }
        
      
    } else if (e.key === 'ArrowDown') {
      const currentTask = e.target.closest('.checkbox-container-main');
      const nextTask = currentTask.nextElementSibling;
      if (nextTask) {
          currentTask.parentNode.insertBefore(nextTask, currentTask);
          // Update arrows for both the moved task and its new next sibling
          toggleArrowVisibility(currentTask, true);
          toggleArrowVisibility(nextTask, false); 
    }
  }

});

// Example function to set the active task - you might set this on click or another event
function setActiveTask(taskElement) {
    activeTask = taskElement;
}

function isSubtask(element) {
  // Check if the element itself or its parent is a subtask
  return element.classList.contains('subtask') || element.parentElement.classList.contains('subtask');
}

function markSubtaskPriority(subtaskElement, priority) {
  // Implement the logic to mark subtask as high or low priority
  if (priority === 'high') {
    subtaskElement.classList.add('marked-high');
    subtaskElement.classList.remove('marked-low');
  } else if (priority === 'low') {
    subtaskElement.classList.add('marked-low');
    subtaskElement.classList.remove('marked-high');
  } else {
    // Unmark
    subtaskElement.classList.remove('marked-high', 'marked-low');
  }
}
  updateCounter();

}

/* --------------------
GLOBAL STATE VARIABLES
----------------------- */

// Task and subtask state
export let currentTaskElement = null;  // The task currently being interacted with
export let selectedTask = null;        // The currently selected task
export let activeTask = null;          // The active task in focus

// Rearrange and Drag State
export let dragDirection = null;       // Direction of drag (up/down)
export let draggedItem = 0;            // The currently dragged task ID
export let isRearrangeModeActive = false; // Is rearrange mode active?
export let activeRearrangeTask = null; // The task currently being rearranged

// App-Wide State
export let counter = 0;                // Tracks task cycles
export let isResetting = false;        // Tracks if the app is resetting
export let errorN = 1;                 // Tracks error state for user messages

// Stopwatch and Timer State
export let isStopWatchRunning = false; // Is the stopwatch running?
export let startTime = null;           // Stopwatch start time
export let elapsedTime = 0;            // Elapsed time for the stopwatch

// Shared UI/Interaction State
export let checkboxContainermain = null; // Tracks the container for checkboxes

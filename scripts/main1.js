// Main App Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Initialize app state and handle errors gracefully
    try {
        loadStateFromLocalStorage();
        loadNotesFromLocalStorage();
        loadTimelineFromLocalStorage();
    } catch (error) {
        console.error("Error loading state:", error);
        alert("An error occurred while loading the app. Starting fresh.");
        localStorage.clear();
    }

    // Attach global event listeners for app functionality
    attachEventListeners();
    mainMenuPanel();
    // Update the counter for tasks
    updateCounter();

    console.log("App Initialized");
});

// Show the Main App (Hide Startup Page)
function showMainApp() {
    const app = document.getElementById('app');
    const startupPage = document.getElementById('startup-page');
    startupPage.classList.add('hidden-startup');
    app.classList.add('visible-app');
}

// Show the Startup Page (Hide Main App)
function showStartupPage() {
    const app = document.getElementById('app');
    const startupPage = document.getElementById('startup-page');
    startupPage.classList.remove('visible-app');
    app.classList.remove('visible-app');
}

// Event Listeners for App Visibility
document.getElementById('open-app-button').addEventListener('click', showMainApp);
document.getElementById('exit-to-home-page').addEventListener('click', showStartupPage);


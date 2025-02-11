









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

      

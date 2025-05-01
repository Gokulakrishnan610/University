(function($) {
    $(document).ready(function() {
        // Function to handle user type changes
        function setupUserTypeHandling() {
            var userTypeSelect = $('#id_user_type');
            
            if (!userTypeSelect.length) return;
            
            // Save the selected value when the page loads
            var initialValue = userTypeSelect.val();
            
            // Function to show temporary message
            function showMessage(message) {
                // Remove any existing messages
                $('.user-type-message').remove();
                
                // Create and show new message
                var messageDiv = $('<div class="user-type-message" style="margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #28a745;"></div>')
                    .text(message);
                
                userTypeSelect.after(messageDiv);
                
                // Automatically remove after 5 seconds
                setTimeout(function() {
                    messageDiv.fadeOut(500, function() { $(this).remove(); });
                }, 5000);
            }
            
            // Handle the change event
            userTypeSelect.on('change', function() {
                var newValue = $(this).val();
                
                // Show different messages based on whether this is an add or change form
                if (window.location.href.indexOf('/add/') > -1) {
                    showMessage('User type selected. The corresponding fields will be available after saving.');
                } else {
                    showMessage('User type changed. Save to update the form with the corresponding fields.');
                }
                
                // Update the stored value
                initialValue = newValue;
            });
        }
        
        // Initialize the handlers
        setupUserTypeHandling();
    });
})(django.jQuery);
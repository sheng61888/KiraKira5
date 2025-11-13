// Track website visit on page load
(function() {
    fetch('/api/admin/analytics/visit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(err => console.error('Failed to track visit:', err));
})();

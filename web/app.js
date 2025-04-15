// Add this code to your existing app.js file where you handle algorithm selection changes

document.addEventListener('DOMContentLoaded', function() {
    const algorithmSelect = document.getElementById('algorithm-select');
    const transactionsTextarea = document.getElementById('transactions');
    
    // Define algorithm-specific placeholders
    const placeholders = {
        'apriori': `A,B,C
A,C
C,B,A
A,B`,
        'kmeans': `1,1
2,1
4,3
5,4`
    };
    
    // Set initial placeholder based on default selected algorithm
    transactionsTextarea.placeholder = placeholders[algorithmSelect.value];
    
    // Update placeholder when algorithm changes
    algorithmSelect.addEventListener('change', function() {
        transactionsTextarea.placeholder = placeholders[this.value];
    });
    
    // ...existing code...
});
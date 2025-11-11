let allRequests = [];

async function loadPasswordResetRequests() {
    try {
        const response = await fetch('/api/passwordreset/requests');
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success && result.requests) {
            allRequests = result.requests;
            displayRequests(allRequests);
        } else {
            document.getElementById('requestsContainer').innerHTML = '<p class="muted">No pending password reset requests.</p>';
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('requestsContainer').innerHTML = '<p class="muted">Error loading requests.</p>';
    }
}

function displayRequests(requests) {
    const container = document.getElementById('requestsContainer');
    
    if (requests.length > 0) {
        container.innerHTML = requests.map(req => {
            const email = req.Email || req.email || 'Unknown';
            const requestDate = req.RequestDate || req.request_date || req.requestDate;
            const status = req.Status || req.status || 'Unknown';
            const requestId = req.RequestId || req.request_id || req.requestId;
            
            return `
            <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>${email}</h3>
                        <p class="muted">Requested: ${new Date(requestDate).toLocaleString()}</p>
                        <p class="muted">Status: ${status}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${status === 'Pending' ? `
                            <button class="btn btn--primary" onclick="approveReset(${requestId}, '${email}')">Approve</button>
                            <button class="btn btn--ghost" onclick="rejectReset(${requestId})">Reject</button>
                        ` : `
                            <button class="btn btn--ghost" onclick="deleteRequest(${requestId})">Delete</button>
                        `}
                    </div>
                </div>
            </div>
            `;
        }).join('');
    } else {
        container.innerHTML = '<p class="muted">No requests found.</p>';
    }
}

function searchRequests() {
    const searchEmail = document.getElementById('searchEmail').value.toLowerCase();
    const filtered = allRequests.filter(req => {
        const email = (req.Email || req.email || '').toLowerCase();
        return email.includes(searchEmail);
    });
    displayRequests(filtered);
}

function clearSearch() {
    document.getElementById('searchEmail').value = '';
    displayRequests(allRequests);
}

async function approveReset(requestId, email) {
    if (!confirm(`Approve password reset for ${email}?`)) return;
    
    try {
        const response = await fetch('/api/passwordreset/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Password reset approved! User can now set their new password.');
            loadPasswordResetRequests();
        } else {
            alert('Failed to approve reset: ' + result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function rejectReset(requestId) {
    if (!confirm('Are you sure you want to reject this request?')) return;
    
    try {
        const response = await fetch('/api/passwordreset/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Request rejected.');
            loadPasswordResetRequests();
        } else {
            alert('Failed to reject: ' + result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
        const response = await fetch(`/api/passwordreset/delete/${requestId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Request deleted.');
            loadPasswordResetRequests();
        } else {
            alert('Failed to delete: ' + result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

loadPasswordResetRequests();

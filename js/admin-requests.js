let allRequests = [];

async function loadPasswordResetRequests() {
    try {
        const response = await fetch('/api/passwordreset/requests');
        const result = await response.json();
        
        if (result.success && result.requests) {
            allRequests = result.requests;
            displayRequests(allRequests);
        } else {
            document.getElementById('requestsContainer').innerHTML = '<p class="muted">No password reset requests.</p>';
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
            const otp = req.OTP || req.otp;
            const otpExpiry = req.OTPExpiry || req.otp_expiry;
            
            const isExpired = otpExpiry && new Date(otpExpiry) < new Date();
            const otpStatus = isExpired ? 'Expired' : status;
            
            return `
            <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <h3>${email}</h3>
                        <p class="muted">Requested: ${new Date(requestDate).toLocaleString()}</p>
                        <p class="muted">Status: ${otpStatus}</p>
                        ${otp && status === 'Active' ? `
                            <div style="margin-top: 0.5rem; padding: 0.75rem; background: #f0f0f0; border-radius: 4px; display: inline-block;">
                                <strong>OTP: ${otp}</strong>
                                <p class="muted" style="margin: 0.25rem 0 0 0; font-size: 0.85rem;">Expires: ${new Date(otpExpiry).toLocaleString()}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn--ghost" onclick="deleteRequest(${requestId})">Delete</button>
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

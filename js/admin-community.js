let threads = [];
let filteredThreads = [];
let threadToDelete = null;

async function loadThreads() {
    try {
        const response = await fetch('/api/Admin/community/threads');
        if (!response.ok) {
            throw new Error('Failed to load threads');
        }
        threads = await response.json();
        filteredThreads = threads;
        renderThreads();
        showStatus('Threads loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading threads:', error);
        showStatus('Error loading threads', 'error');
        document.getElementById('threadsTableBody').innerHTML = 
            '<tr><td colspan="7" style="text-align: center;">Error loading threads</td></tr>';
    }
}

function renderThreads() {
    const tbody = document.getElementById('threadsTableBody');
    
    if (!filteredThreads || filteredThreads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No threads found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredThreads.map(thread => `
        <tr>
            <td>${thread.threadId}</td>
            <td>
                <strong>${escapeHtml(thread.title)}</strong>
                <br>
                <small class="text-muted">${escapeHtml(thread.body.substring(0, 100))}${thread.body.length > 100 ? '...' : ''}</small>
            </td>
            <td>
                <span class="badge">${escapeHtml(thread.category || 'General')}</span>
                ${thread.primaryTag ? `<br><span class="badge badge-tag">#${escapeHtml(thread.primaryTag)}</span>` : ''}
            </td>
            <td>${escapeHtml(thread.username)}</td>
            <td>${thread.replyCount}</td>
            <td>${formatDate(thread.createdAt)}</td>
            <td>
                <button onclick="viewThread(${thread.threadId})" class="btn btn--ghost btn-sm" style="margin-right: 0.5rem;">View</button>
                <button onclick="showDeleteModal(${thread.threadId})" class="btn-danger btn-sm">Delete</button>
            </td>
        </tr>
    `).join('');
}

function viewThread(threadId) {
    const thread = threads.find(t => t.threadId === threadId);
    if (!thread) return;

    document.getElementById('viewThreadTitle').textContent = thread.title;
    document.getElementById('viewCategory').textContent = thread.category || 'General';
    document.getElementById('viewAuthor').textContent = thread.username;
    document.getElementById('viewCreated').textContent = formatDate(thread.createdAt);
    document.getElementById('viewReplies').textContent = thread.replyCount;
    document.getElementById('viewBody').textContent = thread.body;
    
    document.getElementById('viewModal').style.display = 'flex';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

function showDeleteModal(threadId) {
    threadToDelete = threadId;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    threadToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!threadToDelete) return;

    try {
        const response = await fetch(`/api/Admin/community/threads/${threadToDelete}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete thread');
        }

        showStatus('Thread deleted successfully', 'success');
        threads = threads.filter(t => t.threadId !== threadToDelete);
        renderThreads();
        closeDeleteModal();
    } catch (error) {
        console.error('Error deleting thread:', error);
        showStatus('Error deleting thread', 'error');
    }
}

function searchThreads() {
    const searchValue = document.getElementById('searchTitle').value.toLowerCase().trim();
    
    if (!searchValue) {
        filteredThreads = threads;
    } else {
        filteredThreads = threads.filter(thread => 
            thread.title.toLowerCase().includes(searchValue)
        );
    }
    
    renderThreads();
}

function clearSearch() {
    document.getElementById('searchTitle').value = '';
    filteredThreads = threads;
    renderThreads();
}

function refreshThreads() {
    document.getElementById('searchTitle').value = '';
    loadThreads();
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function logout() {
    window.location.href = 'login_signup.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadThreads();
});

window.onclick = function(event) {
    const deleteModal = document.getElementById('deleteModal');
    const viewModal = document.getElementById('viewModal');
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
    if (event.target === viewModal) {
        closeViewModal();
    }
};

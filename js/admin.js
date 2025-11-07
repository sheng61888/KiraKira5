// Admin Dashboard Styles
const adminStyles = `
.admin-layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background-color: var(--color-surface);
    border-right: 1px solid var(--color-border);
    padding: 1.5rem 0;
    height: 100vh;
    overflow-y: auto;
}

.sidebar-header {
    padding: 0 1.5rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 1.5rem;
}

.sidebar-nav {
    padding: 0 1rem;
}

.nav-item {
    margin-bottom: 0.5rem;
}

.nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}

.nav-link:hover {
    background-color: var(--color-surface-muted);
    color: var(--color-text);
}

.nav-link.active {
    background-color: var(--color-accent);
    color: var(--color-on-accent);
}

.nav-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.75rem;
}

.main-content {
    flex: 1;
}

.top-bar {
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dashboard-content {
    padding: 2rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--color-surface);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.5rem;
}

.stat-label {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.feature-card {
    background: var(--color-surface);
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.feature-icon-wrapper {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
}

.icon-indigo {
    background-color: #e0e7ff;
    color: #4f46e5;
}

.icon-green {
    background-color: #dcfce7;
    color: #16a34a;
}

.icon-purple {
    background-color: #f3e8ff;
    color: #9333ea;
}

.feature-card h3 {
    margin-bottom: 0.5rem;
    color: var(--color-text);
}

.feature-card p {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
    font-size: 0.875rem;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = adminStyles;
document.head.appendChild(styleSheet);

// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Theme switcher
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            document.body.className = theme === 'dark' ? 'theme-dark' : '';
            
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
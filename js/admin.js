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
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 100;
}

.sidebar.open {
    transform: translateX(0);
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
    margin-left: 0;
    transition: margin-left 0.3s ease;
}

.main-content.sidebar-open {
    margin-left: 250px;
}

.top-bar {
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.menu-toggle {
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
}

.menu-toggle:hover {
    background-color: var(--color-surface-muted);
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

.overlay {
    display: none;
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 50;
}

.overlay.show {
    display: block;
}

@media (min-width: 768px) {
    .sidebar {
        position: static;
        transform: translateX(0);
    }

    .main-content {
        margin-left: 0;
    }

    .menu-toggle {
        display: none;
    }

    .overlay {
        display: none !important;
    }
}

@media (max-width: 767px) {
    .main-content.sidebar-open {
        margin-left: 0;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = adminStyles;
document.head.appendChild(styleSheet);

// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('overlay');

    if (menuToggle && sidebar && mainContent && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            mainContent.classList.toggle('sidebar-open');
            overlay.classList.toggle('show');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            mainContent.classList.remove('sidebar-open');
            overlay.classList.remove('show');
        });
    }

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
function loadModules() {
    if (!window.kiraModules) {
        const script = document.createElement('script');
        script.src = '../js/modules-data.js';
        script.onload = () => displayModules();
        document.head.appendChild(script);
    } else {
        displayModules();
    }
}

function displayModules() {
    const container = document.getElementById('modulesList');
    if (!window.kiraModules || window.kiraModules.length === 0) {
        container.innerHTML = '<p class="muted">No modules available.</p>';
        return;
    }

    let html = '';
    window.kiraModules.forEach(section => {
        html += `<div class="module-stack">
            <div class="module-stack-header">
                <h3>${section.grade}</h3>
                <p class="muted">${section.description}</p>
            </div>
            <div class="module-list">`;
        
        section.modules.forEach(module => {
            const lessonCount = module.lessons ? module.lessons.length : 0;
            const unitCount = module.units ? module.units.length : 0;
            html += `
                <div class="module-list-item" style="cursor: pointer;" onclick="toggleUnits('${module.moduleId}')">
                    <div class="module-info">
                        <span class="module-number">${module.number}</span>
                        <div>
                            <strong>${module.title}</strong>
                            <small>${lessonCount} lesson${lessonCount !== 1 ? 's' : ''} · ${unitCount} unit${unitCount !== 1 ? 's' : ''}</small>
                            ${module.lessons ? `<br><small class="muted">Topics: ${module.lessons.join(', ')}</small>` : ''}
                        </div>
                    </div>
                </div>
                <div id="units-${module.moduleId}" style="display: none; margin-left: 2rem; margin-bottom: 1rem;">
                    ${module.units ? module.units.map(unit => `
                        <div style="padding: 0.75rem; margin: 0.5rem 0; border-left: 3px solid var(--accent); background: rgba(255,255,255,0.02); border-radius: 4px;">
                            <strong style="color: var(--text);">${unit.title}</strong><br>
                            <small class="muted">Type: ${unit.type} · Duration: ${unit.duration}</small>
                            ${unit.summary ? `<br><small class="muted">${unit.summary}</small>` : ''}
                        </div>
                    `).join('') : '<p class="muted">No units available</p>'}
                </div>
            `;
        });
        html += '</div></div>';
    });
    
    container.innerHTML = html;
}

function toggleUnits(moduleId) {
    const unitsDiv = document.getElementById(`units-${moduleId}`);
    if (unitsDiv) {
        unitsDiv.style.display = unitsDiv.style.display === 'none' ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadModules);

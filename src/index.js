function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

const gridSize = 110;
const padding = 10;
const gridWidth = 10;
const gridHeight = 10;
const grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));

document.querySelectorAll('.app').forEach(app => {
    app.addEventListener('dragstart', drag);
});

document.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.addEventListener('drop', (event) => {
    const appId = event.dataTransfer.getData("text/plain");
    const appElement = document.getElementById(appId);
    const gridContainer = document.querySelector('.desktop');
    const rect = gridContainer.getBoundingClientRect();

    const offsetX = event.clientX - rect.left - (appElement.offsetWidth / 2);
    const offsetY = event.clientY - rect.top - (appElement.offsetHeight / 2);

    const snappedX = Math.round(offsetX / gridSize);
    const snappedY = Math.round(offsetY / gridSize);

    const boundedX = Math.max(0, Math.min(snappedX, gridWidth - 1));
    const boundedY = Math.max(0, Math.min(snappedY, gridHeight - 1));

    let currentPosition = findAppPosition(appId);

    if (currentPosition) {
        grid[currentPosition.y][currentPosition.x] = null;
    }

    if (grid[boundedY][boundedX] === null) {
        grid[boundedY][boundedX] = appId;
        appElement.style.left = `${boundedX * gridSize}px`;
        appElement.style.top = `${boundedY * gridSize}px`;
    } else {
        const newPosition = findNextAvailableCell();
        if (newPosition) {
            const { x, y } = newPosition;
            grid[y][x] = appId;
            appElement.style.left = `${x * gridSize}px`;
            appElement.style.top = `${y * gridSize}px`;
        }
    }
});

document.querySelectorAll('.app img').forEach(img => {
    img.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });
});

function findAppPosition(appId) {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === appId) {
                return { x, y };
            }
        }
    }
    return null;
}

function findNextAvailableCell() {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === null) {
                return { x, y };
            }
        }
    }
    return null;
}

function positionAppsVertically() {
    let index = 0;
    document.querySelectorAll('.app').forEach(app => {
        let x = Math.floor(index / gridHeight);
        let y = index % gridHeight;

        while (grid[y] && grid[y][x] !== null) {
            x++;
            if (x >= gridWidth) {
                x = 0;
                y++;
            }
        }

        if (y < gridHeight) {
            grid[y][x] = app.id;
            app.style.left = `${x * gridSize}px`;
            app.style.top = `${y * gridSize}px`;
            index++;
        }
    });
}

let taskbar = document.createElement('div');
taskbar.className = 'taskbar';
document.body.appendChild(taskbar);

function createWindow(title, width, height, contentHtml) {
    const windowElement = document.createElement('div');
    windowElement.className = 'window';
    windowElement.style.width = `${width}px`;
    windowElement.style.height = `${height}px`;
    windowElement.innerHTML = `
        <div class="window-header">
            <span>${title}</span>
            <div class="window-controls">
                <button class="minimize">-</button>
                <button class="close">X</button>
            </div>
        </div>
        <div class="window-content">${contentHtml}</div>
    `;
    document.body.appendChild(windowElement);

    const minimizeButton = windowElement.querySelector('.minimize');
    const closeButton = windowElement.querySelector('.close');

    minimizeButton.onclick = () => {
        windowElement.style.display = 'none';
    };

    closeButton.onclick = () => {
        windowElement.remove();
        const appId = "window-" + title.replace(/\s+/g, '').toLowerCase();
        const appElement = document.getElementById(appId);
        if (appElement) {
            appElement.remove(); 
        }
    };

    const appElement = document.createElement('div');
    appElement.className = 'taskbar-app';
    appElement.id = "window-" + title.replace(/\s+/g, '').toLowerCase();
    appElement.innerHTML = `<span>${title}</span>`;
    taskbar.appendChild(appElement);

    appElement.onclick = () => {
        windowElement.style.display = 'block';
        windowElement.style.zIndex = 1000;
    };

    windowElement.style.position = 'absolute';
    windowElement.style.left = '100px';
    windowElement.style.top = '100px';
    windowElement.style.backgroundColor = 'black';
    windowElement.style.color = 'white';
    windowElement.style.border = '3px solid purple';
    windowElement.style.zIndex = 1000;

    const header = windowElement.querySelector('.window-header');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '5px';
    header.style.backgroundColor = 'black';
    header.style.border = '3px solid purple';

    const content = windowElement.querySelector('.window-content');
    content.style.padding = '10px';
    content.style.height = `calc(${height}px - 40px)`;

    let isDragging = false;
    let offsetX, offsetY;

    header.onmousedown = (e) => {
        isDragging = true;
        offsetX = e.clientX - windowElement.getBoundingClientRect().left;
        offsetY = e.clientY - windowElement.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    function onMouseMove(e) {
        if (isDragging) {
            windowElement.style.left = `${e.clientX - offsetX}px`;
            windowElement.style.top = `${e.clientY - offsetY}px`;
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

positionAppsVertically();

const applications = {
    music: {
        title: 'Music Box',
        width: 500,
        height: 400,
        content: '<p>UNDER CONSTRUCTION.</p>'
    },
    notepad: {
        title: 'Notepad',
        width: 500,
        height: 200,
        content: `<p>Hi, this place will probably work out as a sandbox of some sort where I put cool things and shit.<br><br>This is influenced by OneShot: world machine edition if that matters.</p>`
    }
};

function openApplication(appKey) {
    const app = applications[appKey];
    if (app) {
        createWindow(app.title, app.width, app.height, app.content);
    } else {
        console.error('Application not found:', appKey);
    }
}

document.querySelectorAll('.app').forEach(app => {
    app.addEventListener('dblclick', () => {
        const appId = app.id.toLowerCase();
        openApplication(appId) 
    });
});


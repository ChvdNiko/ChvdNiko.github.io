function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

const gridSize = 110;
const padding = 10;
const gridWidth = 10;
const gridHeight = 10;

let songs = [{
        title: "My Burden Is Light",
        file: "./music/My Burden Is Light.mp3"
    },
    {
        title: "On Little Cat Feet",
        file: "./music/On Little Cat Feet.mp3"
    },
    {
        title: "Song Three",
        file: "./music/song_three.mp3"
    }
]

const grid = Array.from({
    length: gridHeight
}, () => Array(gridWidth).fill(null));

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
            const {
                x,
                y
            } = newPosition;
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
                return {
                    x,
                    y
                };
            }
        }
    }
    return null;
}

function findNextAvailableCell() {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === null) {
                return {
                    x,
                    y
                };
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

function createWindow(title, width, height, contentHtml, contentJS) {
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

let currentSongIndex = 0;
let audio = new Audio(songs[currentSongIndex].file);
let isPlaying = false;


const applications = {
    
music: {
    title: 'Music Box',
    width: 700,
    height: 500,

    content: `
    <style>
        #current-song {
            font-weight: bold;
            margin: 10px 0;
            text-align: center;
            border:2px solid purple;
        }

        #lightbulb-image {
            height: auto;
            width: 50px;
            margin:0px 20px;
        }

        #niko-image {
            height: 100px;
            width: 100px;
            object-fit: cover;
        }

        #player-image {
            height: 150px;
            width: 150px;
            object-fit: cover;
        }

        #speed-slider, #volume-slider {
            width: 200px;
            margin: 10px auto;
            display: block;
            background-color: purple;
        }

        #progress-bar {
            width: 100%;
            margin: 10px 0;
        }

        .image-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
        }

        .button-container {
            text-align: center;
            margin: 10px 0;
        }

        button {
            margin: 0 5px;
            background-color: black;
            color: white;
            border: 2px solid purple;
            cursor: pointer;
        }

        .song-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 10px 0;
        }

        .song-controls button {
            margin: 0 10px;
        }

        .slider-label {
            text-align: center;
            margin: 5px 0;
        }
    </style>
    <div class="image-container">
        <img src="./images/lightbulb.png" alt="Lightbulb" id="lightbulb-image"/>
        <img src="./images/stopped.gif" id="play-status" alt="Player" id="player-image" />
        <img src="./images/sleeping.gif" id="activity-status" alt="Niko" id="niko-image" />
    </div>
    <div class="song-controls">
        <button id="prev-song">&lt;</button>
        <p id="current-song">Currently Playing: <span></span></p>
        <button id="next-song">&gt;</button>
    </div>
    <div>
        <div class="slider-label">Playback speed</div>
        <input type="range" id="speed-slider" min="0.5" max="2" step="0.1" value="1" />
        <div class="slider-label">Volume</div>
        <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="1" />
    </div>
    <div class="button-container">
        <button id="stop-song">Stop</button>
        <button id="play-pause-song">Play</button>
    </div>
    <progress id="progress-bar" value="0" max="100"></progress>`
},
    notepad: {
        title: 'Notepad',
        width: 500,
        height: 200,
        content: `<p>Hi, this place will probably work out as a sandbox of some sort where I put cool things and shit.<br><br>This is influenced by OneShot: world machine edition if that matters.</p>`
    },

    shark: {
        title: 'Bombardiro crocodilo',
        width: 320,
        height: 240,
        content: `
    <div style="text-align: center;">
      <video autoplay loop style="max-width:300px;max-height:250px;">
        <source src="./videos/bombardiro.webm" type="video/webm">
        Your browser does not support the video tag.
      </video>
    </div>
`
    },
 calculator: {
        title: 'Calculator',
        width: 300,
        height: 405,
        content: `
        <style>
            #calculator-display {
                width: 100%;
                height: 50px;
                font-size: 24px;
                background-color:black;
                color:purple;
                text-align: right;
                padding: 10px;
                box-sizing: border-box;
                border: 2px solid purple;
            }
            .button {
                width: 25%;
                height: 60px;
                font-size: 20px;
                background-color:black;
                color:white;
                border:1px solid purple;
                cursor: pointer;
            }
            .button-container {
                display: flex;
                flex-wrap: wrap;
            }
        </style>
        <input type="text" id="calculator-display" disabled />
        <div class="button-container">
            <button class="button" onclick="appendToDisplay('7')">7</button>
            <button class="button" onclick="appendToDisplay('8')">8</button>
            <button class="button" onclick="appendToDisplay('9')">9</button>
            <button class="button" onclick="appendToDisplay('/')">/</button>
            <button class="button" onclick="appendToDisplay('4')">4</button>
            <button class="button" onclick="appendToDisplay('5')">5</button>
            <button class="button" onclick="appendToDisplay('6')">6</button>
            <button class="button" onclick="appendToDisplay('*')">*</button>
            <button class="button" onclick="appendToDisplay('1')">1</button>
            <button class="button" onclick="appendToDisplay('2')">2</button>
            <button class="button" onclick="appendToDisplay('3')">3</button>
            <button class="button" onclick="calculateResult()">=</button>
            <button class="button" onclick="appendToDisplay('.')">.</button>
            <button class="button" onclick="appendToDisplay('0')">0</button>
            <button class="button" onclick="appendToDisplay('+')">+</button>
            <button class="button" onclick="appendToDisplay('-')">-</button>
            <button class="button" onclick="clearDisplay()">C</button>
        </div>
        `,
    }
};

function appendToDisplay(value) {
    const display = document.getElementById('calculator-display');
    display.value += value;
}

function calculateResult() {
    const display = document.getElementById('calculator-display');
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = 'Error';
    }
}

function clearDisplay() {
    const display = document.getElementById('calculator-display');
    display.value = '';
}

function initializeMusicPlayer() {
    const musicContainer = document.createElement('div');
    musicContainer.innerHTML = applications.music.contentHtml;
    document.body.appendChild(musicContainer);

    setupEventListeners();
    updateSong();
}

function updateSong() {
    document.getElementById('current-song').innerText = songs[currentSongIndex].title;
    audio.src = songs[currentSongIndex].file;
}

function setupEventListeners() {
    document.getElementById('play-pause-song').addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            document.getElementById('play-status').src = './images/stopped.gif';
            document.getElementById('activity-status').src = './images/sleeping.gif';

        } else {
            audio.play();
            document.getElementById('play-status').src = './images/playing.gif';
            document.getElementById('activity-status').src = './images/dance.gif';
        }
        isPlaying = !isPlaying;
    });

    document.getElementById('stop-song').addEventListener('click', () => {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        document.getElementById('play-status').src = './images/stopped.gif';
        document.getElementById('activity-status').src = './images/sleeping.gif';
    });

    document.getElementById('prev-song').addEventListener('click', () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        updateSong();
        if (isPlaying) audio.play();
    });

    document.getElementById('next-song').addEventListener('click', () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        updateSong();
        if (isPlaying) audio.play();
    });

    document.getElementById('speed-slider').addEventListener('input', (event) => {
        audio.playbackRate = event.target.value;
    });

    document.getElementById('volume-slider').addEventListener('input', (event) => {
        audio.volume = event.target.value;
    });

    audio.addEventListener('timeupdate', () => {
        const progressBar = document.getElementById('progress-bar');
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    });
}

function openApplication(appKey) {
    const app = applications[appKey];
    if (app) {
        createWindow(app.title, app.width, app.height, app.content, app.contentJS);
    } else {
        console.error('Application not found:', appKey);
    }
}

document.querySelectorAll('.app').forEach(app => {
    app.addEventListener('dblclick', () => {
        const appId = app.id.toLowerCase();
        openApplication(appId)
        if (appId == "music") initializeMusicPlayer();
    });
});

function typeDialogue(dialogues) {
    const dialogueBox = document.createElement('div');
    const characterImage = document.createElement('img');

    dialogueBox.style.position = 'fixed';
    dialogueBox.style.bottom = '20px';
    dialogueBox.style.left = '50%';
    dialogueBox.style.transform = 'translateX(-50%)';
    dialogueBox.style.border = '3px solid purple';
    dialogueBox.style.padding = '20px';
    dialogueBox.style.width = '80%';
    dialogueBox.style.fontSize= "16px";
    dialogueBox.style.height = '150px';
    dialogueBox.style.backgroundColor = 'black';
    dialogueBox.style.color = 'transparent';
    dialogueBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    dialogueBox.style.zIndex = '1000';
    dialogueBox.style.display = 'flex';
    
    dialogueBox.style.alignItems = 'flex-start';
    dialogueBox.style.justifyContent = 'space-between';
    document.body.appendChild(dialogueBox);

    const textSpan = document.createElement('span');
    textSpan.style.color = 'white';
    dialogueBox.appendChild(textSpan);

    characterImage.style.width = '120px';
    characterImage.style.marginLeft = '10px';
    characterImage.style.marginRight = '10px';
    characterImage.style.zIndex = '1000';
    dialogueBox.appendChild(characterImage);

    let currentDialogueIndex = 0;
    let typingInterval;

    function displayNextSentence() {
        if (currentDialogueIndex < dialogues.length) {
            const { image, speed, content } = dialogues[currentDialogueIndex];

            characterImage.src = image;
            typeOutText(content, speed);
        } else {
            cleanup();
        }
    }

    function typeOutText(text, speed) {
        textSpan.innerHTML = '';
        let index = 0;

        typingInterval = setInterval(() => {
            if (index < text.length) {
                textSpan.innerHTML += text.charAt(index);
                index++;
            } else {
                clearInterval(typingInterval);
                currentDialogueIndex++;
                setTimeout(displayNextSentence, 1000);
            }
        }, 1000 / speed);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'z' || event.key === 'Z') {
            if (textSpan.innerHTML.length > 0) {
                clearInterval(typingInterval);
                currentDialogueIndex++;
                textSpan.innerHTML = '';
                setTimeout(displayNextSentence, 200);
            } else {
                displayNextSentence();
            }
        }
    });

    function cleanup() {
        document.body.removeChild(dialogueBox);
    }

    displayNextSentence();
}

const dialogues = [
    {
        image: "./sprites/happy.webp",
        speed: 25,
        content: "Hello there! Welcome to my sandbox."
    },
    {
        image: "./sprites/neutral.webp",
        speed: 25,
        content: "You may explore it for now"
    }
];

typeDialogue(dialogues);

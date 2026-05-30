let player;
let queue = [];
let isAutoMode = true;
let currentVideoIndex = -1;

// YouTube API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED && isAutoMode) {
        playNext();
    }
}

// Twitch 監聽
ComfyJS.onChat = (user, message, flags, self, extra) => {
    const ytRegex = /(?:v=|be\/|embed\/|v%3D)([a-zA-Z0-9_-]{11})/;
    const match = message.match(ytRegex);

    if (match) {
        const videoId = match[1];
        addToQueue(videoId, user);
    }
};

function addToQueue(videoId, sender) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    queue.push({ id: videoId, sender, time });
    updateUI();

    if (isAutoMode && player && player.getPlayerState) {
        if (player.getPlayerState() !== 1 && currentVideoIndex === -1) {
            playNext();
        }
    }
}

function updateUI() {
    const tbody = document.getElementById("queueBody");
    const emptyState = document.getElementById("emptyState");
    document.getElementById("queueCount").innerText = queue.length;
    
    tbody.innerHTML = "";
    if (queue.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
        queue.forEach((item, index) => {
            const tr = document.createElement("tr");
            if (index === currentVideoIndex) tr.className = "playing";
            tr.innerHTML = `<td>${item.time}</td><td>${item.sender}</td><td>${item.id}</td>`;
            tr.onclick = () => playVideo(index);
            tbody.appendChild(tr);
        });
    }
}

function playVideo(index) {
    if (!player || typeof player.loadVideoById !== "function") return;
    currentVideoIndex = index;
    const video = queue[index];
    player.loadVideoById(video.id);

    document.getElementById("nowPlayingTitle").innerHTML = `
        <div style="font-size: 14px; width: 100%; text-align: center; line-height: 1.5;">
            <span style="color: #888;">來自:</span> 
            <strong style="color: #fff; margin-right: 15px;">${video.sender}</strong>
            <span style="color: #888;">ID:</span> 
            <strong style="color: #9146ff; font-family: monospace;">${video.id}</strong>
        </div>
    `;
    updateUI();
}

function playNext() {
    if (currentVideoIndex + 1 < queue.length) {
        playVideo(currentVideoIndex + 1);
    }
}

// 事件綁定
document.getElementById("toggleAuto").onclick = function() {
    isAutoMode = !isAutoMode;
    this.innerText = isAutoMode ? "ON" : "OFF";
    this.className = isAutoMode ? "on" : "";
};

document.getElementById("clearList").onclick = () => {
    queue = [];
    currentVideoIndex = -1;
    player.stopVideo();
    document.getElementById("nowPlayingTitle").innerText = "目前沒有播放中的影片";
    updateUI();
};

document.getElementById("fixPlayer").onclick = () => {
    player.cueVideoById('tgbNymZ7vqY');
    ComfyJS.Disconnect();
    ComfyJS.Init(document.getElementById("channelName").value);
    alert("已重新連線並解鎖播放權限！");
};

// 網頁載入時，初始化自動播放按鈕的視覺狀態
const toggleBtn = document.getElementById("toggleAuto");
if (toggleBtn) {
    toggleBtn.innerText = "ON";
    toggleBtn.className = "on";
}

ComfyJS.Init("winsyi");

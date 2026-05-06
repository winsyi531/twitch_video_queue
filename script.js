let player;
let queue = [];
let isAutoMode = false;
let currentVideoIndex = -1;

// 初始化 YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED && isAutoMode) {
        playNext();
    }
}

// 監聽聊天室
ComfyJS.onChat = (user, message, flags, self, extra) => {
    // 改進後的 Regex，支援多種 YT 網址格式
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
    const count = document.getElementById("queueCount");

    count.innerText = queue.length;
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
    document.getElementById("nowPlayingTitle").innerText = `正在播放：${video.id} (提供者: ${video.sender})`;
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
    // 透過點擊按鈕來解鎖瀏覽器的 Autoplay 限制
    player.cueVideoById('tgbNymZ7vqY');
    ComfyJS.Disconnect();
    ComfyJS.Init(document.getElementById("channelName").value);
    alert("已重新初始化並解鎖播放權限！");
};

// 初始啟動
ComfyJS.Init("winsyi");
let player;
let queue = [];
let isAutoMode = false;
let currentVideoIndex = -1;

// 初始化 YouTube 播放器
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

// 監聽播放狀態
function onPlayerStateChange(event) {
    // 當影片結束 (YT.PlayerState.ENDED = 0)
    if (event.data === 0 && isAutoMode) {
        playNext();
    }
}

// 監聽 Twitch 聊天室
ComfyJS.onChat = (user, message, flags, self, extra) => {
    const match = message.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
        const videoId = match[1];
        addToQueue(videoId, user);
    }
};

// 加入清單
function addToQueue(videoId, sender) {
    const videoData = {
        id: videoId,
        title: `${sender}`,
        url: `https://youtu.be/${videoId}`
    };
    queue.push(videoData);
    renderQueue();

    // 修正：增加 player 是否存在的檢查
    if (isAutoMode && player && typeof player.getPlayerState === "function") {
        const state = player.getPlayerState();
        // 如果目前不在播放中 (不在 PLAYING=1 或 BUFFERING=3 狀態)，且是第一首歌
        if (state !== 1 && state !== 3 && currentVideoIndex === -1) {
            playNext();
        }
    }
}

// 渲染畫面上的清單
function renderQueue() {
    const tbody = document.getElementById("queueBody");
    tbody.innerHTML = "";
    queue.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${item.title}</td><td>${item.id}</td>`;
        tr.onclick = () => playVideo(index);
        if (index === currentVideoIndex) tr.style.backgroundColor = "#444";
        tbody.appendChild(tr);
    });
}

// 播放指定索引的影片
function playVideo(index) {
    // 這邊你已經加了檢查，非常好！
    if (!player || typeof player.loadVideoById !== "function") {
        console.warn("播放器準備中...");
        return;
    }
    currentVideoIndex = index;
    player.loadVideoById(queue[index].id);
    renderQueue();
}

// 播放下一首
function playNext() {
    if (currentVideoIndex + 1 < queue.length) {
        playVideo(currentVideoIndex + 1);
    }
}

// 控制按鈕
document.getElementById("toggleAuto").onclick = () => {
    isAutoMode = !isAutoMode;
    document.getElementById("autoStatus").innerText = isAutoMode ? "ON" : "OFF";
};

document.getElementById("clearList").onclick = () => {
    queue = [];
    currentVideoIndex = -1;
    player.stopVideo();
    renderQueue();
};

ComfyJS.Init("winsyi");

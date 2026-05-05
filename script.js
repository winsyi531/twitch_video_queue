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
        title: `影片由 ${sender} 提供`, // 註：前端抓不到真實標題需後端，這裡先顯示來源
        url: `https://youtu.be/${videoId}`
    };
    queue.push(videoData);
    renderQueue();

    // 如果是 Auto 模式且目前沒在播，就直接播
    if (isAutoMode && player && player.getPlayerState() !== 1) {
        if (currentVideoIndex === -1) playNext();
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

ComfyJS.Init("你的帳號名稱");

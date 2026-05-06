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
    // 強效版 Regex：專門對付帶參數的 YouTube 網址
    const ytRegex = /(?:v=|be\/|embed\/)([a-zA-Z0-9_-]{11})/;
    const match = message.match(ytRegex);

    if (match) {
        const videoId = match[1];
        addToQueue(videoId, user);
    }
};

// 加入清單
function addToQueue(videoId, sender) {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ":" + 
                       now.getMinutes().toString().padStart(2, '0');

    const videoData = {
        id: videoId,
        time: timeString, // 新增時間欄位
        title: `${sender}`,
        url: `https://youtu.be/${videoId}`
    };
    
    queue.push(videoData);
    renderQueue();

    if (isAutoMode && player && typeof player.getPlayerState === "function") {
        const state = player.getPlayerState();
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
        // 增加時間欄位顯示
        tr.innerHTML = `
            <td style="color: #888;">${item.time}</td>
            <td>${item.title}</td>
            <td style="font-family: monospace; font-size: 12px;">${item.id}</td>
        `;
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

document.getElementById("fixPlayer").onclick = () => {
    // 1. 隨便播放一個短片再停掉，騙過瀏覽器權限
    player.cueVideoById('tgbNymZ7vqY'); // 隨便一個 ID
    
    // 2. 重新連線 Twitch
    ComfyJS.Disconnect();
    ComfyJS.Init("winsyi");
    
    alert("播放器已解鎖並重新連接聊天室！");
};

window.onload = () => {
    try {
        ComfyJS.Init("winsyi");
        console.log("Twitch Chat 連線成功！");
    } catch (e) {
        console.error("連線失敗:", e);
    }
};

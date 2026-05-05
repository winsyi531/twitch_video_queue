// 初始化 YouTube 播放器
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

// 當影片播放完畢，可以自動清空畫面（選配）
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // 影片結束後的操作，例如隱藏播放器
    }
}

// 監聽 Twitch 聊天室
ComfyJS.onChat = (user, message, flags, self, extra) => {
    // 簡單的 Regex 抓取 YouTube ID
    const match = message.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    
    if (match) {
        const videoId = match[1];
        // 載入並自動播放影片
        player.loadVideoById(videoId);
    }
};

// 填入你的 Twitch 頻道名稱
ComfyJS.Init("winsyi");

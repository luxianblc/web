// 播放器状态
let player = {
    isPlaying: false,
    isMuted: false,
    volume: 80,
    currentSongIndex: -1,
    playlist: []
};

// 初始化播放器
function initPlayer() {
    const audio = document.getElementById('audioElement');
    if (!audio) return;
    
    // 加载保存的音量
    const savedVolume = localStorage.getItem('netease_volume');
    if (savedVolume) {
        player.volume = parseInt(savedVolume);
        audio.volume = player.volume / 100;
        document.getElementById('volumeSlider').value = player.volume;
    }
    
    // 监听音频事件
    audio.addEventListener('play', () => {
        player.isPlaying = true;
        updatePlayButton();
    });
    
    audio.addEventListener('pause', () => {
        player.isPlaying = false;
        updatePlayButton();
    });
    
    audio.addEventListener('volumechange', () => {
        player.volume = audio.volume * 100;
        updateVolumeButton();
    });
}

// 播放音频
function playAudio(url, name = '未知歌曲', songId = null) {
    const audio = document.getElementById('audioElement');
    const coverImg = document.getElementById('currentSongCover');
    const songName = document.getElementById('currentSongName');
    const artistName = document.getElementById('currentArtist');
    
    if (songId) {
        // 获取歌曲详情
        fetchSongDetails(songId);
    }
    
    audio.src = url;
    audio.play().catch(error => {
        console.error('播放失败:', error);
        alert('播放失败，可能需要VIP权限');
    });
    
    songName.textContent = name;
    artistName.textContent = '加载中...';
}

// 获取歌曲详情
async function fetchSongDetails(songId) {
    try {
        const url = buildApiUrl('/song/detail', { ids: songId });
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200 && data.songs && data.songs[0]) {
            const song = data.songs[0];
            const artists = song.ar ? song.ar.map(artist => artist.name).join(', ') : '未知';
            const album = song.al ? song.al.name : '未知';
            
            document.getElementById('currentArtist').textContent = `${artists} - ${album}`;
            
            // 更新封面
            const coverUrl = song.al?.picUrl;
            if (coverUrl) {
                document.getElementById('currentSongCover').src = `${coverUrl}?param=100y100`;
            }
        }
    } catch (error) {
        console.error('获取歌曲详情失败:', error);
    }
}

// 切换播放状态
function togglePlay() {
    const audio = document.getElementById('audioElement');
    if (!audio.src) return;
    
    if (player.isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(error => {
            console.error('播放失败:', error);
        });
    }
}

// 更新播放按钮
function updatePlayButton() {
    const playBtn = document.getElementById('playBtn');
    if (!playBtn) return;
    
    const icon = playBtn.querySelector('i');
    icon.className = player.isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

// 更新进度条
function updateProgress() {
    const audio = document.getElementById('audioElement');
    const progressFill = document.getElementById('progressFill');
    const currentTime = document.getElementById('currentTime');
    const durationTime = document.getElementById('durationTime');
    
    if (!audio.duration) return;
    
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
    
    // 更新时间显示
    currentTime.textContent = formatTime(audio.currentTime);
    durationTime.textContent = formatTime(audio.duration);
}

// 跳转播放位置
function seekAudio(event) {
    const audio = document.getElementById('audioElement');
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    
    if (audio.duration) {
        audio.currentTime = audio.duration * percent;
    }
}

// 切换静音
function toggleMute() {
    const audio = document.getElementById('audioElement');
    player.isMuted = !player.isMuted;
    audio.muted = player.isMuted;
    updateVolumeButton();
}

// 改变音量
function changeVolume(value) {
    const audio = document.getElementById('audioElement');
    player.volume = parseInt(value);
    audio.volume = player.volume / 100;
    localStorage.setItem('netease_volume', player.volume);
    updateVolumeButton();
}

// 更新音量按钮
function updateVolumeButton() {
    const volumeBtn = document.getElementById('volumeBtn');
    if (!volumeBtn) return;
    
    const icon = volumeBtn.querySelector('i');
    
    if (player.isMuted || player.volume === 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (player.volume < 50) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}

// 上一首/下一首
function previousSong() {
    if (player.playlist.length > 0) {
        player.currentSongIndex = Math.max(0, player.currentSongIndex - 1);
        playSongFromPlaylist();
    }
}

function nextSong() {
    if (player.playlist.length > 0) {
        player.currentSongIndex = Math.min(player.playlist.length - 1, player.currentSongIndex + 1);
        playSongFromPlaylist();
    }
}

// 从播放列表播放
function playSongFromPlaylist() {
    if (player.currentSongIndex >= 0 && player.currentSongIndex < player.playlist.length) {
        const song = player.playlist[player.currentSongIndex];
        playAudio(song.url, song.name, song.id);
    }
}

// 格式化时间
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 暴露全局函数
window.playAudio = playAudio;

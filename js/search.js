let searchResults = [];

// 初始化搜索
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
}

// 处理搜索输入
function handleSearchInput(event) {
    const value = event.target.value;
    if (value.length > 2) {
        // 可以在这里实现实时搜索建议
    }
}

// 执行搜索
async function performSearch() {
    const keywords = document.getElementById('searchInput').value.trim();
    if (!keywords) {
        alert('请输入搜索关键词');
        return;
    }
    
    switchSection('search');
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const params = {
            keywords: encodeURIComponent(keywords),
            type: 1, // 单曲
            limit: 50,
            offset: 0
        };
        
        const url = buildApiUrl('/cloudsearch', params);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200 && data.result && data.result.songs) {
            searchResults = data.result.songs;
            displaySearchResults(searchResults);
        } else {
            resultsContainer.innerHTML = '<div class="error">搜索失败</div>';
        }
    } catch (error) {
        console.error('搜索失败:', error);
        resultsContainer.innerHTML = `<div class="error">搜索失败: ${error.message}</div>`;
    }
}

// 显示搜索结果
function displaySearchResults(songs) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!songs || songs.length === 0) {
        resultsContainer.innerHTML = '<div class="empty">未找到相关歌曲</div>';
        return;
    }
    
    let html = '';
    songs.forEach((song, index) => {
        const artists = song.ar ? song.ar.map(artist => artist.name).join(', ') : '未知';
        const album = song.al ? song.al.name : '未知';
        
        html += `
            <div class="song-item">
                <span class="song-index">${index + 1}</span>
                <img src="${song.al?.picUrl || 'https://via.placeholder.com/50'}?param=50y50" alt="${song.name}">
                <div class="song-details">
                    <div class="song-title">${song.name}</div>
                    <div class="song-artist">${artists} - ${album}</div>
                </div>
                <div class="song-actions">
                    <button onclick="playSong(${song.id}, '${song.name.replace(/'/g, "\\'")}')" class="song-action-btn">
                        <i class="fas fa-play"></i> 播放
                    </button>
                    <button onclick="addToPlaylist(${song.id})" class="song-action-btn">
                        <i class="fas fa-plus"></i> 收藏
                    </button>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}

// 播放歌曲
async function playSong(songId, songName) {
    try {
        const params = {
            id: songId,
            level: 'exhigh'
        };
        
        const url = buildApiUrl('/song/url/v1', params);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            const song = Array.isArray(data.data) ? data.data[0] : data.data;
            
            if (song.url && song.url.startsWith('http')) {
                // 调用播放器功能
                window.playAudio(song.url, songName, songId);
            } else {
                alert('无法播放此歌曲（可能需要VIP或登录）');
            }
        }
    } catch (error) {
        console.error('播放失败:', error);
        alert('播放失败');
    }
}

// 添加到播放列表
function addToPlaylist(songId) {
    alert(`歌曲 ${songId} 已添加到播放列表`);
    // 这里可以添加具体的播放列表逻辑
}

// 清空搜索
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

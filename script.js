// 全局变量
let API_BASE = 'https://neteaseapi-enhanced.vercel.app';
let currentAudio = null;
let currentTrackIndex = 0;
let isPlaying = false;
let currentPlaylist = [];
let userCookie = null;
let currentSongData = null;
let repeatMode = 0; // 0: 不循环, 1: 单曲

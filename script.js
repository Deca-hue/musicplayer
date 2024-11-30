// script.js

// Select Elements
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const fileUpload = document.getElementById('file-upload');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');

// Variables
let playlist = [];
let currentTrackIndex = 0;

// Update Song Details
function updateSongDetails(track) {
  songTitle.textContent = track.name || 'Unknown Title';
  songArtist.textContent = track.artist || 'Artist: Unknown';
}

// Load Track
function loadTrack(index) {
  const track = playlist[index];
  if (track) {
    audioPlayer.src = URL.createObjectURL(track.file);
    updateSongDetails(track);
    playTrack();
  }
}

// Play Track
function playTrack() {
  audioPlayer.play();
  playBtn.style.display = 'none';
  pauseBtn.style.display = 'inline-block';
}

// Pause Track
function pauseTrack() {
  audioPlayer.pause();
  playBtn.style.display = 'inline-block';
  pauseBtn.style.display = 'none';
}

// Play Next Track
function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex);
}

// Play Previous Track
function playPrevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
}

// Update Progress Bar
function updateProgressBar() {
  const { currentTime, duration } = audioPlayer;
  progressBar.value = (currentTime / duration) * 100 || 0;
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
}

// Format Time (mm:ss)
function formatTime(time) {
  const minutes = Math.floor(time / 60) || 0;
  const seconds = Math.floor(time % 60) || 0;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Set Progress
function setProgress() {
  const newTime = (progressBar.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = newTime;
}

// Adjust Volume
function adjustVolume() {
  audioPlayer.volume = volumeSlider.value;
}

// Handle File Upload
fileUpload.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  playlist = files.map((file) => ({
    file,
    name: file.name.split('.')[0],
    artist: 'Unknown',
  }));
  currentTrackIndex = 0;
  loadTrack(currentTrackIndex);
});

// Event Listeners
playBtn.addEventListener('click', playTrack);
pauseBtn.addEventListener('click', pauseTrack);
nextBtn.addEventListener('click', playNextTrack);
prevBtn.addEventListener('click', playPrevTrack);
progressBar.addEventListener('input', setProgress);
audioPlayer.addEventListener('timeupdate', updateProgressBar);
volumeSlider.addEventListener('input', adjustVolume);

// Initialize Player
updateSongDetails({ name: 'No Song Selected', artist: 'Artist: Unknown' });

function updateSongDetails(track) {
    songTitle.textContent = track.name || 'Unknown Title';
    songArtist.textContent = track.artist || 'Artist: Unknown';
    document.getElementById('album-art').src = track.albumArt || 'placeholder.png';
  }

  function savePlaylist() {
    const playlistData = playlist.map((track) => ({
      name: track.name,
      artist: track.artist,
      albumArt: track.albumArt,
    }));
    localStorage.setItem('playlist', JSON.stringify(playlistData));
  }
  
  function loadPlaylist() {
    const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
    playlist = savedPlaylist.map((data) => ({
      ...data,
      file: null, // Files can't be saved in localStorage; user will need to re-upload.
    }));
    if (playlist.length > 0) loadTrack(0);
  }
  
  // Save playlist after upload
  fileUpload.addEventListener('change', () => {
    savePlaylist();
  });
  
  // Load playlist on page load
  window.addEventListener('load', loadPlaylist);

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case ' ': // Spacebar for play/pause
        event.preventDefault(); // Prevent scrolling
        audioPlayer.paused ? playTrack() : pauseTrack();
        break;
      case 'ArrowRight': // Next track
        playNextTrack();
        break;
      case 'ArrowLeft': // Previous track
        playPrevTrack();
        break;
      case 'ArrowUp': // Increase volume
        volumeSlider.value = Math.min(1, parseFloat(volumeSlider.value) + 0.1);
        adjustVolume();
        break;
      case 'ArrowDown': // Decrease volume
        volumeSlider.value = Math.max(0, parseFloat(volumeSlider.value) - 0.1);
        adjustVolume();
        break;
    }
  });

  const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  themeToggle.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audioPlayer);
source.connect(analyser);
analyser.connect(audioContext.destination);

const canvas = document.createElement('canvas');
document.querySelector('.music-player').appendChild(canvas);
canvas.width = 400;
canvas.height = 100;
const ctx = canvas.getContext('2d');

function drawEqualizer() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 2;
    ctx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }

  requestAnimationFrame(drawEqualizer);
}

audioPlayer.addEventListener('play', () => {
  audioContext.resume();
  drawEqualizer();
});


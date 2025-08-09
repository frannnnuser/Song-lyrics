class MusicPlayer {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.audioPlayerContainer = document.getElementById('audioPlayerContainer');
        this.prevButton = document.getElementById('prevButton');
        this.lyricsDisplay = document.getElementById('lyricsDisplay');
        this.songList = document.getElementById('songList');
        this.songTitle = document.getElementById('songTitle');
        this.albumCover = document.getElementById('albumCover');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        
        this.currentSong = null;
        this.currentSongIndex = -1;
        this.songHistory = []; // Historial de canciones reproducidas
        this.lyrics = [];
        this.currentLyricIndex = -1;
        this.isInitialState = true;
        this.filteredSongs = []; // Para el buscador
        
        // Lista de canciones (aquí puedes agregar más)
        this.songs = [
            {
                id: 1,
                title: "Cumpleaños",
                artist: "Los Mesoneros",
                audioFile: "songs/CumpleañosLosMesoneros.mp3",
                lyricsFile: "songs/lrcs/CumpleañosLosMesoneros.lrc",
                cover: "songs/image/Cumpleaños-cover.jpg",            
            },
            {
                id: 2,
                title: "Cuéntame",
                artist: "Pedro Suárez Vértiz",
                audioFile: "songs/CuentamePedroSuarezVertiz.mp3",
                lyricsFile: "songs/lrcs/CuentamePedroSuarezVertiz.lrc",
                cover: "songs/image/CuentamePedroSuarezVertiz-cover.jpg",
            }
            // Puedes agregar más canciones aquí
        ];
        
        this.init();
    }
    
    init() {
        this.filteredSongs = [...this.songs]; // Inicializar con todas las canciones
        this.loadPlaylist();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Sincronización de letras mientras se reproduce
        this.audioPlayer.addEventListener('timeupdate', () => {
            this.updateLyrics();
        });
        
        // Cuando cambia la canción
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            console.log('Canción cargada');
        });
        
        // Click en línea de letra para saltar a ese momento
        this.lyricsDisplay.addEventListener('click', (e) => {
            if (e.target.classList.contains('lyric-line')) {
                const time = parseFloat(e.target.dataset.time);
                this.audioPlayer.currentTime = time;
            }
        });
        
        // Buscador
        this.searchInput.addEventListener('input', (e) => {
            this.searchSongs(e.target.value);
        });
        
        this.searchButton.addEventListener('click', () => {
            this.searchSongs(this.searchInput.value);
        });
        
        // Enter en el buscador
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchSongs(this.searchInput.value);
            }
        });
    }
    
    loadPlaylist(songsToShow = null) {
        const songs = songsToShow || this.filteredSongs;
        this.songList.innerHTML = '';
        
        if (songs.length === 0) {
            this.songList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No se encontraron canciones</div>';
            return;
        }
        
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            songItem.innerHTML = `
                <div><strong>${song.title}</strong></div>
                <div style="color: #666; font-size: 0.9rem;">${song.artist}</div>
            `;
            songItem.addEventListener('click', () => this.loadSong(song));
            this.songList.appendChild(songItem);
        });
    }
    
    searchSongs(query) {
        if (!query.trim()) {
            this.filteredSongs = [...this.songs];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredSongs = this.songs.filter(song => 
                song.title.toLowerCase().includes(searchTerm) || 
                song.artist.toLowerCase().includes(searchTerm)
            );
        }
        this.loadPlaylist();
    }
    
    async loadSong(song) {
        // Agregar canción actual al historial antes de cambiar
        if (this.currentSong && this.currentSongIndex !== -1) {
            this.songHistory.push({
                song: this.currentSong,
                index: this.currentSongIndex
            });
        }
        
        this.currentSong = song;
        this.currentSongIndex = this.songs.findIndex(s => s.id === song.id);
        this.isInitialState = false;
        
        // Mostrar reproductor de audio con animación
        this.audioPlayerContainer.style.display = 'block';
        setTimeout(() => {
            this.audioPlayerContainer.style.opacity = '1';
            this.audioPlayerContainer.style.transform = 'translateY(0)';
        }, 100);
        
        // Mostrar/ocultar botón anterior según historial
        this.updatePrevButton();
        
        // Actualizar interfaz
        this.songTitle.textContent = song.title;
        this.albumCover.src = song.cover;
        this.audioPlayer.src = song.audioFile;
        
        // Marcar canción activa en playlist
        this.updateActiveStates();
        
        // Cargar letras
        await this.loadLyrics(song.lyricsFile);
    }
    
    updatePrevButton() {
        const prevButton = this.prevButton;
        
        if (this.songHistory.length > 0) {
            // Mostrar botón si hay historial
            prevButton.style.display = 'flex';
            setTimeout(() => {
                prevButton.style.opacity = '1';
                prevButton.style.transform = 'translateX(0)';
            }, 200);
        } else {
            // Ocultar botón si no hay historial
            prevButton.style.opacity = '0';
            prevButton.style.transform = 'translateX(-30px)';
            setTimeout(() => {
                prevButton.style.display = 'none';
            }, 300);
        }
    }
    
    updateActiveStates() {
        // Actualizar estados activos en todas las listas (filtrada y completa)
        document.querySelectorAll('.song-item').forEach((item, index) => {
            const songs = this.filteredSongs.length > 0 ? this.filteredSongs : this.songs;
            const song = songs[index];
            
            if (song && this.currentSong && song.id === this.currentSong.id) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    playPreviousSong() {
        if (this.songHistory.length === 0) return;
        
        // Obtener la última canción del historial
        const previousSong = this.songHistory.pop();
        
        // Cargar la canción anterior sin agregar al historial
        this.currentSong = previousSong.song;
        this.currentSongIndex = previousSong.index;
        
        // Actualizar interfaz
        this.songTitle.textContent = this.currentSong.title;
        this.albumCover.src = this.currentSong.cover;
        this.audioPlayer.src = this.currentSong.audioFile;
        
        // Actualizar estados
        this.updateActiveStates();
        this.updatePrevButton();
        
        // Cargar letras
        this.loadLyrics(this.currentSong.lyricsFile);
    }
    
    goToHome() {
        this.isInitialState = true;
        
        // Ocultar reproductor de audio con animación
        this.audioPlayerContainer.style.opacity = '0';
        this.audioPlayerContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            this.audioPlayerContainer.style.display = 'none';
        }, 300);
        
        // Ocultar botón anterior
        this.prevButton.style.opacity = '0';
        this.prevButton.style.transform = 'translateX(-30px)';
        setTimeout(() => {
            this.prevButton.style.display = 'none';
        }, 300);
        
        // Pausar y resetear audio
        this.audioPlayer.pause();
        this.audioPlayer.src = '';
        this.audioPlayer.currentTime = 0;
        
        // Restaurar estado inicial
        this.songTitle.textContent = 'Seleccionar una canción';
        this.albumCover.src = 'image/menu.jpg';
        
        // Limpiar buscador
        this.searchInput.value = '';
        this.filteredSongs = [...this.songs];
        this.loadPlaylist();
        
        // Remover clase active de todas las canciones
        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Restaurar placeholder de letras
        this.lyricsDisplay.innerHTML = `
            <div class="lyrics-placeholder">
                <p>🎵 Selecciona una canción para ver las letras</p>
            </div>
        `;
        
        // Limpiar datos actuales
        this.currentSong = null;
        this.currentSongIndex = -1;
        this.songHistory = [];
        this.lyrics = [];
        this.currentLyricIndex = -1;
    }
    
    async loadLyrics(lyricsFile) {
        try {
            // En desarrollo, podrías usar letras hardcodeadas
            // En producción, cargarías desde el archivo LRC
            const response = await fetch(lyricsFile);
            const lrcContent = await response.text();
            this.lyrics = this.parseLRC(lrcContent);
            this.displayLyrics();
        } catch (error) {
            console.log('No se pudieron cargar las letras, usando demo');
            // Letras de demostración
            this.lyrics = [
                { time: 0, text: "🎵 Ejemplo de letra sincronizada" },
                { time: 3, text: "Esta es la primera línea" },
                { time: 6, text: "Aquí va la segunda línea" },
                { time: 9, text: "Y continúa la tercera" },
                { time: 12, text: "El ritmo sigue y sigue" },
                { time: 15, text: "Con más letras por venir" },
                { time: 18, text: "La música nunca para" },
                { time: 21, text: "Hasta el final de la canción" }
            ];
            this.displayLyrics();
        }
    }
    
    parseLRC(lrcContent) {
        const lines = lrcContent.split('\n');
        const lyrics = [];
        
        lines.forEach(line => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const centiseconds = parseInt(match[3]);
                const time = minutes * 60 + seconds + centiseconds / 100;
                const text = match[4].trim();
                
                if (text) {
                    lyrics.push({ time, text });
                }
            }
        });
        
        return lyrics.sort((a, b) => a.time - b.time);
    }
    
    displayLyrics() {
        this.lyricsDisplay.innerHTML = '';
        
        if (this.lyrics.length === 0) {
            this.lyricsDisplay.innerHTML = '<div class="lyrics-placeholder"><p>🎵 No hay letras disponibles</p></div>';
            return;
        }
        
        this.lyrics.forEach((lyric, index) => {
            const lyricElement = document.createElement('div');
            lyricElement.className = 'lyric-line';
            lyricElement.textContent = lyric.text;
            lyricElement.dataset.time = lyric.time;
            lyricElement.dataset.index = index;
            this.lyricsDisplay.appendChild(lyricElement);
        });
    }
    
    updateLyrics() {
        if (this.lyrics.length === 0) return;
        
        const currentTime = this.audioPlayer.currentTime;
        let activeIndex = -1;
        
        // Encontrar la línea activa
        for (let i = 0; i < this.lyrics.length; i++) {
            if (currentTime >= this.lyrics[i].time) {
                activeIndex = i;
            } else {
                break;
            }
        }
        
        // Actualizar solo si cambió la línea activa
        if (activeIndex !== this.currentLyricIndex) {
            this.currentLyricIndex = activeIndex;
            
            const lyricLines = document.querySelectorAll('.lyric-line');
            
            lyricLines.forEach((line, index) => {
                line.classList.remove('active', 'passed');
                
                if (index === activeIndex) {
                    line.classList.add('active');
                    // Hacer scroll suave a la línea activa
                    line.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (index < activeIndex) {
                    line.classList.add('passed');
                }
            });
        }
    }
}

// Funciones globales para los botones del HTML
function goToHome() {
    if (window.musicPlayer) {
        window.musicPlayer.goToHome();
    }
}

function playPreviousSong() {
    if (window.musicPlayer) {
        window.musicPlayer.playPreviousSong();
    }
}

// Inicializar el reproductor cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});
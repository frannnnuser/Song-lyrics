class MusicPlayer {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.lyricsDisplay = document.getElementById('lyricsDisplay');
        this.songList = document.getElementById('songList');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.albumCover = document.getElementById('albumCover');
        
        this.currentSong = null;
        this.lyrics = [];
        this.currentLyricIndex = -1;
        
        // Lista de canciones (aquí puedes agregar más)
        this.songs = [
            {
                id: 1,
                title: "Cumpleaños",
                artist: "Los Mesoneros",
                audioFile: "songs/CumpleañosLosMesoneros.mp3",
                lyricsFile: "songs/CumpleañosLosMesoneros.lrc",
                cover: "songs/Cumpleaños-cover.jpg",
            }
            // Puedes agregar más canciones aquí
        ];
        
        this.init();
    }
    
    init() {
        this.loadPlaylist();
        this.setupEventListeners();
    }
    
    loadPlaylist() {
        this.songList.innerHTML = '';
        this.songs.forEach(song => {
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
    }
    
    async loadSong(song) {
        this.currentSong = song;
        
        // Actualizar interfaz
        this.songTitle.textContent = song.title;
        this.artistName.textContent = song.artist;
        this.albumCover.src = song.cover;
        this.audioPlayer.src = song.audioFile;
        
        // Marcar canción activa en playlist
        document.querySelectorAll('.song-item').forEach((item, index) => {
            item.classList.toggle('active', index === this.songs.indexOf(song));
        });
        
        // Cargar letras
        await this.loadLyrics(song.lyricsFile);
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

// Inicializar el reproductor cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});
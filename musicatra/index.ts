// Definición de tipos
interface Song {
    titulo: string;
    nombre: string;
    fuente: string;
    file?: File;
}

interface SongNode {
    song: Song;
    prev: SongNode;
    next: SongNode;
}

// Obtener elementos del DOM
const tituloCancion = document.getElementById('tituloCancion') as HTMLElement;
const nombreArtista = document.getElementById('nombreArtista') as HTMLElement;
const progreso = document.getElementById('progreso') as HTMLInputElement;
const cancion = document.getElementById('cancion') as HTMLAudioElement;
const iconoControl = document.getElementById('iconoControl') as HTMLElement;
const botonReproducirPausar = document.querySelector('.boton-reproducir-pausar') as HTMLElement;
const botonAtras = document.querySelector('.atras') as HTMLElement;
const botonAdelante = document.querySelector('.adelante') as HTMLElement;
const nuevoTitulo = document.getElementById('nuevoTitulo') as HTMLInputElement;
const nuevoArtista = document.getElementById('nuevoArtista') as HTMLInputElement;
const archivoCancion = document.getElementById('archivoCancion') as HTMLInputElement;
const nombreArchivo = document.getElementById('nombreArchivo') as HTMLElement;
const agregarInicio = document.getElementById('agregarInicio') as HTMLButtonElement;
const agregarFinal = document.getElementById('agregarFinal') as HTMLButtonElement;
const eliminarActual = document.getElementById('eliminarActual') as HTMLButtonElement;

// Lista de canciones inicial
let canciones: Song[] = [
    {
        titulo: "CHIHIRO",
        nombre: "Billie Eilish",
        fuente: "music/BillieEilish_CHIHIRO.mp3"
    },
    {
        titulo: "Cheap Thrills",
        nombre: "Sia ft. Sean Paul",
        fuente: "music/Sia_CheapThrills.mp3"
    }
];

let currentSongNode: SongNode | null = null;

// Configurar el input de archivo
archivoCancion.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
        nombreArchivo.textContent = files[0].name;
        
        if (!nuevoTitulo.value) {
            nuevoTitulo.value = files[0].name.replace('.mp3', '');
        }
    } else {
        nombreArchivo.textContent = "No se ha seleccionado archivo";
    }
});

// Crear lista doblemente enlazada circular
function createPlaylist(songs: Song[]): SongNode | null {
    if (songs.length === 0) return null;
    
    let head: SongNode = {} as SongNode;
    let current: SongNode = {} as SongNode;
    
    // Primer nodo
    head = {
        song: songs[0],
        prev: {} as SongNode,
        next: {} as SongNode
    };
    current = head;
    
    // Nodos restantes
    for (let i = 1; i < songs.length; i++) {
        const newNode: SongNode = {
            song: songs[i],
            prev: current,
            next: {} as SongNode
        };
        
        current.next = newNode;
        current = newNode;
    }
    
    // Hacer circular
    current.next = head;
    head.prev = current;
    
    return head;
}

// Actualizar información de la canción
function actualizarInfoCancion(): void {
    if (!currentSongNode) {
        tituloCancion.textContent = "No hay canciones";
        nombreArtista.textContent = "";
        cancion.src = "";
        return;
    }
    
    tituloCancion.textContent = currentSongNode.song.titulo;
    nombreArtista.textContent = currentSongNode.song.nombre;
    
    if (currentSongNode.song.file) {
        const objectUrl = URL.createObjectURL(currentSongNode.song.file);
        cancion.src = objectUrl;
        
        // Liberar URL cuando termine
        cancion.addEventListener('ended', () => {
            URL.revokeObjectURL(objectUrl);
        }, { once: true });
    } else {
        cancion.src = currentSongNode.song.fuente;
    }
    
    // Cargar la fuente
    cancion.load();
}

// Funciones para gestionar canciones
function agregarCancion(posicion: 'inicio' | 'final'): void {
    const file = archivoCancion.files?.[0] || null;
    const titulo = nuevoTitulo.value.trim() || file?.name.replace('.mp3', '') || "Sin título";
    
    if (!file && !titulo) {
        alert("Debes ingresar al menos un título o seleccionar un archivo");
        return;
    }
    
    const nuevaCancion: Song = {
        titulo,
        nombre: nuevoArtista.value.trim() || "Artista desconocido",
        fuente: file ? file.name : "local-file.mp3",
        file
    };
    
    if (posicion === 'inicio') {
        canciones.unshift(nuevaCancion);
    } else {
        canciones.push(nuevaCancion);
    }
    
    currentSongNode = createPlaylist(canciones);
    actualizarInfoCancion();
    limpiarFormulario();
}

function eliminarCancionActual(): void {
    if (!currentSongNode || canciones.length <= 1) {
        alert("No puedes eliminar la última canción");
        return;
    }
    
    const tituloActual = currentSongNode.song.titulo;
    canciones = canciones.filter(c => c.titulo !== tituloActual);
    
    currentSongNode = createPlaylist(canciones);
    actualizarInfoCancion();
}

function limpiarFormulario(): void {
    nuevoTitulo.value = "";
    nuevoArtista.value = "";
    archivoCancion.value = "";
    nombreArchivo.textContent = "No se ha seleccionado archivo";
}

// Control de reproducción
function reproducirPausar(): void {
    if (!currentSongNode) return;
    
    if (cancion.paused) {
        cancion.play()
            .then(() => {
                iconoControl.classList.replace('bi-play-fill', 'bi-pause-fill');
            })
            .catch(error => {
                console.error("Error al reproducir:", error);
                alert(`Error al reproducir: ${currentSongNode?.song.titulo}`);
            });
    } else {
        cancion.pause();
        iconoControl.classList.replace('bi-pause-fill', 'bi-play-fill');
    }
}

function cancionAnterior(): void {
    if (!currentSongNode) return;
    currentSongNode = currentSongNode.prev;
    actualizarInfoCancion();
    cancion.play();
}

function siguienteCancion(): void {
    if (!currentSongNode) return;
    currentSongNode = currentSongNode.next;
    actualizarInfoCancion();
    cancion.play();
}

// Configurar event listeners
function setupEventListeners(): void {
    botonReproducirPausar.addEventListener('click', reproducirPausar);
    botonAtras.addEventListener('click', cancionAnterior);
    botonAdelante.addEventListener('click', siguienteCancion);
    agregarInicio.addEventListener('click', () => agregarCancion('inicio'));
    agregarFinal.addEventListener('click', () => agregarCancion('final'));
    eliminarActual.addEventListener('click', eliminarCancionActual);
    
    // Barra de progreso
    cancion.addEventListener('timeupdate', () => {
        if (!isNaN(cancion.duration)) {
            progreso.value = (cancion.currentTime / cancion.duration * 100).toString();
        }
    });
    
    progreso.addEventListener('input', () => {
        if (!isNaN(cancion.duration)) {
            cancion.currentTime = (parseFloat(progreso.value)) * cancion.duration / 100;
        }
    });
    
    cancion.addEventListener('ended', siguienteCancion);
}

// Inicializar el reproductor
function inicializarReproductor(): void {
    currentSongNode = createPlaylist(canciones);
    actualizarInfoCancion();
    setupEventListeners();
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarReproductor);
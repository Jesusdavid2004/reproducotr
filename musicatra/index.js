// Obtener elementos del DOM
var tituloCancion = document.getElementById('tituloCancion');
var nombreArtista = document.getElementById('nombreArtista');
var progreso = document.getElementById('progreso');
var cancion = document.getElementById('cancion');
var iconoControl = document.getElementById('iconoControl');
var botonReproducirPausar = document.querySelector('.boton-reproducir-pausar');
var botonAtras = document.querySelector('.atras');
var botonAdelante = document.querySelector('.adelante');
var nuevoTitulo = document.getElementById('nuevoTitulo');
var nuevoArtista = document.getElementById('nuevoArtista');
var archivoCancion = document.getElementById('archivoCancion');
var nombreArchivo = document.getElementById('nombreArchivo');
var agregarInicio = document.getElementById('agregarInicio');
var agregarFinal = document.getElementById('agregarFinal');
var eliminarActual = document.getElementById('eliminarActual');
// Lista de canciones inicial
var canciones = [
    {
        titulo: "CHIHIRO",
        nombre: "Billie Eilish",
        fuente: "music/BillieEilish_CHIHIRO.mp3"
    },
    {
        titulo: "Cheap Thrills",
        nombre: "Sia ft. Sean Paul",
        fuente: "music/Sia_CheapThrills.mp3"
    },
    {
        titulo: "Lunch",
        nombre: "Billie Eilish",
        fuente: "music/BillieEilish-LUNCH.mp3"
    },
    {
        titulo: "Eilish",
        nombre: "Billie Eilish",
        fuente: "music/Billie Eilish-Lost Cause.mp3"
    },
    {
        titulo: "Denial",
        nombre: "Doechii",
        fuente: "music/Doechii - DENIAL IS A RIVER.mp3"
    },
    {
        titulo: "Extral",
        nombre: "Doechii and Jennie",
        fuente: "music/JENNIE,Doechii-ExtraL.mp3"
    },

];
var currentSongNode = null;
// Configurar el input de archivo
archivoCancion.addEventListener('change', function (e) {
    var files = e.target.files;
    if (files && files[0]) {
        nombreArchivo.textContent = files[0].name;
        if (!nuevoTitulo.value) {
            nuevoTitulo.value = files[0].name.replace('.mp3', '');
        }
    }
    else {
        nombreArchivo.textContent = "No se ha seleccionado archivo";
    }
});
// Crear lista doblemente enlazada circular
function createPlaylist(songs) {
    if (songs.length === 0)
        return null;
    var head = {};
    var current = {};
    // Primer nodo
    head = {
        song: songs[0],
        prev: {},
        next: {}
    };
    current = head;
    // Nodos restantes
    for (var i = 1; i < songs.length; i++) {
        var newNode = {
            song: songs[i],
            prev: current,
            next: {}
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
function actualizarInfoCancion() {
    if (!currentSongNode) {
        tituloCancion.textContent = "No hay canciones";
        nombreArtista.textContent = "";
        cancion.src = "";
        return;
    }
    tituloCancion.textContent = currentSongNode.song.titulo;
    nombreArtista.textContent = currentSongNode.song.nombre;
    if (currentSongNode.song.file) {
        var objectUrl_1 = URL.createObjectURL(currentSongNode.song.file);
        cancion.src = objectUrl_1;
        // Liberar URL cuando termine
        cancion.addEventListener('ended', function () {
            URL.revokeObjectURL(objectUrl_1);
        }, { once: true });
    }
    else {
        cancion.src = currentSongNode.song.fuente;
    }
    // Cargar la fuente
    cancion.load();
}
// Funciones para gestionar canciones
function agregarCancion(posicion) {
    var _a;
    var file = ((_a = archivoCancion.files) === null || _a === void 0 ? void 0 : _a[0]) || null;
    var titulo = nuevoTitulo.value.trim() || (file === null || file === void 0 ? void 0 : file.name.replace('.mp3', '')) || "Sin título";
    if (!file && !titulo) {
        alert("Debes ingresar al menos un título o seleccionar un archivo");
        return;
    }
    var nuevaCancion = {
        titulo: titulo,
        nombre: nuevoArtista.value.trim() || "Artista desconocido",
        fuente: file ? file.name : "local-file.mp3",
        file: file
    };
    if (posicion === 'inicio') {
        canciones.unshift(nuevaCancion);
    }
    else {
        canciones.push(nuevaCancion);
    }
    currentSongNode = createPlaylist(canciones);
    actualizarInfoCancion();
    limpiarFormulario();
}
function eliminarCancionActual() {
    if (!currentSongNode || canciones.length <= 1) {
        alert("No puedes eliminar la última canción");
        return;
    }
    var tituloActual = currentSongNode.song.titulo;
    canciones = canciones.filter(function (c) { return c.titulo !== tituloActual; });
    currentSongNode = createPlaylist(canciones);
    actualizarInfoCancion();
}
function limpiarFormulario() {
    nuevoTitulo.value = "";
    nuevoArtista.value = "";
    archivoCancion.value = "";
    nombreArchivo.textContent = "No se ha seleccionado archivo";
}
// Control de reproducción
function reproducirPausar() {
    if (!currentSongNode)
        return;
    if (cancion.paused) {
        cancion.play()
            .then(function () {
            iconoControl.classList.replace('bi-play-fill', 'bi-pause-fill');
        })
            .catch(function (error) {
            console.error("Error al reproducir:", error);
            alert("Error al reproducir: ".concat(currentSongNode === null || currentSongNode === void 0 ? void 0 : currentSongNode.song.titulo));
        });
    }
    else {
        cancion.pause();
        iconoControl.classList.replace('bi-pause-fill', 'bi-play-fill');
    }
}
function cancionAnterior() {
    if (!currentSongNode)
        return;
    currentSongNode = currentSongNode.prev;
    actualizarInfoCancion();
    cancion.play();
}
function siguienteCancion() {
    if (!currentSongNode)
        return;
    currentSongNode = currentSongNode.next;
    actualizarInfoCancion();
    cancion.play();
}
// Configurar event listeners
function setupEventListeners() {
    botonReproducirPausar.addEventListener('click', reproducirPausar);
    botonAtras.addEventListener('click', cancionAnterior);
    botonAdelante.addEventListener('click', siguienteCancion);
    agregarInicio.addEventListener('click', function () { return agregarCancion('inicio'); });
    agregarFinal.addEventListener('click', function () { return agregarCancion('final'); });
    eliminarActual.addEventListener('click', eliminarCancionActual);
    // Barra de progreso
    cancion.addEventListener('timeupdate', function () {
        if (!isNaN(cancion.duration)) {
            progreso.value = (cancion.currentTime / cancion.duration * 100).toString();
        }
    });
    progreso.addEventListener('input', function () {
        if (!isNaN(cancion.duration)) {
            cancion.currentTime = (parseFloat(progreso.value)) * cancion.duration / 100;
        }
    });
    cancion.addEventListener('ended', siguienteCancion);
}
// Inicializar el reproductor
function inicializarReproductor() {
    currentSongNode = createPlaylist(canciones);
    actualizarInfoCancion();
    setupEventListeners();
}
// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarReproductor);

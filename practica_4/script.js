/* =====================================================
   VARIABLES GLOBALES DEL JUEGO
   ===================================================== */

// Variables de control del estado del juego
let gameStarted = false;        // Controla si el juego ha comenzado
let timeLimit = 120;            // Límite de tiempo en segundos (2 minutos)
let timeRemaining = timeLimit;  // Tiempo restante en segundos
let timerInterval = null;       // Intervalo del temporizador que se actualiza cada segundo
let attempts = 0;               // Contador de intentos realizados por el jugador
let flippedCards = [];          // Array que almacena las cartas volteadas actualmente
let matchedPairs = 0;           // Contador de pares encontrados correctamente
let isProcessing = false;       // Previene clicks durante el procesamiento de cartas
let gameEnded = false;          // Controla si el juego ha terminado (victoria o derrota)

// Array con los emojis que aparecerán en las cartas (6 parejas = 12 cartas total)
const cardSymbols = ['🐶', '🐱', '🐰', '🦊', '🐸', '🐼'];

/* =====================================================
   FUNCIONES AUXILIARES
   ===================================================== */

/**
 * Función que mezcla un array aleatoriamente usando el algoritmo Fisher-Yates
 * @param {Array} array - Array original a mezclar
 * @returns {Array} - Nueva copia del array mezclado aleatoriamente
 */
function shuffleArray(array) {
    const newArray = [...array]; // Crear copia para no modificar el array original
    
    // Algoritmo Fisher-Yates: recorre desde el final hacia el inicio
    for (let i = newArray.length - 1; i > 0; i--) {
        // Generar índice aleatorio entre 0 y i (inclusive)
        const j = Math.floor(Math.random() * (i + 1));
        // Intercambiar elementos en las posiciones i y j
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Función que formatea el tiempo en segundos a formato MM:SS
 * @param {number} seconds - Tiempo en segundos
 * @returns {string} - Tiempo formateado como MM:SS
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

/* =====================================================
   FUNCIONES DE CREACIÓN Y CONTROL DEL TABLERO
   ===================================================== */

/**
 * Función principal que crea el tablero de juego generando todas las cartas HTML
 * Se ejecuta al inicio del juego y cada vez que se reinicia
 */
function createGameBoard() {
    const gameBoard = document.getElementById('gameBoard');
    
    // Crear array con pares de símbolos (cada símbolo aparece exactamente dos veces)
    const cardPairs = [...cardSymbols, ...cardSymbols];
    
    // Mezclar las cartas aleatoriamente para cada nueva partida
    const shuffledCards = shuffleArray(cardPairs);
    
    // Limpiar el tablero existente antes de crear las nuevas cartas
    gameBoard.innerHTML = '';
    
    // Crear cada carta individual y añadirla al tablero
    shuffledCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Almacenar información importante en atributos data
        card.setAttribute('data-value', symbol); // Símbolo de la carta para comparación
        card.setAttribute('data-index', index);   // Índice único para identificar cada carta
        
        // Estructura HTML interna de cada carta con efecto flip
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${symbol}</div>
                <div class="card-back">❓</div>
            </div>
        `;
        
        // Añadir evento de click a cada carta para manejar el volteo
        card.addEventListener('click', () => flipCard(card));
        
        // Añadir la carta completa al tablero de juego
        gameBoard.appendChild(card);
    });
}

/**
 * Función que maneja la lógica de volteo de cartas cuando el usuario hace click
 * Incluye validaciones para prevenir clicks inválidos
 * @param {HTMLElement} card - Elemento DOM de la carta que fue clickeada
 */
function flipCard(card) {
    // Validaciones: prevenir clicks si el juego terminó, está procesando o en cartas ya volteadas/emparejadas
    if (gameEnded || 
        isProcessing || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched')) {
        return; // Salir de la función si la carta no se puede voltear
    }
    
    // Iniciar temporizador automáticamente en el primer click del juego
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Aplicar efecto visual de volteo y agregar carta al array de cartas volteadas
    card.classList.add('flipped');
    flippedCards.push(card);
    
    // Lógica de procesamiento según el número de cartas volteadas
    if (flippedCards.length === 2) {
        isProcessing = true; // Bloquear nuevos clicks temporalmente
        attempts++; // Incrementar contador de intentos
        
        // Actualizar display del contador en la interfaz
        document.getElementById('attempts').textContent = attempts;
        
        // Verificar si las cartas coinciden después de una pequeña pausa (800ms)
        // La pausa permite al jugador ver ambas cartas antes del resultado
        setTimeout(checkMatch, 800);
    }
}

/**
 * Función que verifica si las dos cartas volteadas tienen el mismo símbolo
 * Maneja tanto el caso de coincidencia como el de no coincidencia
 */
function checkMatch() {
    // Si el juego ya terminó, no procesar más
    if (gameEnded) {
        return;
    }
    
    const [card1, card2] = flippedCards; // Destructuring de las dos cartas volteadas
    
    // Obtener los símbolos de ambas cartas desde sus atributos data-value
    const value1 = card1.getAttribute('data-value');
    const value2 = card2.getAttribute('data-value');
    
    if (value1 === value2) {
        // ✅ COINCIDENCIA: Las cartas tienen el mismo símbolo
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++; // Incrementar contador de pares encontrados
        
        // Verificar si el juego está completamente terminado
        if (matchedPairs === cardSymbols.length) {
            // El jugador encontró todos los pares antes de que se acabe el tiempo
            setTimeout(showVictory, 500);
        }
    } else {
        // ❌ NO COINCIDENCIA: Las cartas tienen símbolos diferentes
        // Voltear las cartas de vuelta (ocultar su contenido)
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    
    // Limpiar el array de cartas volteadas y reactivar la capacidad de hacer click
    flippedCards = [];
    isProcessing = false;
}

/* =====================================================
   FUNCIONES DE TEMPORIZADOR CON LÍMITE DE TIEMPO
   ===================================================== */

/**
 * Función que inicia el temporizador con cuenta regresiva
 * Se ejecuta automáticamente en el primer click de cualquier carta
 */
function startTimer() {
    // Crear intervalo que actualiza el temporizador cada segundo (1000ms)
    timerInterval = setInterval(() => {
        timeRemaining--; // Decrementar el tiempo restante
        
        // Actualizar el display del temporizador
        updateTimerDisplay();
        
        // Verificar si se acabó el tiempo
        if (timeRemaining <= 0) {
            timeRemaining = 0; // Asegurar que no sea negativo
            updateTimerDisplay(); // Actualizar una última vez
            endGameByTime(); // Terminar juego por tiempo agotado
        }
    }, 1000);
}

/**
 * Función que actualiza el display del temporizador y aplica efectos visuales según el tiempo restante
 */
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(timeRemaining);
    
    // Aplicar efectos visuales de alerta según el tiempo restante
    timerElement.classList.remove('timer-warning', 'timer-critical');
    
    if (timeRemaining <= 10) {
        // Tiempo crítico: últimos 10 segundos
        timerElement.classList.add('timer-critical');
    } else if (timeRemaining <= 30) {
        // Tiempo de advertencia: últimos 30 segundos
        timerElement.classList.add('timer-warning');
    }
}

/**
 * Función que detiene el temporizador del juego
 * Se ejecuta cuando el juego termina (victoria o derrota) o se reinicia
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // Limpiar el intervalo activo
        timerInterval = null; // Resetear la variable
    }
}

/**
 * Función que termina el juego cuando se agota el tiempo
 */
function endGameByTime() {
    gameEnded = true; // Marcar el juego como terminado
    stopTimer(); // Detener el temporizador
    
    // Voltear todas las cartas no emparejadas de vuelta
    document.querySelectorAll('.card.flipped:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    
    // Limpiar cartas volteadas actualmente
    flippedCards = [];
    isProcessing = false;
    
    // Mostrar modal de derrota después de una pequeña pausa
    setTimeout(showDefeat, 500);
}

/* =====================================================
   FUNCIONES DE INTERFAZ Y MODALES
   ===================================================== */

/**
 * Función que muestra el modal de victoria con las estadísticas finales del juego
 * Se ejecuta automáticamente cuando se encuentran todos los pares antes del tiempo límite
 */
function showVictory() {
    gameEnded = true; // Marcar el juego como terminado
    stopTimer(); // Detener el temporizador inmediatamente
    
    // Calcular el tiempo usado (tiempo límite menos tiempo restante)
    const timeUsed = timeLimit - timeRemaining;
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    
    // Preparar y mostrar las estadísticas finales en el modal
    const statsElement = document.getElementById('victoryStats');
    statsElement.innerHTML = `
        ⏱️ Tiempo usado: ${formatTime(timeUsed)}<br>
        ⏰ Tiempo restante: ${formatTime(timeRemaining)}<br>
        🎯 Intentos: ${attempts}<br>
        🏆 ¡Completaste el juego a tiempo!
    `;
    
    // Mostrar cuadro de victoria
    document.getElementById('victoryModal').style.display = 'flex';
}


//Función del cuadro de derrota cuando se agota el tiempo

function showDefeat() {
    // Preparar y mostrar las estadísticas en el cuadro
    const statsElement = document.getElementById('defeatStats');
    statsElement.innerHTML = `
        🎯 Intentos realizados: ${attempts}<br>
        🧩 Pares encontrados: ${matchedPairs}/${cardSymbols.length}<br>
        💔 No lograste completar el juego a tiempo<br>
        🔄 ¡Inténtalo de nuevo!
    `;
    
    // Mostrar el cuadro de derrota
    document.getElementById('defeatModal').style.display = 'flex';
}

/**
 * Función que cierra el cuadro de victoria y reinicia el juego
 * Ocurre al presionar "Jugar de Nuevo"
 */
function closeVictoryModal() {
    document.getElementById('victoryModal').style.display = 'none';
    restartGame(); // Reiniciar para una nueva partida
}

/**
 * Función que cierra el cuadro de derrota y reinicia el juego
 * Ocurre al presionar "Intentar de Nuevo"
 */
function closeDefeatModal() {
    document.getElementById('defeatModal').style.display = 'none';
    restartGame(); // Reiniciar para una nueva partida
}

/**
 * Función principal que reinicia el juego 
 * Ocurre al presionar el boton "Reiniciar"
 */
function restartGame() {
    // Resetear todas las variables de estado del juego
    gameStarted = false;
    gameEnded = false;
    timeRemaining = timeLimit; // Restaurar tiempo límite 
    attempts = 0;
    flippedCards = [];
    matchedPairs = 0;
    isProcessing = false;
    
    // Detener cualquier temporizador activo
    stopTimer();
    
    // Resetear todos los displays de la interfaz 
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(timeLimit);
    timerElement.classList.remove('timer-warning', 'timer-critical'); 
    document.getElementById('attempts').textContent = '0';
    
    // Crear un nuevo tablero 
    createGameBoard();
    
    // Asegurar que ambos cuadros estén cerrados
    document.getElementById('victoryModal').style.display = 'none';
    document.getElementById('defeatModal').style.display = 'none';
}

//Sección para teléfonos


//Inicializar el juego cuando la página se carga completamente

document.addEventListener('DOMContentLoaded', () => {
    // Establecer el tiempo inicial en el display
    document.getElementById('timer').textContent = formatTime(timeLimit);
    // Crear el tablero inicial
    createGameBoard();
});


// Prevenir zoom accidental en dispositivos móviles 
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

// Prevenir zoom con doble tap 
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault(); 
    }
    lastTouchEnd = now;
}, false);
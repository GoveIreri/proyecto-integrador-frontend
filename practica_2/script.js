// Variables globales para llevar el marcador
let wins = 0;
let losses = 0;
let ties = 0;

// Opciones del juego con sus emojis correspondientes
const choices = {
    piedra: '🪨',
    papel: '📄',
    tijera: '✂️'
};

// Array con las opciones para generar elección aleatoria de la computadora
const choiceKeys = ['piedra', 'papel', 'tijera'];

/**
 * Función principal que maneja la elección del jugador
 * @param {string} playerSelection - La elección del jugador (piedra, papel, tijera)
 */
function playerChoice(playerSelection) {
    // Generar elección aleatoria de la computadora
    const computerSelection = getComputerChoice();
    
    // Mostrar las elecciones en pantalla
    displayChoices(playerSelection, computerSelection);
    
    // Determinar el ganador
    const result = determineWinner(playerSelection, computerSelection);
    
    // Mostrar el resultado
    displayResult(result, playerSelection, computerSelection);
    
    // Actualizar el marcador
    updateScore(result);
}

/**
 * Genera una elección aleatoria para la computadora
 * @returns {string} La elección de la computadora
 */
function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * choiceKeys.length);
    return choiceKeys[randomIndex];
}

/**
 * Muestra las elecciones del jugador y la computadora en pantalla
 * @param {string} player - Elección del jugador
 * @param {string} computer - Elección de la computadora
 */
function displayChoices(player, computer) {
    document.getElementById('player-display').textContent = choices[player];
    document.getElementById('computer-display').textContent = choices[computer];
}

/**
 * Determina el ganador según las reglas del juego
 * @param {string} player - Elección del jugador
 * @param {string} computer - Elección de la computadora
 * @returns {string} El resultado: 'win', 'lose', o 'tie'
 */
function determineWinner(player, computer) {
    // Empate
    if (player === computer) {
        return 'tie';
    }
    
    // Condiciones de victoria para el jugador
    if (
        (player === 'piedra' && computer === 'tijera') ||
        (player === 'papel' && computer === 'piedra') ||
        (player === 'tijera' && computer === 'papel')
    ) {
        return 'win';
    }
    
    // Si no es empate ni victoria, es derrota
    return 'lose';
}

/**
 * Muestra el mensaje de resultado en pantalla
 * @param {string} result - El resultado del juego
 * @param {string} player - Elección del jugador
 * @param {string} computer - Elección de la computadora
 */
function displayResult(result, player, computer) {
    const resultElement = document.getElementById('result-message');
    resultElement.style.display = 'block';
    
    // Limpiar clases anteriores
    resultElement.className = 'result-message';
    
    let message = '';
    
    switch (result) {
        case 'win':
            message = `¡Ganaste! ${choices[player]} vence a ${choices[computer]}`;
            resultElement.classList.add('win');
            break;
        case 'lose':
            message = `¡Perdiste! ${choices[computer]} vence a ${choices[player]}`;
            resultElement.classList.add('lose');
            break;
        case 'tie':
            message = `¡Empate! Ambos eligieron ${choices[player]}`;
            resultElement.classList.add('tie');
            break;
    }
    
    resultElement.textContent = message;
    
    // Agregar efecto de animación
    resultElement.style.transform = 'scale(0.8)';
    setTimeout(() => {
        resultElement.style.transform = 'scale(1)';
    }, 100);
}

/**
 * Actualiza el marcador según el resultado
 * @param {string} result - El resultado del juego
 */
function updateScore(result) {
    switch (result) {
        case 'win':
            wins++;
            document.getElementById('wins').textContent = wins;
            break;
        case 'lose':
            losses++;
            document.getElementById('losses').textContent = losses;
            break;
        case 'tie':
            ties++;
            document.getElementById('ties').textContent = ties;
            break;
    }
    
    // Guardar puntuación en localStorage para persistencia
    saveScore();
}

/**
 * Guarda la puntuación actual en localStorage
 */
function saveScore() {
    const scoreData = {
        wins: wins,
        losses: losses,
        ties: ties
    };
    localStorage.setItem('rpsScore', JSON.stringify(scoreData));
}

/**
 * Carga la puntuación guardada desde localStorage
 */
function loadScore() {
    const savedScore = localStorage.getItem('rpsScore');
    if (savedScore) {
        const scoreData = JSON.parse(savedScore);
        wins = scoreData.wins || 0;
        losses = scoreData.losses || 0;
        ties = scoreData.ties || 0;
        
        // Actualizar la visualización
        document.getElementById('wins').textContent = wins;
        document.getElementById('losses').textContent = losses;
        document.getElementById('ties').textContent = ties;
    }
}

/**
 * Reinicia el marcador a cero
 */
function resetGame() {
    wins = 0;
    losses = 0;
    ties = 0;
    
    // Actualizar la visualización
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('ties').textContent = ties;
    
    // Ocultar el mensaje de resultado
    document.getElementById('result-message').style.display = 'none';
    
    // Resetear las elecciones mostradas
    document.getElementById('player-display').textContent = '❓';
    document.getElementById('computer-display').textContent = '❓';
    
    // Limpiar localStorage
    localStorage.removeItem('rpsScore');
    
    // Mostrar mensaje de confirmación
    const resultElement = document.getElementById('result-message');
    resultElement.style.display = 'block';
    resultElement.className = 'result-message tie';
    resultElement.textContent = '¡Puntuación reiniciada! ¡A jugar!';
    
    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
        resultElement.style.display = 'none';
    }, 2000);
}

// Cargar puntuación al iniciar la página
window.addEventListener('load', loadScore);
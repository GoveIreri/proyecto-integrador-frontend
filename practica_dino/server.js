const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Importar rutas de scores
const scoresRoutes = require('./scores.routes');
app.use('/api/scores', scoresRoutes);

// Crear directorio data si no existe
async function initializeDataDirectory() {
    try {
        await fs.access(path.join(__dirname, 'data'));
    } catch (error) {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        console.log('📁 Directorio data creado');
    }

    // Crear archivo scores.json si no existe
    const scoresPath = path.join(__dirname, 'data/scores.json');
    try {
        await fs.access(scoresPath);
    } catch (error) {
        await fs.writeFile(scoresPath, JSON.stringify([]));
        console.log('📄 Archivo scores.json creado');
    }
}

// Inicializar servidor
async function startServer() {
    try {
        await initializeDataDirectory();
        
        app.listen(PORT, () => {
            console.log('\n🚀 Servidor RunnerJS iniciado');
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🎮 Juego: http://localhost:${PORT}/proyecto/game.html`);
            console.log(`📊 API Scores: http://localhost:${PORT}/api/scores`);
            console.log('\n💡 Controles del juego:');
            console.log('   - ESPACIO: Saltar');
            console.log('   - R: Reiniciar');
            console.log('   - CLICK: Saltar (alternativo)');
            console.log('\n🏆 Funciones:');
            console.log('   - Niveles progresivos');
            console.log('   - Sistema de puntuaciones');
            console.log('   - Leaderboard online');
            console.log('   - Fallback a localStorage');
        });
    } catch (error) {
        console.error('❌ Error al inicializar el servidor:', error);
        process.exit(1);
    }
}

// Manejo de errores
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        availableRoutes: [
            'GET /',
            'GET /proyecto/game.html',
            'GET /api/scores',
            'POST /api/scores'
        ]
    });
});

// Iniciar servidor
startServer();

// Manejo graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor RunnerJS...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor RunnerJS...');
    process.exit(0);
});
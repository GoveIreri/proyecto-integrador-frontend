const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const scoresFilePath = path.join(__dirname, 'data/scores.json');

// Función para validar datos de score
function validateScore(scoreData) {
    const { name, score, level } = scoreData;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return { valid: false, message: 'El nombre es requerido' };
    }
    
    if (!score || typeof score !== 'number' || score < 0) {
        return { valid: false, message: 'La puntuación debe ser un número positivo' };
    }
    
    if (!level || typeof level !== 'number' || level < 1) {
        return { valid: false, message: 'El nivel debe ser un número mayor a 0' };
    }
    
    if (name.trim().length > 20) {
        return { valid: false, message: 'El nombre no puede tener más de 20 caracteres' };
    }
    
    return { valid: true };
}

// Función para leer scores del archivo
async function readScores() {
    try {
        const data = await fs.readFile(scoresFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer scores:', error.message);
        return [];
    }
}

// Función para escribir scores al archivo
async function writeScores(scores) {
    try {
        await fs.writeFile(scoresFilePath, JSON.stringify(scores, null, 2));
        return true;
    } catch (error) {
        console.error('Error al escribir scores:', error.message);
        return false;
    }
}

// Función para limpiar y filtrar datos maliciosos
function sanitizeScoreData(scoreData) {
    return {
        name: scoreData.name.trim().substring(0, 20),
        score: Math.max(0, Math.floor(Number(scoreData.score))),
        level: Math.max(1, Math.floor(Number(scoreData.level))),
        date: new Date().toISOString(),
        id: Date.now() + Math.random().toString(36).substr(2, 9)
    };
}

// GET /api/scores - Obtener todas las puntuaciones
router.get('/', async (req, res) => {
    try {
        const scores = await readScores();
        
        // Ordenar por puntuación descendente y limitar a top 50
        const sortedScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
        
        res.json(sortedScores);
        console.log(`📊 Scores enviados: ${sortedScores.length} puntuaciones`);
        
    } catch (error) {
        console.error('Error al obtener scores:', error);
        res.status(500).json({ 
            error: 'Error al obtener puntuaciones',
            message: 'Inténtalo de nuevo más tarde'
        });
    }
});

// POST /api/scores - Guardar nueva puntuación
router.post('/', async (req, res) => {
    try {
        // Validar datos recibidos
        const validation = validateScore(req.body);
        if (!validation.valid) {
            return res.status(400).json({ 
                error: 'Datos inválidos',
                message: validation.message 
            });
        }
        
        // Limpiar y preparar datos
        const newScore = sanitizeScoreData(req.body);
        
        // Leer scores existentes
        const scores = await readScores();
        
        // Verificar si ya existe una puntuación muy reciente del mismo jugador
        // (prevención básica de spam)
        const recentScore = scores.find(score => 
            score.name === newScore.name && 
            new Date() - new Date(score.date) < 10000 // 10 segundos
        );
        
        if (recentScore) {
            return res.status(429).json({
                error: 'Puntuación muy reciente',
                message: 'Espera un momento antes de guardar otra puntuación'
            });
        }
        
        // Agregar nueva puntuación
        scores.push(newScore);
        
        // Ordenar y mantener solo top 100 para evitar crecimiento excesivo
        const sortedScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 100);
        
        // Guardar archivo
        const saved = await writeScores(sortedScores);
        
        if (!saved) {
            return res.status(500).json({
                error: 'Error al guardar',
                message: 'No se pudo guardar la puntuación'
            });
        }
        
        // Determinar la posición en el ranking
        const position = sortedScores.findIndex(score => score.id === newScore.id) + 1;
        
        res.status(201).json({
            message: 'Puntuación guardada exitosamente',
            score: newScore,
            position: position,
            totalScores: sortedScores.length
        });
        
        console.log(`💾 Nueva puntuación guardada: ${newScore.name} - ${newScore.score} pts (Nivel ${newScore.level})`);
        
    } catch (error) {
        console.error('Error al guardar score:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo procesar la puntuación'
        });
    }
});

// GET /api/scores/top/:limit - Obtener top N puntuaciones
router.get('/top/:limit', async (req, res) => {
    try {
        const limit = Math.min(Math.max(1, parseInt(req.params.limit) || 10), 50);
        const scores = await readScores();
        
        const topScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        
        res.json({
            limit: limit,
            count: topScores.length,
            scores: topScores
        });
        
    } catch (error) {
        console.error('Error al obtener top scores:', error);
        res.status(500).json({
            error: 'Error al obtener puntuaciones',
            message: 'Inténtalo de nuevo más tarde'
        });
    }
});

// GET /api/scores/player/:name - Obtener puntuaciones de un jugador específico
router.get('/player/:name', async (req, res) => {
    try {
        const playerName = req.params.name.trim();
        if (!playerName) {
            return res.status(400).json({
                error: 'Nombre inválido',
                message: 'El nombre del jugador es requerido'
            });
        }
        
        const scores = await readScores();
        const playerScores = scores
            .filter(score => score.name.toLowerCase() === playerName.toLowerCase())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10 del jugador
        
        res.json({
            player: playerName,
            count: playerScores.length,
            bestScore: playerScores.length > 0 ? playerScores[0].score : 0,
            scores: playerScores
        });
        
    } catch (error) {
        console.error('Error al obtener scores del jugador:', error);
        res.status(500).json({
            error: 'Error al obtener puntuaciones del jugador',
            message: 'Inténtalo de nuevo más tarde'
        });
    }
});

// DELETE /api/scores/reset - Resetear todas las puntuaciones (para desarrollo)
router.delete('/reset', async (req, res) => {
    try {
        // Solo permitir en modo desarrollo
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: 'Operación no permitida',
                message: 'No se puede resetear en producción'
            });
        }
        
        const saved = await writeScores([]);
        
        if (!saved) {
            return res.status(500).json({
                error: 'Error al resetear',
                message: 'No se pudo resetear las puntuaciones'
            });
        }
        
        res.json({
            message: 'Puntuaciones reseteadas exitosamente',
            count: 0
        });
        
        console.log('🗑️ Puntuaciones reseteadas');
        
    } catch (error) {
        console.error('Error al resetear scores:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo resetear las puntuaciones'
        });
    }
});

// GET /api/scores/stats - Obtener estadísticas generales
router.get('/stats', async (req, res) => {
    try {
        const scores = await readScores();
        
        if (scores.length === 0) {
            return res.json({
                totalScores: 0,
                totalPlayers: 0,
                highestScore: 0,
                averageScore: 0,
                highestLevel: 0,
                averageLevel: 0
            });
        }
        
        const totalScores = scores.length;
        const uniquePlayers = [...new Set(scores.map(score => score.name))].length;
        const highestScore = Math.max(...scores.map(score => score.score));
        const averageScore = Math.round(scores.reduce((sum, score) => sum + score.score, 0) / totalScores);
        const highestLevel = Math.max(...scores.map(score => score.level));
        const averageLevel = Math.round(scores.reduce((sum, score) => sum + score.level, 0) / totalScores);
        
        res.json({
            totalScores,
            totalPlayers: uniquePlayers,
            highestScore,
            averageScore,
            highestLevel,
            averageLevel
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas',
            message: 'Inténtalo de nuevo más tarde'
        });
    }
});

module.exports = router;
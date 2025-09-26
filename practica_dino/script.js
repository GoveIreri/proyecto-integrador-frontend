                // === SPRITES ===
        const dinoImg = new Image();
        dinoImg.src = "img/dino.png";

        const cactusImg = new Image();
        cactusImg.src = "img/cactus.png";

        const rockImg = new Image();
        rockImg.src = "img/rock.png";

        const birdImg = new Image();
        birdImg.src = "img/bird.png";

        // Variables del juego
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Estado del juego
        let gameState = {
            running: false,
            score: 0,
            level: 1,
            speed: 3,
            highScore: localStorage.getItem('runnerHighScore') || 0
        };

        // Jugador
        const player = {
            x: 100,
            y: 300,
            width: 50,
            height: 50,
            velocityY: 0,
            jumping: false,
            grounded: true
        };

        // Obstáculos
        let obstacles = [];
        let obstacleTimer = 0;
        const obstacleInterval = 120; // frames entre obstáculos

        // Nubes (decoración)
        let clouds = [];

        // Partículas
        let particles = [];

        // Actualizar HUD
        function updateHUD() {
            document.getElementById('score').textContent = gameState.score;
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('highScore').textContent = gameState.highScore;
        }

        // Crear nube
        function createCloud() {
            return {
                x: canvas.width + Math.random() * 200,
                y: 50 + Math.random() * 100,
                width: 60 + Math.random() * 40,
                height: 30 + Math.random() * 20,
                speed: 0.5 + Math.random() * 0.5
            };
        }

        // Crear obstáculo
        function createObstacle() {
            const types = ['cactus', 'rock', 'bird'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let obstacle = {
                x: canvas.width,
                width: 30,
                height: 30,
                type: type
            };

            if (type === 'bird') {
                obstacle.y = 250 + Math.random() * 50;
                obstacle.height = 45; 
                obstacle.width = 50;   
            } else {
                obstacle.y = 310;
                obstacle.height = 40;
                if (type === 'rock') {
                    obstacle.width = 30;
                    obstacle.height = 40;
                }
            }

            return obstacle;
        }

        // Crear partícula
        function createParticle(x, y) {
            return {
                x: x,
                y: y,
                velocityX: -2 - Math.random() * 3,
                velocityY: -1 - Math.random() * 2,
                life: 30,
                maxLife: 30
            };
        }

        // Dibujar jugador (dinosaurio)
                function drawPlayer() {
            ctx.drawImage(dinoImg, player.x, player.y, player.width, player.height);
        }

        // Dibujar obstáculo
        function drawObstacle(obstacle) {
            let img;
            if (obstacle.type === "cactus") img = cactusImg;
            if (obstacle.type === "rock") img = rockImg;
            if (obstacle.type === "bird") img = birdImg;
            ctx.drawImage(img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        // Dibujar nube
        function drawCloud(cloud) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.4, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dibujar partícula
        function drawParticle(particle) {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
            ctx.fillRect(particle.x, particle.y, 3, 3);
        }

        // Dibujar suelo
        function drawGround() {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, 350, canvas.width, 50);
            
            // Línea del suelo
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 350);
            ctx.lineTo(canvas.width, 350);
            ctx.stroke();
        }

        // Saltar
        function jump() {
            if (player.grounded) {
                player.velocityY = -12;
                player.jumping = true;
                player.grounded = false;
            }
        }

        function checkCollision(rect1, rect2) {
            const playerPadding = 8;
            const obstaclePadding = rect2.type === 'bird' ? 5 : 8; 

            return rect1.x + playerPadding < rect2.x + rect2.width - obstaclePadding &&
            rect1.x + rect1.width - playerPadding > rect2.x + obstaclePadding &&
            rect1.y + playerPadding < rect2.y + rect2.height - obstaclePadding &&
            rect1.y + rect1.height - playerPadding > rect2.y + obstaclePadding;
        }



        // Actualizar juego
        function update() {
            if (!gameState.running) return;

            // Actualizar jugador
            player.velocityY += 0.8; // gravedad
            player.y += player.velocityY;

            // Verificar si está en el suelo
            if (player.y >= 300) {
                player.y = 300;
                player.velocityY = 0;
                player.jumping = false;
                player.grounded = true;
            }

            // Crear obstáculos
            obstacleTimer++;
            if (obstacleTimer >= obstacleInterval - (gameState.level * 5)) {
                obstacles.push(createObstacle());
                obstacleTimer = 0;
            }

            // Actualizar obstáculos
            for (let i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].x -= gameState.speed;

                // Eliminar obstáculos fuera de pantalla
                if (obstacles[i].x + obstacles[i].width < 0) {
                    obstacles.splice(i, 1);
                    gameState.score += 10;
                    continue;
                }

                // Verificar colisión
                if (checkCollision(player, obstacles[i])) {
                    gameOver();
                    return;
                }
            }

            // Crear nubes ocasionalmente
            if (Math.random() < 0.005) {
                clouds.push(createCloud());
            }

            // Actualizar nubes
            for (let i = clouds.length - 1; i >= 0; i--) {
                clouds[i].x -= clouds[i].speed;
                if (clouds[i].x + clouds[i].width < 0) {
                    clouds.splice(i, 1);
                }
            }

            // Actualizar partículas
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].x += particles[i].velocityX;
                particles[i].y += particles[i].velocityY;
                particles[i].life--;
                
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                }
            }

            // Incrementar nivel y dificultad
            const newLevel = Math.floor(gameState.score / 100) + 1;
            if (newLevel > gameState.level) {
                gameState.level = newLevel;
                gameState.speed = Math.min(3 + (gameState.level * 0.5), 8);
            }

            updateHUD();
        }

        // Dibujar todo
        function draw() {
            // Limpiar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Fondo degradado
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.7, '#98FB98');
            gradient.addColorStop(1, '#228B22');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar nubes
            clouds.forEach(drawCloud);

            // Dibujar suelo
            drawGround();

            // Dibujar obstáculos
            obstacles.forEach(drawObstacle);

            // Dibujar jugador
            drawPlayer();

            // Dibujar partículas
            particles.forEach(drawParticle);

            // Mensaje de inicio
            if (!gameState.running && obstacles.length === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = 'white';
                ctx.font = '36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RunnerJS', canvas.width/2, 150);
                
                ctx.font = '18px Arial';
                ctx.fillText('Presiona ESPACIO para comenzar', canvas.width/2, 200);
                ctx.fillText('¡Esquiva los obstáculos y consigue la mayor puntuación!', canvas.width/2, 230);
            }
        }

        // Game Over
        function gameOver() {
            gameState.running = false;
            
            // Crear partículas de explosión
            for (let i = 0; i < 15; i++) {
                particles.push(createParticle(
                    player.x + player.width/2,
                    player.y + player.height/2
                ));
            }

            // Verificar nuevo récord
            const isNewRecord = gameState.score > gameState.highScore;
            if (isNewRecord) {
                gameState.highScore = gameState.score;
                localStorage.setItem('runnerHighScore', gameState.highScore);
                document.getElementById('newRecord').style.display = 'block';
            } else {
                document.getElementById('newRecord').style.display = 'none';
            }

            // Mostrar modal
            document.getElementById('finalScore').textContent = gameState.score;
            document.getElementById('finalLevel').textContent = gameState.level;
            document.getElementById('gameOverModal').style.display = 'flex';
            
            updateHUD();
        }

        // Reiniciar juego
        function restartGame() {
            gameState.running = true;
            gameState.score = 0;
            gameState.level = 1;
            gameState.speed = 3;
            
            player.x = 100;
            player.y = 300;
            player.velocityY = 0;
            player.jumping = false;
            player.grounded = true;
            
            obstacles = [];
            particles = [];
            obstacleTimer = 0;
            
            document.getElementById('gameOverModal').style.display = 'none';
            updateHUD();
        }

        // Inicializar juego
        function initGame() {
            gameState.running = false;
            updateHUD();
            loadLeaderboard();
            gameLoop();
        }

        // Loop principal del juego
        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }

        // API para puntuaciones
        async function saveScore() {
            const playerName = document.getElementById('playerName').value.trim();
            if (!playerName) {
                alert('Por favor, ingresa tu nombre');
                return;
            }

            const scoreData = {
                name: playerName,
                score: gameState.score,
                level: gameState.level,
                date: new Date().toISOString()
            };

            try {
                // Intentar guardar en el servidor
                const response = await fetch('/api/scores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(scoreData)
                });

                if (response.ok) {
                    console.log('Puntuación guardada en el servidor');
                    loadLeaderboard();
                } else {
                    throw new Error('Servidor no disponible');
                }
            } catch (error) {
                console.log('Guardando en localStorage:', error.message);
                // Fallback a localStorage
                saveToLocalStorage(scoreData);
            }

            document.getElementById('playerName').value = '';
            document.getElementById('gameOverModal').style.display = 'none';
        }

        // Guardar en localStorage como fallback
        function saveToLocalStorage(scoreData) {
            let scores = JSON.parse(localStorage.getItem('runnerScores')) || [];
            scores.push(scoreData);
            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 10); // Mantener solo top 10
            localStorage.setItem('runnerScores', JSON.stringify(scores));
            loadLeaderboard();
        }

        // Cargar leaderboard
        async function loadLeaderboard() {
            try {
                // Intentar cargar desde el servidor
                const response = await fetch('/api/scores');
                if (response.ok) {
                    const scores = await response.json();
                    displayLeaderboard(scores);
                    return;
                }
            } catch (error) {
                console.log('Cargando desde localStorage');
            }

            // Fallback a localStorage
            const localScores = JSON.parse(localStorage.getItem('runnerScores')) || [];
            displayLeaderboard(localScores);
        }

        // Mostrar leaderboard
        function displayLeaderboard(scores) {
            const leaderboardList = document.getElementById('leaderboardList');
            
            if (scores.length === 0) {
                leaderboardList.innerHTML = `
                    <li class="leaderboard-item">
                        <div class="player-info">
                            <span class="rank">-</span>
                            <span>No hay puntuaciones aún</span>
                        </div>
                        <span>¡Sé el primero!</span>
                    </li>
                `;
                return;
            }

            leaderboardList.innerHTML = '';
            
            scores.slice(0, 10).forEach((score, index) => {
                const li = document.createElement('li');
                li.className = 'leaderboard-item';
                
                const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                
                li.innerHTML = `
                    <div class="player-info">
                        <span class="rank ${rankClass}">${index + 1}</span>
                        <span>${score.name}</span>
                    </div>
                    <span>Nivel ${score.level} - ${score.score} pts</span>
                `;
                
                leaderboardList.appendChild(li);
            });
        }

        // Event Listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (gameState.running) {
                    jump();
                } else {
                    restartGame();
                }
            } else if (e.code === 'KeyR') {
                if (!gameState.running && obstacles.length > 0) {
                    restartGame();
                }
            } else if (e.code === 'Enter') {
                if (document.getElementById('gameOverModal').style.display === 'flex') {
                    saveScore();
                }
            }
        });

        // Click en canvas para saltar
        canvas.addEventListener('click', () => {
            if (gameState.running) {
                jump();
            } else {
                restartGame();
            }
        });

        // Touch para móviles
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameState.running) {
                jump();
            } else {
                restartGame();
            }
        });

        // Redimensionar canvas para móviles
        function resizeCanvas() {
            const container = document.querySelector('.game-container');
            const containerWidth = container.offsetWidth;
            
            if (window.innerWidth < 768) {
                canvas.style.width = '95vw';
                canvas.style.height = 'auto';
            } else {
                canvas.style.width = '800px';
                canvas.style.height = '400px';
            }
        }

        window.addEventListener('resize', resizeCanvas);

        // Inicializar
        window.addEventListener('load', () => {
            resizeCanvas();
            initGame();
        });
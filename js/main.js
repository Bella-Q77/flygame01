// DOM元素
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏交互
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 移动端导航菜单切换
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // 导航链接点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            // 添加当前链接的活动状态
            this.classList.add('active');
            
            // 关闭移动端菜单
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // 平滑滚动到目标区域
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 滚动时导航栏效果
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(45, 52, 54, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(45, 52, 54, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        // 更新活动导航链接
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // 游戏预览功能
    const gameCanvas = document.getElementById('gameCanvas');
    const heroCanvas = document.getElementById('heroCanvas');
    const ctx = gameCanvas.getContext('2d');
    const heroCtx = heroCanvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const playOverlay = document.querySelector('.play-overlay');
    
    // 创建音频上下文用于音效
    let audioContext;
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // 播放音效函数
    function playSound(frequency, duration, type = 'sine') {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // 游戏状态
    let gameState = {
        running: false,
        paused: false,
        score: 0,
        lives: 3, // 玩家生命值
        player: {
            x: 200,
            y: 600,
            width: 64,
            height: 64,
            speed: 5
        },
        bullets: [],
        enemies: [],
        explosions: [],
        particles: [], // 粒子效果
        stars: [], // 星空背景星星
        keys: {},
        lastShot: 0,
        shotCooldown: 250,
        enemySpawnTimer: 0,
        enemySpawnInterval: 2000,
        gameOver: false
    };
    
    // 初始化星空背景
    function initStarfield() {
        gameState.stars = [];
        for (let i = 0; i < 100; i++) {
            gameState.stars.push({
                x: Math.random() * gameCanvas.width,
                y: Math.random() * gameCanvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 1 + 0.5,
                opacity: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    // 初始化游戏画布
    function initCanvas() {
        // 设置画布尺寸
        gameCanvas.width = 460;
        gameCanvas.height = 720;
        heroCanvas.width = 460;
        heroCanvas.height = 720;
        
        // 初始化星空背景
        initStarfield();
        
        // 绘制初始画面
        drawGameScreen(ctx, '欢迎来到蜜蜂大战飞机！\n点击"开始游戏"按钮开始');
        drawGameScreen(heroCtx, '蜜蜂大战飞机\n点击预览游戏');
    }
    
    // 绘制游戏画面
    function drawGameScreen(context, message) {
        // 清空画布
        context.fillStyle = '#0a0e27';
        context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // 绘制星空背景
        drawStarfield(context);
        
        // 绘制消息
        if (message) {
            context.fillStyle = '#fff';
            context.font = 'bold 24px Orbitron';
            context.textAlign = 'center';
            context.fillText(message, gameCanvas.width / 2, gameCanvas.height / 2);
        }
    }
    
    // 绘制星空背景
    function drawStarfield(context) {
        gameState.stars.forEach(star => {
            // 更新星星位置
            star.y += star.speed;
            if (star.y > gameCanvas.height) {
                star.y = 0;
                star.x = Math.random() * gameCanvas.width;
            }
            
            // 绘制星星
            context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();
        });
    }
    
    // 绘制玩家飞机（改进版）
    function drawPlayer(context, player) {
        // 保存当前状态
        context.save();
        
        // 绘制飞机主体
        context.fillStyle = '#4ecdc4';
        context.beginPath();
        context.moveTo(player.x + player.width / 2, player.y);
        context.lineTo(player.x + player.width * 0.3, player.y + player.height * 0.7);
        context.lineTo(player.x + player.width * 0.2, player.y + player.height);
        context.lineTo(player.x + player.width * 0.5, player.y + player.height * 0.8);
        context.lineTo(player.x + player.width * 0.8, player.y + player.height);
        context.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.7);
        context.closePath();
        context.fill();
        
        // 绘制飞机细节
        context.fillStyle = '#2a9d8f';
        context.beginPath();
        context.moveTo(player.x + player.width / 2, player.y + player.height * 0.2);
        context.lineTo(player.x + player.width * 0.4, player.y + player.height * 0.6);
        context.lineTo(player.x + player.width * 0.6, player.y + player.height * 0.6);
        context.closePath();
        context.fill();
        
        // 绘制座舱
        context.fillStyle = '#264653';
        context.beginPath();
        context.ellipse(player.x + player.width / 2, player.y + player.height * 0.3, 
                       player.width * 0.15, player.height * 0.2, 0, 0, Math.PI * 2);
        context.fill();
        
        // 绘制引擎火焰
        if (gameState.running && !gameState.paused) {
            const flameSize = Math.random() * 5 + 10;
            context.fillStyle = '#ff9f1c';
            context.beginPath();
            context.moveTo(player.x + player.width * 0.3, player.y + player.height);
            context.lineTo(player.x + player.width * 0.35, player.y + player.height + flameSize);
            context.lineTo(player.x + player.width * 0.4, player.y + player.height);
            context.closePath();
            context.fill();
            
            context.beginPath();
            context.moveTo(player.x + player.width * 0.6, player.y + player.height);
            context.lineTo(player.x + player.width * 0.65, player.y + player.height + flameSize);
            context.lineTo(player.x + player.width * 0.7, player.y + player.height);
            context.closePath();
            context.fill();
        }
        
        // 恢复状态
        context.restore();
    }
    
    // 绘制子弹（放大版）
    function drawBullets(context, bullets) {
        bullets.forEach(bullet => {
            // 绘制子弹光晕
            const gradient = context.createRadialGradient(
                bullet.x + bullet.width/2, bullet.y + bullet.height/2, 0,
                bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width
            );
            gradient.addColorStop(0, 'rgba(255, 230, 109, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 230, 109, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width, 0, Math.PI * 2);
            context.fill();
            
            // 绘制子弹核心
            context.fillStyle = '#ffe66d';
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // 绘制子弹尾迹
            context.fillStyle = 'rgba(255, 230, 109, 0.5)';
            context.fillRect(bullet.x + bullet.width * 0.3, bullet.y + bullet.height, 
                           bullet.width * 0.4, bullet.height * 0.5);
        });
    }
    
    // 绘制敌机（飞机形状）
    function drawEnemies(context, enemies) {
        enemies.forEach(enemy => {
            // 保存当前状态
            context.save();
            
            // 绘制敌机主体
            context.fillStyle = '#e63946';
            context.beginPath();
            context.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            context.lineTo(enemy.x + enemy.width * 0.3, enemy.y + enemy.height * 0.3);
            context.lineTo(enemy.x, enemy.y);
            context.lineTo(enemy.x + enemy.width * 0.2, enemy.y + enemy.height * 0.2);
            context.lineTo(enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.15);
            context.lineTo(enemy.x + enemy.width * 0.8, enemy.y + enemy.height * 0.2);
            context.lineTo(enemy.x + enemy.width, enemy.y);
            context.lineTo(enemy.x + enemy.width * 0.7, enemy.y + enemy.height * 0.3);
            context.closePath();
            context.fill();
            
            // 绘制敌机细节
            context.fillStyle = '#a61e4d';
            context.beginPath();
            context.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height * 0.8);
            context.lineTo(enemy.x + enemy.width * 0.4, enemy.y + enemy.height * 0.4);
            context.lineTo(enemy.x + enemy.width * 0.6, enemy.y + enemy.height * 0.4);
            context.closePath();
            context.fill();
            
            // 绘制座舱
            context.fillStyle = '#1d3557';
            context.beginPath();
            context.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height * 0.7, 
                           enemy.width * 0.12, enemy.height * 0.15, 0, 0, Math.PI * 2);
            context.fill();
            
            // 恢复状态
            context.restore();
        });
    }
    
    // 创建粒子效果
    function createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 1;
            
            gameState.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color: color,
                life: 1.0
            });
        }
    }
    
    // 更新和绘制粒子
    function updateAndDrawParticles(context) {
        gameState.particles = gameState.particles.filter(particle => {
            // 更新粒子位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            // 绘制粒子
            if (particle.life > 0) {
                context.fillStyle = `${particle.color}${Math.floor(particle.life * 255).toString(16).padStart(2, '0')}`;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
                context.fill();
                
                return true;
            }
            return false;
        });
    }
    
    // 绘制爆炸效果（增强版）
    function drawExplosions(context, explosions) {
        explosions.forEach(explosion => {
            const progress = explosion.frame / explosion.maxFrame;
            const opacity = 1 - progress;
            
            // 绘制多层爆炸效果
            for (let i = 0; i < 3; i++) {
                const radius = explosion.radius * (1 + i * 0.3) * (1 + progress * 0.5);
                const layerOpacity = opacity * (1 - i * 0.3);
                
                // 外层爆炸
                const gradient = context.createRadialGradient(
                    explosion.x, explosion.y, 0,
                    explosion.x, explosion.y, radius
                );
                
                if (i === 0) {
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${layerOpacity})`);
                    gradient.addColorStop(0.3, `rgba(255, 200, 50, ${layerOpacity * 0.8})`);
                    gradient.addColorStop(0.7, `rgba(255, 100, 0, ${layerOpacity * 0.5})`);
                    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
                } else if (i === 1) {
                    gradient.addColorStop(0, `rgba(255, 200, 100, ${layerOpacity})`);
                    gradient.addColorStop(0.5, `rgba(255, 50, 0, ${layerOpacity * 0.7})`);
                    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
                } else {
                    gradient.addColorStop(0, `rgba(100, 100, 255, ${layerOpacity * 0.5})`);
                    gradient.addColorStop(1, `rgba(0, 0, 255, 0)`);
                }
                
                context.fillStyle = gradient;
                context.beginPath();
                context.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
                context.fill();
            }
            
            // 创建爆炸粒子
            if (explosion.frame % 3 === 0 && explosion.frame < explosion.maxFrame * 0.7) {
                createParticles(
                    explosion.x + (Math.random() - 0.5) * explosion.radius,
                    explosion.y + (Math.random() - 0.5) * explosion.radius,
                    '#ff9f1c',
                    3
                );
            }
            
            explosion.radius += 2;
            explosion.frame++;
        });
        
        // 移除完成的爆炸效果
        gameState.explosions = gameState.explosions.filter(e => e.frame < e.maxFrame);
    }
    
    // 绘制分数和生命值
    function drawScoreAndLives(context, score, lives) {
        // 绘制分数
        context.fillStyle = '#fff';
        context.font = 'bold 20px Orbitron';
        context.textAlign = 'left';
        context.fillText(`分数: ${score}`, 10, 30);
        
        // 绘制生命值
        context.fillText(`生命: `, 10, 60);
        
        // 绘制生命值图标（小飞机）
        for (let i = 0; i < lives; i++) {
            context.fillStyle = '#4ecdc4';
            context.beginPath();
            context.moveTo(70 + i * 25, 55);
            context.lineTo(65 + i * 25, 65);
            context.lineTo(67 + i * 25, 63);
            context.lineTo(70 + i * 25, 65);
            context.lineTo(73 + i * 25, 63);
            context.lineTo(75 + i * 25, 65);
            context.closePath();
            context.fill();
        }
    }
    
    // 游戏更新逻辑
    function updateGame(timestamp) {
        if (!gameState.running || gameState.paused || gameState.gameOver) return;
        
        // 更新玩家位置
        if (gameState.keys['ArrowLeft'] && gameState.player.x > 0) {
            gameState.player.x -= gameState.player.speed;
        }
        if (gameState.keys['ArrowRight'] && gameState.player.x < gameCanvas.width - gameState.player.width) {
            gameState.player.x += gameState.player.speed;
        }
        
        // 发射子弹
        if (gameState.keys[' '] && timestamp - gameState.lastShot > gameState.shotCooldown) {
            // 发射更宽的子弹
            gameState.bullets.push({
                x: gameState.player.x + gameState.player.width / 2 - 4, // 居中并加宽
                y: gameState.player.y,
                width: 8, // 放大子弹宽度
                height: 15,
                speed: 8
            });
            gameState.lastShot = timestamp;
            
            // 播放射击音效
            playSound(800, 0.1, 'square');
        }
        
        // 更新子弹位置
        gameState.bullets = gameState.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
        
        // 生成敌机
        if (timestamp - gameState.enemySpawnTimer > gameState.enemySpawnInterval) {
            gameState.enemies.push({
                x: Math.random() * (gameCanvas.width - 40),
                y: -40,
                width: 40,
                height: 40,
                speed: 2 + Math.random() * 2
            });
            gameState.enemySpawnTimer = timestamp;
        }
        
        // 更新敌机位置
        gameState.enemies = gameState.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            return enemy.y < gameCanvas.height + enemy.height;
        });
        
        // 碰撞检测
        checkCollisions();
        
        // 绘制游戏画面
        drawGameScreen(ctx);
        drawPlayer(ctx, gameState.player);
        drawBullets(ctx, gameState.bullets);
        drawEnemies(ctx, gameState.enemies);
        drawExplosions(ctx, gameState.explosions);
        updateAndDrawParticles(ctx);
        drawScoreAndLives(ctx, gameState.score, gameState.lives);
        
        // 继续游戏循环
        requestAnimationFrame(updateGame);
    }
    
    // 碰撞检测
    function checkCollisions() {
        // 子弹与敌机碰撞
        gameState.bullets.forEach((bullet, bulletIndex) => {
            gameState.enemies.forEach((enemy, enemyIndex) => {
                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    // 移除子弹和敌机
                    gameState.bullets.splice(bulletIndex, 1);
                    gameState.enemies.splice(enemyIndex, 1);
                    
                    // 添加爆炸效果
                    gameState.explosions.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height / 2,
                        radius: 10,
                        frame: 0,
                        maxFrame: 20
                    });
                    
                    // 创建粒子效果
                    createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff9f1c', 15);
                    
                    // 增加分数
                    gameState.score += 10;
                    
                    // 播放爆炸音效
                    playSound(200, 0.2, 'sawtooth');
                }
            });
        });
        
        // 玩家与敌机碰撞
        gameState.enemies.forEach((enemy, index) => {
            if (
                gameState.player.x < enemy.x + enemy.width &&
                gameState.player.x + gameState.player.width > enemy.x &&
                gameState.player.y < enemy.y + enemy.height &&
                gameState.player.y + gameState.player.height > enemy.y
            ) {
                // 移除敌机
                gameState.enemies.splice(index, 1);
                
                // 添加爆炸效果
                gameState.explosions.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height / 2,
                    radius: 20,
                    frame: 0,
                    maxFrame: 30
                });
                
                // 创建粒子效果
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#e63946', 20);
                
                // 减少生命值
                gameState.lives--;
                
                // 播放受击音效
                playSound(100, 0.3, 'triangle');
                
                // 检查游戏是否结束
                if (gameState.lives <= 0) {
                    endGame();
                }
            }
        });
    }
    
    // 开始游戏
    function startGame() {
        // 初始化音频
        initAudio();
        
        if (gameState.running && !gameState.gameOver) return;
        
        // 重置游戏状态
        gameState = {
            running: true,
            paused: false,
            score: 0,
            lives: 3,
            player: {
                x: 200,
                y: 600,
                width: 64,
                height: 64,
                speed: 5
            },
            bullets: [],
            enemies: [],
            explosions: [],
            particles: [],
            stars: gameState.stars || [],
            keys: {},
            lastShot: 0,
            shotCooldown: 250,
            enemySpawnTimer: 0,
            enemySpawnInterval: 2000,
            gameOver: false
        };
        
        // 更新按钮状态
        startBtn.textContent = '重新开始';
        pauseBtn.textContent = '暂停';
        pauseBtn.disabled = false;
        
        // 开始游戏循环
        requestAnimationFrame(updateGame);
    }
    
    // 暂停/继续游戏
    function togglePause() {
        if (!gameState.running || gameState.gameOver) return;
        
        gameState.paused = !gameState.paused;
        pauseBtn.textContent = gameState.paused ? '继续' : '暂停';
        
        if (!gameState.paused) {
            requestAnimationFrame(updateGame);
        }
    }
    
    // 结束游戏
    function endGame() {
        gameState.gameOver = true;
        gameState.running = false;
        
        // 显示游戏结束画面
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', gameCanvas.width / 2, gameCanvas.height / 2 - 50);
        
        ctx.font = 'bold 24px Orbitron';
        ctx.fillText(`最终得分: ${gameState.score}`, gameCanvas.width / 2, gameCanvas.height / 2);
        
        // 显示"再来一局"按钮
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(gameCanvas.width / 2 - 80, gameCanvas.height / 2 + 30, 160, 40);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Orbitron';
        ctx.fillText('再来一局', gameCanvas.width / 2, gameCanvas.height / 2 + 55);
        
        // 更新按钮状态
        pauseBtn.disabled = true;
        
        // 播放游戏结束音效
        playSound(150, 0.5, 'sine');
    }
    
    // 重置游戏
    function resetGame() {
        gameState.running = false;
        gameState.paused = false;
        gameState.gameOver = false;
        
        // 重置按钮状态
        startBtn.textContent = '开始游戏';
        pauseBtn.textContent = '暂停';
        pauseBtn.disabled = true;
        
        // 绘制初始画面
        drawGameScreen(ctx, '游戏已重置\n点击"开始游戏"按钮开始');
    }
    
    // 键盘事件处理
    document.addEventListener('keydown', function(e) {
        gameState.keys[e.key] = true;
        
        // 防止方向键滚动页面
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', function(e) {
        gameState.keys[e.key] = false;
    });
    
    // 按钮事件
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    
    // 点击画布上的"再来一局"按钮
    gameCanvas.addEventListener('click', function(e) {
        if (gameState.gameOver) {
            const rect = gameCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 检查是否点击了"再来一局"按钮
            if (x >= gameCanvas.width / 2 - 80 && x <= gameCanvas.width / 2 + 80 &&
                y >= gameCanvas.height / 2 + 30 && y <= gameCanvas.height / 2 + 70) {
                startGame();
            }
        }
    });
    
    // 点击预览区域开始游戏
    playOverlay.addEventListener('click', function() {
        document.getElementById('preview').scrollIntoView({ behavior: 'smooth' });
        setTimeout(startGame, 500);
    });
    
    // 截图轮播功能
    const screenshotItems = document.querySelectorAll('.screenshot-item');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    
    // 显示指定索引的幻灯片
    function showSlide(index) {
        // 隐藏所有幻灯片
        screenshotItems.forEach(item => item.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // 显示当前幻灯片
        screenshotItems[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentSlide = index;
    }
    
    // 下一张幻灯片
    function nextSlide() {
        const newIndex = (currentSlide + 1) % screenshotItems.length;
        showSlide(newIndex);
    }
    
    // 上一张幻灯片
    function prevSlide() {
        const newIndex = (currentSlide - 1 + screenshotItems.length) % screenshotItems.length;
        showSlide(newIndex);
    }
    
    // 自动轮播
    let slideInterval = setInterval(nextSlide, 5000);
    
    // 重置轮播定时器
    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // 按钮事件
    nextBtn.addEventListener('click', function() {
        nextSlide();
        resetSlideInterval();
    });
    
    prevBtn.addEventListener('click', function() {
        prevSlide();
        resetSlideInterval();
    });
    
    // 点击指示点
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
            resetSlideInterval();
        });
    });
    
    // 下载按钮事件
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 创建提示消息
            const message = document.createElement('div');
            message.className = 'download-message';
            message.textContent = '下载功能仅为演示，实际游戏请访问原始项目';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 10000;
                max-width: 300px;
                text-align: center;
            `;
            
            document.body.appendChild(message);
            
            // 3秒后移除提示
            setTimeout(() => {
                document.body.removeChild(message);
            }, 3000);
        });
    });
    
    // 初始化
    initCanvas();
    
    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 添加滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 观察所有section
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});
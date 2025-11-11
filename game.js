// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
const setCanvasSize = () => {
    const maxWidth = Math.min(window.innerWidth - 40, 800);
    const maxHeight = Math.min(window.innerHeight - 200, 600);
    canvas.width = Math.min(maxWidth, 800);
    canvas.height = Math.min(maxHeight, 600);
};
setCanvasSize();

// Game variables
let gameState = 'start'; // start, playing, win, lose
let score = 0;
let lives = 3;

// Paddle
const paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    speed: 8,
    dx: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 4,
    dx: 4,
    dy: -4
};

// Blocks
const blockRowCount = 5;
const blockColumnCount = 8;
const blockWidth = 75;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 50;
const blockOffsetLeft = (canvas.width - (blockColumnCount * (blockWidth + blockPadding))) / 2;

const blocks = [];
const blockColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

// Initialize blocks
const initBlocks = () => {
    blocks.length = 0;
    for (let row = 0; row < blockRowCount; row++) {
        blocks[row] = [];
        for (let col = 0; col < blockColumnCount; col++) {
            blocks[row][col] = {
                x: blockOffsetLeft + col * (blockWidth + blockPadding),
                y: blockOffsetTop + row * (blockHeight + blockPadding),
                status: 1,
                color: blockColors[row % blockColors.length]
            };
        }
    }
};

// Draw paddle
const drawPaddle = () => {
    ctx.fillStyle = '#4ECCA3';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4ECCA3';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
};

// Draw ball
const drawBall = () => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFD700';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
};

// Draw blocks
const drawBlocks = () => {
    for (let row = 0; row < blockRowCount; row++) {
        for (let col = 0; col < blockColumnCount; col++) {
            const block = blocks[row][col];
            if (block.status === 1) {
                ctx.fillStyle = block.color;
                ctx.fillRect(block.x, block.y, blockWidth, blockHeight);
                
                // Add highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(block.x, block.y, blockWidth, blockHeight / 2);
            }
        }
    }
};

// Draw score and lives
const drawInfo = () => {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
};

// Move paddle
const movePaddle = () => {
    paddle.x += paddle.dx;
    
    // Wall detection
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
};

// Move ball
const moveBall = () => {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (left and right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }
    
    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }
    
    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.dy > 0
    ) {
        // Calculate where on paddle the ball hit (for angle variation)
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -speed * Math.cos(angle);
    }
    
    // Bottom collision (lose life)
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameState = 'lose';
            showOverlay('Game Over!', `Final Score: ${score}`);
        } else {
            resetBall();
        }
    }
};

// Block collision detection
const blockCollision = () => {
    for (let row = 0; row < blockRowCount; row++) {
        for (let col = 0; col < blockColumnCount; col++) {
            const block = blocks[row][col];
            if (block.status === 1) {
                if (
                    ball.x > block.x &&
                    ball.x < block.x + blockWidth &&
                    ball.y > block.y &&
                    ball.y < block.y + blockHeight
                ) {
                    ball.dy *= -1;
                    block.status = 0;
                    score += 10;
                    
                    // Check if all blocks are destroyed
                    if (checkWin()) {
                        gameState = 'win';
                        showOverlay('You Win!', `Final Score: ${score}`);
                    }
                }
            }
        }
    }
};

// Check if player won
const checkWin = () => {
    for (let row = 0; row < blockRowCount; row++) {
        for (let col = 0; col < blockColumnCount; col++) {
            if (blocks[row][col].status === 1) {
                return false;
            }
        }
    }
    return true;
};

// Reset ball position
const resetBall = () => {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;
};

// Show overlay
const showOverlay = (title, message) => {
    const overlay = document.getElementById('gameOverlay');
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').textContent = message;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
    overlay.classList.remove('hidden');
};

// Hide overlay
const hideOverlay = () => {
    document.getElementById('gameOverlay').classList.add('hidden');
};

// Reset game
const resetGame = () => {
    score = 0;
    lives = 3;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    resetBall();
    initBlocks();
    drawInfo();
};

// Draw everything
const draw = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBlocks();
    drawPaddle();
    drawBall();
    drawInfo();
};

// Update game state
const update = () => {
    if (gameState === 'playing') {
        movePaddle();
        moveBall();
        blockCollision();
    }
    
    draw();
    requestAnimationFrame(update);
};

// Mouse/Touch controls
const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX;
    
    if (e.type.includes('touch')) {
        mouseX = e.touches[0].clientX - rect.left;
    } else {
        mouseX = e.clientX - rect.left;
    }
    
    paddle.x = mouseX - paddle.width / 2;
    
    // Keep paddle in bounds
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
};

// Event listeners
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchmove', handleMouseMove);

document.getElementById('gameOverlay').addEventListener('click', () => {
    if (gameState === 'start' || gameState === 'win' || gameState === 'lose') {
        gameState = 'playing';
        resetGame();
        hideOverlay();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    setCanvasSize();
    
    // Adjust positions proportionally
    paddle.x = (paddle.x / oldWidth) * canvas.width;
    ball.x = (ball.x / oldWidth) * canvas.width;
    ball.y = (ball.y / oldHeight) * canvas.height;
    
    // Reinitialize blocks for new size
    initBlocks();
});

// Initialize game
initBlocks();
draw();
update();

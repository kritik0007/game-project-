const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

class Fighter {
    constructor(x, color) {
        this.x = x;
        this.y = 330;
        this.width = 60;
        this.height = 140;
        this.color = color;
        this.health = 100;
        this.velocityY = 0;
        this.isJumping = false;
        this.attackCooldown = 0;
        this.isHit = false;
    }

    draw() {
        ctx.fillStyle = this.isHit ? "red" : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.velocityY;
        this.velocityY += 0.6;

        if (this.y >= 330) {
            this.y = 330;
            this.isJumping = false;
        }

        if (this.attackCooldown > 0) this.attackCooldown--;

        this.draw();
    }

    attack(target) {
        if (this.attackCooldown === 0 &&
            Math.abs(this.x - target.x) < 80) {

            target.health -= 10;
            target.x += (this.x < target.x ? 20 : -20); // knockback
            target.isHit = true;
            setTimeout(() => target.isHit = false, 100);

            this.attackCooldown = 40;
        }
    }
}

const player = new Fighter(200, "black");
const enemy = new Fighter(600, "gray");

function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#2c3e50");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 470, canvas.width, 30);
}

function updateHealthBars() {
    document.getElementById("playerHealth").style.width = player.health + "%";
    document.getElementById("enemyHealth").style.width = enemy.health + "%";
}

function enemyAI() {
    if (enemy.health <= 0) return;

    if (enemy.x > player.x) enemy.x -= 1.5;
    if (enemy.x < player.x) enemy.x += 1.5;

    if (Math.random() < 0.02) {
        enemy.attack(player);
    }
}

function showGameOver(text) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText(text, canvas.width/2 - 120, canvas.height/2);
}

function gameLoop() {
    drawBackground();

    if (keys["a"]) player.x -= 4;
    if (keys["d"]) player.x += 4;

    if (keys["w"] && !player.isJumping) {
        player.velocityY = -12;
        player.isJumping = true;
    }

    if (keys[" "]) player.attack(enemy);

    player.update();
    enemy.update();
    enemyAI();
    updateHealthBars();

    if (player.health > 0 && enemy.health > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        showGameOver(player.health > 0 ? "YOU WIN" : "YOU LOSE");
    }
}

gameLoop();
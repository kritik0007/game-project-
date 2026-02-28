console.log("Correct game.js loaded");

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
        this.energy = 0;
        this.maxEnergy = 100;
        this.dashCooldown = 0;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.comboStep = 0;
        this.comboTimer = 0;

        this.isHit = false;
    }

    draw() {
    ctx.fillStyle = this.isHit ? "red" : this.color;

    const centerX = this.x + this.width / 2;
    const headY = this.y - 20;

    // Head
    ctx.beginPath();
    ctx.arc(centerX, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillRect(centerX - 5, this.y, 10, 50);

    // Arms
    ctx.fillRect(centerX - 25, this.y + 10, 50, 8);

    // Legs
    ctx.fillRect(centerX - 15, this.y + 50, 10, 40);
    ctx.fillRect(centerX + 5, this.y + 50, 10, 40);

    // Attack hitbox debug
    if (this.isAttacking) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x + this.width, this.y + 30, 40, 40);
    }
}
    dash(direction) {
    if (this.dashCooldown > 0) return;

    this.x += direction * 60;
    this.dashCooldown = 50;
    }

    update() {
        this.y += this.velocityY;
        this.velocityY += 0.6;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.y >= 330) {
            this.y = 330;
            this.velocityY = 0;
            this.isJumping = false;
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.comboTimer > 0) this.comboTimer--;
        else this.comboStep = 0;

        this.draw();
    }

    attack(target) {
        if (this.attackCooldown > 0) return;

        this.isAttacking = true;
        this.attackCooldown = 25;
        this.energy += 10;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;

        this.comboStep++;
        if (this.comboStep > 3) this.comboStep = 1;

        this.comboTimer = 40;

        const hitX = this.x + this.width;
        const hitY = this.y + 40;

        if (
            hitX < target.x + target.width &&
            hitX + 40 > target.x &&
            hitY < target.y + target.height &&
            hitY + 40 > target.y
        ) {
            let damage = 5 * this.comboStep;
            target.health -= damage;
            target.x += 15 * this.comboStep;
            target.isHit = true;
            setTimeout(() => target.isHit = false, 100);
        }

        setTimeout(() => this.isAttacking = false, 150);
    }
    specialAttack(target) {
    if (this.energy < 50) return;

    this.energy -= 50;
    this.isAttacking = true;

    if (Math.abs(this.x - target.x) < 120) {
        target.health -= 25;
        target.x += (this.x < target.x ? 50 : -50);
        target.isHit = true;
        setTimeout(() => target.isHit = false, 200);
    }

    setTimeout(() => this.isAttacking = false, 300);
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

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 470, canvas.width, 30);
}

function updateHealthBars() {
    document.getElementById("playerHealth").style.width = player.health + "%";
    document.getElementById("enemyHealth").style.width = enemy.health + "%";
    document.getElementById("energyBar").style.width = player.energy + "%";
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
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText(text, canvas.width / 2 - 120, canvas.height / 2);
}

function gameLoop() {
    drawBackground();
    if (keys["e"]) {
    player.specialAttack(enemy);
    }
    if (keys["Shift"] && keys["d"]) player.dash(1);
    if (keys["Shift"] && keys["a"]) player.dash(-1);

    if (keys["a"]) player.x -= 4;
    if (keys["d"]) player.x += 4;

    if (keys["w"] && !player.isJumping && player.y === 330) {
    player.velocityY = -12;
    player.isJumping = true;
}

    if (keys[" "] && !player.isAttacking) {
        player.attack(enemy);
    }

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
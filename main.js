const buttons = new Set();
const img = document.getElementById('block');
const enemyImg = document.getElementById('enemy');
const bindBtn = document.getElementById('bind');
const startBtn = document.getElementById('start');
const scoreEl = document.getElementById('score');
const orange = document.getElementById('orange');
const graphicsBtn = document.getElementById('graphics');
const hintBtn = document.getElementById('hint');
const popupOverlay = document.getElementById('popup-overlay');
const popupClose = document.getElementById('popup-close');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsClose = document.getElementById('settings-close');
const settingsBtn = document.getElementById('settings-btn');

hintBtn.addEventListener('click', () => {
    settingsOverlay.classList.add('hidden');
    popupOverlay.classList.remove('hidden');
});
popupClose.addEventListener('click', () => popupOverlay.classList.add('hidden'));
popupOverlay.addEventListener('click', e => {
    if (e.target === popupOverlay) popupOverlay.classList.add('hidden');
});
settingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
settingsClose.addEventListener('click', () => settingsOverlay.classList.add('hidden'));
settingsOverlay.addEventListener('click', e => {
    if (e.target === settingsOverlay) settingsOverlay.classList.add('hidden');
});
let activeFrames = 2;
const activeFramesInput = document.getElementById('active-frames');
let overheadFrames = 18;
const overheadFramesInput = document.getElementById('overhead-frames');
let orangeProb = 5;
let jumpyProb = 30;
const orangeProbInput = document.getElementById('orange-prob');
const jumpyProbInput = document.getElementById('jumpy-prob');
const normalProbEl = document.getElementById('normal-prob');
let jumpAttackProb = 80;
const jumpAttackInput = document.getElementById('jump-attack-prob');
const faintProbEl = document.getElementById('faint-prob');
let orangeAttackProb = 80;
const orangeAttackInput = document.getElementById('orange-attack-prob');
const orangeFaintProbEl = document.getElementById('orange-faint-prob');
let normalFramesMin = 6;
let normalFramesMax = 18;
const normalFramesMinInput = document.getElementById('normal-frames-min');
const normalFramesMaxInput = document.getElementById('normal-frames-max');
let target = ' ';
let binding = false;
const keyDisplay = {
    ' ': '␣',
    'Backspace': '⌫',
    'Tab': '⇥',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Enter': '↵',
};

let frame = 0;
let moveFrames = 10;
const attack = {
    None: 0,
    Jump: 1,
    Normal: 2,
    High: 3,
    Charge: 4,
    Orange: 5
};
let currentAttack = attack.None;
let attackList = [];
let enemyY = 0;

let hitPlayed = false;

let gameState = 'idle';
let score = 0;
let simpleGraphics = false;

bindBtn.addEventListener('click', () => {
    if (gameState === 'playing' || gameState === 'countdown') return;
    binding = true;
    gpBindingDone = false;
    bindBtn.textContent = 'Binding...';
    pollGamepads();
});

const modeBtn = document.getElementById('mode');
const customSettings = document.getElementById('custom-settings');
let playItYourWay = false;

modeBtn.addEventListener('click', () => {
    playItYourWay = !playItYourWay;
    modeBtn.textContent = playItYourWay ? 'Play it Your Way' : 'Default';
    customSettings.classList.toggle('disabled', !playItYourWay);
    if (!playItYourWay) {
        activeFrames = 2;
        activeFramesInput.value = 2;
        overheadFrames = 18;
        overheadFramesInput.value = 18;
        orangeProb = 5;
        orangeProbInput.value = 5;
        jumpyProb = 30;
        jumpyProbInput.value = 30;
        normalProbEl.textContent = 65;
        jumpAttackProb = 80;
        jumpAttackInput.value = 80;
        faintProbEl.textContent = 20;
        orangeAttackProb = 80;
        orangeAttackInput.value = 80;
        orangeFaintProbEl.textContent = 20;
        normalFramesMin = 6;
        normalFramesMinInput.value = 6;
        normalFramesMax = 18;
        normalFramesMaxInput.value = 18;
    }
});

customSettings.classList.add('disabled');

activeFramesInput.addEventListener('input', () => {
    activeFrames = Math.min(5, Math.max(1, Number(activeFramesInput.value)));
    activeFramesInput.value = activeFrames;
});

overheadFramesInput.addEventListener('input', () => {
    overheadFrames = Math.max(1, Number(overheadFramesInput.value));
    overheadFramesInput.value = overheadFrames;
});

function updateProbs() {
    orangeProb = Math.max(0, Math.min(100 - jumpyProb, Number(orangeProbInput.value)));
    orangeProbInput.value = orangeProb;
    jumpyProb = Math.max(0, Math.min(100 - orangeProb, Number(jumpyProbInput.value)));
    jumpyProbInput.value = jumpyProb;
    normalProbEl.textContent = 100 - orangeProb - jumpyProb;
}

orangeProbInput.addEventListener('input', updateProbs);
jumpyProbInput.addEventListener('input', updateProbs);

jumpAttackInput.addEventListener('input', () => {
    jumpAttackProb = Math.max(0, Math.min(100, Number(jumpAttackInput.value)));
    jumpAttackInput.value = jumpAttackProb;
    faintProbEl.textContent = 100 - jumpAttackProb;
});

orangeAttackInput.addEventListener('input', () => {
    orangeAttackProb = Math.max(0, Math.min(100, Number(orangeAttackInput.value)));
    orangeAttackInput.value = orangeAttackProb;
    orangeFaintProbEl.textContent = 100 - orangeAttackProb;
});

normalFramesMinInput.addEventListener('input', () => {
    normalFramesMin = Math.min(normalFramesMax, Math.max(1, Number(normalFramesMinInput.value)));
    normalFramesMinInput.value = normalFramesMin;
});

normalFramesMaxInput.addEventListener('input', () => {
    normalFramesMax = Math.max(normalFramesMin, Number(normalFramesMaxInput.value));
    normalFramesMaxInput.value = normalFramesMax;
});

graphicsBtn.addEventListener('click', () => {
    simpleGraphics = !simpleGraphics;
    graphicsBtn.textContent = simpleGraphics ? 'Normal' : 'Wacky';
    enemyImg.src = getAttackImg();
});

startBtn.addEventListener('click', () => {
    if (!window.assetsReady) return;
    if (gameState !== 'idle' && gameState !== 'gameover') return;
    startCountdown();
});

function setButtonsDisabled(disabled) {
    startBtn.disabled = disabled;
    settingsBtn.disabled = disabled;
}

function startCountdown() {
    gameState = 'countdown';
    setButtonsDisabled(true);
    score = 0;
    scoreEl.textContent = '3';
    resetEnemy();
    playSound('sounds/321.wav');
    setTimeout(() => {
        scoreEl.textContent = '2';
        playSound('sounds/321.wav');
    }, 1000);
    setTimeout(() => {
        scoreEl.textContent = '1';
        playSound('sounds/321.wav');
    }, 2000);
    setTimeout(() => {
        scoreEl.textContent = 'GO!';
        playSound('sounds/Go.wav');
    }, 3000);
    setTimeout(startGame, 3500);
}

function startGame() {
    gameState = 'playing';
    scoreEl.textContent = 'Score: 0';
}

function playSound(soundPath) {
    const snd = new Audio(soundPath);
    snd.currentTime = 0;
    snd.play().catch(() => { });
}

function gameOver() {
    gameState = 'gameover';
    scoreEl.textContent = `Game Over! Score: ${score}`;
    setButtonsDisabled(false);
}

function getAttackImg() {
    if (simpleGraphics) {
        if (currentAttack == attack.Jump) return 'imgs/enemy/jump/1.png';
        else if (currentAttack == attack.High) return 'imgs/enemy/overhead/1.png';
        else if (currentAttack == attack.Normal) return 'imgs/enemy/normal/1.png';
        else if (currentAttack == attack.None) return 'imgs/enemy/none/1.png';
        else if (currentAttack == attack.Charge) return 'imgs/enemy/orange/orange-1.png';
        else if (currentAttack == attack.Orange) return 'imgs/enemy/orange/orange-2.png';
    }
    if (currentAttack == attack.Jump) return `imgs/enemy/jump/${Math.floor(Math.random() * 7) + 1}.png`;
    else if (currentAttack == attack.High) return `imgs/enemy/overhead/${Math.floor(Math.random() * 7) + 1}.png`;
    else if (currentAttack == attack.Normal) return `imgs/enemy/normal/${Math.floor(Math.random() * 9) + 1}.png`;
    else if (currentAttack == attack.None) return `imgs/enemy/none/${Math.floor(Math.random() * 5) + 1}.png`;
    else if (currentAttack == attack.Charge) return 'imgs/enemy/orange/orange-1.png';
    else if (currentAttack == attack.Orange) return 'imgs/enemy/orange/orange-2.png';
}

function resetEnemy() {
    frame = 0;
    currentAttack = attack.None;
    attackList = [];
    enemyY = 0;
    enemyImg.style.transform = '';
    enemyImg.src = getAttackImg();
    orange.className = '';
}

function isHit() {
    const blockingLow = buttons.has(target);
    return frame <= activeFrames && ((currentAttack == attack.High && blockingLow) || (currentAttack == attack.Normal && !blockingLow) || (currentAttack == attack.Orange && blockingLow))
}

document.addEventListener('keydown', e => {
    if (binding || e.key === target) e.preventDefault();
    if (binding) { bindKey(e.key); return; }
    if (!e.repeat) { buttons.add(e.key); update(); }
});
document.addEventListener('keyup', e => {
    buttons.delete(e.key); update();
});

window.addEventListener('DOMContentLoaded', () => pollGamepads());
window.addEventListener('gamepadconnected', () => pollGamepads());
window.addEventListener('gamepaddisconnected', () => { buttons.clear(); update(); });

let gpBindingDone = false;

function pollGamepads() {
    const gamepads = navigator.getGamepads();
    let active = false;
    for (const gp of gamepads) {
        if (!gp) continue;
        gp.buttons.forEach((btn, i) => {
            if (btn.pressed) { buttons.add(`GP${gp.index}:B${i}`); active = true; }
            else { buttons.delete(`GP${gp.index}:B${i}`); }
        });
        gp.axes.forEach((val, i) => {
            const k = `GP${gp.index}:A${i}`;
            if (Math.abs(val) > 0.5) { buttons.add(k + (val < 0 ? '-' : '+')); active = true; }
            else { buttons.delete(k + '-'); buttons.delete(k + '+'); }
        });
    }
    if (binding && !gpBindingDone) {
        for (const gp of gamepads) {
            if (!gp) continue;
            for (let i = 0; i < gp.buttons.length; i++) {
                if (gp.buttons[i].pressed) { gpBindingDone = true; bindKey(`GP${gp.index}:B${i}`); break; }
            }
            if (gpBindingDone) break;
            for (let i = 0; i < gp.axes.length; i++) {
                const val = gp.axes[i];
                if (Math.abs(val) > 0.5) { gpBindingDone = true; bindKey(`GP${gp.index}:A${i}${val < 0 ? '-' : '+'}`); break; }
            }
        }
    }
}

document.addEventListener('blur', () => { buttons.clear(); update(); });

function bindKey(key) {
    target = key;
    binding = false;
    gpBindingDone = false;
    bindBtn.textContent = keyDisplay[target] || target;
    update();
}

function update() {
    const blockingLow = buttons.has(target);
    if (gameState === 'gameover' || isHit())
        img.src = 'imgs/dead.png';
    else if (currentAttack == attack.High && !blockingLow)
        img.src = 'imgs/high-hit.png';
    else if (currentAttack == attack.Normal && blockingLow)
        img.src = 'imgs/low-hit.png';
    else if (blockingLow)
        img.src = 'imgs/low-block.png';
    else img.src = 'imgs/high-block.png';
}

function fillAttackList() {
    if (attackList.length) return;
    const options = [
        [attack.None, attack.Normal],
        [attack.Normal],
        [attack.Jump, attack.High, attack.None],
        [attack.Jump, attack.None, attack.None],
        [attack.Charge, attack.Orange, attack.None],
        [attack.Charge, attack.None, attack.None],
    ];
    const orangeThreshold = orangeProb / 100;
    const jumpyThreshold = (orangeProb + jumpyProb) / 100;
    const choice = Math.random()
    if (choice <= orangeThreshold)
        attackList = options[Math.random() <= orangeAttackProb / 100 ? 4 : 5];
    else if (choice <= jumpyThreshold)
        attackList = options[Math.random() <= jumpAttackProb / 100 ? 2 : 3];
    else
        attackList = options[Math.random() <= 0.5 ? 0 : 1];
}

function makeEnemyAttack() {
    fillAttackList();
    currentAttack = attackList.shift();
    document.getElementById('orange').className = currentAttack == attack.Orange ? 'active' : '';
    if (currentAttack == attack.Jump) {
        moveFrames = overheadFrames;
        enemyY = -300;
        enemyImg.src = getAttackImg();
        enemyImg.style.transform = `translateY(${enemyY}px)`;
    } else if (currentAttack == attack.High) {
        moveFrames = 10;
        enemyY = -300;
        enemyImg.src = getAttackImg();
        enemyImg.style.transform = `translateY(${enemyY}px)`;
        playSound('sounds/hitHurt.wav');
    } else {
        if (enemyY) { enemyY = 0; enemyImg.style.transform = ''; }
        moveFrames = 10;
        if (currentAttack == attack.Normal) {
            moveFrames = normalFramesMin + Math.floor(Math.random() * (normalFramesMax - normalFramesMin + 1))
            enemyImg.src = getAttackImg();
            playSound('sounds/hitHurt.wav');
            if (gameState === 'playing') score++;
        } else if (currentAttack == attack.None) {
            moveFrames = 10
            enemyImg.src = getAttackImg();
        } else if (currentAttack == attack.Charge) {
            moveFrames = overheadFrames;
            enemyImg.src = getAttackImg();
            playSound('sounds/charge.wav');
        } else if (currentAttack == attack.Orange) {
            enemyImg.src = getAttackImg();
            playSound('sounds/hitHurt.wav');
            if (gameState === 'playing') score++;
        }
    }
    if (gameState === 'playing') scoreEl.textContent = 'Score: ' + score;
}

let lastTick = 0;

function tick(time) {
    if (time - lastTick >= 1000 / 60) {
        lastTick = time;
        pollGamepads();
        update();

        if (gameState === 'playing') {
            frame++;
            if (frame >= moveFrames) {
                frame = 0;
                makeEnemyAttack();
                update();
            }

            if (isHit() && !hitPlayed) {
                hitPlayed = true;
                if (gameState === 'playing') gameOver();
                setTimeout(() => playSound('sounds/explosion.wav'), 50);
            } else if (!isHit()) {
                hitPlayed = false;
            }
        } else if (gameState === 'idle') {
            frame = 0;
            currentAttack = attack.None;
        }
    }
    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

const images = [
    'imgs/dead.png',
    'imgs/high-block.png',
    'imgs/high-hit.png',
    'imgs/low-block.png',
    'imgs/low-hit.png',
    'imgs/enemy/orange/orange.png',
    'imgs/enemy/orange/orange-1.png',
    'imgs/enemy/orange/orange-2.png',
];

for (let i = 1; i <= 7; i++) images.push(`imgs/enemy/jump/${i}.png`);
for (let i = 1; i <= 7; i++) images.push(`imgs/enemy/overhead/${i}.png`);
for (let i = 1; i <= 9; i++) images.push(`imgs/enemy/normal/${i}.png`);
for (let i = 1; i <= 5; i++) images.push(`imgs/enemy/none/${i}.png`);

let loaded = 0;
const total = images.length;
const loaderScoreEl = document.getElementById('score');

loaderScoreEl.textContent = `Loading... 0/${total}`;

images.forEach(src => {
    const img = new Image();
    img.onload = img.onerror = () => {
        loaded++;
        loaderScoreEl.textContent = `Loading... ${loaded}/${total}`;
        if (loaded === total) {
            window.assetsReady = true;
            loaderScoreEl.textContent = 'Score: 0';
        }
    };
    img.src = src;
});

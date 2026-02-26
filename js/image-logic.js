import { layer, tr, config } from './canvas.js';

export let imagesData = [];
let currentDistPattern = 'jitter';

export async function handleFiles(files) {
    const assetGrid = document.getElementById('assetGrid');
    
    for (const file of Array.from(files)) {
        const url = await new Promise(res => {
            const reader = new FileReader();
            reader.onload = e => res(e.target.result);
            reader.readAsDataURL(file);
        });
        const imgObj = new Image();
        imgObj.src = url;
        await new Promise(res => imgObj.onload = res);

        const kImg = new Konva.Image({
            image: imgObj,
            draggable: true,
            name: 'user-image',
            strokeWidth: 0 
        });

        const thumb = document.createElement('img');
        thumb.src = url;
        thumb.className = "asset-thumb";
        assetGrid.appendChild(thumb);

        thumb.onclick = () => selectImage(kImg);
        kImg.on('click tap dragstart', () => selectImage(kImg));

        layer.add(kImg);
        // Added layout property to store state
        imagesData.push({ 
            kImg, 
            origW: imgObj.width, 
            origH: imgObj.height, 
            thumb,
            layout: { x: 0, y: 0, rotation: 0, baseScale: 1 } 
        });
    }
    shuffleLayout(currentDistPattern);
}

// 1. Separate Scaling from Positioning
export function applyGlobalScale() {
    const userScaleSlider = Number(document.getElementById('globalScale').value);
    const userScaleMult = Math.pow(1.5, userScaleSlider); 

    imagesData.forEach(data => {
        const finalScale = data.layout.baseScale * userScaleMult;
        data.kImg.setAttrs({
            x: data.layout.x,
            y: data.layout.y,
            rotation: data.layout.rotation,
            scaleX: finalScale,
            scaleY: finalScale
        });
    });
    layer.batchDraw();
}

// 2. Layout Logic (Jitter, Orbital, Spiral, Grid)
export function shuffleLayout(pattern) {
    currentDistPattern = pattern;
    const count = imagesData.length;
    if (count === 0) return;

    const autoScaleFactor = Math.max(0.2, 1.0 / Math.sqrt(count));
    const centerX = config.width / 2;
    const centerY = config.height / 2;

    imagesData.forEach((data, i) => {
        let posX, posY, rotation, radialFactor = 1;

        if (pattern === 'grid') {
            const cols = Math.ceil(Math.sqrt(count * (config.width / config.height)));
            const cellW = config.width / cols;
            const cellH = config.height / Math.ceil(count / cols);
            posX = ((i % cols) + 0.5) * cellW;
            posY = (Math.floor(i / cols) + 0.5) * cellH;
            rotation = 0;
        } 
        else if (pattern === 'jitter') {
            const cols = Math.ceil(Math.sqrt(count * (config.width / config.height)));
            const cellW = config.width / cols;
            const cellH = config.height / Math.ceil(count / cols);
            const baseX = ((i % cols) + 0.5) * cellW;
            const baseY = (Math.floor(i / cols) + 0.5) * cellH;
            posX = baseX + (Math.random() - 0.5) * cellW * 1.2;
            posY = baseY + (Math.random() - 0.5) * cellH * 1.2;
            rotation = (Math.random() - 0.5) * 40;
        } 
        else if (pattern === 'orbital') {
            const angle = (i / count) * Math.PI * 2;
            const radius = Math.min(centerX, centerY) * 0.8 * Math.sqrt((i + 1) / count);
            posX = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100;
            posY = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100;
            rotation = (angle * 180 / Math.PI) + 90 + (Math.random() - 0.5) * 20;
            radialFactor = 1.3 - (radius / Math.min(centerX, centerY));
        }
        else if (pattern === 'spiral') {
            const angle = 0.5 * i;
            const radius = 40 * angle;
            posX = centerX + Math.cos(angle) * radius;
            posY = centerY + Math.sin(angle) * radius;
            rotation = (angle * 180 / Math.PI) % 360;
            radialFactor = 1.1;
        }

        // Store layout state
        const baseSizeScale = Math.min(config.width / data.origW, config.height / data.origH);
        data.layout = {
            x: posX,
            y: posY,
            rotation: rotation,
            baseScale: baseSizeScale * autoScaleFactor * radialFactor * (0.9 + Math.random() * 0.2)
        };
        
        data.kImg.setAttrs({
            offsetX: data.origW / 2,
            offsetY: data.origH / 2
        });
    });

    applyGlobalScale();
}

function selectImage(kImg) {
    tr.nodes([kImg]);
    kImg.moveToTop();
    tr.moveToTop();
    document.getElementById('imageEditSection').classList.remove('opacity-30', 'pointer-events-none');
    document.querySelectorAll('.asset-thumb').forEach(t => t.classList.remove('selected'));
    const data = imagesData.find(d => d.kImg === kImg);
    if (data) data.thumb.classList.add('selected');
    syncInputs(kImg);
    layer.batchDraw();
}

export function deleteSelected() {
    const selected = tr.nodes()[0];
    if (!selected) return;
    const index = imagesData.findIndex(d => d.kImg === selected);
    if (index > -1) {
        imagesData[index].thumb.remove();
        imagesData.splice(index, 1);
    }
    tr.nodes([]);
    selected.destroy();
    layer.draw();
}

export function clearAll() {
    imagesData.forEach(data => {
        data.kImg.destroy();
        data.thumb.remove();
    });
    imagesData = [];
    tr.nodes([]);
    layer.draw();
}

export function updateImageStyle(node) {
    const radius = Number(document.getElementById('rangeRadius').value);
    const shadow = Number(document.getElementById('rangeShadow').value);
    const bColor = document.getElementById('borderColor').value;
    const bWidth = Number(document.getElementById('borderWidth').value) * 5;

    node.setAttrs({
        cornerRadius: radius,
        shadowBlur: shadow,
        stroke: bColor,
        strokeWidth: bWidth,
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowOffset: { x: shadow/2, y: shadow/2 }
    });
    layer.batchDraw();
}

export function applyStylesToAll() {
    imagesData.forEach(data => updateImageStyle(data.kImg));
}

function syncInputs(node) {
    document.getElementById('rangeRadius').value = node.cornerRadius() || 0;
    document.getElementById('rangeShadow').value = node.shadowBlur() || 0;
    document.getElementById('borderColor').value = node.stroke() || '#000000';
    document.getElementById('borderWidth').value = (node.strokeWidth() / 5) || 0;
}
import { layer, tr, config } from './canvas.js';

export let imagesData = [];
let currentLayout = 'free'; // 'grid' or 'free'

// UTILITY: Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export async function handleFiles(files) {
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('emptyOverlay').classList.add('hidden');
    const newImages = [];

    for (const file of Array.from(files).filter(f => f.type.startsWith('image/'))) {
        const url = await new Promise(res => {
            const reader = new FileReader();
            reader.onload = e => res(e.target.result);
            reader.readAsDataURL(file);
        });
        const imgObj = new Image();
        imgObj.src = url;
        await new Promise(res => imgObj.onload = res);

        const kImg = new Konva.Image({ image: imgObj, draggable: true, name: 'user-image', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' });
        
        kImg.on('click tap dragstart', (e) => {
            tr.nodes([kImg]);
            kImg.moveToTop();
            tr.moveToTop();
            layer.batchDraw();
            document.getElementById('imageEditSection').classList.remove('opacity-30', 'pointer-events-none');
            syncInputs(kImg);
            // Deselect watermark controls if active
            const wmSection = document.getElementById('wmControls');
            if(wmSection) wmSection.classList.add('opacity-30', 'pointer-events-none');
        });

        layer.add(kImg);
        const data = { id: Math.random(), konvaImg: kImg, origW: imgObj.width, origH: imgObj.height, src: url };
        imagesData.push(data);
        newImages.push(data);
    }

    document.getElementById('loader').classList.add('hidden');
    updateUI();

    // Problem Solved: Decide whether to re-order based on current state
    if (imagesData.length === newImages.length || currentLayout === 'grid') {
        randomizeLayout(); // First load or if user is in 'grid' mode, randomize all
    } else {
        addImagesToLayout(newImages); // User is arranging, add new images to center without reordering
    }
}

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

// Problem Solved Logic: Add new images keeping existing order
function addImagesToLayout(newImages) {
    if (newImages.length === 0) return;

    const existingImages = imagesData.filter(img => !newImages.includes(img));
    
    // Calculate average scale of existing images to keep consistency
    let avgScale = 1;
    if (existingImages.length > 0) {
        const totalScale = existingImages.reduce((sum, data) => sum + data.konvaImg.scaleX(), 0);
        avgScale = totalScale / existingImages.length;
    } else {
        // Fallback for first load
        avgScale = Math.min(1080 / 1920, 1080 / 1080) * 0.5; // Arbitrary safe scale
    }

    newImages.forEach(data => {
        // Place new images in the center with some randomness
        data.konvaImg.setAttrs({
            x: config.width / 2 + (Math.random() - 0.5) * (config.width * 0.3),
            y: config.height / 2 + (Math.random() - 0.5) * (config.height * 0.3),
            scaleX: avgScale,
            scaleY: avgScale,
            rotation: (Math.random() - 0.5) * 20,
            offsetX: data.origW / 2,
            offsetY: data.origH / 2
        });
        data.konvaImg.moveToTop();
    });
    tr.moveToTop();
    currentLayout = 'free';
    layer.batchDraw();
}

export function randomizeLayout(type = 'grid') {
    if (imagesData.length === 0) return;
    const count = imagesData.length;

    if (type === 'grid') {
        currentLayout = 'grid';
        // Now it completely shuffles the order of imageData
        shuffleArray(imagesData);
        
        const aspectRatio = config.width / config.height;
        const cols = Math.ceil(Math.sqrt(count * aspectRatio));
        const rows = Math.ceil(count / cols);
        const cellW = config.width / cols;
        const cellH = config.height / rows;

        const gridPos = [];
        for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { gridPos.push({ x: c * cellW + cellW/2, y: r * cellH + cellH/2 }); } }
        
        // Match matched imagesData order
        imagesData.forEach((data, i) => {
            const pos = gridPos[i % gridPos.length];
            const baseScale = Math.min(cellW / data.origW, cellH / data.origH) * 0.9;
            const scale = baseScale * (0.9 + Math.random() * 0.1);
            data.konvaImg.setAttrs({
                x: pos.x, y: pos.y,
                scaleX: scale, scaleY: scale,
                rotation: 0,
                offsetX: data.origW / 2, offsetY: data.origH / 2
            });
        });
    } else {
        currentLayout = 'free';
        // Jitter / Orbital (Keep existing order, but add jitter)
        imagesData.forEach((data) => {
             // ... jitter logic can go here if needed, or keep free arrangement
        });
    }
    layer.batchDraw();
}

function updateUI() {
    const grid = document.getElementById('assetGrid');
    const status = document.getElementById('statusDisplay');
    grid.innerHTML = imagesData.length ? imagesData.map(img => `<div class="aspect-square border border-black bg-white"><img src="${img.src}" class="w-full h-full object-cover"></div>`).join('') : 'No Images';
    if(status) status.innerHTML = `SYSTEM_STATUS: READY<br>OUTPUT: ${config.width}x${config.height}`;
}

export function updateImageStyle(node) {
    node.cornerRadius(Number(document.getElementById('rangeRadius').value));
    node.shadowBlur(Number(document.getElementById('rangeShadow').value));
    node.stroke(document.getElementById('borderColor').value);
    node.strokeWidth(Number(document.getElementById('borderWidth').value));
    layer.batchDraw();
}

function syncInputs(node) {
    document.getElementById('rangeRadius').value = node.cornerRadius() || 0;
    document.getElementById('rangeShadow').value = node.shadowBlur() || 0;
    document.getElementById('borderColor').value = node.stroke() || '#000000';
    document.getElementById('borderWidth').value = node.strokeWidth() || 0;
}

export function clearAll() {
    imagesData.forEach(d => d.konvaImg.destroy());
    imagesData = [];
    tr.nodes([]);
    updateUI();
}
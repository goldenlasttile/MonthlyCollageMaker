import { initStage, fitStage, stage, layer, tr, config } from './canvas.js';
import { initBackground, updateBackground, updatePattern, updatePatternColor, updateOpacity } from './background.js';
import { applyPreset, handleResolutionChange } from './presets.js';
import { applyGlobalScale, handleFiles, shuffleLayout, updateImageStyle, imagesData, applyStylesToAll, deleteSelected, clearAll } from './image-logic.js';
import { addWatermark, updateWatermarkStyle, removeWatermark } from './watermark.js';

// Init with new HD default
config.width = 2160;
config.height = 2700;

// Init
initStage();
initBackground();
lucide.createIcons();
fitStage();

// 1. Resolution & Presets
document.getElementById('presetSelect').onchange = (e) => applyPreset(e.target.value);
document.getElementById('inputW').oninput = handleResolutionChange;
document.getElementById('inputH').oninput = handleResolutionChange;

// 2. Background & Patterns
document.getElementById('bgColor').oninput = (e) => updateBackground(e.target.value);
document.getElementById('patternColor').oninput = (e) => updatePatternColor(e.target.value);
document.getElementById('patternOpacity').oninput = (e) => updateOpacity(e.target.value);
document.querySelectorAll('.pat-btn').forEach(btn => {
    btn.onclick = () => updatePattern(btn.dataset.pattern);
});



// 3. Image Effects
document.getElementById('btnApplyAll').onclick = applyStylesToAll;
document.getElementById('btnDeleteSelected').onclick = deleteSelected;
document.getElementById('btnClearAll').onclick = clearAll;

const imgInputs = ['rangeRadius', 'rangeShadow', 'borderColor', 'borderWidth'];
imgInputs.forEach(id => {
    document.getElementById(id).oninput = () => {
        const selected = tr.nodes()[0];
        if (selected) updateImageStyle(selected);
    };
});

// 4. Core Actions
document.getElementById('dropZone').onclick = () => document.getElementById('fileInput').click();
document.getElementById('fileInput').onchange = (e) => handleFiles(e.target.files);
document.getElementById('btnApplyAll').onclick = applyStylesToAll;
document.getElementById('btnShuffle').onclick = () => {
    shuffleLayout();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00FF00', '#000000'] });
};

// Global Scale Slider Logic
let currentDistPattern = 'jitter';
// Distribution Buttons
document.querySelectorAll('.dist-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.dist-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDistPattern = btn.dataset.dist;
        shuffleLayout(currentDistPattern);
    };
});
// Grid Button
document.getElementById('btnGrid').onclick = () => {
    shuffleLayout('grid');
};

// Shuffle Button (uses current selected pattern)
document.getElementById('btnShuffle').onclick = () => {
    shuffleLayout(currentDistPattern);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00FF00', '#000000'] });
};

// Global Scale Slider (Now only calls applyGlobalScale)
document.getElementById('globalScale').oninput = (e) => {
    document.getElementById('scaleVal').innerText = parseFloat(e.target.value).toFixed(1);
    applyGlobalScale(false); 
};

document.getElementById('btnExport').onclick = () => {
    tr.nodes([]);
    // Correctly scale export back to internal resolution
    const dataURL = stage.toDataURL({ 
        pixelRatio: 1 / stage.scaleX() 
    });
    const link = document.createElement('a');
    link.download = `collage-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
};

// 5. Watermark Inputs (Right Sidebar) (New!)
document.getElementById('btnToggleWm').onclick = () => {
    const btn = document.getElementById('btnToggleWm');
    if (btn.innerHTML === 'Add') {
        const text = document.getElementById('wmText').value || '@YourID';
        const color = document.getElementById('wmColor').value;
        const size = Number(document.getElementById('wmSize').value);
        const opacity = Number(document.getElementById('wmOpacity').value);
        
        addWatermark(text, color, size, opacity);
        btn.innerHTML = 'Remove';
        btn.classList.add('bg-red-600', 'hover:bg-red-700');
    } else {
        removeWatermark();
        btn.innerHTML = 'Add';
        btn.classList.remove('bg-red-600', 'hover:bg-red-700');
    }
};

const wmStyleInputs = ['wmColor', 'wmSize', 'wmOpacity', 'wmText'];
wmStyleInputs.forEach(id => {
    document.getElementById(id).oninput = () => {
        const selected = tr.nodes()[0];
        // Only update if watermark itself is selected
        if (selected && selected.name() === 'watermark') updateWatermarkStyle();
    };
});

window.onresize = fitStage;
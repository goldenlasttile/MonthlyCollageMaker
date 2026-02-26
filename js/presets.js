import { config, fitStage } from './canvas.js';
import { updateBackground, resizeBackground } from './background.js';

const presets = {
    'hd-portrait': { w: 2160, h: 2700 }, // New Default
    'ig-story': { w: 1080, h: 1920 },
    'ig-post': { w: 1080, h: 1350 },
    'square': { w: 1080, h: 1080 },
    'a4': { w: 2480, h: 3508 }
};

export function applyPreset(key) {
    if (presets[key]) {
        const { w, h } = presets[key];
        document.getElementById('inputW').value = w;
        document.getElementById('inputH').value = h;
        updateResolution(w, h);
    }
}

export function handleResolutionChange() {
    const w = parseInt(document.getElementById('inputW').value) || 100;
    const h = parseInt(document.getElementById('inputH').value) || 100;
    document.getElementById('presetSelect').value = 'custom';
    updateResolution(w, h);
}

function updateResolution(w, h) {
    config.width = w;
    config.height = h;
    
    resizeBackground(w, h);
    fitStage();
    updateBackground(document.getElementById('bgColor').value);
}
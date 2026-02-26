import { layer, config } from './canvas.js';

let bgRect;
let patternGroup;
let opacity;
let patternColor = '#E3E3E3';
let currentPatternType = 'none';

export function initBackground() {
    bgRect = new Konva.Rect({ 
        width: config.width, 
        height: config.height, 
        fill: 'white', 
        name: 'background' 
    });
    patternGroup = new Konva.Group({ name: 'pattern', listening: false });

    layer.add(bgRect);
    layer.add(patternGroup);
    bgRect.moveToBottom();
    patternGroup.moveUp();
}

export function updateOpacity(op) {
    opacity = op;
    updatePattern(currentPatternType);
}

export function updatePatternColor(color) {
    patternColor = color;
    updatePattern(currentPatternType);
}

export function updateBackground(color) {
    if (bgRect) {
        bgRect.fill(color);
        layer.batchDraw();
    }
}

export function updatePattern(type) {
    currentPatternType = type;
    if (!patternGroup) return;
    
    patternGroup.destroyChildren();
    if(!patternColor)
        patternColor = '#E3E3E3';
    if(!opacity)
        opacity = 1;

    if (type === 'grid') {
        const gap = 100;
        for (let i = 0; i <= config.width; i += gap) {
            patternGroup.add(new Konva.Line({ points: [i, 0, i, config.height], stroke: patternColor, strokeWidth: 2, opacity: opacity }));
        }
        for (let j = 0; j <= config.height; j += gap) {
            patternGroup.add(new Konva.Line({ points: [0, j, config.width, j], stroke: patternColor, strokeWidth: 2, opacity: opacity }));
        }
    } else if (type === 'dots') {
        const gap = 80;
        for (let i = 0; i <= config.width; i += gap) {
            for (let j = 0; j <= config.height; j += gap) {
                patternGroup.add(new Konva.Circle({ x: i, y: j, radius: 4, fill: patternColor, opacity: opacity }));
            }
        }
    }
    layer.batchDraw();
}

export function resizeBackground(w, h) {
    if (bgRect) {
        bgRect.width(w);
        bgRect.height(h);
        updatePattern(currentPatternType);
    }
}
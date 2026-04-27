import { deselectWatermark } from './watermark.js';
export const config = { width: 2160, height: 2700 };
export let stage;
export let layer;
export let tr;

export function initStage() {
    // Create the main stage
    stage = new Konva.Stage({
        container: 'canvasContainer',
        width: config.width,
        height: config.height
    });

    // Create the primary interaction layer
    layer = new Konva.Layer();
    stage.add(layer);

    // Initialize the Transformer for object manipulation
    tr = new Konva.Transformer({
        boundBoxFunc: (oldBox, newBox) => {
            // Minimum size constraint
            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                return oldBox;
            }
            return newBox;
        }
    });
    layer.add(tr);

    // Deselect logic when clicking empty areas
    stage.on('click tap', (e) => {
        const isEmpty = e.target === stage || 
                        e.target.name() === 'background' || 
                        e.target.name() === 'pattern';
        
        if (isEmpty) {
        tr.nodes([]);
        
        const editSection = document.getElementById('imageEditSection');
        if (editSection) editSection.classList.remove('opacity-30', 'pointer-events-none');

        deselectWatermark();
        
        layer.draw();
    }
    });

    // Initial scale calculation
    fitStage();
}

export function fitStage() {
    const container = document.getElementById('canvasParent');
    if (!container || !stage) return;

    const padding = 40;
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;

    const scale = Math.min(
        availableWidth / config.width,
        availableHeight / config.height
    );

    const containerDiv = document.getElementById('canvasContainer');
    if (containerDiv) {
        containerDiv.style.width = `${Math.round(config.width * scale)}px`;
        containerDiv.style.height = `${Math.round(config.height * scale)}px`;
    }

    stage.width(Math.round(config.width * scale));
    stage.height(Math.round(config.height * scale));
    stage.scale({ x: scale, y: scale });
    stage.batchDraw();
}
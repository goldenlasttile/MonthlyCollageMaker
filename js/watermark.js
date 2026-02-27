import { layer, tr, config } from './canvas.js';

let watermarkNode;

export function addWatermark(text, color, size, opacity) {
    if (watermarkNode) watermarkNode.destroy(); // One watermark at a time

    watermarkNode = new Konva.Text({
        text: text,
        fontFamily: 'sans-serif',
        fontSize: size,
        fontStyle: 'bold',
        fill: color,
        opacity: opacity / 100,
        draggable: true,
        name: 'watermark',
        // Default position: Bottom Right with padding
        x: config.width - size * 5 - 40, 
        y: config.height - size - 40
    });

    watermarkNode.on('click tap dragstart', () => {
        tr.nodes([watermarkNode]);
        watermarkNode.moveToTop();
        tr.moveToTop();
        layer.batchDraw();
        
        // Show watermark controls, hide image controls
        document.getElementById('wmControls').classList.remove('opacity-30', 'pointer-events-none');
        const imgSection = document.getElementById('imageEditSection');
        if(imgSection) imgSection.classList.add('opacity-30', 'pointer-events-none');
        
        syncWatermarkInputs(watermarkNode);
    });

    layer.add(watermarkNode);
    watermarkNode.moveToTop();
    tr.moveToTop();
    layer.batchDraw();
    return watermarkNode;
}

export function updateWatermarkStyle() {
    if (!watermarkNode) return;
    const text = document.getElementById('wmText').value;
    const color = document.getElementById('wmColor').value;
    const size = Number(document.getElementById('wmSize').value);
    const opacity = Number(document.getElementById('wmOpacity').value);

    watermarkNode.setAttrs({
        text: text,
        fill: color,
        fontSize: size,
        opacity: opacity / 100
    });
    // offsetX/Y logic based on font-size to center rotation if needed (skipped for simplicity, rotates from Top Left)
    layer.batchDraw();
}

export function removeWatermark() {
    if (watermarkNode) {
        watermarkNode.destroy();
        watermarkNode = null;
        tr.nodes([]);
        document.getElementById('wmControls').classList.add('opacity-30', 'pointer-events-none');
        document.getElementById('wmText').value = '';
        document.getElementById('btnToggleWm').innerHTML = 'Add';
        layer.draw();
    }
}

function syncWatermarkInputs(node) {
    document.getElementById('wmText').value = node.text();
    document.getElementById('wmColor').value = node.fill();
    document.getElementById('wmSize').value = node.fontSize();
    document.getElementById('wmOpacity').value = node.opacity() * 100;
}
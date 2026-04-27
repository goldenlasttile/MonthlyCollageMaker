import { layer, tr, config } from './canvas.js';

let selectedTextNode = null;

export function handleWatermarkButton() {
    if (selectedTextNode) {
        removeWatermark();
    } else {
        const text = document.getElementById('wmText').value || '@YourID';
        const color = document.getElementById('wmColor').value;
        const size = Number(document.getElementById('wmSize').value);
        const opacity = Number(document.getElementById('wmOpacity').value);
        addWatermark(text, color, size, opacity);
    }
}

export function addWatermark(text, color, size, opacity) {
    const newTextNode = new Konva.Text({
        text: text,
        fontFamily: 'sans-serif',
        fontSize: size,
        fontStyle: 'bold',
        fill: color,
        opacity: opacity / 100,
        draggable: true,
        name: 'watermark',
        offsetX: 0,
        offsetY: 0
    });

    newTextNode.x(stage.width() / 2);
    newTextNode.y(stage.height() / 2);

    newTextNode.align('center');
    newTextNode.verticalAlign('middle');
    
    newTextNode.offsetX(newTextNode.width() / 2);
    newTextNode.offsetY(newTextNode.height() / 2);

    newTextNode.on('click tap dragstart', () => {
        selectNode(newTextNode);
    });

    layer.add(newTextNode);
    selectNode(newTextNode);
    return newTextNode;
}

function selectNode(node) {
    selectedTextNode = node;
    tr.nodes([node]);
    node.moveToTop();
    tr.moveToTop();
    layer.batchDraw();
    
    updateUIState(true);
    syncWatermarkInputs(node);
}

export function removeWatermark() {
    if (selectedTextNode) {
        selectedTextNode.destroy();
        selectedTextNode = null;
        tr.nodes([]);
        updateUIState(false);
        layer.draw();
    }
}

export function deselectWatermark() {
    selectedTextNode = null;
    updateUIState(false);
}

function updateUIState(isSelected) {
    const btn = document.getElementById('btnToggleWm');
    const wmControls = document.getElementById('wmControls');
    const imgSection = document.getElementById('imageEditSection');

    if (isSelected) {
        btn.innerHTML = 'Remove';
        btn.classList.add('bg-red-600', 'hover:bg-red-700');
        if (wmControls) wmControls.classList.remove('opacity-30', 'pointer-events-none');
        if (imgSection) imgSection.classList.add('opacity-30', 'pointer-events-none');
    } else {
        btn.innerHTML = 'Add';
        btn.classList.remove('bg-red-600', 'hover:bg-red-700');
        if (wmControls) wmControls.classList.add('opacity-30', 'pointer-events-none');
        document.getElementById('wmText').value = '';
    }
}

function syncWatermarkInputs(node) {
    document.getElementById('wmText').value = node.text();
    document.getElementById('wmColor').value = node.fill();
    document.getElementById('wmSize').value = node.fontSize();
    document.getElementById('wmOpacity').value = node.opacity() * 100;
}
import { layer, tr, config } from './canvas.js';

let selectedTextNode = null;

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
        x: config.width / 2 - 50,
        y: config.height / 2
    });

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
    
    const btn = document.getElementById('btnToggleWm');
    if (btn) {
        btn.innerHTML = 'Remove';
        btn.classList.add('bg-red-600', 'hover:bg-red-700');
        btn.onclick = () => removeWatermark();
    }

    const wmControls = document.getElementById('wmControls');
    if (wmControls) {
        wmControls.classList.remove('opacity-30', 'pointer-events-none');
    }

    const imgSection = document.getElementById('imageEditSection');
    if (imgSection) {
        imgSection.classList.add('opacity-30', 'pointer-events-none');
    }
    
    syncWatermarkInputs(node);
}

export function updateWatermarkStyle() {
    if (!selectedTextNode) return;
    
    const text = document.getElementById('wmText').value;
    const color = document.getElementById('wmColor').value;
    const size = Number(document.getElementById('wmSize').value);
    const opacity = Number(document.getElementById('wmOpacity').value);

    selectedTextNode.setAttrs({
        text: text,
        fill: color,
        fontSize: size,
        opacity: opacity / 100
    });
    layer.batchDraw();
}

export function removeWatermark() {
    if (selectedTextNode) {
        selectedTextNode.destroy();
        selectedTextNode = null;
        tr.nodes([]);
        
        const btn = document.getElementById('btnToggleWm');
        if (btn) {
            btn.innerHTML = 'Add';
            btn.classList.remove('bg-red-600', 'hover:bg-red-700');
            btn.onclick = () => {
                const text = document.getElementById('wmText').value || '@YourID';
                const color = document.getElementById('wmColor').value;
                const size = Number(document.getElementById('wmSize').value);
                const opacity = Number(document.getElementById('wmOpacity').value);
                addWatermark(text, color, size, opacity);
            };
        }

        const wmControls = document.getElementById('wmControls');
        if (wmControls) {
            wmControls.classList.add('opacity-30', 'pointer-events-none');
        }

        document.getElementById('wmText').value = '';
        layer.draw();
    }
}

function syncWatermarkInputs(node) {
    document.getElementById('wmText').value = node.text();
    document.getElementById('wmColor').value = node.fill();
    document.getElementById('wmSize').value = node.fontSize();
    document.getElementById('wmOpacity').value = node.opacity() * 100;
}
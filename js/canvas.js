export const config = { width: 2160, height: 2700 };
export let stage;
export let layer;
export let tr;

export function initStage() {
    stage = new Konva.Stage({ container: 'canvasContainer', width: config.width, height: config.height });
    layer = new Konva.Layer();
    stage.add(layer);
    tr = new Konva.Transformer({ boundBoxFunc: (oldBox, newBox) => (newBox.width < 20 || newBox.height < 20) ? oldBox : newBox });
    layer.add(tr);
    fitStage();
}

export function fitStage() {
    const container = document.getElementById('canvasParent');
    const padding = 60;
    const scale = Math.min((container.clientWidth - padding) / config.width, (container.clientHeight - padding) / config.height);
    const containerDiv = document.getElementById('canvasContainer');
    containerDiv.style.width = (config.width * scale) + 'px';
    containerDiv.style.height = (config.height * scale) + 'px';
    stage.width(config.width);
    stage.height(config.height);
    stage.scale({ x: scale, y: scale });
    stage.width(config.width * scale);
    stage.height(config.height * scale);
}
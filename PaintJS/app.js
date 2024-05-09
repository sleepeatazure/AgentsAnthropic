const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = new Pickr({
  el: '.color-picker',
  default: '#000000',
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      hex: true,
      rgba: true,
      hsva: true,
      input: true,
      clear: true,
      save: true
    }
  }
});
const pencilBtn = document.getElementById('pencil-btn');
const eraserBtn = document.getElementById('eraser-btn');
const clearBtn = document.getElementById('clear-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const brushSize = document.getElementById('brush-size');
const brushPreview = document.createElement('div');
brushPreview.classList.add('brush-preview');

let isDrawing = false;
let tool = 'pencil';
let currentColor = '#000000';
let currentBrushSize = 5;
let undoStack = [];
let redoStack = [];

// Set up event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
pencilBtn.addEventListener('click', () => changeTool('pencil'));
eraserBtn.addEventListener('click', () => changeTool('eraser'));
clearBtn.addEventListener('click', clearCanvas);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
saveBtn.addEventListener('click', saveDrawing);
loadBtn.addEventListener('change', loadDrawing);
brushSize.addEventListener('input', setBrushSize);
colorPicker.on('change', (color) => setColor(color.toHEXA().toString()));

// Drawing functions
function startDrawing(e) {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  redoStack = [];
  updateButtonStates();
}

function draw(e) {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = tool === 'pencil' ? currentColor : '#ffffff';
  ctx.lineWidth = currentBrushSize;
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
}

// Utility functions
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  redoStack = [];
  updateButtonStates();
}

function setColor(color) {
  currentColor = color;
}

function setBrushSize() {
  currentBrushSize = brushSize.value;
  brushPreview.style.width = `${currentBrushSize * 2}px`;
  brushPreview.style.height = `${currentBrushSize * 2}px`;
}

function changeTool(newTool) {
  tool = newTool;
  pencilBtn.classList.remove('active');
  eraserBtn.classList.remove('active');
  if (newTool === 'pencil') {
    pencilBtn.classList.add('active');
  } else {
    eraserBtn.classList.add('active');
  }
}

function updateButtonStates() {
  undoBtn.disabled = undoStack.length === 0;
  redoBtn.disabled = redoStack.length === 0;
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const prevState = undoStack.pop();
    ctx.putImageData(prevState, 0, 0);
    updateButtonStates();
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const nextState = redoStack.pop();
    ctx.putImageData(nextState, 0, 0);
    updateButtonStates();
  }
}

function saveDrawing() {
  const dataURL = canvas.toDataURL('image/png');
  saveBtn.href = dataURL;
}

function loadDrawing(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

// Add brush preview to the controls
document.querySelector('.actions').appendChild(brushPreview);
setBrushSize();
const canvas = document.getElementById('signatureCanvas');
const clearButton = document.getElementById('clearButton');
const submitButton = document.getElementById('submitButton');
const canvasHint = document.getElementById('canvasHint');
const aquaWindow = document.getElementById('aquaWindow');
const signingState = document.getElementById('signingState');
const successState = document.getElementById('successState');
const signerNumber = document.getElementById('signerNumber');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

let drawing = false;
let hasInk = false;
let lastPoint = null;
let signer = 1;

function configureContext(context) {
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = '#102a46';
  context.lineWidth = 3.4;
  context.shadowColor = 'rgba(2, 36, 66, .16)';
  context.shadowBlur = 1.5;
}

function prepareCanvas() {
  if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;
  const snapshot = hasInk ? canvas.toDataURL() : null;
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const context = canvas.getContext('2d');
  context.scale(ratio, ratio);
  configureContext(context);
  if (snapshot) {
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
    image.src = snapshot;
  }
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener('pointerdown', (event) => {
  canvas.setPointerCapture(event.pointerId);
  drawing = true;
  lastPoint = pointFromEvent(event);
});

canvas.addEventListener('pointermove', (event) => {
  if (!drawing || !lastPoint) return;
  const rect = canvas.getBoundingClientRect();
  const samples = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
  const context = canvas.getContext('2d');
  context.beginPath();
  context.moveTo(lastPoint.x, lastPoint.y);
  samples.forEach((sample) => context.lineTo(sample.clientX - rect.left, sample.clientY - rect.top));
  context.stroke();
  const finalSample = samples[samples.length - 1];
  lastPoint = { x: finalSample.clientX - rect.left, y: finalSample.clientY - rect.top };
  if (!hasInk) {
    hasInk = true;
    canvasHint.classList.add('hidden');
    clearButton.disabled = false;
    submitButton.disabled = false;
  }
});

function stopDrawing() {
  drawing = false;
  lastPoint = null;
}

canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);
canvas.addEventListener('pointerleave', stopDrawing);

clearButton.addEventListener('click', () => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  hasInk = false;
  canvasHint.classList.remove('hidden');
  clearButton.disabled = true;
  submitButton.disabled = true;
});

submitButton.addEventListener('click', () => {
  if (!hasInk) return;
  aquaWindow.classList.add('is-turning');
  signingState.classList.add('hidden');
  successState.classList.remove('hidden');
  step2.classList.add('active');
  step3.classList.add('active');
  window.setTimeout(() => {
    signer += 1;
    signerNumber.textContent = String(signer).padStart(2, '0');
    hasInk = false;
    successState.classList.add('hidden');
    signingState.classList.remove('hidden');
    aquaWindow.classList.remove('is-turning');
    step2.classList.remove('active');
    step3.classList.remove('active');
    canvasHint.classList.remove('hidden');
    clearButton.disabled = true;
    submitButton.disabled = true;
    window.setTimeout(prepareCanvas, 30);
  }, 2600);
});

window.addEventListener('resize', prepareCanvas);
prepareCanvas();

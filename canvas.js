const SNAP_DISTANCE = 10;

let canvas = null;
let ctx = null;
let points = [];
let points_history = [[...points]];
let lines = [];
let isDrag = false;
let dragIndex = -1;
let showGrab = false;
let showInsertPoint = false;
let showMove = false;
let isLeftMouseDown = false;
let lastCursorPos = null;

dimensionWidth.addEventListener('input', showInCodeBlock);
dimensionHeight.addEventListener('input', showInCodeBlock);

function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}

function eq(d1, d2) {
  return JSON.stringify(d1) === JSON.stringify(d2);
}

function createCanvas() {
  initCanvasVariable();
  canvas = document.createElement('canvas');
  setTimeout(() => {
    canvas.width = dropArea.offsetWidth;
    canvas.height = dropArea.offsetHeight;
  }, 100);
  dropArea.appendChild(canvas);
  canvas.style.position = 'absolute';
  ctx = canvas.getContext("2d");

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("contextmenu", handleContextMenu);
}

function initCanvasVariable() {
  canvas = null;
  ctx = null;
  points = [];
  points_history = [[...points]];
  lines = [];
  isDrag = false;
  dragIndex = -1;
  showGrab = false;
  showInsertPoint = false;
  showMove = false;
  isLeftMouseDown = false;
  lastCursorPos = null;
  showInCodeBlock();
}

function handleMouseDown(event) {
  const rect = canvas.getBoundingClientRect();
  const cursorPos = new Point(event.clientX - rect.left, event.clientY - rect.top);
  if (event.button === 0) { // left click
    isLeftMouseDown = true;
    lastCursorPos = { ...cursorPos };
  }
  else if (event.button === 2) { // right click
    handleRightClick(event);
  }
}

function handleMouseUp(event) {
  const rect = canvas.getBoundingClientRect();
  const cursorPos = new Point(event.clientX - rect.left, event.clientY - rect.top);
  if (event.button === 0) { // left click
    isLeftMouseDown = false;
    if (isDrag) {
      isDrag = false;
      points_history.push(deepCopy(points));
      showInCodeBlock();
      return;
    }
    if (showInsertPoint) {
      const insertIndex = getNearestLineIndex(cursorPos, lines);
      points.splice(insertIndex + 1, 0, { ...cursorPos });
      points_history.push(deepCopy(points));
      draw();
      showInCodeBlock();
    }
    else if (!showMove) {
      points.push({ ...cursorPos });
      points_history.push(deepCopy(points));
      draw();
      showInCodeBlock();
    }
  }
}

function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const cursorPos = new Point(event.clientX - rect.left, event.clientY - rect.top);
  if (isLeftMouseDown && !isDrag) {
    isDrag = true;
    dragIndex = getNearestPointIndex(cursorPos, points);
  }
  showGrab = false;
  showInsertPoint = false;
  for (const point of points) {
    showGrab = !showGrab ? isNearPoint(point, cursorPos) : true;
  }
  for (const line of lines) {
    showInsertPoint = !showInsertPoint ? isNearLine(cursorPos, line) : true;
  }
  showMove = isPointInsidePolygon(cursorPos, points);

  if (showGrab) {
    canvas.style.cursor = "grab";
  }
  else if (showInsertPoint) {
    canvas.style.cursor = "crosshair";
  }
  else if (showMove) {
    canvas.style.cursor = "move";
  }
  else {
    canvas.style.cursor = "default";
  }

  if (isDrag && dragIndex !== -1) {
    points[dragIndex] = { ...cursorPos };
    draw();
  }
  else if (isDrag && showMove) {
    const dx = cursorPos.x - lastCursorPos.x;
    const dy = cursorPos.y - lastCursorPos.y;
    let canMove = true;
    for (let point of points) {
      if (point.x + dx < 0 || point.x + dx > rect.width ||
        point.y + dy < 0 || point.y + dy > rect.height) {
        canMove = false;
        break;
      }
    }
    if (canMove) {
      for (let point of points) {
        point.x += dx;
        point.y += dy;
      }
    }
    draw();
  }
  lastCursorPos = { ...cursorPos };
}

function handleRightClick(event) {
  event.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const cursorPos = new Point(event.clientX - rect.left, event.clientY - rect.top);
  const index = getNearestPointIndex(cursorPos, points);
  if (index !== -1) {
    points.splice(index, 1);
    points_history.push(deepCopy(points));
    draw();
    showInCodeBlock();
  }
}

function handleContextMenu(event) {
  event.preventDefault();
}

function getProcessedPoint(point) {
  const originNumber = parseInt(origin.slice(-1))-1;
  const widthRatio = (dimensionWidth.value.trim() || dimensionWidth.placeholder) / canvas.width;
  const heightRatio = (dimensionHeight.value.trim() || dimensionHeight.placeholder) / canvas.height;
  let x = originNumber & 1 << 0 ? Math.abs(point.x - canvas.width) : point.x;
  let y = originNumber & 1 << 1 ? Math.abs(point.y - canvas.height) : point.y;
  return [(x * widthRatio).toFixed(0), (y * heightRatio).toFixed(0)];
}

function showInCodeBlock() {
  if (canvas == null) return;
  const output = points.map(point => JSON.stringify(getProcessedPoint(point))).join(',');
  codeBlock.textContent = `Points:\n[${output}]`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPoints();
  drawLines();
  drawPolygon();
}

function drawPoints() {
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  });
}

function drawLines() {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  lines = [];
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
    lines.push(new Line(points[i - 1], points[i]));
  }
  if (points.length > 2) {
    ctx.lineTo(points[0].x, points[0].y);
    lines.push(new Line(points[points.length - 1], points[0]));
  }
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawPolygon() {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
  ctx.fill();
}

function reset() {
  points = [];
  lines = [];
  points_history.push(deepCopy(points));
  draw();
  showInCodeBlock();
}

resetButton.onclick = () => {
  reset();
};

document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 'z') {
    if (points_history.length > 2) {
      // Pop the current first
      points_history.pop();
      // And take the last points
      points = [...points_history.pop()];
    }
    else if (points_history.length === 2) {
      points_history = [];
      reset();
    }
    points_history.push(deepCopy(points));
    draw();
    showInCodeBlock();
  }
});
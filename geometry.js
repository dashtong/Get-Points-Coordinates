class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Line {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
}

function pointToLineDistance(point, line) {
    const dx = line.endPoint.x - line.startPoint.x;
    const dy = line.endPoint.y - line.startPoint.y;
    const t = ((point.x - line.startPoint.x) * dx + (point.y - line.startPoint.y) * dy) / (dx * dx + dy * dy);
    const closestX = line.startPoint.x + t * dx;
    const closestY = line.startPoint.y + t * dy;
    const onSegment = t >= 0 && t <= 1;
    if (!onSegment) return Infinity;
    return Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2);
  }

  function isNearLine(point, line) {
    return pointToLineDistance(point, line) <= SNAP_DISTANCE;
  }

  function isNearPoint(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2) <= SNAP_DISTANCE;
  }

  function getNearestLineIndex(targetPoint, lines) {
    return lines.findIndex(line => isNearLine(targetPoint, line));
  }

  function getNearestPointIndex(targetPoint, points) {
    return points.findIndex(point => isNearPoint(point, targetPoint))
  }

  function isPointInsidePolygon(point, polygon) {
    const x = point.x;
    const y = point.y;
    let inside = false;
    for (let i = 0; i < polygon.length; i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const j = (i + 1) % polygon.length;
        const xj = polygon[j].x;
        const yj = polygon[j].y;
        const intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
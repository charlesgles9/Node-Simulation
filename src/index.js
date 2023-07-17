var Point2D = {
  x: 0,
  y: 0,
  speed: 0,
  acc: 0,
  size: 0,
  angle: 0,
  collided: false,
  alpha: 1,

  contains(point) {
    const deltaX = this.x - point.x;
    const deltaY = this.y - point.y;
    // circle collision detection
    return (
      Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) <
      point.size + this.size
    );
  },
};

var Line2D = {
  start: undefined,
  end: undefined,
  max: 200,
  distance() {
    const deltaX = this.start.x - this.end.x;
    const deltaY = this.start.y - this.end.y;
    // Applying the Pythagorean theorem to calculate the distance
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  },
  getAngle() {
    return Math.atan2(this.start.y - this.end.y, this.end.x - this.start.x);
  },
  alpha() {
    return this.max / this.distance() - 1;
  },
};

var LineTree = {
  lines: [],
  createTree(points, maxLength) {
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        if (i == j) continue;
        const a = points[i];
        const b = points[j];
        const line = Object.create(Line2D);
        line.start = a;
        line.end = b;
        line.max = maxLength;
        this.lines.push(line);
      }
    }
  },

  clear() {
    this.lines.splice(0, this.lines.length);
  },
};

function mouseRepelAnimation(point) {
  const mouseRadius = 0.6;
  if (pointer2D.distance() <= pointer2D.max * mouseRadius) {
    point.angle = -pointer2D.getAngle();
    movePoint(
      point,
      Math.min(Math.abs(pointer2D.distance() - pointer2D.max), 10)
    );
  } else movePoint(point, 0);
}

function mouseAttractAnimation(point) {
  if (
    pointer2D.distance() <= pointer2D.max &&
    pointer2D.distance() >= pointer2D.max * 0.5
  ) {
    point.angle = -pointer2D.getAngle();
    movePoint(
      point,
      -Math.abs(pointer2D.distance() - pointer2D.max) * 0.02 - point.speed
    );
  } else movePoint(point, 0);
}

function mouseGatherAnimation(point) {
  if (pointer2D.distance() <= pointer2D.max) {
    movePoint(point, -point.speed);
  } else movePoint(point, 0);
}

function mouseFlingPoint(point) {
  const radius = point.size * 2;
  const elasticity = 500;
  if (pointerDown2D.distance() <= radius) {
    pointerDown2D.start.x = point.x;
    pointerDown2D.start.y = point.y;

    if (EVENT[2]) {
      point.angle = -pointerUp2D.getAngle();
      point.acc =
        (10 * Math.min(pointerUp2D.distance(), elasticity)) / elasticity;
    }
  } else {
    movePoint(point, 0);
  }
}

function movePoint(point, offset) {
  point.x += (point.speed + offset + point.acc) * Math.cos(point.angle);
  point.y += (point.speed + offset + point.acc) * Math.sin(point.angle);
  point.acc *= 0.999;
}

function applyWave(point) {
  let offset = point.size * 4;
  pointer2D.end.x = point.x;
  pointer2D.end.y = point.y;
  pointerDown2D.end.x = point.x;
  pointerDown2D.end.y = point.y;
  pointerUp2D.end.x = point.x;
  pointerUp2D.end.y = point.y;
  switch (MODE) {
    case 0:
      mouseRepelAnimation(point);
      break;
    case 1:
      mouseAttractAnimation(point);
      break;
    case 2:
      mouseGatherAnimation(point);
      break;
    case 3:
      mouseFlingPoint(point);
      break;
  }

  if (point.y + point.size >= ctx.canvas.height + offset)
    point.angle = -Math.random() * Math.PI;

  if (point.x + point.size >= ctx.canvas.width + offset)
    point.angle = -Math.random() * Math.PI;

  if (point.x - point.size <= -offset) point.angle = Math.random() * Math.PI;

  if (point.y - point.size <= -offset) point.angle = Math.random() * Math.PI;
}

function particleCollisionDetection() {
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    for (let j = i + 1; j < points.length; j++) {
      const b = points[j];
      if (a.contains(b)) {
        a.x += (a.x - b.x) * 0.5;
        a.y += (a.y - b.y) * 0.5;
        b.x += (b.x - a.x) * 0.5;
        b.y += (b.y - a.y) * 0.5;
        a.acc += a.speed - b.speed;
        b.acc += a.speed - b.speed;
        a.angle = -Math.atan2(a.y - b.y, a.x - b.x);
        b.angle = Math.atan2(b.y - a.y, b.x - a.x);
        break;
      }
    }
  }
}

var canvas = null;
var ctx = null;
var points = [];
var lineTree = null;
var n_time = 0;
var o_time;
var tick = 0;
var MODE;
var enableBallCollision = false;
var EVENT = [false, false, false];
var maxLineLength = 200;
const pointer2D = Object.create(Line2D);
const pointerDown2D = Object.create(Line2D);
const pointerUp2D = Object.create(Line2D);
const maxParticles = 300;

window.onload = () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  MODE = 3;
  initParticleList();
  pointer2D.start = Object.create(Point2D);
  pointer2D.end = Object.create(Point2D);
  pointer2D.start.size = 5;
  pointerDown2D.start = Object.create(Point2D);
  pointerDown2D.end = Object.create(Point2D);
  pointerUp2D.start = Object.create(Point2D);
  pointerUp2D.end = Object.create(Point2D);
};

window.addEventListener(
  "resize",
  () => {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  },
  false
);

window.addEventListener("mousemove", (event) => {
  pointer2D.start.x = event.x;
  pointer2D.start.y = event.y;
  EVENT[0] = true;
});

window.addEventListener("mousedown", (event) => {
  pointerDown2D.start.x = event.x;
  pointerDown2D.start.y = event.y;
  EVENT[1] = true;
});

window.addEventListener("mouseup", (event) => {
  pointerUp2D.start.x = event.x;
  pointerUp2D.start.y = event.y;
  EVENT[2] = true;
});

function initParticleList() {
  points.splice(0, points.length);
  const size =
    maxParticles * (parseFloat(document.getElementById("p1").value) / 100.0);
  for (let i = 0; i < size; i++) {
    const point = Object.create(Point2D);
    point.x = Math.random() * ctx.canvas.width;
    point.y = Math.random() * ctx.canvas.height;
    point.size = 5;
    point.speed = 0.5 + Math.random() * 1.5;
    point.angle = Math.random() * Math.PI * 2;
    points.push(point);
  }
  if (lineTree == null) lineTree = Object.create(LineTree);
  else lineTree.clear();
  const maxLength =
    (maxLineLength * parseFloat(document.getElementById("p2").value)) / 100;
  lineTree.createTree(points, maxLength);
}

function toggleBallCollision() {
  enableBallCollision = document.getElementById("p3").checked;
}

function update() {
  if (canvas != null) {
    o_time = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw lineTree
    lineTree.lines.forEach((line) => {
      if (line.distance() <= line.max && line.distance() >= line.max * 0.2) {
        ctx.strokeStyle = `rgba(128, 128, 128, ${line.alpha()})`;
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.closePath();
        ctx.stroke();
        line.start.collided = true;
        line.end.collided = true;
        line.start.alpha = line.alpha();
        line.end.alpha = line.alpha();
      }
    });

    //Draw the mouseFlig line this will occur when mouse pointer down and mouse move is activated
    if (EVENT[0] && EVENT[1]) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(pointerDown2D.start.x, pointerDown2D.start.y);
      ctx.lineTo(pointer2D.start.x, pointer2D.start.y);
      ctx.closePath();
      ctx.stroke();
    }

    // Draw the point
    points.forEach((point) => {
      ctx.fillStyle = `rgb(${Math.min(50 + 255 * point.alpha, 255)},255,255)`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    });

    // draw the mouse pointer down if the mode if mouse fling
    if (EVENT[0]) {
      ctx.fillStyle = `rgb(${Math.min(
        50 + 255 * (pointer2D.start.alpha, 255)
      )},255,255)`;
      ctx.beginPath();
      ctx.arc(
        pointer2D.start.x,
        pointer2D.start.y,
        pointer2D.start.size * 1.2,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.fill();
    }

    // reset the point collision flag to false
    points.forEach((point) => {
      point.collided = false;
      point.alpha += 1 * 0.01;
      point.alpha = Math.min(point.alpha, 1);
    });

    //update points
    points.forEach((point) => {
      applyWave(point);
    });

    const modeList = document.getElementsByName("mode");
    if (modeList[0].checked) {
      MODE = 0;
    } else if (modeList[1].checked) {
      MODE = 1;
    } else if (modeList[2].checked) {
      MODE = 2;
    } else if (modeList[3].checked) {
      MODE = 3;
    }

    updateFps();

    if (enableBallCollision) particleCollisionDetection();

    // we have to reset the move mouse pointer for the fling mode
    if (MODE != 3) {
      pointer2D.start.x = Number.POSITIVE_INFINITY;
      pointer2D.start.y = Number.POSITIVE_INFINITY;
    }

    // reset the mouse pointer down and mouse poiner up values
    if (EVENT[2]) {
      pointerDown2D.start.x = Number.POSITIVE_INFINITY;
      pointerDown2D.start.y = Number.POSITIVE_INFINITY;
      EVENT[2] = false;
    }
  }
  requestAnimationFrame(update);
}

const updateFps = () => {
  if (o_time >= n_time) {
    n_time = performance.now() + 1000;
    document.getElementById("fps").innerText = `FPS: ${tick}`;
    tick = 0;
  } else tick++;
};

update();

// Draw border for canvas
function Border(color, weight) {
  push();
  noFill();
  stroke(color);
  strokeWeight(weight*2);
  rectMode(CENTER);
  rect(width/2, height/2, width, height);
  pop();
}

// Show frame rate
function showFrameRate(posX=10, posY=35, SIZE=35, COLOR="#0088BB") {
  push();
  textSize(SIZE);
  fill(COLOR);
  text(floor(frameRate()), posX, posY);
  pop();
}

// Check click
let CLICK = false;
function mouseClicked() {
  CLICK = !CLICK;
  if (!CLICK) loop();
}

// Click to noloop
function ClickStop() { if (CLICK) noLoop(); }

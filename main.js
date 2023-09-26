// Basic structure ref: https://itp-xstory.github.io/p5js-shaders/#/./docs/setting-up-shaders-in-p5
let theShader;
let WebGL;
let Canvas;
let img0, img1, img2;
let deltaX = 0,
  deltaY = 0;

var capture, previous, diff;

var thresh = 30;
var camerax = 128;
var cameray = 72;

//centroid
var cx;
var cy;

let smoothingFactor = 0.1;
let chillingFactor = 0.01;

var cxx;
var cyy;

let rSum = 1;

let showCentroid = false;

function preload() {
  theShader = new p5.Shader(this.renderer, vert, frag);
  img0 = loadImage("data/bn.png");
  img1 = loadImage("data/bn.png");
  img2 = loadImage("data/bn.png");
}

function setup() {
  fullscreen();
  pixelDensity(1);
  Canvas = createCanvas(windowWidth, windowHeight);
  WebGL = createGraphics(width, height, WEBGL);
  // Canvas = createGraphics(width, height);
  noStroke();
  background(51);

  // List available video devices (optional)
  //listVideoDevices();

  // Specify the deviceId to use (change this to your desired device)
  // const deviceId =
  //   "44b83d482cf9a38e492880525731ba3858edb780d05379924ac4838d51ca2b37";

  // // Define constraints to select the desired video device
  // const constraints = {
  //   video: {
  //     deviceId: { exact: deviceId },
  //   },
  // };

  capture = createCapture(VIDEO); // this opens up the camera
  capture.size(camerax, cameray); // this is in pixels
  capture.hide(); // telling the browser to hide the camera so we can draw it ourselves
  previous = createImage(camerax, cameray); // create an empty picture
  diff = createImage(camerax, cameray); // create an empty picture

  cx = 0;
  cy = 0;

  cxx = 500;
  cyy = 500;

}

function draw() {
  deltaRatio = 0.005 * (map(rSum,0,400,1,8));
  deltaX += map(cxx, width, 0, deltaRatio, -deltaRatio);
  deltaY += map(cyy, 0, height, deltaRatio, -deltaRatio);

  // deltaX += map(mouseX, 0, width, 0.005, -0.005);
  // deltaY += map(mouseY, 0, height, 0.005, -0.005);

  WebGL.shader(theShader);

  theShader.setUniform('iResolution', [img0.width, img0.height]);
  theShader.setUniform('iPixelDensity', pixelDensity());
  theShader.setUniform('iCanvas', Canvas);
  theShader.setUniform('iImage0', img0);
  theShader.setUniform('iImage1', img1);
  theShader.setUniform('iImage2', img2);
  theShader.setUniform('iMouse', [cxx, cyy]);
  theShader.setUniform('iTime', frameCount);
  theShader.setUniform('iDelta', [deltaX, deltaY]);

  WebGL.rect(0, 0, width, height);
  image(WebGL, 0, 0);
  // Border("#FFFFFF", 10);
  rSum = getCentroid();
  ClickStop();
}

function listVideoDevices() {
  // List available video devices (optional)
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      console.log("Available video devices:");
      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          console.log(device.label, device.deviceId);
        }
      });
    })
    .catch((error) => {
      console.error("Error listing video devices:", error);
    });
}

function getCentroid() {
  //thresh = mouseY/height * 255; // uncomment this for playing with the threshold
  capture.loadPixels();
  previous.loadPixels();
  diff.loadPixels();
  noSmooth(); // this makes everything not interpolate
  var x, y, p;
  var rsum = 0; // running sum
  var avgx = 0; // average x value
  var avgy = 0; // average y value
  //var numpix = capture.pixels.length/4;
  for (let i = 0; i < capture.pixels.length; i += 4) {
    let avg =
      (abs(capture.pixels[i] - previous.pixels[i]) +
        abs(capture.pixels[i + 1] - previous.pixels[i + 1]) +
        abs(capture.pixels[i + 2] - previous.pixels[i + 2])) /
      3;

    let bval = avg > thresh; // binary value

    rsum += bval; // add to running sum

    p = floor(i / 4);
    x = p % capture.width;
    y = floor(p / capture.width);
    avgx += bval ? x : 0;
    avgy += bval ? y : 0;

    // just for show:
    //diff.pixels[i]=diff.pixels[i+1]=diff.pixels[i+2]=bval*255;
    //diff.pixels[i+3]=255;
  }

  if (rsum > 0) cx = lerp(cx, avgx / rsum, smoothingFactor); // centroidx
  if (rsum > 0) cy = lerp(cy, avgy / rsum, smoothingFactor); // centroidy

  diff.updatePixels();

  for (let i = 0; i < capture.pixels.length; i++) {
    previous.pixels[i] = capture.pixels[i];
  }
  previous.updatePixels();

  //image(capture, 0, 0, width/2, height/2);
  //image(diff, 0, 0, width, height);
  if (rsum > 32) {
    cxx = map(cx, 0, capture.width, width, 0);
    cyy = map(cy, 0, capture.height, 0, height);
  } 
  else  {
    cxx > width/2 ? cxx -= width*chillingFactor : cxx += width*chillingFactor;
    cyy > height/2 ? cyy -= height*chillingFactor : cyy += height*chillingFactor;
  }

  if (showCentroid){
    background (127,0.5);
    fill(255, 0, 0);
    ellipse(cxx, cyy, 16, 16);
  }  
  return rsum;
}

function keyPressed() {
  // if (key === "F" || key === "f") {
  //   let fs = fullscreen();
  //   fullscreen(!fs);
  // }
  if (key === "1" || key === "&") {
    img0 = loadImage("data/bn.png");
    img1 = loadImage("data/bn.png");
    img2 = loadImage("data/bn.png");
  }

  if (key === "2" || key === "é") {
    img0 = loadImage("data/color.png");
    img1 = loadImage("data/color.png");
    img2 = loadImage("data/color.png");
  }

  if (key === "3" || key === '"') {
    img0 = loadImage("data/A1.png");
    img1 = loadImage("data/A1.png");
    img2 = loadImage("data/A1.png");
  }

  if (key === "4" || key === "'") {
    img0 = loadImage("data/A2.png");
    img1 = loadImage("data/A2.png");
    img2 = loadImage("data/A2.png");
  }

  if (key === "S" || key === "s") {
    showCentroid = !showCentroid;
  }
}

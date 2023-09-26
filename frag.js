// noprotect

const frag = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 iResolution;
  uniform float iPixelDensity;
  uniform sampler2D iCanvas;
  uniform sampler2D iImage0;
  uniform sampler2D iImage1;
  uniform sampler2D iImage2;
  //changer par blob position
  uniform vec2 iMouse;
  uniform float iTime;
  //changer par blob surface
  uniform vec2 iDelta;
  
  ${ snoise3D }
  ${ snoise3DImage }
  ${ displace }
  ${ extendMode }
  
  vec4 noiseImage(vec2 uv, float scal, float gain, float ofst, vec3 move) {
    vec4 dimg = 1.0*snoise3DImage((uv-vec2(421., 132))*1., scal, gain, ofst, move);
    dimg +=    0.25*snoise3DImage((uv-vec2(834., 724))*4., scal, gain, ofst, move);
    dimg +=  0.0625*snoise3DImage((uv-vec2(387., 99))*16., scal, gain, ofst, move);
    return dimg/1.3125;
  }
  
  varying vec2 vTexCoord;
  void main() {
    vec2 uv = vTexCoord;
    vec2 mouse = iMouse.xy/iResolution.xy;
    uv.y = 1.-uv.y;

    vec3 trans = vec3(iDelta.x, iDelta.y, iTime*0.0001);

//noise 
    vec4 dimg = noiseImage(uv, 1., 5.9, 1., trans);

//displacement parameters
    vec2 duv = displace(uv, dimg.rb, 1., .02);
    duv = mirror(duv, 1.);
    
    vec4 img0 = texture2D(iImage0, duv);
    vec4 img1 = texture2D(iImage1, duv);
    vec4 img2 = texture2D(iImage2, duv);
    
    // fade slideshow
    vec4 col;
    float time = iTime*.005;
    float it = floor(time);
    float grad = .5+.5*sin((fract(time)-.5)*3.14159);
    if (mod(it, 3.) == 0.) { col = mix(img0, img1, grad); }
    if (mod(it, 3.) == 1.) { col = mix(img1, img2, grad); }
    if (mod(it, 3.) == 2.) { col = mix(img2, img0, grad); }
    
    gl_FragColor = col;
  }
`

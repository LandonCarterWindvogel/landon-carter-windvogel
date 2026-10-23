/* Hero background: a slow, drifting contour field in the brand lime that bends
   around the cursor. Raw WebGL, ~2 KB, no libraries.
   - Renders at reduced resolution (cheap, and the soft look suits it)
   - Pauses when the hero is off-screen or the tab is hidden
   - Draws one still frame for prefers-reduced-motion
   - Silently does nothing if WebGL is unavailable (the CSS grid remains) */
(() => {
  'use strict';

  const canvas = document.getElementById('hero-gl');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vertexSource = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fragmentSource = [
    'precision mediump float;',
    'uniform vec2 u_res;uniform vec2 u_m;uniform float u_t;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return v;}',
    'void main(){',
    ' vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;',
    ' vec2 m=(u_m-.5*u_res)/u_res.y;',
    ' float d=length(p-m);',
    ' vec2 q=p*1.7+(p-m)*.5*exp(-d*3.2);',
    ' float t=u_t*.045;',
    ' float f=fbm(q+vec2(t,-t*.6)+fbm(q*1.25-t));',
    ' float band=abs(fract(f*8.)-.5);',
    ' float line=1.-smoothstep(.0,.05,band);',
    ' float near=exp(-d*2.6);',
    ' float a=line*(.14+.62*near)+near*.07;',
    ' gl_FragColor=vec4(vec3(.847,1.,.31)*a,a);',
    '}'
  ].join('\n');

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  const vs = compile(gl.VERTEX_SHADER, vertexSource);
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_res');
  const uMouse = gl.getUniformLocation(program, 'u_m');
  const uTime = gl.getUniformLocation(program, 'u_t');

  const hero = canvas.closest('.hero') || canvas.parentElement;
  const scale = 0.55; // render resolution relative to CSS pixels
  let width = 0, height = 0;
  const target = { x: 0.72, y: 0.58 };   // normalised, y measured from the top
  const mouse = { x: 0.72, y: 0.58 };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(2, Math.round(rect.width * scale));
    height = Math.max(2, Math.round(rect.height * scale));
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };

  const draw = (seconds) => {
    gl.uniform2f(uRes, width, height);
    gl.uniform2f(uMouse, mouse.x * width, (1 - mouse.y) * height);
    gl.uniform1f(uTime, seconds);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  resize();
  window.addEventListener('resize', () => { resize(); if (reduceMotion) draw(8); }, { passive: true });

  if (reduceMotion) {
    draw(8);
    canvas.classList.add('is-live');
    return;
  }

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    target.x = (event.clientX - rect.left) / rect.width;
    target.y = (event.clientY - rect.top) / rect.height;
  }, { passive: true });

  let visible = true;
  let frame = 0;
  const startedAt = performance.now();

  const loop = (now) => {
    frame = 0;
    if (!visible || document.hidden) return;
    mouse.x += (target.x - mouse.x) * 0.06;
    mouse.y += (target.y - mouse.y) * 0.06;
    draw((now - startedAt) / 1000 + 8);
    frame = requestAnimationFrame(loop);
  };
  const start = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', start);

  start();
  canvas.classList.add('is-live');
})();

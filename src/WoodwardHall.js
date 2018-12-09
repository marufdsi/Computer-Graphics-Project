var canvas;
var gl;
var program;

var NumVertices = 36;

var walls = [];
var carpet = [];
var doors = [];
var normalsArray = [];

var textureArrayFloor = [];
var textureArrayWall = [];
var textureArrayDoor = [];

var textureUnit = [
  vec2(0, 1),
  vec2(1, 1),
  vec2(0, 0),
  vec2(1, 0), // the rest for front wall
  vec2(0, 1),
  vec2(1, 1),
  vec2(0, 0),
  vec2(1, 0),
  vec2(0, 1),
  vec2(1, 1),
  vec2(0, 0),
  vec2(1, 0),
  vec2(0, 1),
  vec2(1, 1),
  vec2(0, 0),
  vec2(1, 0)
];


var IMAGES = [
  "wall.jpg",
  "door.jpg",
  "carpet.jpg",
];

var leftCorridor = [
  vec3(-150, 0, 450),
  vec3(-100, 0.0, 450),
  vec3(-150, 0.0, -400),
  vec3(-100, 0.0, -400),
];
var rightCorridor = [
  vec3(150, 0.0, 450.0),
  vec3(100, 0.0, 450.0),
  vec3(150, 0.0, -400.0),
  vec3(100, 0.0, -400.0),
];
var frontCorridor = [
  vec3(-100, 0.0, -400.0),
  vec3(100, 0.0, -400.0),
  vec3(-100, 0.0, -450.0),
  vec3(100, 0.0, -450.0),
];
var backCorridor = [
  vec3(-100, 0.0, 400.0),
  vec3(100, 0.0, 400.0),
  vec3(-100, 0.0, 450.0),
  vec3(100, 0.0, 450.0),
];

var colorsArray = [];
var baseColor = vec4(0.4, 0.4, 0.8, 1.0);
var corridorColor = vec4(0.5, 0.6, 0.2, 1.0);
var wallsColor = vec4(0.4, 0.9, 0.6, 1.0);
var partitionColor = vec4(0.6, 0.4, 0.4, 1.0);

var vertexColors = [
  vec4(0.0, 0.0, 0.0, 1.0), // black
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // magenta
  vec4(0.0, 1.0, 1.0, 1.0), // cyan
  vec4(1.0, 1.0, 1.0, 1.0), // white
];


var near = -1.0;
var far = 1.0;
var left = -1.0;
var right = 1.0;
var bottom = -1.0;
var _top = 1.0;
var radius = 4.0;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;

var fovy = 45.0; // Field-of-view in Y direction angle (in degrees)
var aspect; // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;

var personheight = 100;
var up = vec3(0.0, -1.0, 0.0);
var eye = vec3(-125, personheight, -300); // Initial at left corridor, better at elevator
var at = vec3(-125, personheight, 0);

var speed = 0.5;


var lightSource = vec4(-115, 100.0, 0.0, 0.0);
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(0.0, 0.2, 1.0, 1.0);
var materialShininess = 100.0;

// Our model width will be -250 to 250 that means 500
var min_x = -250;
var max_x = 250;
// Our model length will be -450 to 450 that means 900
var min_z = -450;
var max_z = 450;
// Per floor height 150
var min_y = 0;
var max_y = 150;
// Corridor width 50
var corridor_width = 50;
// Default length of the room 50
var default_room_length = 50;
// Default width of the room 100
var default_room_width = 100;


function createRoom(start, length, width, height, dLWall, dRWall, dBWall, dFWall) {
  basement = [
    vec3(start[0], 0.0, start[2] + length),
    vec3(start[0] + width, 0.0, start[2] + length),
    vec3(start[0], 0.0, start[2]),
    vec3(start[0] + width, 0.0, start[2]),
  ];
  leftSide = [
    vec3(start[0], height, start[2]),
    vec3(start[0], 0, start[2]),
    vec3(start[0] + width, 0, start[2]),
    vec3(start[0] + width, height, start[2]),
  ];
  rightSide = [
    vec3(start[0], height, start[2] + length),
    vec3(start[0] + width, height, start[2] + length),
    vec3(start[0], 0, start[2] + length),
    vec3(start[0] + width, 0, start[2] + length),
  ];
  backSide = [
    vec3(start[0], height, start[2]),
    vec3(start[0], height, start[2] + length),
    vec3(start[0], 0, start[2]),
    vec3(start[0], 0, start[2] + length),
  ];
  frontSide = [
    // left portion
    vec3(start[0] + width, height, start[2]),
    vec3(start[0] + width, height, start[2] + (length / 3)),
    vec3(start[0] + width, 0, start[2]),
    vec3(start[0] + width, 0, start[2] + (length / 3)),
    // right portion
    vec3(start[0] + width, height, start[2] + (2 * length / 3)),
    vec3(start[0] + width, height, start[2] + length),
    vec3(start[0] + width, 0, start[2] + (2 * length / 3)),
    vec3(start[0] + width, 0, start[2] + length),
    // upper portion of door
    vec3(start[0] + width, height, start[2] + (length / 3)),
    vec3(start[0] + width, height, start[2] + (2 * length / 3)),
    vec3(start[0] + width, (3 * height / 4), start[2] + (length / 3)),
    vec3(start[0] + width, (3 * height / 4), start[2] + (2 * length / 3)),
    // door
    vec3(start[0] + width, (3 * height / 4), start[2] + (length / 3)),
    vec3(start[0] + width, (3 * height / 4), start[2] + (2 * length / 3)),
    vec3(start[0] + width, 0, start[2] + (length / 3)),
    vec3(start[0] + width, 0, start[2] + (2 * length / 3)),
  ];
  if (dFWall) {
    quad(frontSide, 2, 0, 1, 3, 0);
    quad(frontSide, 6, 4, 5, 7, 0);
    quad(frontSide, 10, 8, 9, 11, 0);
    quad(frontSide, 14, 12, 13, 15, 2);
  }
  if (dBWall) {
    quad(backSide, 2, 0, 1, 3, 0);
  }
  if (dLWall) {
    quad(leftSide, 0, 1, 2, 3, 0);
  }
  if (dRWall) {
    quad(rightSide, 2, 0, 1, 3, 0);
  }
  quad(basement, 2, 0, 1, 3, 1);
}

function convertToNDC(object) {
  var result = [];
  for (var i = 0; i < object.length; i++) {
    result.push(vec4((2 * object[i][0] / canvas.width) - 1, (2 * (canvas.height - object[i][1]) / canvas.height) - 1, object[i][2], object[i][3]));
  }
  return result;
}

function makeCeiling() {
  ceiling = [
    vec3(-250, 150, 450),
    vec3(250, 150, 450),
    vec3(-250, 150, -450),
    vec3(250, 150, -450),
  ];
  quad(ceiling, 2, 0, 1, 3, 0);
}

function quad(object, a, b, c, d, element) {
  var t1 = subtract(object[b], object[a]);
  var t2 = subtract(object[c], object[b]);
  var normal = cross(t1, t2);
  var normal = vec3(normal);
  normal = normalize(normal);

  if (element == 0) {
    walls.push(object[a]);
    normalsArray.push(normal);
    walls.push(object[b]);
    normalsArray.push(normal);
    walls.push(object[c]);
    normalsArray.push(normal);
    walls.push(object[a]);
    normalsArray.push(normal);
    walls.push(object[c]);
    normalsArray.push(normal);
    walls.push(object[d]);
    normalsArray.push(normal);

    textureArrayWall.push(textureUnit[a]);
    textureArrayWall.push(textureUnit[b]);
    textureArrayWall.push(textureUnit[c]);
    textureArrayWall.push(textureUnit[a]);
    textureArrayWall.push(textureUnit[c]);
    textureArrayWall.push(textureUnit[d]);

  } else if (element == 1) {
    carpet.push(object[a]);
    normalsArray.push(normal);
    carpet.push(object[b]);
    normalsArray.push(normal);
    carpet.push(object[c]);
    normalsArray.push(normal);

    carpet.push(object[a]);
    normalsArray.push(normal);
    carpet.push(object[c]);
    normalsArray.push(normal);
    carpet.push(object[d]);
    normalsArray.push(normal);

    textureArrayFloor.push(textureUnit[a]);
    textureArrayFloor.push(textureUnit[b]);
    textureArrayFloor.push(textureUnit[c]);
    textureArrayFloor.push(textureUnit[a]);
    textureArrayFloor.push(textureUnit[c]);
    textureArrayFloor.push(textureUnit[d]);

  } else if (element == 2) {
    doors.push(object[a]);
    normalsArray.push(normal);
    doors.push(object[b]);
    normalsArray.push(normal);
    doors.push(object[c]);
    normalsArray.push(normal);

    doors.push(object[a]);
    normalsArray.push(normal);
    doors.push(object[c]);
    normalsArray.push(normal);
    doors.push(object[d]);
    normalsArray.push(normal);

    textureArrayDoor.push(textureUnit[a]);
    textureArrayDoor.push(textureUnit[b]);
    textureArrayDoor.push(textureUnit[c]);
    textureArrayDoor.push(textureUnit[a]);
    textureArrayDoor.push(textureUnit[c]);
    textureArrayDoor.push(textureUnit[d]);
  }
}


function cooridors(floor) {
  if (floor == 4) {
    quad(leftCorridor, 2, 0, 1, 3, 1);
    quad(rightCorridor, 2, 0, 1, 3, 1);
    quad(frontCorridor, 2, 0, 1, 3, 1);
    quad(backCorridor, 2, 0, 1, 3, 1);
  }
}

function createLeftRooms(floor) {
  if (floor == 4) {
    createRoom(vec4(min_x, 0, -450), 2 * 50, 100, 150, true, false, true, true);
    for (var i = 2; i < 8; i++) {
      createRoom(vec4(min_x, 0, (-450 + (i * 50))), 50, 100, 150, true, true, true, true);
    }
    createRoom(vec4(min_x, 0, (-450 + (8 * 50))), 2 * 50, 100, 150, true, true, true, true);
    for (var i = 10; i < 17; i++) {
      createRoom(vec4(min_x, 0, (-450 + (i * 50))), 50, 100, 150, true, true, true, true);
    }
    createRoom(vec4(min_x, 0, (-450 + (17 * 50))), 50, 100, 150, true, true, true, true);
  }
}

function createRightRooms(floor) {
  if (floor == 4) {
    createRoom(vec4(250, 0, -450), 2 * 50, -100, 150, true, true, true, true);
    for (var i = 2; i < 17; i++) {
      createRoom(vec4(250, 0, (-450 + (i * 50))), 50, -100, 150, true, true, true, true);
    }
    createRoom(vec4(250, 0, (-450 + (17 * 50))), 50, -100, 150, true, true, true, true);
  }
}

function createLab(floor) {
  if (floor == 4) {
    // First three labs
    createRoom(vec4(-149, 0, -550), 150, 124, 150, true, true, true, true);
    createRoom(vec4(-25, 0, -550), 150, 125, 150, true, true, true, true);
    createRoom(vec4(120, 0, -550), 150, 49, 150, true, true, true, true);

    // 2nd from last two labs
    createRoom(vec4(-100, 0, 125), 75, 100, 150, true, true, true, true);
    createRoom(vec4(0, 0, 125), 75, 100, 150, true, true, true, true);

    // Last two labs
    createRoom(vec4(-100, 0, 200), 200, 100, 150, true, true, true, true);
    createRoom(vec4(0, 0, 200), 200, 100, 150, true, true, true, true);

    // 2nd from first three labs
    createRoom(vec4(-100, 0, -400), 200, 100, 150, true, true, true, true);
    createRoom(vec4(100, 0, -400), 100, -100, 150, true, true, false, true);
    createRoom(vec4(100, 0, -300), 100, -100, 150, false, true, false, true);
    // Stairs
    createRoom(vec4(-100, 0, -35), 70, 75, 150, true, true, true, true);
    createRoom(vec4(-25, 0, -35), 70, 125, 150, true, true, true, true);
  }
}

function createRestroom(floor) {
  if (floor == 4) {

  }
}


var check_valid_up = function() {
  if (up[0] == 0 && up[1] == 0 && up[2] == 0) {
    // reset the up value, because all zero is not a valid up direction
    up = vec3(0, 1, 0);
  }
}

function myPerspective(fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(radians(fovy));
  var d = far - near;

  var result = mat4();
  result[0][0] = f / aspect;
  result[1][1] = f;
  result[2][2] = -1 * (near + far) / d;
  result[2][3] = -2 * near * far / d;
  result[3][2] = -1;
  result[3][3] = 0.0;

  return result;
}

// Return Identity Matrix
function getIdentityMat() {
  var identityMat = mat4();
  identityMat[0][0] = 1.0;
  identityMat[1][1] = 1.0;
  identityMat[2][2] = 1.0;
  identityMat[3][3] = 1.0;
  return identityMat;
}


// Generate Rotation Matrix for Camera
function getRotation(eye, at, up) {
  // Check at and up is not same.
  while (equal(at, up)) {
    at[0] += 0.0001;
  }
  var n = normalize(subtract(at, eye)); // view direction vector
  var u = normalize(cross(up, n)); // perpendicular vector
  var v = normalize(cross(n, u)); // "new" up vector

  n = negate(n);

  var m_rot = mat4(
    vec4(u, 0),
    vec4(v, 0),
    vec4(n, 0),
    vec4(0, 0, 0, 0)
  );
  return m_rot;
}

// Generate Translate Matrix for Camera
function getTranslation(eye) {
  var trans = getIdentityMat();
  trans[0][3] = -eye[0];
  trans[1][3] = -eye[1];
  trans[2][3] = -eye[2];
  return trans;
}

// Return the Camera Matrix
function getCamera(eye, at, up) {
  var m_rot = getRotation(eye, at, up);
  var m_trans = getTranslation(eye);
  return mult(m_rot, m_trans);
}

// Generate N2 Matrix
function get_N1() {
  var N1 = getIdentityMat();
  N1[2][2] = -1 * (far + near) / (far - near);
  N1[2][3] = -2 * near * far / (far - near);
  N1[3][2] = -1;
  N1[3][3] = 0;
  return N1;
}

// Generate N1 Matrix
function get_N2() {
  var N2 = getIdentityMat();
  N2[0][0] = 2 * near / (right - left);
  N2[1][1] = 2 * near / (_top - bottom);
  return N2;
}

// Return Projection Maatrix M_p = N1*N2
function getProjection() {
  var N1 = get_N1();
  var N2 = get_N2();
  return mult(N1, N2);
}

var uSampler;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  aspect = canvas.width / canvas.height;
  gl.clearColor(0.3, 0.1, 0.3, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  initTextures(); //initTextures(draw);

  createLeftRooms(4);
  createRightRooms(4);
  createLab(4);
  createRestroom(4);
  cooridors(4);

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(walls.concat(doors).concat(carpet)), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.enableVertexAttribArray(vPosition);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureArrayWall.concat(textureArrayDoor).concat(textureArrayFloor)), gl.STATIC_DRAW);

  var tTexture = gl.getAttribLocation(program, "aTextureCoord");
  gl.enableVertexAttribArray(tTexture);
  gl.vertexAttribPointer(tTexture, 2, gl.FLOAT, false, 0, 0);

  modelView = gl.getUniformLocation(program, "modelView");
  projection = gl.getUniformLocation(program, "projection");
  uSampler = gl.getUniformLocation(program, "uSampler"); // buttons for viewing parameters

  var useLighting = gl.getUniformLocation(program, "uUseLighting"); // buttons for viewing parameters
  gl.uniform1i(useLighting, 0);

  var useTexture = gl.getUniformLocation(program, "uUseTextureF"); // buttons for viewing parameters
  gl.uniform1i(useTexture, 1);


  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  canvas.onmousedown = canvasMouseDown;
  document.onmouseup = handleMouseUp;
  canvas.onmousemove = canvasMouseMove;

  render();
}

var render = function() {
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  handleKeys();
  check_valid_up();


  var m_Camera = getCamera(eye, at, up);
  var m_P = getProjection();


  mvMatrix = lookAt(eye, at, subtract(up, eye));
  pMatrix = perspective(fovy, aspect, near, far);

  var ambientProduct = mult(lightAmbient, materialAmbient);
  var diffuseProduct = mult(lightDiffuse, materialDiffuse);
  var specularProduct = mult(lightSpecular, materialSpecular);
  gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "lightSource"), flatten(lightSource));
  // gl.uniform4fv(gl.getUniformLocation(program, "lightSource"), flatten(vec4(eye, 0.0)));

  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
  //gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
  //gl.uniformMatrix4fv(projection, false, flatten(pMatrix));

  gl.uniformMatrix4fv(modelView, false, flatten(m_Camera));
  gl.uniformMatrix4fv(projection, false, flatten(m_P));


  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  gl.uniform1i(uSampler, 0);
  gl.drawArrays(gl.TRIANGLES, walls.length, doors.length); //door


  lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  ambientProduct = mult(lightAmbient, materialAmbient);
  gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.uniform1i(uSampler, 0);
  gl.drawArrays(gl.TRIANGLES, 0, walls.length);// wall

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[2]);
  gl.uniform1i(uSampler, 0);
  gl.drawArrays(gl.TRIANGLES, walls.length+doors.length, carpet.length); // carpet



  requestAnimFrame(render);
}


// Navigation, key operations
var currentlyPressedKeys = {};

function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
  //console.log(event.keyCode);
}

function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}

var leftright = 0;
var forwardback = 0;
var viewheight = personheight;
var jumptimer = 0;
var walktimer = 0;
var speedRate = 0;

function handleKeys() {
  if (currentlyPressedKeys[65]) { // A, left
    leftright = -1;
  } else if (currentlyPressedKeys[68]) { // D, right
    leftright = 1;
  } else {
    leftright = 0;
  }
  if (currentlyPressedKeys[87]) { //  W, forwrd
    forwardback = 1;
  } else if (currentlyPressedKeys[83]) { //S, backward
    forwardback = -1;
  } else {
    forwardback = 0;
  }
  if (currentlyPressedKeys[67]) { //  C, Crounch
    viewheight = 50;
  } else if (currentlyPressedKeys[90]) { //Z, Prone
    viewheight = 10;
  } else if (currentlyPressedKeys[32]) { //Space, Jump
    if (walktimer < 10) wiewheight = personheight; // jump effect
    else viewheight = personheight + 30;
    jumptimer = jumptimer + 1;
    if (jumptimer - walktimer > 30) {
      currentlyPressedKeys[32] = false;
      walktimer = 0;
      jumptimer = 0;
    }
  } else {
    walktimer = walktimer + 1;
    jumptimer = walktimer;
    if (walktimer > 100) walktimer = 0;
    viewheight = personheight;
  }
  if (currentlyPressedKeys[69]) { //  E, speed
    speedRate = 0.3;
  } else if (currentlyPressedKeys[82]) { //R, slow down
    speedRate = -0.3;
  } else {
    speedRate = 0;
  }

  speed = speed * (1 + speedRate);
  if (speed > 5) speed = 5;
  if (speed < 0.05) speed = 0.05;


  //at = add(at, vec3(leftright * speed, viewheight - eye[1], forwardback * speed));
  //eye = add(eye, vec3(leftright * speed, viewheight - eye[1], forwardback * speed));

  var motion = vec3(leftright * speed, viewheight - eye[1], forwardback * speed);
  var motionDirected = multMV(transpose(direction), motion);
  eye = add(eye, vec3(motionDirected));
  at = add(at, vec3(motionDirected));

  // detect edge
  //console.log(motion);
  //console.log(motionDirected);

}

var mouseX = null;
var mouseY = null;
var xzangle = 0;
var yzangle = 0;
var mouseDown = false;

function canvasMouseDown(event) { // change view direction
  mouseDown = true;

  var rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  lastX = mouseX;
  lastY = mouseY;

  xzangle = xzangle + (mouseX - Math.floor(canvas.width / 2)) / Math.floor(canvas.width / 2) * 45 / 180 * Math.PI;
  yzangle = yzangle + (Math.floor(canvas.height / 2) - mouseY) / Math.floor(canvas.height / 2) * 45 / 180 * Math.PI;

  var angles = moveAt(xzangle, yzangle);
  xzangle = angles[0];
  yzangles = angles[1];
}

function handleMouseUp(event) {
  mouseDown = false;
}

var direction = mat3(
  vec3(1, 0, 0), //right
  vec3(0, 1, 0), //up
  vec3(0, 0, 1)
); //forward
var dirXZangle = 0;
var dirYZangle = 0;
var lastX = 0;
var lastY = 0;


function canvasMouseMove(event) { // change walking direction
  if (!mouseDown) {
    return;
  }
  var rect = canvas.getBoundingClientRect();
  var newX = event.clientX - rect.left - lastX;
  var newY = -(event.clientY - rect.top - lastY);
  lastX = event.clientX - rect.left;
  lastY = event.clientY - rect.top;

  dirXZangle = dirXZangle + newX / Math.floor(canvas.width / 2) * 90 / 180 * Math.PI;
  dirYZangle = dirYZangle + newY / Math.floor(canvas.height / 2) * 90 / 180 * Math.PI;

  moveDirection(dirXZangle, dirYZangle);
  var angles = moveAt(dirXZangle, dirYZangle);
  dirXZangle = angles[0];
  dirYZangle = angles[1];
  console.log(dirXZangle + '  ,' + dirYZangle)

}

function moveAt(xzA, yzA) {
  if (xzA >= 2 * Math.PI) xzA = xzA - 2 * Math.PI;
  if (xzA < 0) xzA = xzA + 2 * Math.PI;
  if (yzA >= 2 * Math.PI) yzA = yzA - 2 * Math.PI;
  if (yzA < 0) yzA = yzA + 2 * Math.PI;

  var x = length(subtract(at, eye)) * Math.cos(yzA) * Math.sin(xzA);
  var y = length(subtract(at, eye)) * Math.sin(yzA);
  var z = length(subtract(at, eye)) * Math.cos(yzA) * Math.cos(xzA);

  at = add(eye, vec3(x, y, z));
  up = vec3(Math.cos(yzA - 1 / 2 * Math.PI) * Math.sin(xzA), Math.sin(yzA - 1 / 2 * Math.PI), Math.cos(yzA - 1 / 2 * Math.PI) * Math.cos(xzA));

  return [xzA, yzA];
}

function moveDirection(xzA, yzA) {
  if (xzA >= 2 * Math.PI) xzA = xzA - 2 * Math.PI;
  if (xzA < 0) xzA = xzA + 2 * Math.PI;
  if (yzA >= 2 * Math.PI) yzA = yzA - 2 * Math.PI;
  if (yzA < 0) yzA = yzA + 2 * Math.PI;

  /*
    direction = mat3(
      vec3(Math.cos(yzA) * Math.sin(xzA + Math.PI/2), Math.sin(yzA), Math.cos(yzA) * Math.cos(xzA + Math.PI/2)),
      vec3(Math.cos(yzA + Math.PI/2) * Math.sin(xzA- Math.PI), Math.sin(yzA + Math.PI / 2), Math.cos(yzA + Math.PI/2) * Math.cos(xzA- Math.PI)),
      vec3(Math.cos(yzA) * Math.sin(xzA), Math.sin(yzA), Math.cos(yzA) * Math.cos(xzA))
    );
    */
  direction = mat3(
    vec3(Math.sin(xzA + Math.PI / 2), 0, Math.cos(xzA + Math.PI / 2)),
    vec3(0, Math.sin(yzA + Math.PI / 2), Math.cos(yzA + Math.PI / 2)),
    vec3(Math.cos(yzA) * Math.sin(xzA), Math.sin(yzA), Math.cos(yzA) * Math.cos(xzA))
  );


  return [xzA, yzA];
}

var textures = [];

function initTextures(callback, args) {
  var promises = [];
  for (var i = 0; i < IMAGES.length; i++) {
    var image_src = IMAGES[i];
    var prom = new Promise(function(resolve, reject) {
      var texture = gl.createTexture();
      if (!texture) {
        reject(new Error('Failed to create the texture object'));
      }
      texture.src = image_src;
      var image = new Image();
      if (!image) {
        reject(new Error('Failed to create the image object'));
      }
      image.onload = function() {
        textures.push(texture);
        loadTexture(image, texture);
        resolve("success");
      };
      image.src = image_src;
    });
    promises.push(prom);
  }

  Promise.all(promises).then(function() {
    if (callback) {
      callback(args);
    }
  }, function(error) {
    console.log('Error loading images', error);
  })

}

function loadTexture(image, texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

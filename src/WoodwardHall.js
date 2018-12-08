var canvas;
var gl;
var program;

var NumVertices = 36;

var pointsArray = [];
var colorsArray = [];

var leftCorridor = [
    vec4(-150, 0, 450, 1.0),
    vec4(-100, 0.0, 450, 1.0),
    vec4(-150, 0.0, -400, 1.0),
    vec4(-100, 0.0, -400, 1.0),
];
var rightCorridor = [
    vec4(150, 0.0, 450.0, 1.0),
    vec4(100, 0.0, 450.0, 1.0),
    vec4(150, 0.0, -400.0, 1.0),
    vec4(100, 0.0, -400.0, 1.0),
];
var frontCorridor = [
    vec4(-100, 0.0, -400.0, 1.0),
    vec4(100, 0.0, -400.0, 1.0),
    vec4(-100, 0.0, -450.0, 1.0),
    vec4(100, 0.0, -450.0, 1.0),
];
var backCorridor = [
    vec4(-100, 0.0, 400.0, 1.0),
    vec4(100, 0.0, 400.0, 1.0),
    vec4(-100, 0.0, 450.0, 1.0),
    vec4(100, 0.0, 450.0, 1.0),
];
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
//var eye = vec3(-200.0, 600.0, -800.0);
//var at = vec3(0.0, 0.0, 0.0);
var personheight = 100;
var up = vec3(0.0, -1.0, 0.0);
var eye = vec3(-125, personheight, -375); // Initial at left corridor, better at elevator
var at = vec3(-125, personheight, 0);

var speed = 0.5;

var normalsArray = [];
var carpet = [];

var lightSource = vec4(-205, 150.0, 300.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
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
        vec4(start[0], 0.0, start[2] + length, start[3]),
        vec4(start[0] + width, 0.0, start[2] + length, start[3]),
        vec4(start[0], 0.0, start[2], start[3]),
        vec4(start[0] + width, 0.0, start[2], start[3]),
    ];
    leftSide = [
        vec4(start[0], height, start[2], start[3]),
        vec4(start[0] + width, height, start[2], start[3]),
        vec4(start[0], 0, start[2], start[3]),
        vec4(start[0] + width, 0, start[2], start[3]),
    ];
    rightSide = [
        vec4(start[0], height, start[2] + length, start[3]),
        vec4(start[0] + width, height, start[2] + length, start[3]),
        vec4(start[0], 0, start[2] + length, start[3]),
        vec4(start[0] + width, 0, start[2] + length, start[3]),
    ];
    backSide = [
        vec4(start[0], height, start[2], start[3]),
        vec4(start[0], height, start[2] + length, start[3]),
        vec4(start[0], 0, start[2], start[3]),
        vec4(start[0], 0, start[2] + length, start[3]),
    ];
    frontSide = [
        vec4(start[0] + width, height, start[2], start[3]),
        vec4(start[0] + width, height, start[2] + length, start[3]),
        vec4(start[0] + width, 0, start[2], start[3]),
        vec4(start[0] + width, 0, start[2] + length, start[3]),
    ];
    if (dLWall) {
        quad(leftSide, 2, 0, 1, 3, 0);
    }
    if (dRWall) {
        quad(rightSide, 2, 0, 1, 3, 0);
    }
    if (dBWall) {
        quad(backSide, 2, 0, 1, 3, 0);
    }
    if (dFWall) {
        quad(frontSide, 2, 0, 1, 3, 0);
    }
    quad(basement, 2, 0, 1, 3, 1);
}

function makeCeiling() {
    ceiling = [
        vec4(-250, 150, 450, 1.0),
        vec4(250, 150, 450, 1.0),
        vec4(-250, 150, -450, 1.0),
        vec4(250, 150, -450, 1.0),
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
        pointsArray.push(object[a]);
        normalsArray.push(normal);
        pointsArray.push(object[b]);
        normalsArray.push(normal);
        pointsArray.push(object[c]);
        normalsArray.push(normal);

        pointsArray.push(object[a]);
        normalsArray.push(normal);
        pointsArray.push(object[c]);
        normalsArray.push(normal);
        pointsArray.push(object[d]);
        normalsArray.push(normal);
    } else if (element == 1){
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
        createRoom(vec4(min_x, 0, -450, 1.0), 2 * 50, 100, 150, true, false, true, true);
        for (var i = 2; i < 8; i++) {
            createRoom(vec4(min_x, 0, (-450 + (i * 50)), 1.0), 50, 100, 150, true, true, true, true);
        }
        createRoom(vec4(min_x, 0, (-450 + (8 * 50)), 1.0), 2 * 50, 100, 150, true, true, true, true);
        for (var i = 10; i < 17; i++) {
            createRoom(vec4(min_x, 0, (-450 + (i * 50)), 1.0), 50, 100, 150, true, true, true, true);
        }
        createRoom(vec4(min_x, 0, (-450 + (17 * 50)), 1.0), 50, 100, 150, true, true, true, true);
    }
}

function createRightRooms(floor) {
    if (floor == 4) {
        createRoom(vec4(250, 0, -450, 1.0), 2 * 50, -100, 150, true, true, true, true);
        for (var i = 2; i < 17; i++) {
            createRoom(vec4(250, 0, (-450 + (i * 50)), 1.0), 50, -100, 150, true, true, true, true);
        }
        createRoom(vec4(250, 0, (-450 + (17 * 50)), 1.0), 50, -100, 150, true, true, true, true);
    }
}

function createLab(floor) {
    if (floor == 4) {
        // First three labs
        createRoom(vec4(-149, 0, -550, 1.0), 150, 124, 150, true, true, true, true);
        createRoom(vec4(-25, 0, -550, 1.0), 150, 125, 150, true, true, true, true);
        createRoom(vec4(120, 0, -550, 1.0), 150, 49, 150, true, true, true, true);

        // 2nd from last two labs
        createRoom(vec4(-100, 0, 125, 1.0), 75, 100, 150, true, true, true, true);
        createRoom(vec4(0, 0, 125, 1.0), 75, 100, 150, true, true, true, true);

        // Last two labs
        createRoom(vec4(-100, 0, 200, 1.0), 200, 100, 150, true, true, true, true);
        createRoom(vec4(0, 0, 200, 1.0), 200, 100, 150, true, true, true, true);

        // 2nd from first three labs
        createRoom(vec4(-100, 0, -400, 1.0), 200, 100, 150, true, true, true, true);
        createRoom(vec4(0, 0, -400, 1.0), 100, 100, 150, true, true, true, true);
        createRoom(vec4(0, 0, -300, 1.0), 100, 100, 150, false, true, true, true);
        // Stairs
        createRoom(vec4(-100, 0, -35, 1.0), 70, 75, 150, true, true, true, true);
        createRoom(vec4(-25, 0, -35, 1.0), 70, 125, 150, true, true, true, true);
    }
}

function createRestroom(floor) {
    if (floor == 4) {

    }
}

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

    createLab(4);
    createLeftRooms(4);
    createRightRooms(4);
    createRestroom(4);
    cooridors(4);
    makeCeiling();
    /*var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);*/

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray.concat(carpet)), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelView = gl.getUniformLocation(program, "modelView");
    projection = gl.getUniformLocation(program, "projection");

    // buttons for viewing parameters
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    canvas.onmousedown = canvasMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = canvasMouseMove;

    render();
}

var check_valid_up = function () {
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

var render = function () {
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    handleKeys();
    check_valid_up();
    var m_Camera = getCamera(eye, at, up);
    var m_P = getProjection();
    mvMatrix = lookAt(eye, at, subtract(up, eye));
    pMatrix = myPerspective(fovy, aspect, near, far);
    //console.log("camera xform: " + mvMatrix);
    //console.log("perspective xform: " + pMatrix);

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

    // gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv(modelView, false, flatten(m_Camera));
    // gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    gl.uniformMatrix4fv(projection, false, flatten(m_P));

    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
    gl.drawArrays(gl.TRIANGLES, pointsArray.length, carpet.length);
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
        else viewheight = personheight + 20;
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

    at = add(at, vec3(leftright * speed, viewheight - eye[1], forwardback * speed));
    eye = vec3(eye[0] + leftright * speed, viewheight, eye[2] + forwardback * speed)

    // detect edge


    //console.log(at);


}

var mouseX = null;
var mouseY = null;
var xzangle = 0;
var yzangle = 0;
var mouseDown = false;

function canvasMouseDown(event) {  // change view direction
    mouseDown = true;

    var rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    xzangle = xzangle + (mouseX - Math.floor(canvas.width / 2)) / Math.floor(canvas.width / 2) * 45 / 180 * Math.PI;
    yzangle = yzangle + (Math.floor(canvas.height / 2) - mouseY) / Math.floor(canvas.height / 2) * 45 / 180 * Math.PI;
    if (xzangle >= 2 * Math.PI) xzangle = xzangle - 2 * Math.PI;
    if (xzangle < 0) xzangle = xzangle + 2 * Math.PI;
    if (yzangle >= 2 * Math.PI) yzangle = yzangle - 2 * Math.PI;
    if (yzangle < 0) yzangle = yzangle + 2 * Math.PI;

    var x = length(subtract(at, eye)) * Math.cos(yzangle) * Math.sin(xzangle);
    var y = length(subtract(at, eye)) * Math.sin(yzangle);
    var z = length(subtract(at, eye)) * Math.cos(yzangle) * Math.cos(xzangle);

    at = add(eye, vec3(x, y, z));
    up = vec3(Math.cos(yzangle - 1 / 2 * Math.PI) * Math.sin(xzangle), Math.sin(yzangle - 1 / 2 * Math.PI), Math.cos(yzangle - 1 / 2 * Math.PI) * Math.cos(xzangle));

}

function handleMouseUp(event) {
    mouseDown = false;
}

function canvasMouseMove(event) {  // change walking direction
    if (!mouseDown) {
        return;
    }
    var rect = canvas.getBoundingClientRect();
    var newX = event.clientX - rect.left;
    var newY = event.clientY - rect.left;
}

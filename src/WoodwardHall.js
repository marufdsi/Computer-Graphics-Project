

var canvas;
var gl;

var NumVertices  = 36;

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
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];


var near = -1.0;
var far = 1.0;
var left = -1.0;
var right = 1.0;
var bottom = -1.0;
var _top = 1.0;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;
var eye = vec3(-200.0, 600.0, -800.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, -1.0, 0.0);


function createRoom(start, length, width, height) {
    basement = [
        vec4(start[0], 0.0, start[2]+length, start[3]),
        vec4(start[0]+width, 0.0, start[2]+length, start[3]),
        vec4(start[0], 0.0, start[2], start[3]),
        vec4(start[0]+width, 0.0, start[2], start[3]),
    ];
    leftSide = [
        vec4(start[0], height, start[2], start[3]),
        vec4(start[0]+width, height, start[2], start[3]),
        vec4(start[0], 0, start[2], start[3]),
        vec4(start[0]+width, 0, start[2], start[3]),
    ];
    rightSide = [
        vec4(start[0], height, start[2]+length, start[3]),
        vec4(start[0]+width, height, start[2]+length, start[3]),
        vec4(start[0], 0, start[2]+length, start[3]),
        vec4(start[0]+width, 0, start[2]+length, start[3]),
    ];
    backSide = [
        vec4(start[0], height, start[2], start[3]),
        vec4(start[0], height, start[2]+length , start[3]),
        vec4(start[0], 0, start[2], start[3]),
        vec4(start[0], 0, start[2]+length, start[3]),
    ];
    frontSide = [
        vec4(start[0]+width, height, start[2], start[3]),
        vec4(start[0]+width, height, start[2]+length, start[3]),
        vec4(start[0]+width, 0, start[2], start[3]),
        vec4(start[0]+width, 0, start[2]+length, start[3]),
    ];
    quad( leftSide, 2, 0, 1, 3, partitionColor );
    quad( rightSide, 2, 0, 1, 3, partitionColor );
    quad( backSide, 2, 0, 1, 3, wallsColor );
    quad( frontSide, 2, 0, 1, 3, wallsColor );
    quad( basement, 2, 0, 1, 3, baseColor );
}
function quad(object, a, b, c, d, color) {
    pointsArray.push(object[a]);
    colorsArray.push(color);
    pointsArray.push(object[b]);
    colorsArray.push(color);
    pointsArray.push(object[c]);
    colorsArray.push(color);
    pointsArray.push(object[a]);
    colorsArray.push(color);
    pointsArray.push(object[c]);
    colorsArray.push(color);
    pointsArray.push(object[d]);
    colorsArray.push(color);
}


function cooridors(floor){
    if (floor == 4) {
        quad(leftCorridor, 2, 0, 1, 3, corridorColor);
        quad(rightCorridor, 2, 0, 1, 3, corridorColor);
        quad(frontCorridor, 2, 0, 1, 3, corridorColor);
        quad(backCorridor, 2, 0, 1, 3, corridorColor);
    }
}

function createLeftRooms(floor){
    if (floor == 4) {
        createRoom(vec4(-250, 0, -450, 1.0), 2 * 50, 100, 150);
        for (var i = 2; i < 8; i++) {
            createRoom(vec4(-250, 0, (-450 + (i * 50)), 1.0), 50, 100, 150);
        }
        createRoom(vec4(-250, 0, (-450 + (8 * 50)), 1.0), 2 * 50, 100, 150);
        for (var i = 10; i < 18; i++) {
            createRoom(vec4(-250, 0, (-450 + (i * 50)), 1.0), 50, 100, 150);
        }
    }
}
function createRightRooms(floor){
    if (floor == 4) {
        createRoom(vec4(250, 0, -450, 1.0), 2 * 50, -100, 150);
        for (var i = 2; i < 18; i++) {
            createRoom(vec4(250, 0, (-450 + (i * 50)), 1.0), 50, -100, 150);
        }
    }
}
function createLab(floor){
    if (floor == 4) {
        createRoom(vec4(-150, 0, -550, 1.0), 150, 125, 150);
        createRoom(vec4(-25, 0, -550, 1.0), 150, 125, 150);
        createRoom(vec4(120, 0, -550, 1.0), 150, 50, 150);

        createRoom(vec4(-100, 0, 200, 1.0), 200, 100, 150);
        createRoom(vec4(0, 0, 200, 1.0), 200, 100, 150);

        createRoom(vec4(-100, 0, 125, 1.0), 75, 100, 150);
        createRoom(vec4(0, 0, 125, 1.0), 75, 100, 150);

        createRoom(vec4(-100, 0, -400, 1.0), 200, 100, 150);
        createRoom(vec4(0, 0, -400, 1.0), 100, 100, 150);
        createRoom(vec4(0, 0, -300, 1.0), 100, 100, 150);

        createRoom(vec4(-100, 0, -35, 1.0), 70, 75, 150);
        createRoom(vec4(-25, 0, -35, 1.0), 70, 125, 150);
    }
}

function createRestroom(floor){
    if (floor == 4) {

    }
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 0.3, 0.1, 0.3, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    createLeftRooms(4);
    createRightRooms(4);
    cooridors(4);
    createLab(4);
    createRestroom(4);
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );

// buttons for viewing parameters

       
    render(); 
}

var check_valid_up = function(){
	if(up[0] == 0 && up[1] == 0 && up[2] == 0){
		// reset the up value, because all zero is not a valid up direction
		up = vec3(0, 1, 0);
	}
}

function myPerspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan(radians(fovy));
    var d = far - near;

    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -1*(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

// Return Identity Matrix
function getIdentityMat(){
    var identityMat = mat4();
    identityMat[0][0] = 1.0;
    identityMat[1][1] = 1.0;
    identityMat[2][2] = 1.0;
    identityMat[3][3] = 1.0;
    return identityMat;
}
// Generate Rotation Matrix for Camera
function getRotation( eye, at, up ){
    // Check at and up is not same.
    while(equal(at, up)){
        at[0] += 0.0001;
    }
    var n = normalize( subtract(at, eye) );  // view direction vector
    var u = normalize( cross(up, n) );       // perpendicular vector
    var v = normalize( cross(n, u) );        // "new" up vector

    n = negate( n );

    var m_rot = mat4(
        vec4( u, 0),
        vec4( v, 0),
        vec4( n, 0),
        vec4(0, 0, 0, 0)
    );
    return m_rot;
}
// Generate Translate Matrix for Camera
function getTranslation(eye){
    var trans = getIdentityMat();
    trans[0][3] = -eye[0];
    trans[1][3] = -eye[1];
    trans[2][3] = -eye[2];
    return trans;
}
// Return the Camera Matrix
function getCamera( eye, at, up ){
    var m_rot = getRotation( eye, at, up );
    var m_trans = getTranslation(eye);
    return mult(m_rot, m_trans);
}
// Generate N2 Matrix
function get_N1(){
    var N1 = getIdentityMat();
    N1[2][2] = -1*(far + near)/(far - near);
    N1[2][3] = -2*near*far/(far - near);
    N1[3][2] = -1;
    N1[3][3] = 0;
    return N1;
}
// Generate N1 Matrix
function get_N2(){
    var N2 = getIdentityMat();
    N2[0][0] = 2*near/(right-left);
    N2[1][1] = 2*near/(_top-bottom);
    return N2;
}
// Return Projection Maatrix M_p = N1*N2
function getProjection(){
    var N1 = get_N1();
    var N2 = get_N2();
    return mult(N1, N2);
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
	check_valid_up();
    var m_Camera = getCamera( eye, at, up );
    var m_P = getProjection();
    mvMatrix = lookAt(eye, at , subtract(up, eye));
    pMatrix = myPerspective(fovy, aspect, near, far);
//console.log("camera xform: " + mvMatrix);
//console.log("perspective xform: " + pMatrix);

    // gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( modelView, false, flatten(m_Camera) );
    // gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(m_P) );

    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );
    requestAnimFrame(render);
}

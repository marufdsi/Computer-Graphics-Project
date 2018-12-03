

var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4( 0.5, -0.5, 0.5, 1.0) 
];
var leftRoomsBase = [
    vec4(-400, 250, 0.0, 1.0),
    vec4(400, 250, 0.0, 1.0),
    vec4(-400, 150, 0.0, 1.0),
    vec4(400, 150, 0.0, 1.0),
];
var rightRoomsBase = [
    vec4(-400, -150, 0.0, 1.0),
    vec4(400, -150, 0.0, 1.0),
    vec4(-400, -250, 0.0, 1.0),
    vec4(400, -250, 0.0, 1.0),
];
var labsBase = [
    vec4(-400, 100, 0.0, 1.0),
    vec4(400, 100, 0.0, 1.0),
    vec4(-400, -100, 0.0, 1.0),
    vec4(400, -100, 0.0, 1.0),
];

var leftWall = [
    vec4(-250, -450, 150.0, 1.0),
    vec4(-250, 450, 150.0, 1.0),
    vec4(-250, -450, 0.0, 1.0),
    vec4(-250, 450, 0.0, 1.0),

    vec4(-150, -450, 150.0, 1.0),
    vec4(-150, 450, 150.0, 1.0),
    vec4(-150, -450, 0.0, 1.0),
    vec4(-150, 450, 0.0, 1.0),
];
var rightWall = [
    vec4(250, -450, 150.0, 1.0),
    vec4(250, 450, 150.0, 1.0),
    vec4(250, -450, 0.0, 1.0),
    vec4(250, 450, 0.0, 1.0),

    vec4(150, -450, 150.0, 1.0),
    vec4(150, 450, 150.0, 1.0),
    vec4(150, -450, 0.0, 1.0),
    vec4(150, 450, 0.0, 1.0),
];
var labsWall = [
    vec4(-100, -450, 150.0, 1.0),
    vec4(-100, 450, 150.0, 1.0),
    vec4(-100, -450, 0.0, 1.0),
    vec4(-100, 450, 0.0, 1.0),

    vec4(100, -450, 150.0, 1.0),
    vec4(100, 450, 150.0, 1.0),
    vec4(100, -450, 0.0, 1.0),
    vec4(100, 450, 0.0, 1.0),

    vec4(-100, -450, 150.0, 1.0),
    vec4(-100, -450, 0.0, 1.0),
    vec4(100, -450, 150.0, 1.0),
    vec4(100, -450, 0.0, 1.0),

    vec4(-100, 450, 150.0, 1.0),
    vec4(-100, 450, 0.0, 1.0),
    vec4(100, 450, 150.0, 1.0),
    vec4(100, 450, 0.0, 1.0),
];


var leftCorridor = [
    vec4(-150, 450, 0.0, 1.0),
    vec4(-100, 450, 0.0, 1.0),
    vec4(-150, -450, 0.0, 1.0),
    vec4(-100, -450, 0.0, 1.0),
];
var rightCorridor = [
    vec4(150, 450, 0.0, 1.0),
    vec4(100, 450, 0.0, 1.0),
    vec4(150, -450, 0.0, 1.0),
    vec4(100, -450, 0.0, 1.0),
];
var baseColor = vec4(0.5, 0.4, 0.4, 1.0);
var corridorColor = vec4(0.5, 0.6, 0.2, 1.0);
var wallsColor = vec4(0.9, 0.9, 0.1, 1.0);
var partitionColor = vec4(0.2, 0.9, 0.1, 1.0);

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


var near = 0;
var far = 100.0;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;
var eye = vec3(10.0, -600.0, 600.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);


function createRoom(start, length, width, height) {
    basement = [
        vec4(start[0], start[1]+length, 0, start[3]),
        vec4(start[0]+width, start[1]+length, 0, start[3]),
        vec4(start[0], start[1], 0, start[3]),
        vec4(start[0]+width, start[1], 0, start[3]),
    ];
    leftSide = [
        vec4(start[0], start[1], height, start[3]),
        vec4(start[0]+width, start[1], height, start[3]),
        vec4(start[0], start[1], 0, start[3]),
        vec4(start[0]+width, start[1], 0, start[3]),
    ];
    rightSide = [
        vec4(start[0], start[1]+length, height, start[3]),
        vec4(start[0]+width, start[1]+length, height, start[3]),
        vec4(start[0], start[1]+length, 0, start[3]),
        vec4(start[0]+width, start[1]+length, 0, start[3]),
    ];
    backSide = [
        vec4(start[0], start[1], height, start[3]),
        vec4(start[0], start[1]+length, height, start[3]),
        vec4(start[0], start[1], 0, start[3]),
        vec4(start[0], start[1]+length, 0, start[3]),
    ];
    frontSide = [
        vec4(start[0]+width, start[1], height, start[3]),
        vec4(start[0]+width, start[1]+length, height, start[3]),
        vec4(start[0]+width, start[1], 0, start[3]),
        vec4(start[0]+width, start[1]+length, 0, start[3]),
    ];
    // quad( leftSide, 2, 0, 1, 3, partitionColor );
    // quad( rightSide, 2, 0, 1, 3, partitionColor );
    quad( backSide, 2, 0, 1, 3, wallsColor );
    quad( frontSide, 2, 0, 1, 3, wallsColor );
    // quad( basement, 2, 0, 1, 3, baseColor );
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

function floor(floor_number)
{
    quad( leftRoomsBase, 2, 0, 1, 3, baseColor );
    quad( rightRoomsBase, 2, 0, 1, 3, baseColor );
    quad( labsBase, 2, 0, 1, 3, baseColor );
}
function cooridors(){
    quad( leftCorridor, 2, 0, 1, 3, corridorColor );
    quad( rightCorridor, 2, 0, 1, 3, corridorColor );
}
function walls(){
    quad( leftWall, 2, 0, 1, 3, wallsColor );
    quad( leftWall, 6, 4, 5, 7, wallsColor );

    quad( rightWall, 2, 0, 1, 3, wallsColor );
    quad( rightWall, 6, 4, 5, 7, wallsColor );

    quad( labsWall, 2, 0, 1, 3, wallsColor );
    quad( labsWall, 6, 4, 5, 7, wallsColor );

    quad( labsWall, 10, 8, 9, 11, wallsColor );
    quad( labsWall, 14, 12, 13, 15, wallsColor );
}

function createLeftRooms(){
    for (var i=0; i<2; i++) {
        createRoom(vec4(-250, (-450 + (i*50)) , 0, 1.0), 50, 100, 150);
    }
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 0.5, 0.8, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // floor(4);
    // cooridors();
    // walls();
    createLeftRooms();
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

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
	check_valid_up();
    mvMatrix = lookAt(eye, at , subtract(up, eye));
    pMatrix = myPerspective(fovy, aspect, near, far);
//console.log("camera xform: " + mvMatrix);
//console.log("perspective xform: " + pMatrix);

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
            
    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );
    requestAnimFrame(render);
}

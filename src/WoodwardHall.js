var canvas;
var gl;
var program;

var NumVertices = 36;
var walls = [];
var carpet = [];
var doors = [];
var eledoors3 = [];
var eledoors4 = [];
var normalsArray = [];

var textureArrayFloor = [];
var textureArrayWall = [];
var textureArrayDoor = [];
var textureArrayeleDoor3 = [];
var textureArrayeleDoor4 = [];

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
  "elevator3.png",
  "elevator4.png",
];

var leftCorridor = [
  vec3(-150, 0, 450),
  vec3(-100, 0.0, 450),
  vec3(-150, 0.0, -450),
  vec3(-100, 0.0, -450),
];
var rightCorridor = [
  vec3(150, 0.0, 450.0),
  vec3(100, 0.0, 450.0),
  vec3(150, 0.0, -450.0),
  vec3(100, 0.0, -450.0),
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
var floorChanged = false;
var selectedFloor = 3;

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

var fovy = 75.0; // Field-of-view in Y directionMat angle (in degrees)
var aspect; // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;

var personheight = 65;


var up = vec3(0.0, 1.0, 0.0);
var eye = vec3(0, personheight, -10); // Initial at  elevator
var at = vec3(0, personheight, 100);

/*
var eye = vec3(-125, 800, -300); // Initial at left corridor, better at elevator
var at = vec3(-125, 200, -300);
var up = vec3(0.0, 0.0, -1.0);
*/

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

function createRightDoorRoom(start, length, width, height, dLWall, dRWall, dBWall, dFWall) {
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
    //right potion
    vec3(start[0], height, start[2] + length),
    vec3(start[0] + (width / 3), height, start[2] + length),
    vec3(start[0], 0, start[2] + length),
    vec3(start[0] + (width / 3), 0, start[2] + length),
    // left portion
    vec3(start[0] + (2 * width / 3), height, start[2] + length),
    vec3(start[0] + width, height, start[2] + length),
    vec3(start[0] + (2 * width / 3), 0, start[2] + length),
    vec3(start[0] + width, 0, start[2] + length),
    // upper portion of door
    vec3(start[0] + width / 3, height, start[2] + length),
    vec3(start[0] + width / 3 * 2, height, start[2] + length),
    vec3(start[0] + width / 3, (3 * height / 4), start[2] + length),
    vec3(start[0] + width / 3 * 2, (3 * height / 4), start[2] + length),
    // door
    vec3(start[0] + width / 3, (3 * height / 4), start[2] + length),
    vec3(start[0] + width / 3 * 2, (3 * height / 4), start[2] + length),
    vec3(start[0] + width / 3, 0, start[2] + length),
    vec3(start[0] + width / 3 * 2, 0, start[2] + length),


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
    vec3(start[0] + width, height, start[2] + length),
    vec3(start[0] + width, 0, start[2]),
    vec3(start[0] + width, 0, start[2] + length),
  ];
  if (dFWall) {
    quad(frontSide, 2, 0, 1, 3, 0);
  }
  if (dBWall) {
    quad(backSide, 2, 0, 1, 3, 0);
  }
  if (dLWall) {
    quad(leftSide, 0, 1, 2, 3, 0);
  }
  if (dRWall) {
    quad(rightSide, 2, 0, 1, 3, 0);
    quad(rightSide, 6, 4, 5, 7, 0);
    quad(rightSide, 10, 8, 9, 11, 0);
    quad(rightSide, 14, 12, 13, 15, 2);
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
  var ceiling = [
    vec3(-250, 150, 450),
    vec3(250, 150, 450),
    vec3(-250, 150, -450),
    vec3(250, 150, -450),
  ];
  quad(ceiling, 2, 0, 1, 3, 0);
  var border = [
    vec3(-250, 150, 450),
    vec3(250, 150, 450),
    vec3(250, 0, 450),
    vec3(-250, 0, 450),

    vec3(-250, 150, 450),
    vec3(-250, 150, -450),
    vec3(-250, 0, -450),
    vec3(-250, 0, 450),

    vec3(250, 150, 450),
    vec3(250, 150, -450),
    vec3(250, 0, -450),
    vec3(250, 0, 450),

    vec3(-250, 150, -450),
    vec3(250, 150, -450),
    vec3(-250, 0, -450),
    vec3(250, 0, -450),
  ];
  quad(border, 0, 1, 2, 3, 0);
  quad(border, 4, 5, 6, 7, 0);
  quad(border, 8, 9, 10, 11, 0);
  quad(border, 12, 13, 14, 15, 0);
  var base = [
    vec3(-250, 0, 450),
    vec3(250, 0, 450),
    vec3(-250, 0, -450),
    vec3(250, 0, -450),
  ];
  quad(base, 2, 0, 1, 3, 1);
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
  } else if (element == 4) {
    eledoors3.push(object[a]);
    normalsArray.push(normal);
    eledoors3.push(object[b]);
    normalsArray.push(normal);
    eledoors3.push(object[c]);
    normalsArray.push(normal);

    eledoors3.push(object[a]);
    normalsArray.push(normal);
    eledoors3.push(object[c]);
    normalsArray.push(normal);
    eledoors3.push(object[d]);
    normalsArray.push(normal);

    textureArrayeleDoor3.push(textureUnit[a]);
    textureArrayeleDoor3.push(textureUnit[b]);
    textureArrayeleDoor3.push(textureUnit[c]);
    textureArrayeleDoor3.push(textureUnit[a]);
    textureArrayeleDoor3.push(textureUnit[c]);
    textureArrayeleDoor3.push(textureUnit[d]);
  } else if (element == 5) {
    eledoors4.push(object[a]);
    normalsArray.push(normal);
    eledoors4.push(object[b]);
    normalsArray.push(normal);
    eledoors4.push(object[c]);
    normalsArray.push(normal);

    eledoors4.push(object[a]);
    normalsArray.push(normal);
    eledoors4.push(object[c]);
    normalsArray.push(normal);
    eledoors4.push(object[d]);
    normalsArray.push(normal);

    textureArrayeleDoor4.push(textureUnit[a]);
    textureArrayeleDoor4.push(textureUnit[b]);
    textureArrayeleDoor4.push(textureUnit[c]);
    textureArrayeleDoor4.push(textureUnit[a]);
    textureArrayeleDoor4.push(textureUnit[c]);
    textureArrayeleDoor4.push(textureUnit[d]);
  }
}


function cooridors(floor) {
  if (floor == 3 || floor == 4) {
    quad(leftCorridor, 2, 0, 1, 3, 1);
    quad(rightCorridor, 2, 0, 1, 3, 1);
    quad(frontCorridor, 2, 0, 1, 3, 1);
    quad(backCorridor, 2, 0, 1, 3, 1);
  }
}


function createLeftRooms(floor) {
  if (floor == 3 || floor == 4) {
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
  createRoom(vec4(min_x, 0, (-450 + (17 * 50))), 50, 100, 150, true, true, true, true);
}


function createRightRooms(floor) {
  if (floor == 3 || floor == 4) {
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
    createRightDoorRoom(vec4(-150, 0, -600), 150, 125, 150, true, true, true, true);
    createRightDoorRoom(vec4(-25, 0, -600), 150, 125, 150, true, true, true, true);
    createRightDoorRoom(vec4(120, 0, -600), 150, 49, 150, true, true, true, true);

    // 2nd from last two labs
    createRoom(vec4(0, 0, 125), 75, -100, 150, true, true, true, true);
    createRoom(vec4(0, 0, 125), 75, 100, 150, true, true, true, true);

    // Last two labs
    createRoom(vec4(0, 0, 200), 200, -100, 150, true, true, true, true);
    createRoom(vec4(0, 0, 200), 200, 100, 150, true, true, true, true);

    // 2nd from first three labs
    createRoom(vec4(0, 0, -400), 200, -100, 150, true, true, true, true);
    createRoom(vec4(0, 0, -400), 100, 100, 150, true, true, false, true);
    createRoom(vec4(0, 0, -300), 100, 100, 150, false, true, false, true);
    // Stairs
    //  createRoom(vec4(-25, 0, -35), 70, -75, 150, true, true, true, true);
    //  createRoom(vec4(-25, 0, -35), 70, 125, 150, true, true, true, true);
    createRightDoorRoom(vec4(25, 0, -75), 50, 60, 150, true, true,false, true);
    createRightDoorRoom(vec4(25, 0, -25), -50, -110, 150, true, true, false, true);
  }
  if (floor == 3) {
    // First three labs
    createRightDoorRoom(vec4(-150, 0, -600), 150, 125, 150, true, true, true, true);
    createRightDoorRoom(vec4(-25, 0, -600), 150, 125, 150, true, true, true, true);
    createRightDoorRoom(vec4(120, 0, -600), 150, 49, 150, true, true, true, true);

    // 2nd from last two labs
    createRoom(vec4(0, 0, 125), 75, -100, 150, true, true, true, true);
    createRoom(vec4(0, 0, 125), 75, 100, 150, true, true, true, true);

    // Last labs
    createRoom(vec4(-100, 0, 200), 200, 200, 150, true, true, true, true);

    // 2nd from first three labs
    createRoom(vec4(0, 0, -400), 200, -100, 150, true, true, true, true);
    createRoom(vec4(0, 0, -400), 200, 100, 150, true, true, false, true);
    //createRoom(vec4(0, 0, -300), 100, 100, 150, false, true, false, true);
    // Stairs
    //  createRoom(vec4(-25, 0, -35), 70, -75, 150, true, true, true, true);
    //  createRoom(vec4(-25, 0, -35), 70, 125, 150, true, true, true, true);
    createRightDoorRoom(vec4(25, 0, -75), 50, 60, 150, true, true, false, true);
    createRightDoorRoom(vec4(25, 0, -25), -50, -110, 150, true, true, false, true);
  }
}

function createRestroom(floor) {
  if (floor == 3 || floor == 4) {
    createRoom(vec4(-100, 0, -200), 50, 50, 150, false, true, true, true);
    createRoom(vec4(100, 0, -200), 50, -50, 150, false, true, true, true);
  }
}

function createElevator(floor) {


  var length = -40;
  var start = vec4(100, 0, 125);
  var width = -200;
  var height = 150;

  if (floor == 3 || floor == 4) {
    //createRightDoorRoom(vec4(100, 0, 125), -40, -200, 150, true, true, true, true);

    rightSide = [
      //right potion
      vec3(start[0], height, start[2] + length),
      vec3(start[0] + (width / 3), height, start[2] + length),
      vec3(start[0], 0, start[2] + length),
      vec3(start[0] + (width / 3), 0, start[2] + length),
      // left portion
      vec3(start[0] + (2 * width / 3), height, start[2] + length),
      vec3(start[0] + width, height, start[2] + length),
      vec3(start[0] + (2 * width / 3), 0, start[2] + length),
      vec3(start[0] + width, 0, start[2] + length),
      // upper portion of door
      vec3(start[0] + width / 3, height, start[2] + length),
      vec3(start[0] + width / 3 * 2, height, start[2] + length),
      vec3(start[0] + width / 3, 0, start[2] + length),
      vec3(start[0] + width / 3 * 2, 0, start[2] + length)
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
      vec3(start[0] + width, height, start[2] + length),
      vec3(start[0] + width, 0, start[2]),
      vec3(start[0] + width, 0, start[2] + length),
    ];

    quad(frontSide, 2, 0, 1, 3, 0);
    quad(backSide, 2, 0, 1, 3, 0);
    quad(rightSide, 2, 0, 1, 3, 0);
    quad(rightSide, 6, 4, 5, 7, 0);

  }

  if (floor == 3) {
    quad(rightSide, 10, 8, 9, 11, 4);
  } else if (floor == 4) {
    quad(rightSide, 10, 8, 9, 11, 5);
  }
}

var check_valid_up = function() {
  if (up[0] == 0 && up[1] == 0 && up[2] == 0) {
    // reset the up value, because all zero is not a valid up directionMat
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
    at[2] += 0.0001;
  }
  var n = normalize(subtract(at, eye)); // view directionMat vector
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

  loadFloor(selectedFloor);

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

  document.getElementById("Restriction").onclick = walkRestriction;

  /*
      document.getElementById("changeFloor").onchange = function () {
          selectedFloor = parseInt(document.getElementById("changeFloor").value);
          floorChanged = true;

};  */

  render();
}


function loadFloor(numberOfFloor) {
  walls = [];
  carpet = [];
  doors = [];
  normalsArray = [];

  textureArrayFloor = [];
  textureArrayWall = [];
  textureArrayDoor = [];

  createLeftRooms(numberOfFloor);
  createRightRooms(numberOfFloor);
  createLab(numberOfFloor);
  createRestroom(numberOfFloor);
  createElevator(numberOfFloor);
  cooridors(numberOfFloor);
  // floors(numberOfFloor);
  console.log(viewfloorTop);
  if (!viewfloorTop) makeCeiling();

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  var allVertices = doors.concat(eledoors3).concat(eledoors4).concat(walls).concat(carpet);
  var allTextures = textureArrayDoor.concat(textureArrayeleDoor3).concat(textureArrayeleDoor4).concat(textureArrayWall).concat(textureArrayFloor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(allVertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.enableVertexAttribArray(vPosition);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(allTextures), gl.STATIC_DRAW);

  var tTexture = gl.getAttribLocation(program, "aTextureCoord");
  gl.enableVertexAttribArray(tTexture);
  gl.vertexAttribPointer(tTexture, 2, gl.FLOAT, false, 0, 0);

}

var render = function() {
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (floorChanged) {
    if (selectedFloor == 3) {
      selectedFloor = 4;
      eledoors3 = [];
      textureArrayeleDoor3 = [];
    } else if (selectedFloor == 4) {
      selectedFloor = 3;
      eledoors4 = [];
      textureArrayeleDoor4 = [];
    }
    loadFloor(selectedFloor);
    floorChanged = false;
  }
  document.getElementById("dispCurrentFloor").innerHTML = selectedFloor;
  handleKeys();
  check_valid_up();

  //var m_Camera = getCamera(eye, at, up);
  //var m_P = getProjection();
  //mvMatrix = lookAt(eye, at, subtract(up, eye));
  mvMatrix = lookAt(eye, at, up);
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
  gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(projection, false, flatten(pMatrix));

  //gl.uniformMatrix4fv(modelView, false, flatten(m_Camera));
  //gl.uniformMatrix4fv(projection, false, flatten(m_P));


  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  gl.uniform1i(uSampler, 0);
  gl.drawArrays(gl.TRIANGLES, 0, doors.length); //door

  if (eledoors3.length > 0) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.uniform1i(uSampler, 0);
    gl.drawArrays(gl.TRIANGLES, doors.length, eledoors3.length); //elev3
  }
  if (eledoors4.length > 0) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[3]);
    gl.uniform1i(uSampler, 0);
    gl.drawArrays(gl.TRIANGLES, doors.length + eledoors3.length, eledoors4.length); //elev4
  }

  lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  ambientProduct = mult(lightAmbient, materialAmbient);
  gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.uniform1i(uSampler, 0);
  gl.drawArrays(gl.TRIANGLES, doors.length + eledoors3.length + eledoors4.length, walls.length); // wall

  if (carpet.length > 0) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[4]);
    gl.uniform1i(uSampler, 0);
    //  gl.drawArrays(gl.TRIANGLES, doors.length+eledoors3.length+eledoors4.length+walls.length, carpet.length); // carpet
    gl.drawArrays(gl.TRIANGLES, doors.length + eledoors3.length + eledoors4.length + walls.length, carpet.length); // carpet
  }


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
var viewfloorTop = false;
var viewfloorBtm = false;
var upsaved;
var eyesaved;
var atsaved;
var personheightsaved;
var directionMatsaved;
var viewfloortimer0 = 0;
var viewfloortimer1 = 0;
var enableMove = true;

function handleKeys() {
  if (currentlyPressedKeys[70]) { // F, allow floor plan view
    viewfloortimer0 = viewfloortimer0 + 1;
    if (viewfloortimer0 > 10) {
      if (!viewfloorTop) {
        upsaved = up;
        eyesaved = eye;
        atsaved = at;
        personheightsaved = personheight;
        directionMatsaved = directionMat;

        up = vec3(0.0, 0.0, 1.0);
        eye = vec3(0, 1200, -10); // Initial at  elevator
        at = vec3(0, 10, -10);
        personheight = 1200;
        directionMat = mat3(
          [-1, 0, 0],
          [0, 0, -1],
          [0, -1, 0]);
        viewfloorTop = true;
        enableMove = false;
      } else {
        up = upsaved;
        eye = eyesaved;
        at = atsaved;
        personheight = personheightsaved;
        directionMat = directionMatsaved;
        viewfloorTop = false;
        enableMove = true;
      }
      viewfloortimer0 = 0;
    }

  }

  if (currentlyPressedKeys[71]) { // F, allow floor plan view
    viewfloortimer1 = viewfloortimer1 + 1;
    if (viewfloortimer1 > 7) {
      if (!viewfloorBtm) {
        up = vec3(0.0, 0.0, -1.0);
        eye = vec3(0, -1200, -10); // Initial at  elevator
        at = vec3(0, 10, -10);
        personheight = -1200;
        directionMat = mat3(
          [-1, 0, 0],
          [0, 0, 1],
          [0, 1, 0]);
        viewfloorBtm = true;
        enableMove = false;
      } else {
        up = upsaved;
        eye = eyesaved;
        at = atsaved;
        personheight = personheightsaved;
        directionMat = directionMatsaved;
        viewfloorBtm = false;
        enableMove = true;
      }
      viewfloortimer1 = 0;
    }
  }

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

  var motion = vec3(leftright * speed, viewheight - eye[1], forwardback * speed);
  var motionDirected = multMV(directionMat, motion);
  neweye = add(eye, vec3(motionDirected));

//  console.log(checkleftCorridor());
if(isRestrict){
  if (checkleftCorridor() || checkrightCorridor() || checkfrontCorridor() || checkbackCorridor() ||
    checkcenterCorridors() || checkleftRooms() || checkRightRooms() || checkLabs() || checkrestrooms()) {
    enableMove = true;
  } else {
    enableMove = false;
  }
}

  if (enableMove) {
    eye = neweye;
    at = add(at, vec3(motionDirected));
  }

  if ((eye[0] < 100 && eye[0] > -100 && eye[2] < 125 && eye[2] > 85) ||
(eye[0] < 85 && eye[0] > -85 && eye[2] < -25 && eye[2] > -75) ) { //in elevator, change floor
    floorChanged = true;
    up = vec3(0.0, 1.0, 0.0);
    eye = vec3(0, personheight, 0); // Initial at left corridor, better at elevator
    at = vec3(0, personheight, 100);
  }

}

var isRestrict = false;
function walkRestriction(){
  isRestrict = !isRestrict;
}


var clearance = 3;
var neweye;

function checkleftCorridor() {
  if ((eye[0] > leftCorridor[0][0]) & (eye[0] < leftCorridor[1][0]) & (eye[2] < leftCorridor[0][2]) & (eye[2] > leftCorridor[2][2]) &
    (neweye[2] <= leftCorridor[0][2] - clearance) & (neweye[2] >= leftCorridor[2][2] + clearance) & // end walls
    !((neweye[0] <= leftCorridor[0][0] - clearance) & leftInrangeNX()) & // -x walls
    !((neweye[0] >= leftCorridor[1][0] + clearance) & leftInrangePX(0)) // +x walls
  ) {
    return true;
  } else {
    return false;
  }
}

function leftInrangeNX() {
  var inrange = false;
  if ((eye[2] >= (-450) & eye[2] <= (-450 + 100 / 3)) || (eye[2] >= (-450 + 100 / 3 * 2) & eye[2] <= (-450 + 100 + 50 / 3))) {
    inrange = true;
  }

  for (var i = 2; i < 7; i++) {
    if (eye[2] >= (-450 + i * 50 + 50 / 3 * 2) & eye[2] <= (-450 + i * 50 + 50 + 50 / 3)) {
      inrange = true;
    }
  }

  if ((eye[2] >= (-450 + 7 * 50 + 50 / 3 * 2) & eye[2] <= (-450 + 7 * 50 + 50 + 100 / 3)) || (eye[2] >= (-450 + 7 * 50 + 50 + 100 / 3 * 2) & eye[2] <= (-450 + 7 * 50 + 50 + 100 + 50 / 3))) {
    inrange = true;
  }

  for (var i = 9; i < 16; i++) {
    if (eye[2] >= (-450 + i * 50 + 50 / 3 * 2) & eye[2] <= (-450 + i * 50 + 50 + 50 / 3)) {
      inrange = true;
    }
  }
  if (eye[2] >= (-450 + 16 * 50 + 50 / 3 * 2) & eye[2] <= (-450 + 16 * 50 + 50)) {
    inrange = true;
  }
  return inrange;
}

function leftInrangePX(lr) {
  var inrange = false;
  if (!lr) {
    if (eye[2] >= (-600) & eye[2] <= (-600 + 150)) {
      inrange = true;
    }
    if ((eye[2] >= (125) & eye[2] <= (125 + 75 / 3)) || (eye[2] >= (-125 + 57 / 3 * 2) & eye[2] <= (-125 + 75))) {
      inrange = true;
    }
    if ((eye[2] >= (200) & eye[2] <= (200 + 200 / 3)) || (eye[2] >= (200 + 200 / 3 * 2) & eye[2] <= (200 + 200))) {
      inrange = true;
    }
    if ((eye[2] >= (-400) & eye[2] <= (-400 + 200 / 3)) || (eye[2] >= (-400 + 200 / 3 * 2) & eye[2] <= (-400 + 200))) {
      inrange = true;
    }
    if (eye[2] >= (-75) & eye[2] <= (-75 + 50)) {
      inrange = true;
    }
  } else {

  }

return inrange;
}

function checkrightCorridor() {
  console.log(leftInrangePX(0));
  if ((eye[0] <= rightCorridor[0][0]) & (eye[0] >= rightCorridor[1][0]) & (eye[2] <= rightCorridor[0][2]) & (eye[2] >= rightCorridor[2][2]) &
    (neweye[2] <= rightCorridor[0][2] - clearance) & (neweye[2] >= rightCorridor[2][2] + clearance) & // end walls
    !((neweye[0] >= rightCorridor[0][0] - clearance) & leftInrangePX(0)) & // -x walls
    !((neweye[0] <= rightCorridor[1][0] + clearance) & leftInrangeNX()) // +x walls
  ) {
    return true;
  } else {
    return false;
  }
}

function checkfrontCorridor() {
  if ((eye[0] >= frontCorridor[0][0]) & (eye[0] <= frontCorridor[1][0]) & (eye[2] <= frontCorridor[0][2]) & (eye[2] >= frontCorridor[2][2]) &
    (neweye[0] >= frontCorridor[0][0] + clearance) & (neweye[0] <= frontCorridor[1][0] - clearance) & // end walls
    !((neweye[2] >= frontCorridor[0][2] + clearance) & frontInrangeNZ()) &
    !((neweye[2] <= frontCorridor[2][2] - clearance) & frontInrangePZ())
  ) {
    return true;
  } else {
    return false;
  }
}


function frontInrangeNZ(lr) {
  var inrange = false;
  if (eye[0] >= (-150) & eye[2] <= (-150 + 125 / 3)) {
    inrange = true;
  }
  if (eye[0] >= (-150 + 125 / 3 * 2) & eye[2] <= (-25 + 125 / 3)) {
    inrange = true;
  }
  if (eye[0] >= (-25 + 125 / 3 * 2) & eye[2] <= (120 + 49 / 3)) {
    inrange = true;
  }
  if (eye[0] >= (120 + 49 / 3 * 2) & eye[2] <= (120 + 49)) {
    inrange = true;
  }
  return inrange;
}

function frontInrangePZ(lr) {
  var inrange = false;
  if (eye[0] >= (-100) & eye[2] <= (-100 + 100 / 3)) {
    inrange = true;
  }
  if (eye[0] >= (-100 + 100 / 3 * 2) & eye[2] <= (-100 + 100 / 3 * 4)) {
    inrange = true;
  }
  if (eye[0] >= (-100 + 100 / 3 * 4) & eye[2] <= (100)) {
    inrange = true;
  }

  return inrange;
}

function checkbackCorridor() {

  if ((eye[0] >= backCorridor[0][0]) & (eye[0] <= backCorridor[1][0]) & (eye[2] >= backCorridor[0][2]) & (eye[2] <= backCorridor[2][2]) &
    (neweye[0] >= backCorridor[0][0] + clearance) & (neweye[0] <= backCorridor[1][0] - clearance) & (neweye[2] <= backCorridor[2][2] - clearance) & // end walls
    !((neweye[2] <= backCorridor[0][2] + clearance) & backInrangeNZ(selectedFloor) ) ) {
    return true;
  } else {
    return false;
  }
}

function backInrangeNZ(floor) {
  var inrange = false;
  if (floor == 3) {
    if (eye[0] >= (-100) & eye[2] <= (200)) {
      inrange = true;
    }
  };
  if (floor == 4) {
    if (eye[0] >= (-100) & eye[2] <= (-100 + 100 / 3)) {
      inrange = true;
    }
    if (eye[0] >= (-100 + 100 / 3 * 2) & eye[2] <= (-100 + 100 / 3 * 4)) {
      inrange = true;
    }
    if (eye[0] >= (-100 + 100 / 3 * 4) & eye[2] <= (100)) {
      inrange = true;
    }
  }
  return inrange;
}

function checkcenterCorridors() {
//  console.log(eye);
  console.log(neweye);

  var iftrue = false;
  if ((eye[0] >= -100) & (eye[0] <= 100) & (eye[2]>= -25) & (eye[2] <=125-40) &
  !((neweye[2] >= 125-40 - clearance) & ((eye[0] > (-100)) & (eye[0] < (-100+200/3)) || (eye[0] > (-100+200/3*2)) & (eye[0] < 100)) ) &
  !((neweye[2] <= -25 + clearance) &((eye[0] > (-100)) & (eye[0] < -80) || (eye[0] > -40) & (eye[0] < 100)))
){
      iftrue = true;
  }

  if ((eye[0] >= -100) & (eye[0] <= 100) & (eye[2]>= -150 ) & (eye[2] >=-75) &
  !((neweye[2] >= -75 - clearance) & ((eye[0] > (-15)) & (eye[0] < (-15+60+110/3)) || (eye[0] > (-15+60+110/3*2)) & (eye[0] <-15+60+110)) ) &
  !((neweye[2] <= -150 + clearance) &((eye[0] > (-100)) & (eye[0] < (-50)) || (eye[0] > (50)) & (eye[0] < 100))) &
  !((neweye[2] <= -200 + clearance) &((eye[0] > (-25)) & (eye[0] < 25) ))
){
      iftrue = true;
  }
  return iftrue;

}

function checkleftRooms() {
  return false;
}

function checkRightRooms() {
  return false;
}

function checkLabs() {
  return false;
}

function checkrestrooms() {
  return false;
}


/*
function checkPosition(currentPosition, additional) {
  if (((currentPosition[0] + additional[0]) > -150 && (currentPosition[0] + additional[0]) < -100) ||
    ((currentPosition[0] + additional[0]) < 150 && (currentPosition[0] + additional[0]) > 100)) {
    if ((currentPosition[2] + additional[2]) > -450 && (currentPosition[2] + additional[2]) < 449) {
      return true;
    }
  }
  if (((currentPosition[2] + additional[2]) > -449 && (currentPosition[2] + additional[2]) < -401) ||
    ((currentPosition[2] + additional[2]) < 449 && (currentPosition[2] + additional[2]) > 401)) {
    if ((currentPosition[0] + additional[0]) > -150 && (currentPosition[0] + additional[0]) < 150) {
      return true;
    }
  }
  return false;
}
*/

var xzangle = 0;
var yzangle = 0;
var mouseDown = false;
var clicked = false;

function canvasMouseDown(event) { // change view directionMat
  mouseDown = true;
  clicked = !clicked;
  var rect = canvas.getBoundingClientRect();
  lastX = event.clientX - rect.left;
  lastY = event.clientY - rect.top;

}


function handleMouseUp(event) {
  mouseDown = false;
  var rect = canvas.getBoundingClientRect();
  lastX = event.clientX - rect.left;
  lastY = event.clientY - rect.top;
}

var directionMat = mat3(
  vec3(-1, 0, 0), //right
  vec3(0, 1, 0), //up
  vec3(0, 0, 1)
); //forward

var lastX = 0;
var lastY = 0;


function canvasMouseMove(event) { // change walking direction

  var rect = canvas.getBoundingClientRect();
  var newX = event.clientX - rect.left - lastX;
  var newY = -(event.clientY - rect.top - lastY);
  lastX = event.clientX - rect.left;
  lastY = event.clientY - rect.top;

  if (!mouseDown) {
    if (clicked) {

      xzangle = xzangle + newX / Math.floor(canvas.width / 2) * 30 / 180 * Math.PI;
      yzangle = yzangle + newY / Math.floor(canvas.height / 2) * 30 / 180 * Math.PI;

      var angles = moveAt(xzangle, yzangle);
      xzangle = angles[0];
      yzangle = angles[1];
    }
  } else {
    clicked = false;
    xzangle = xzangle + newX / Math.floor(canvas.width / 2) * 30 / 180 * Math.PI;
    yzangle = yzangle + newY / Math.floor(canvas.height / 2) * 30 / 180 * Math.PI;

    //movedirectionMat(xzangle, yzangle);
    var angles = moveAt(xzangle, yzangle);
    xzangle = angles[0];
    yzangle = angles[1];

    var n = lookAt(at, eye, up);
    directionMat = mat3(vec3(normalize(subtract(vec3(0, 0, 0), n[0].slice(0, 3)))), vec3(up), vec3(normalize(subtract(at, eye))));
    //  console.log(directionMat);


  }
}

function moveAt(xzA, yzA) {
  if (xzA >= 2 * Math.PI) xzA = xzA - 2 * Math.PI;
  if (xzA < 0) xzA = xzA + 2 * Math.PI;
  if (yzA >= 2 * Math.PI) yzA = yzA - 2 * Math.PI;
  if (yzA < 0) yzA = yzA + 2 * Math.PI;

  var x = length(subtract(at, eye)) * Math.cos(yzA) * Math.sin(xzA);
  var y = length(subtract(at, eye)) * Math.sin(yzA);
  var z = length(subtract(at, eye)) * Math.cos(yzA) * Math.cos(xzA);


  at = add(eye, vec3(-x, y, z));
  up = vec3(Math.sin(yzA) * Math.sin(xzA), Math.cos(yzA), -Math.sin(yzA) * Math.cos(xzA));


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

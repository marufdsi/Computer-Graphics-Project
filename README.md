# Computer-Graphics-Project

This project provides an interactive navigation of two floors of a building. 
- Initial position is in front of elevator.
- Walk inside elevator or stair to switch floor. Since only two floors are modeled so far, the floors are directly switched.
- WASD to move forward, left, backward, right
- ER to change the motion speed, E: speeding, R: slowing down
- CZ to Crouch or Prone, could see from different viewing position, SPACE to jump
- Click on the canvas to enable/disable rotating of camera. To disable, you need to click the canavas again.
- Mouse drag (click, hold, and move) to change walking direction. Into the screen is made forward. 

Constructions:
- Model is built by specifying vertices
- Lighting includes ambient, diffuse, and specular 
- Motion is enable by adjusting the eye position, at and up direction according to the walking direction and speed. 
- 5 Textures are used for wall, carpet, door, and the two elevator doors. 
- Walking restrictions are done by limiting the walking motion according to the eye position. 

Updating:
- Walking restrictions: user will not be allowed to walk through walls.
- Adjusting lighting for better appearance.
- Doors are not uniform size, could be adjsuted for better appearance. Glass effect could be added for better effects. 
- Would be fun to add door open effects. 

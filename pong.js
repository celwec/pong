/*
** Pong
*/

/*
** -----------------------------------------------------------------------------
** Config
** -----------------------------------------------------------------------------
*/

var CANVAS_WIDTH   = 800,
    CANVAS_HEIGHT  = 600,
		SCREEN_PADDING =  40; // Distance between paddles and left and right border

var PADDLE_WIDTH  =  20,
		PADDLE_HEIGHT = 100;

var FPS = 60; // How many times the game updates per second

var NET = true; // Draw dashed center line?

var DEFAULT_BALL_SPEED = 10,
		MAX_BALL_SPEED     = 20;

var VICTORY_SCORE = 1;

var BACKGROUND_COLOR  = "#101010",
		ENVIRONMENT_COLOR = "#c0c0c0",
		ACTOR_COLOR       = "#f0f0f0";

/*
** -----------------------------------------------------------------------------
** Init
** -----------------------------------------------------------------------------
*/

var canvas  = document.getElementById("pong"),
		context = canvas.getContext("2d");

canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.style.background = BACKGROUND_COLOR;

canvas.addEventListener("mousemove" , handler);
canvas.addEventListener("mousedown", handler);

var gameIsRunning = false,
    gameOver      = false;

/*
** -----------------------------------------------------------------------------
** Actors
** -----------------------------------------------------------------------------
*/

var player = {
  name:"Player",
	x:SCREEN_PADDING,
	y:canvas.height / 2 - PADDLE_HEIGHT / 2,
	w:PADDLE_WIDTH,
	h:PADDLE_HEIGHT
};

var computer = {
  name:"Computer",
	x:canvas.width - SCREEN_PADDING - PADDLE_WIDTH,
	y:canvas.height / 2 - PADDLE_HEIGHT / 2,
	w:PADDLE_WIDTH,
	h:PADDLE_HEIGHT
};

var ball = {
	x:canvas.width / 2,
	y:canvas.height / 2,
	r:8,
	dir:0,
	speed:DEFAULT_BALL_SPEED
};

var score = {
	player:0,
	computer:0,
  winner:""
};

/*
** -----------------------------------------------------------------------------
** Logic
** -----------------------------------------------------------------------------
*/

// Event handling
function handler(e) {

	// Get mouse position
	var mouse = getPos(e.x, e.y);

	// Binding player paddle to mouse position
	player.y = mouse.y - PADDLE_HEIGHT / 2;

	// Left mouse button down
	if (e.buttons == 1 && gameIsRunning == false) {
    if (gameOver == false) start();
    else newGame();
  }

}

function getPos(x, y) {

	// Remove canvas offset from coordinates
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;

	return {
		x:x,
		y:y
	};

}

// Starts the game
function start() {

	gameIsRunning = true;
	ball.dir = 2 * Math.PI * Math.random();

}

function newGame() {

  gameOver = false;
  score.player = 0;
  score.computer = 0;
  score.winner = "";

}

// Resets the ball
function reset() {

	gameIsRunning = false;
	ball.x = canvas.width  / 2;
	ball.y = canvas.height / 2;
	ball.speed = DEFAULT_BALL_SPEED;

}

function random() {

	return (Math.random() * (0.9 - 1.1) + 1.1).toFixed(4)

}

// Collision detection
function collision() {

	// Ball left the screen to the left or the right
	// Player or computer score increases
	if (ball.x + ball.r < 0) {
		score.computer++;
		reset();
    if(score.computer >= VICTORY_SCORE) {
      score.winner = computer.name;
      gameIsRunning = false;
      gameOver = true;
    }
	}
	if (ball.x - ball.r > canvas.width) {
		score.player++;
		reset();
    if(score.player >= VICTORY_SCORE) {
      score.winner = player.name;
      gameIsRunning = false;
      gameOver = true;
    }
	}

	// Ball collision with top and bottom of the screen
	if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.dir = 2 * Math.PI - ball.dir;

	// Ball collision with paddles
	if (
		(player.x < ball.x + ball.r       &&
		player.x + player.w > ball.x      &&
		player.y < ball.y + ball.r        &&
		player.y + player.h > ball.y)     ||
		(computer.x < ball.x + ball.r     &&
		computer.x + computer.w > ball.x  &&
		computer.y < ball.y + ball.r      &&
		computer.y + computer.h > ball.y)
	) {

		ball.dir = Math.PI * random() - ball.dir;
		if (ball.speed < 20) ball.speed++;

	}

}

// Updating ball positions
function updateBall() {

	ball.x += ball.speed * Math.cos(ball.dir);
	ball.y += ball.speed * Math.sin(ball.dir);

}

// Updating computer positions
function ai() {

  // Unbeatable AI...
	computer.y = ball.y - computer.h / 2;

}

/*
** -----------------------------------------------------------------------------
** Runtime
** -----------------------------------------------------------------------------
*/

// Updates the screen
function update() {

	// Clear screen before drawing
	context.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {

    // Draw net?
    if (NET) {
      for (var y = 0; y < canvas.height; y++) {
        if (y % 20 == 0) {
          context.strokeStyle = ENVIRONMENT_COLOR;
          context.beginPath();
          context.moveTo(canvas.width / 2, y);
          context.lineTo(canvas.width / 2, y + 10);
          context.stroke();
        }
      }
    }

    // Draw score
    context.fillStyle = ENVIRONMENT_COLOR;
    context.font = "30px arial";
    context.textAlign = "center";
    context.fillText(score.player, 1/4 * canvas.width, 1/8 * canvas.height);
    context.fillText(score.computer, 3/4 * canvas.width, 1/8 * canvas.height);

    // Draw actors
    context.fillStyle = ACTOR_COLOR;
    context.beginPath();
    context.rect(player.x, player.y, player.w, player.h);
    context.rect(computer.x, computer.y, computer.w, computer.h);
    context.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
    context.fill();

  } else {

    context.fillStyle = ACTOR_COLOR;
    context.font = "30 px arial";
    context.textAlign = "center";
    context.fillText("Winner: " + score.winner, canvas.width / 2, canvas.height /2);

  }
}

// Runs the game
function act() {

	if (gameIsRunning && !gameOver) {

		updateBall();
		ai();
    collision();

	}

	update();

}

// Updates the game every 'FPS' times a second
setInterval(act, 1000/FPS);

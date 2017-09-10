/*
TODO

BUGS/ISSUES

IMPROVE

IMPLEMENT
-Start screen
-Wall kick
-Ghost piece
*/
"use strict";

var BLOCKLENGTH = 30;
var SHAPEUPDATERATE = 7;

var canvas;
var ctx;
var playingField = createPlayingField();

var keyPressUpdateRate = 0;
var nextPiece;
var player;
var shapeTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

var actions = {};
actions.pause = new defaultActionProperties(27, "pause"); // Esc
actions.hold = new defaultActionProperties(67); // c
actions.shiftLeft = new defaultActionProperties(37); // left arrow
actions.shiftRight = new defaultActionProperties(39); // right arrow
actions.rotateRight = new defaultActionProperties(38); // up arrow
actions.rotateLeft = new defaultActionProperties(90); // z
actions.softDrop = new defaultActionProperties(40); // down arrow
actions.hardDrop = new defaultActionProperties(32); // space bar

function defaultActionProperties(code, action) {
	this.keyCode = code;
	this.state = false;
	if (action === "pause")
		this.keyHeld = false;
}

function Shapes(type) {
	this.type = type;
	this.rotationIndex = 0;
	this.locking = false;
	this.stopRotating = true;
	this.autoDropRate = 0;
	this.center = [4, 1];
	this.blocks = getStartingPositions(type, 2);
}

Shapes.prototype.dropHard = true;
Shapes.prototype.hold = true;
Shapes.prototype.storedPiece;
Shapes.prototype.updateRate = 100;

function defaultShapeProperties(colour, xCoord, yCoord) {
	this.colour = colour;
	this.rotationCoordinateX = xCoord;
	this.rotationCoordinateY = yCoord;
}

// coordinates of all possible rotation positions of each block relative to center
Shapes.prototype.I = new defaultShapeProperties("cyan", 
	[[-2, -1, 0, 1], [0, 0, 0, 0], [-2, -1, 0, 1], [-1, -1, -1, -1]],
	[[-1, -1, -1, -1], [-2, -1, 0, 1], [0, 0, 0 , 0], [-2, -1, 0, 1]]
);

Shapes.prototype.J = new defaultShapeProperties("blue",
	[[-1, -1, 1, 0], [1, 0, 0, 0], [1, 1, -1, 0], [-1, 0, 0, 0]],
	[[-1, 0, 0, 0], [-1, -1, 1, 0], [1, 0, 0, 0], [1, 1, -1, 0]]
);

Shapes.prototype.L = new defaultShapeProperties("orange",
	[[-1, 1, 1, 0], [0, 0, 1, 0], [1, -1, -1, 0], [0, 0, -1, 0]],
	[[0, 0, -1, 0], [-1, 1, 1, 0], [0, 0, 1, 0], [1, -1, -1, 0]]
);

Shapes.prototype.O = new defaultShapeProperties("yellow",
	[[-1, -1, 0, 0]],
	[[-1, 0, -1, 0]]
);

Shapes.prototype.S = new defaultShapeProperties("green",
	[[-1, 0, 1, 0], [0, 1, 1, 0], [-1, 0, 1, 0], [-1, -1, 0, 0]],
	[[0, -1, -1, 0], [-1, 0, 1, 0], [1, 1, 0, 0], [-1, 0, 1, 0]]
);

Shapes.prototype.T = new defaultShapeProperties("purple",
	[[-1, 0, 1, 0], [0, 1, 0, 0], [1, 0, -1, 0], [0, -1, 0, 0]],
	[[0, -1, 0, 0], [-1, 0, 1, 0], [0, 1, 0, 0], [1, 0, -1, 0]]
);

Shapes.prototype.Z = new defaultShapeProperties("red",
	[[-1, 0, 1, 0], [1, 1, 0, 0], [1, 0, -1, 0], [-1, -1, 0, 0]],
	[[-1, -1, 0, 0], [-1, 0, 1, 0], [1, 1, 0, 0], [1, 0, -1, 0]]
);

Shapes.prototype.removeFromPlayingField = function() {
	for (var i = 0; i < this.blocks.length; i++) {
		var x = this.blocks[i][0];
		var y = this.blocks[i][1];
		playingField[y][x] = 0;
	}	
};

// test whole piece for any collisions
Shapes.prototype.detectPieceCollisions = function(horizontalShift, verticalShfit) {
	// return true only when no collisions are detected
	var blocks = this.blocks;
	for (var i = 0; i < blocks.length; i++) {
		if (!this.detectBlockCollisions(blocks[i], horizontalShift, verticalShfit)) {	
			return false;
		}
	}
	return true;
};

// tests individual blocks with its shift for collisions
Shapes.prototype.detectBlockCollisions = function(block, horizontalShift, verticalShfit) {
	var xResultant = block[0] + horizontalShift;
	var yResultant = block[1] + verticalShfit;

	// test side walls and ceiling first to prevent piece from locking on side wall
	if (xResultant >= playingField[0].length || xResultant < 0 || yResultant < 0) {
		return false;
	}

	// if resultant is not a block in player
	if (!this.collidingWithPlayerBlocks(xResultant, yResultant)) {

		// if block is in undefined position or a shape is already there
		if (typeof playingField[yResultant] === "undefined" || playingField[yResultant][xResultant] !== 0) {
			if (!this.locking && this.isLockable()) {
				this.lockPiece(300);
			}

			return false;
		}
	}

	// test floor
	if (yResultant > playingField.length - 1) {
		return false;
	}

	// no collisions detected
	return true;
};

// return true when coordinates are colliding with player
Shapes.prototype.collidingWithPlayerBlocks = function(xCoord, yCoord) {
	for (var i = 0;  i < this.blocks.length; i++) {
		if (xCoord === this.blocks[i][0] && yCoord === this.blocks[i][1]) {
			return true;
		} 
	}	
	return false;
};

Shapes.prototype.lockPiece = function(lockDelay) {
	this.locking = true;
	// copy blocks array
	var initialPosition = this.blocks.map(function(arr) {
    	return arr.slice();
	});

	function canLock() {
		// stop if blocks are not in same position lockDelay milliseconds ago
		for (var i = 0; i < initialPosition.length; i++) {
			if (initialPosition[i][0] !== player.blocks[i][0] || initialPosition[i][1] !== player.blocks[i][1]) {
				player.locking = false;
				return false;
			}
		}
		Shapes.prototype.hold = true;
		clearFilledLine();
		player.updateInterval = clearInterval(player.updateInterval);
		player = initialiseNewPiece();
				
	}
	window.setTimeout(canLock, lockDelay);
};

Shapes.prototype.isLockable = function() {
	for (var i = 0; i < this.blocks.length; i++) {
		var xCoord = this.blocks[i][0];
		var yCoord = this.blocks[i][1] + 1;
		if (!this.collidingWithPlayerBlocks(xCoord, yCoord)) {
			if (typeof playingField[yCoord] === "undefined" || playingField[yCoord][xCoord] !== 0) {
				return true;
			} 
		}
	}
	return false;
};

Shapes.prototype.autoDrop = function() {
	var autoDropLimit = this.updateRate / 10;
	if (this.autoDropRate >= autoDropLimit) {
		this.softDrop();
		this.autoDropRate = 0;
	}
	this.autoDropRate++;
	this.updatePlayingField();	
};

Shapes.prototype.hardDrop = function() {
	Shapes.prototype.dropHard = false;
	for (var i = 0; i < playingField.length; i++) {
		// if collision found, stop and lock piece here
		if (!this.detectPieceCollisions(0, i)) {
			this.removeFromPlayingField();

			var verticalShfit = i - 1;			
			for (var j = 0; j < this.blocks.length; j++) {
				this.blocks[j][1] += verticalShfit;
			}
			this.center[1] += verticalShfit;
			this.lockPiece(0);
			break;
		}
	}
	this.updatePlayingField();	
};

Shapes.prototype.softDrop = function() {
	var verticalShfit = 1;

	if (this.detectPieceCollisions(0, verticalShfit)) {
		this.removeFromPlayingField();
		this.center[1] += verticalShfit;
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i][1] += verticalShfit;	
		}
	}
	this.updatePlayingField();	
};

Shapes.prototype.shiftHorizontally = function(units) {
	var horizontalShift = units;

	if (this.detectPieceCollisions(horizontalShift, 0)) {
		this.removeFromPlayingField();
		this.center[0] += horizontalShift;
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i][0] += horizontalShift;	
		}	
	}
	this.updatePlayingField();	
};

Shapes.prototype.rotate = function(direction) {
	var type = this.type;
	var length = this[type].rotationCoordinateX.length;
	var newIndex = (this.rotationIndex + direction).mod(length);
	for (var i = 0; i < this.blocks.length; i++) {
		var offsetX = this[type].rotationCoordinateX[newIndex][i];
		var offsetY = this[type].rotationCoordinateY[newIndex][i];
		
		// check if rotated block may have a collision
		if (!this.detectBlockCollisions(this.center, offsetX, offsetY)) {
			return false;
		}
	}
	this.removeFromPlayingField();
	this.rotationIndex = newIndex;
	for (var i = 0; i < this.blocks.length; i++) {
		var newX = this.center[0] + this[type].rotationCoordinateX[newIndex][i];
		this.blocks[i][0] = newX;

		var newY = this.center[1] + this[type].rotationCoordinateY[newIndex][i];
		this.blocks[i][1] = newY;
	}
	Shapes.prototype.rotateOnce = false;
	this.updatePlayingField();	
	return true;
};

Shapes.prototype.updatePlayingField = function() {
	for (var i = 0; i < this.blocks.length; i++) {
		var x = this.blocks[i][0];
		var y = this.blocks[i][1];
		var type = this.type;
		playingField[y][x] = this[type].colour;
	}
};

Shapes.prototype.isGameOver = function() {
	for (var i = 0; i < this.blocks.length; i++) {
		var xCoord = this.blocks[i][0];
		var yCoord = this.blocks[i][1];
		if (playingField[yCoord][xCoord] !== 0) {
			return true;
		}
	}
	return false;
};

Shapes.prototype.updatePiece = function() {
	if (!menu.pause && !menu.gameOver) {
		if (actions.shiftRight.state) {
			if (keyPressUpdateRate === 0)
				this.shiftHorizontally(1);
			keyPressUpdateRate = (keyPressUpdateRate + 1) % SHAPEUPDATERATE;
		} else if (actions.shiftLeft.state) {
			if (keyPressUpdateRate === 0)
				this.shiftHorizontally(-1);
			keyPressUpdateRate = (keyPressUpdateRate + 1) % SHAPEUPDATERATE;
		}
		
		if (actions.softDrop.state) {
			if (keyPressUpdateRate === 0)
				this.softDrop();
			keyPressUpdateRate = (keyPressUpdateRate + 1) % SHAPEUPDATERATE;
		}

		if (actions.rotateRight.state && Shapes.prototype.rotateOnce) {
			this.rotate(1);
		} else if (actions.rotateLeft.state && Shapes.prototype.rotateOnce) {
			this.rotate(-1);
		}  	

		if (actions.hardDrop.state && Shapes.prototype.dropHard) {	
			this.hardDrop();
		} 		
	}	

	if (!actions.hardDrop.state) {
		Shapes.prototype.dropHard = true;
	}	
	if (!actions.rotateRight.state && !actions.rotateLeft.state) {
		Shapes.prototype.rotateOnce = true;
	}		
};

function getStartingPositions(type, verticalShfit) {
	var startingPosition;
	if (type === "I") startingPosition = [[3, 0], [4, 0], [5, 0], [6, 0]];
	else if (type === "J") startingPosition = [[3, 0], [3, 1], [4, 1], [5, 1]];
	else if (type === "L") startingPosition = [[3, 1], [4, 1], [5, 1], [5, 0]];
	else if (type === "O") startingPosition = [[3, 0], [4, 0], [3, 1], [4, 1]];
	else if (type === "S") startingPosition = [[3, 1], [4, 1], [4, 0], [5, 0]];
	else if (type === "T") startingPosition = [[3, 1], [4, 1], [5, 1], [4, 0]];
	else if (type === "Z") startingPosition = [[3, 0], [4, 0], [4, 1], [5, 1]];
	
	if (verticalShfit) {
		for (var i = 0; i < startingPosition.length; i++) {
			startingPosition[i][1] += verticalShfit;
		}
	}
	return startingPosition;
}

function clearFilledLine() {
	var newPlayingField = [];
	for (var i = 0; i < playingField.length; i++) {
		var consecutives = 0;
		newPlayingField.push(playingField[i]);

		for (var j = 0; j < playingField[i].length; j++) {
			if (playingField[i][j] !== 0) {
				consecutives++;
			}
		}
		if (consecutives === playingField[0].length) {
			newPlayingField.splice(i);
			newPlayingField.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
			menu.score++;
			menu.updateScore();
			if (menu.score % 10 === 0 && Shapes.prototype.updateRate > 10) {
				Shapes.prototype.updateRate -= 10;
				menu.level++;
				menu.updateLevel();
			}
		}
	}
	playingField = newPlayingField;
}

function holdPiece() {
	// check if there is no piece held
	if (!Shapes.prototype.storedPiece) {
		var currentPiece = nextPiece.type;
		nextPiece = generatePiece();
	} else {
		var currentPiece = Shapes.prototype.storedPiece;
	}

	player.updateInterval = clearInterval(player.updateInterval);

	Shapes.prototype.storedPiece = player.type;
	Shapes.prototype.hold = false;	

	player.removeFromPlayingField();
	player = initialiseNewPiece(currentPiece);
	drawStoredShape(Shapes.prototype.storedPiece);
}

function generatePiece() {
	if (shapeTypes.length < 3) {
		shapeTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
	}
	var random = Math.floor(Math.random() * shapeTypes.length);
	var generatedShape = new Shapes(shapeTypes[random]);

	test.heldShapes.push(shapeTypes[random]);

	shapeTypes.splice(random, 1);

	drawNextPiece(generatedShape.type);
	return generatedShape;
}

function initialiseNewPiece(type) {
	// check if argument given is valid
	if (['I', 'J', 'L', 'O', 'S', 'T', 'Z'].indexOf(type) !== -1) {
		var currentShape = new Shapes(type);
	} else {
		var currentShape = nextPiece;
		nextPiece = generatePiece();
	}

	if (!canShiftUp(currentShape)) {
		menu.gameOver = true;			
	} else {
		currentShape.updateInterval = setInterval(function() { 
			currentShape.autoDrop() 
		}, currentShape.updateRate); 
		currentShape.updatePiece();
	}
	
	
	return currentShape;
}

function canShiftUp(piece) {
	if (piece.isGameOver()) {
		piece.blocks = getStartingPositions(piece.type, 1);
		if (piece.isGameOver()) {
			piece.blocks = getStartingPositions(piece.type, 0);
			if (piece.isGameOver()) {
				return false;
			}
		}
	}
	return true;
}

function createPlayingField() {
	var width = 10;
	var height = 22;
	var newPlayingField = [];
	for (var i = 0; i < height; i++) {
		var row = [];
		for (var j = 0; j < width; j++) {
			row.push(0);
		}
		newPlayingField.push(row);
	}
	return newPlayingField;
}

function restartGame() {
	Shapes.prototype.dropHard = true;
	Shapes.prototype.hold = true;
	Shapes.prototype.storedPiece = undefined;
	Shapes.prototype.updateRate = 100;

	player.updateInterval = clearInterval(player.updateInterval);

	menu.score = 0;
	menu.level = 1;
	menu.pause = false;
	menu.gameOver = false;

	menu.updateScore();
	menu.updateLevel();
	
	playAgainBtn.style.display = "none";

	playingField = createPlayingField();
	player = initialiseNewPiece(player.type);
	nextPiece = generatePiece();
	
	drawStoredShape();
	drawNextPiece(nextPiece.type);
}

function pauseGame() {
	menu.pause = !menu.pause;
	if (menu.pause) {
		var nextDisplay = undefined;
		var holdDisplay = undefined;
		player.updateInterval = clearInterval(player.updateInterval);	
	} else {
		var nextDisplay = nextPiece.type;
		var holdDisplay = Shapes.storedPiece;
		if (!player.updateInterval) {
			player.updateInterval = setInterval(function() { 
				player.autoDrop() 
			}, player.updateRate); 				
		}
		
	}
	drawNextPiece(nextDisplay);
	drawStoredShape(holdDisplay);	
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "white";
	
	if (menu.pause) {
		menu.drawPauseMenu();
	} else if (menu.gameOver) {
		menu.drawGameOverMenu();
	} else {
		player.updatePiece();
		for (var row = 2; row < playingField.length; row++) {
			for (var column = 0; column < playingField[row].length; column++) {
				// render block only when not empty
				if (playingField[row][column]) {
					var x = column * BLOCKLENGTH;
					var y = row * BLOCKLENGTH - 2 * BLOCKLENGTH;
					var colour = playingField[row][column];

					ctx.beginPath();
					ctx.fillStyle = colour;
					ctx.fillRect(x, y, BLOCKLENGTH, BLOCKLENGTH);
					ctx.lineWidth = 1;
					ctx.strokeRect(x, y, BLOCKLENGTH, BLOCKLENGTH);
					ctx.closePath();				
				}
			}
		}
	}	
	requestAnimationFrame(render);
}

function keyHandler(e) {
	var keyCode = e.keyCode;
	for (var action in actions) {
		if (keyCode === actions[action].keyCode) {
			if (e.type === "keydown") {
				actions[action].state = true;				
			} else {
				actions[action].state = false;
				keyPressUpdateRate = 0;
			}
			// prevents browser from scrolling
			e.preventDefault();
		}
	}

	if (actions.pause.state && !menu.gameOver && !actions.pause.keyHeld) {
		pauseGame();
		actions.pause.keyHeld = true;
	} else if (!actions.pause.state) {
		actions.pause.keyHeld = false;
	}

	if (actions.hold.state && player.hold && !menu.pause && !menu.gameOver) {
		holdPiece();				
	}
}

// http://javascript.about.com/od/problemsolving/a/modulobug.htm
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};
/*
TODO

BUGS
-Fix game updating while paused
-Start game when game over
	-Hold current piece

IMPROVE
-Create better algorithm for spawning pieces
-More responsive key presses
-Pausing when game is over
-Hide all elements when paused
-Wall kick

IMPLEMENT
-New game button
-Ghost piece
*/
"use strict";

var BLOCKLENGTH = 30;

var canvas;
var ctx;
var playingField = createPlayingField();
var shapeTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
var nextPiece;
var player;

var actions = {
	pause: {
		state: false,
		keyCode: 27, // Esc
	},
	hold: {
		state: false,
		keyCode: 67, // c
	},	
	shiftLeft: {
		state: false,
		keyCode: 37, // left arrow
	},
	shiftRight: {
		state: false,
		keyCode: 39, // row arrow
	},	
	rotateRight: {
		state: false,
		keyCode: 38, // up arrow
	},
	rotateLeft: {
		state: false,
		keyCode: 90, // z
	},
	softDrop: {
		state: false,
		keyCode: 40, // down arrow
	},
	hardDrop: {
		state: false,
		keyCode: 32, // space bar
	},

};

function Shapes(type) {
	this.type = type;
	this.rotationIndex = 0;
	this.locking = false;
	this.stopRotating = true;
	this.gravityRate = 0;
	switch(this.type) {
		case "I":
			this.center = [4, 1];
			this.blocks = [[3, 0], [4, 0], [5, 0], [6, 0]];			
			break;
		case "J":
			this.center = [5, 1];
			this.blocks = [[3, 0], [3, 1], [4, 1], [5, 1]];
			break;
		case "L":
			this.center = [4, 1];
			this.blocks = [[3, 1], [4, 1], [5, 1], [5, 0]];		
			break;
		case "O":
			this.center = [4, 1];
			this.blocks = [[3, 0], [4, 0], [3, 1], [4, 1]];
			break;
		case "S":
			this.center = [4, 1];
			this.blocks = [[3, 1], [4, 1], [4, 0], [5, 0]];
			break;
		case "T":
			this.center = [4, 1];
			this.blocks = [[3, 1], [4, 1], [5, 1], [4, 0]];
			break;
		case "Z":
			this.center = [4, 1];
			this.blocks = [[3, 0], [4, 0], [4, 1], [5, 1]];				
			break;
	}
}

Shapes.prototype.updateRate = 100;
Shapes.prototype.hold = true;
Shapes.prototype.dropHard = true;
Shapes.prototype.storedPiece;

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
Shapes.prototype.testPieceCollisions = function(horizontalShift, verticalShfit) {
	// return true only when no collisions are detected

	var blocks = this.blocks;
	for (var i = 0; i < blocks.length; i++) {

		if (!this.testBlockForCollisions(blocks[i], horizontalShift, verticalShfit)) {	
			return false;
		}
	}
	return true;

};

// tests individual blocks with its shift for collisions
Shapes.prototype.testBlockForCollisions = function(block, horizontalShift, verticalShfit) {
	var xResultant = block[0] + horizontalShift;
	var yResultant = block[1] + verticalShfit;

	// test side walls and ceiling first to prevent piece from locking on side wall
	if (xResultant >= 10 || xResultant < 0 || yResultant < 0) {
		return false;
	}

	// if resultant is not a block in player
	if (!this.collidingWithPlayerBlocks(xResultant, yResultant)) {


		// if block is in undefined position or a shape is already there
		if (typeof playingField[yResultant] === "undefined" || playingField[yResultant][xResultant] !== 0) {
			if (!this.locking && this.lockable()) {
				this.lockPiece(300);
			}

			return false;
		}
	}

	// test floor
	if (yResultant > 19) {
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
	var initialBlocks = this.blocks.map(function(arr) {
    	return arr.slice();
	});

	function canLock() {
		// stop if blocks are not in same position lockDelay milliseconds ago
		for (var i = 0; i < initialBlocks.length; i++) {
			if (initialBlocks[i][0] !== player.blocks[i][0] || initialBlocks[i][1] !== player.blocks[i][1]) {
				player.locking = false;
				return false;
			}
		}
		Shapes.prototype.hold = true;
		clearFilledLine();
		clearInterval(player.updateInterval);
		player = getNewPiece();
				
	}
	window.setTimeout(canLock, lockDelay);
};

Shapes.prototype.lockable = function() {
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

Shapes.prototype.gravity = function() {
	var gravityLimit = this.updateRate / 10;
	if (this.gravityRate >= gravityLimit) {
		this.softDrop();
		this.gravityRate = 0;
	}
	this.gravityRate++;
};

Shapes.prototype.hardDrop = function() {
	Shapes.prototype.dropHard = false;
	for (var i = 0; i < playingField.length; i++) {
		// if collision found, stop and lock piece here
		if (!this.testPieceCollisions(0, i)) {
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
};

Shapes.prototype.softDrop = function() {
	var verticalShfit = 1;

	if (this.testPieceCollisions(0, verticalShfit)) {
		this.removeFromPlayingField();
		this.center[1] += verticalShfit;
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i][1] += verticalShfit;	
		}
	}
};

Shapes.prototype.shift = function(units) {
	var horizontalShift = units;

	if (this.testPieceCollisions(horizontalShift, 0)) {
		this.removeFromPlayingField();
		this.center[0] += horizontalShift;
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i][0] += horizontalShift;	
		}	
	}
};

Shapes.prototype.rotate = function(units) {
	var type = this.type;
	var length = this[type].rotationCoordinateX.length;
	var newIndex = (this.rotationIndex + units).mod(length); // see bottom of file
		
	for (var i = 0; i < this.blocks.length; i++) {
		var offsetX = this[type].rotationCoordinateX[newIndex][i];
		var offsetY = this[type].rotationCoordinateY[newIndex][i];
		
		// check if rotated block may have a collision
		if (!this.testBlockForCollisions(this.center, offsetX, offsetY)) {
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
};

Shapes.prototype.updatePlayingField = function() {
	for (var i = 0; i < this.blocks.length; i++) {
		var x = this.blocks[i][0];
		var y = this.blocks[i][1];
		var type = this.type;
		playingField[y][x] = this[type].colour;
	}
};

Shapes.prototype.loseCondition = function() {
	for (var i = 0; i < this.blocks.length; i++) {
		var xCoord = this.blocks[i][0];
		var yCoord = this.blocks[i][1];
		if (playingField[yCoord][xCoord] !== 0) {
			return true;
		}
	}
	return false;
};

Shapes.prototype.updatePiece = function(keyPresses) {
	if (keyPresses.shiftRight.state) {
		this.shift(1);
	} else if (keyPresses.shiftLeft.state) {
		this.shift(-1);
	}
	
	if (keyPresses.hardDrop.state && Shapes.prototype.dropHard) {	
		this.hardDrop();
	} else if (!keyPresses.hardDrop.state) {
		Shapes.prototype.dropHard = true;
	}

	if (keyPresses.softDrop.state) {
		this.softDrop();
	} 
	
	if (keyPresses.rotateRight.state && Shapes.prototype.rotateOnce) {
		this.rotate(1);
	} else if (keyPresses.rotateLeft.state && Shapes.prototype.rotateOnce) {
		this.rotate(-1);
	} else if (!keyPresses.rotateRight.state && !keyPresses.rotateLeft.state) {
		Shapes.prototype.rotateOnce = true;
	}	
	
	this.gravity();
	this.updatePlayingField();
};

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
		var shape = nextPiece.type;
		nextPiece = generatePiece();
	} else {
		var shape = Shapes.prototype.storedPiece;
	}

	clearInterval(player.updateInterval);
	Shapes.prototype.storedPiece = player.type;
	Shapes.prototype.hold = false;	
	player.removeFromPlayingField();
	player = getNewPiece(shape);
	drawStoredShape(Shapes.prototype.storedPiece);
};

function generatePiece() {
	var random = Math.floor(Math.random() * 7);
	var shape = new Shapes(shapeTypes[random]);
	drawNextPiece(shape.type);
	return shape;
}

function getNewPiece(type) {

	// check if type in shapeTypes
	if (shapeTypes.indexOf(type) !== -1) {
		var shape = new Shapes(type);
	} else {
		var shape = nextPiece;
		nextPiece = generatePiece();
	}

	if (shape.loseCondition()) {
		menu.gameOver = true;
	} else {
		shape.updateInterval = setInterval(function() { shape.updatePiece(actions) }, shape.updateRate); 
	}
	
	
	return shape;
}

function createPlayingField() {
	var width = 10;
	var height = 20;
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
	Shapes.prototype.updateRate = 100;
	Shapes.prototype.storedPiece = undefined;

	menu.score = 0;
	menu.level = 1;
	menu.pause = false;
	menu.gameOver = false;
	
	playAgainBtn.style.display = "none";

	playingField = createPlayingField();
	player = getNewPiece(player.type);
	nextPiece = generatePiece();
	drawStoredShape();
	drawNextPiece(nextPiece.type);
}

function render() {
	// clear canvas to redraw
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "white";
	if (menu.pause) {
		menu.drawPauseMenu();
	} else {
		for (var row = 0; row < playingField.length; row++) {
			for (var column = 0; column < playingField[row].length; column++) {
				// render block only when not empty
				if (playingField[row][column]) {
					var x = column * BLOCKLENGTH;
					var y = row * BLOCKLENGTH;
					var colour = playingField[row][column];

					ctx.clearRect(x, y, BLOCKLENGTH, BLOCKLENGTH)
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
	if (menu.gameOver) {
		menu.drawGameOverMenu();
	}		
	requestAnimationFrame(render);
}

function keyState(e) {
	var keyCode = e.keyCode;
	for (var action in actions) {
		if (keyCode === actions[action].keyCode) {
			actions[action].state = (e.type === "keydown") ? true: false;
			e.preventDefault();
		}
	}

	if (actions.pause.state) {
		menu.pause = !menu.pause;
	}

	if (actions.hold.state && player.hold) {
		holdPiece();
	}	
	
	/*if (actions.shiftLeft.state) {
		console.log("LEFT");
		player.shift(-1);	
	}*/
	/*if (actions.rotateRight.state && player.rotateOnce) {
		player.rotate(1);
	} else if (actions.rotateLeft.state && player.rotateOnce) {
		player.rotate(-1);
	} else if (actions.rotateRight.state === false && actions.rotateLeft.state === false) {
		player.rotateOnce = true;
	}*/	

}

// http://javascript.about.com/od/problemsolving/a/modulobug.htm
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};
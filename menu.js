"use strict";
var playAgainBtn;
var holdPieceGrid;
var nextPieceGrid;

var menu = {
	score: 0,
	level: 1,
	pause: false,
	gameOver: false,
	updateScore: function() {
		document.getElementById("score").innerHTML = "Lines: " + this.score;
	},
	updateLevel: function() {
		document.getElementById("level").innerHTML = "Level: " + this.level;
	},
	drawGameOverMenu: function() {
		var text = "GAME OVER";
		var width = ctx.measureText(text).width;

		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.font = "40px arial";
		ctx.fillText(text, (canvas.width / 2) - (width / 2), canvas.height / 2 - 30);
		ctx.closePath();
		document.getElementById("playAgainBtn").style.display = "block";
	},
	drawPauseMenu: function() {
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.font = "40px arial";

		ctx.fillText("GAME PAUSED", 0, canvas.height / 2);	
		ctx.closePath();
	}
};

function createTable(element) {
	var table = document.getElementById(element);
	for (var i = 0; i < 2; i++) {
		var row = document.createElement("tr");
		for (var j = 0; j < 4; j++) {
			var cell = document.createElement("td");
			cell.id = i.toString() + j.toString();
			row.appendChild(cell);
		}
		table.appendChild(row);
	}
	return table.getElementsByTagName("td");
}

function drawNextPiece(shape) {
	switch(shape) {
		case 'I':
			changeCell(nextPieceGrid, [4, 5, 6, 7], "cyan");
			break;
		case 'J':
			changeCell(nextPieceGrid, [0, 4, 5, 6], "blue");
			break; 
		case 'L':
			changeCell(nextPieceGrid, [2, 4, 5, 6], "orange");
			break;
		case 'O':
			changeCell(nextPieceGrid, [0, 1, 4, 5], "yellow");
			break;
		case 'S':
			changeCell(nextPieceGrid, [1, 2, 4, 5], "green");
			break;
		case 'T':
			changeCell(nextPieceGrid, [1, 4, 5, 6], "purple");
			break;
		case 'Z':
			changeCell(nextPieceGrid, [0, 1, 5, 6], "red");
			break;
		default:
			changeCell(nextPieceGrid, [0, 1, 2, 3, 4, 5, 6, 7], "white");
	}
}

function drawStoredShape(shape) {
	switch(shape) {
		case 'I':
			changeCell(holdPieceGrid, [4, 5, 6, 7], "cyan");
			break;
		case 'J':
			changeCell(holdPieceGrid, [0, 4, 5, 6], "blue");
			break; 
		case 'L':
			changeCell(holdPieceGrid, [2, 4, 5, 6], "orange");
			break;
		case 'O':
			changeCell(holdPieceGrid, [0, 1, 4, 5], "yellow");
			break;
		case 'S':
			changeCell(holdPieceGrid, [1, 2, 4, 5], "green");
			break;
		case 'T':
			changeCell(holdPieceGrid, [1, 4, 5, 6], "purple");
			break;
		case 'Z':
			changeCell(holdPieceGrid, [0, 1, 5, 6], "red");
			break;
		default:
			changeCell(holdPieceGrid, [0, 1, 2, 3, 4, 5, 6, 7], "white");
	}
}

function changeCell(table, cells, colour) {
	for (var i = 0; i < table.length; i++) {
		table[i].style["background-color"] = "white";
	}
	for (var i = 0; i < cells.length; i++) {
		table[cells[i]].style["background-color"] = colour;
	}
}

function pauseGame() {
	menu.pause = !menu.pause;
	if (menu.pause) {
		var nextDisplay = undefined;
		var holdDisplay = undefined;
	} else {
		var nextDisplay = nextPiece.type;
		var holdDisplay = Shapes.storedPiece;
	}
	drawNextPiece(nextDisplay);
	drawStoredShape(holdDisplay);	
}

function initialiseGrid() {
	var gridCanvas = document.getElementById("grid");
	var context = gridCanvas.getContext("2d");
	context.strokeStyle = "red";
	context.fillStyle = "#efefef";

	for (var column = 0; column <= gridCanvas.width; column += BLOCKLENGTH) {
		if (column % 60 === 0) {
			context.beginPath();
			context.fillRect(column, 0, BLOCKLENGTH, gridCanvas.height);
			context.closePath();	
		}
	}
}

window.addEventListener("load", function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d")

	holdPieceGrid = createTable("hold");
	nextPieceGrid = createTable("nextPiece");

	playAgainBtn = document.getElementById("playAgainBtn");
	playAgainBtn.addEventListener("click", restartGame);

	document.getElementById("new-game").addEventListener("click", function() {
		if (!menu.gameOver) {
			restartGame();			
		}
	});
	document.getElementById("pause").addEventListener("click", pauseGame);
	document.addEventListener("keydown", keyState);
	document.addEventListener("keyup", keyState);

	nextPiece = generatePiece();
	player = getNewPiece();

	initialiseGrid();
	render();
});
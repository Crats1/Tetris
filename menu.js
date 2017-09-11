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
	drawText: function(text, font, colour, x, y) {
		ctx.fillStyle = colour;
		ctx.font = font;
		ctx.fillText(text, x, y);
	},	
	drawGameOverMenu: function() {
		var text = "GAME OVER";
		var textWidth = ctx.measureText(text).width;
		var textX = (canvas.width / 2) - (textWidth / 2);
		var textY = canvas.height / 2 - 30;

		var backgroundX = textX - 15;
		var backgroundY = textY - 50;
		var backgroundWidth = textWidth + 30;
		var backgroundHeight = 150;

		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.globalAlpha = 0.8;
		ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
		ctx.globalAlpha = 1;	

		this.drawText(text, "40px sans-serif", "#efefef", textX, textY);
		ctx.closePath();
		document.getElementById("playAgainBtn").style.display = "block";
	},
	drawPauseMenu: function() {
		var text = "PAUSED";
		var textWidth = ctx.measureText(text).width;
		var textX = (canvas.width / 2) - (textWidth / 2);
		var textY = canvas.height / 2;

		ctx.beginPath();
		this.drawText(text, "40px sans-serif", "black", textX, textY);	
		ctx.closePath();
	},
	changeStartScreenState: function(state) {
		document.getElementById("start-screen").style.display = state;
	},
};

function createTable(element) {
	var table = document.getElementById(element);
	var height = 2;
	var width = 4;
	for (var i = 0; i < height; i++) {
		var row = document.createElement("tr");
		for (var j = 0; j < width; j++) {
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
	// clears table before applying changes to table
	for (var i = 0; i < table.length; i++) {
		table[i].style["background-color"] = "white";
	}
	for (var i = 0; i < cells.length; i++) {
		table[cells[i]].style["background-color"] = colour;
	}
}

function createGrid() {
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

function initialiseGame() {
	initialiseSounds();
	
	playAgainBtn = document.getElementById("playAgainBtn");
	playAgainBtn.addEventListener("click", restartGame);

	document.getElementById("new-game").addEventListener("click", function() {
		if (!menu.gameOver) {
			restartGame();			
		}
	});
	document.getElementById("pause").addEventListener("click", pauseGame);
	document.addEventListener("keydown", keyHandler);
	document.addEventListener("keyup", keyHandler);

	nextPiece = generatePiece();
	player = initialiseNewPiece();
}

function setUpGame() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");	
	holdPieceGrid = createTable("hold");
	nextPieceGrid = createTable("nextPiece");
	createGrid();
}

function startGame(e) {
	if (e.keyCode === 32) {
		initialiseGame();
		render();
		
		menu.changeStartScreenState("none");
		document.removeEventListener("keydown", startGame);
		e.preventDefault();
	}
}

window.addEventListener("load", function() {
	setUpGame();

	menu.changeStartScreenState("block");
	document.addEventListener("keydown", startGame);
});
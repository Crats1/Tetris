var test = {
	heldShapes: [],
	render: function() {
		// I
		playingField[0][0] = "cyan";
		playingField[0][1] = "cyan";
		playingField[0][2] = "cyan";
		playingField[0][3] = "cyan";

		// J
		playingField[19][9] = "blue";
		playingField[19][8] = "blue";
		playingField[19][7] = "blue";
		playingField[18][7] = "blue";

		playingField[17][1] = "blue";
		playingField[18][1] = "blue";
		playingField[19][1] = "blue";
		playingField[19][0] = "blue";

		// colours
		playingField[2][0] = "orange";
		playingField[2][1] = "purple";
		playingField[2][2] = "yellow";
		playingField[2][3] = "green";
		playingField[2][4] = "red";
		playingField[2][5] = "blue";
		playingField[2][6] = "cyan";
	},
	lineClear: function() {
		// creates a 4 X 9 high blockField in playingField
		for (var i = 0; i < 9; i++) {
			playingField[16][i] = "red";
			playingField[17][i] = "red";
			playingField[18][i] = "red";
			playingField[19][i] = "red";
		}	
	},
	fillUpPlayingField: function(height) {
		// fills up playingField close to top
		for (var row = playingField.length % height; row < playingField.length; row++) {
			for (var column = 0; column < playingField[row].length - 1; column++) {
				playingField[row][column] = "red";
			}
		}
	},
	spawnAlgorithm: function(range) {
		// finds number of same types within range
		var current;
		var duplicates = 0;
		for (var i = 0; i < this.heldShapes.length; i++) {
			if (i % range === 0) {
				current = this.heldShapes[i];
			} else if (this.heldShapes[i] === current) {
				console.log("Duplicate");
				duplicates++;
			}
		}
		console.log("COUNT: ", duplicates);
	},
};
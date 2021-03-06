var sounds = {};

var musicOn = false;
var soundOn = false;

var soundToggleBtn;
var musicToggleBtn;

function playSound(soundName) {
	if (soundOn) {
		sounds[soundName].play();
	}
}

function initialiseSounds() {
	sounds.rotate = createSound("shape-rotate");
	sounds.lock = createSound("shape-lock");
	sounds.select = createSound("select");
	sounds.pause = createSound("pauseSound");
	sounds.music = createSound("music", 0.2);
	sounds.gameOver = createSound("gameOver", 0.5);

	soundToggleBtn = document.getElementById("sound-toggle");
	musicToggleBtn = document.getElementById("music-toggle");

	soundToggleBtn.addEventListener("click", soundToggle);
	musicToggleBtn.addEventListener("click", musicToggle);

	soundToggle();
	musicToggle();
	
	// loops through music
	sounds.music.addEventListener('ended', function() {
	    this.currentTime = 0;
	    this.play();
	}, false);	
}

function createSound(soundName, volume) {
	var sound = document.getElementById(soundName);
	if (volume)
		sound.volume = volume;
	return sound;
}

function soundToggle() {
	sounds.select.play();
    if (!soundOn) {
        soundOn = true;
        soundToggleBtn.value = "Turn Sounds Off";
    } else {
        soundOn = false;
        soundToggleBtn.value = "Enable Sounds";
    }
}

function musicToggle() {
    if (!musicOn) {
    	sounds.music.play();
        musicOn = true;
        musicToggleBtn.value = "Turn Music Off";
    } else {
    	sounds.music.pause();
        musicOn = false;
        musicToggleBtn.value = "Enable Music";
    }
}

function resetMusic() {
	sounds.music.currentTime = 0;	
	musicOn = true;
	musicToggleBtn = "Turn Music Off"
	sounds.music.play();

}
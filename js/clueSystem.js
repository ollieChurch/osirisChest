// ===== INPUT BOX SET UP ===== //

const mainHeadContainer = document.getElementById("container-input")
const inputBoxesContainer = document.getElementById("input-boxes")
const errorMsg = document.getElementById("errorMsg")
const referenceLength = 5

for (let i = 0; i < referenceLength; i++) {
    const box = document.createElement("input")
    box.classList.add("reference-input")
    box.type = "text"
    box.readOnly = true
    inputBoxesContainer.append(box)
}

const inputBoxes = document.getElementsByClassName("reference-input")

// ===== KEYBOARD SET UP ===== //

const keyboardContainer = document.getElementById("container-keyboard")
const keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
    ["Submit", "Clear"]
]

keyboard.forEach(row => {
    const newKeyboardRow = document.createElement("div")
    newKeyboardRow.classList.add("keyboard-row")
    
    row.forEach(entry => {
        const newKeyboardButton = document.createElement("button")
        newKeyboardButton.textContent = entry
        
        if (entry.length === 1) {
            newKeyboardButton.addEventListener("click", letterPress)
            newKeyboardButton.classList.add("keyboard-btn")
        } else {
            newKeyboardButton.addEventListener("click", instructionPress)
            newKeyboardButton.classList.add("keyboard-btn-instruction")
            
            const instructionClass = entry.toLowerCase() === "submit" ? "keyboard-btn-submit" : "keyboard-btn-clear"
            newKeyboardButton.classList.add(instructionClass)
        }

        newKeyboardRow.append(newKeyboardButton)
    })
    
    keyboardContainer.append(newKeyboardRow)
})

// ===== CLUE SET UP ===== //

const clueTitle = document.getElementById("clue-title")
const clueContainer = document.getElementById("container-clue")
const clueDisplay = document.getElementById("clue-display")
const clueDisplayText = document.getElementById("clue-display-text")
const clueDisplayImage = document.getElementById("clue-display-img")

import { clueData } from "./clueData.js"
const clueTrackerInitial = -1

let referenceCodes = []
let clueTracker = []

clueData.forEach(puzzle => {
    referenceCodes.push(puzzle.reference)
    clueTracker.push(clueTrackerInitial)
})

// ===== TIMER SET UP ===== //

const timeContainer = document.getElementById("time")
const timeDisplay = document.getElementById("time-display")

let minuteTens
let minuteOnes
let secondTens
let secondOnes
let timeInSecs

function resetTimer() {
    minuteTens = 3
    minuteOnes = 0
    secondTens = 0
    secondOnes = 0
    timeInSecs = (((minuteTens*10) + minuteOnes)*60) + (secondTens*10) + secondOnes
    updateTime()
}

// ===== START SCREEN SET UP ===== //

const headerImage = document.getElementById("header-img-container")
const headerInstruction = document.getElementById("header-instruction")
const startScreen = document.getElementById("screen-start")

// ===== VOICEOVER SET UP ===== //

const startVoice = "../sound/voiceover/placeholderStartVoice.mp3"
const winVoice = "../sound/voiceover/placeholderWinVoice.mp3"
const failVoice = "../sound/voiceover/placeholderFailVoice.mp3"

let voiceover
let currentVoice

function firstVoiceover(event) {
    if (event.keyCode === 32) {
        currentVoice = startVoice
        voicePlay()
        window.removeEventListener("keypress", firstVoiceover)  
    }
}

function voicePlay() {
    voiceover = new Howl({
            src: currentVoice,
            onend: voiceFinish
        })
    voiceover.play()   
    window.addEventListener("keypress", voiceSkip)  // PRESS SPACEBAR TO SKIP VOICEOVER WHEN DEBUGGING
}

function voiceSkip(event){
    if (event.keyCode === 32) {
        voiceover.pause()
        voiceover.currentTime = 0
        voiceFinish()
    }
}

function voiceFinish() {
    startScreen.style.display = "none"
    window.removeEventListener("keypress", voiceSkip)
    if (currentVoice === startVoice) { 
        startGame()
    } else {
        const fileName = currentVoice === winVoice ? "happy_resolution.mp3" : "fail_resolution.wav"
        let sound = new Howl({
            src: [`../sound/${fileName}`]
        })
        sound.play()
    }
}

// ===== MUSIC SET UP ===== //

import { musicData } from "./musicData.js"
const numberOfMusicTracks = musicData.length - 1
let currentTrack = 0
let backgroundMusic
let playBackgroundMusic = false
let backgroundMusicSetUp = false

function backgroundMusicBegin() {
    window.addEventListener("keypress", musicTrackSkip)  // PRESS SPACEBAR TO PLAY NEXT TRACK WHEN DEBUGGING
    backgroundMusicPlay()
    backgroundMusicSetUp = true
}

function backgroundMusicPlay() {
    const musicSrc = musicData[currentTrack]
    if (playBackgroundMusic) {
        backgroundMusic = new Howl({
            src: [musicSrc],
            onend: backgroundMusicNextTrack
        })
        backgroundMusic.play()
    } else {
        backgroundMusicStop()
        backgroundMusicSetUp = false
    }
}

function backgroundMusicNextTrack() {
    currentTrack = currentTrack < numberOfMusicTracks ? currentTrack + 1 : 0
    backgroundMusicPlay()
}

function musicTrackSkip(event) {
    if (event.keyCode === 32) { 
        backgroundMusic.pause()
        backgroundMusic.currentTime = 0
        backgroundMusicNextTrack() 
    }
}

function backgroundMusicStop() {
    if (backgroundMusicSetUp) {
        if (backgroundMusic.playing()) { backgroundMusic.stop() }
    }
    backgroundMusicSetUp = false
    window.removeEventListener("keypress", musicTrackSkip)
}

function buttonSound() {
    let sound = new Howl({
        src: ['../sound/keyboardClick.ogg'],
        volume: 0.5
    })
    sound.play()
}

// ===== ENDING ELEMENTS SET UP ===== //

const endingClueCount = document.getElementById("ending-clueCount")
const endingTitle = document.getElementById("ending-title")
const endingContainer = document.getElementById("container-ending")
const endingWinText = document.getElementById("ending-win")
const endingFailText = document.getElementById("ending-fail")
const endingTimeDisplay = document.getElementById("ending-time")

// ===== INITIALISE AND RESET ===== //

const logo = document.getElementById("logo")

let currentInputBox
let inputString
let hintCount
let timer

function clearInput() {
    inputString = ""
    currentInputBox = 0
    errorMsg.style.visibility = "hidden"
    clueTitle.textContent = ""
    for (const box of inputBoxes) { box.value = "" }
}

function clearClues() {
    clueTracker = []
    hintCount = 0 
    updateHintCountDisplay()
    clueData.forEach(puzzle => { clueTracker.push(clueTrackerInitial) })
}

function resetSystem() {
    endingContainer.style.display = "none"
    endingFailText.style.display = "none"
    endingWinText.style.display = "none"
    startScreen.style.display = "block"
    backgroundMusicStop()
    clearClues()
    resetTimer()
    clearInput()
    logo.removeEventListener("click", resetSystem)
    window.addEventListener("keypress", firstVoiceover)
}

resetSystem()

// ===== START GAME ===== //

function startGame() {    
    // Show Header Instruction
    headerInstruction.style.display = "block"
    
    // Display Keyboard Input
    keyboardContainer.style.display = "flex"
    mainHeadContainer.style.display = "flex"
    clearInput()
    
    // Play Sound
    let startMusic = new Howl({
        src: ['../sound/dramaticStart.wav'],
        volume: 1
    })
    startMusic.play()
    const fadeStartIn = 5000
    const lengthOfFade = 10000
    setTimeout(() => { startMusic.fade(1, 0, lengthOfFade) }, fadeStartIn)
    
    playBackgroundMusic = true
    setTimeout(backgroundMusicBegin, (fadeStartIn + lengthOfFade))
    
    // Start Timer
    timer = setInterval(decreaseTimer, 1000)
    flashElement(timeContainer, "red", 5)
}

// ===== KEYBOARD INPUT ===== //

let puzzleIndex

function letterPress(event) {
    buttonSound()
    if (inputString.length < referenceLength) {
        const {textContent} = event.target
        inputString += textContent
        inputBoxes[currentInputBox].value = textContent
        currentInputBox ++
    }
}

function instructionPress(event) {    
    const {textContent} = event.target
    inputString = inputString.toLowerCase()
    
    buttonSound()
    
    if (textContent.toLowerCase() === "submit") {
        if (inputString === "eliza") {
            
            // Clear Screen
            winGame()
            
            //Play Win Voiceover
            currentVoice = winVoice
            voicePlay() 
        } 
        else if (inputString === "reset") {
            endGame()
            resetSystem()
        } 
        else if (referenceCodes.includes(inputString)) {
            keyboardContainer.style.display = "none"
            clueContainer.style.display = "block"
            showClue()
            updateHintCountDisplay()
        } 
        else {
            errorMsg.style.visibility = "visible"
        }
    } else {
        clearInput()
    }
}

// ===== CLUE DISPLAY ===== //

const nextBtnContainer = document.getElementById("clue-btn-container-next")
const backBtn = document.getElementById("clue-btn-back")
const nextBtn = document.getElementById("clue-btn-next")
const nextLabel = document.getElementById("clue-btn-next-label")

function showClue() {
    puzzleIndex = clueData.findIndex(puzzle => puzzle.reference === inputString)
    const { name, clues } = clueData[puzzleIndex]
    
    // add to the hint count if it is the first time
    if (clueTracker[puzzleIndex] === -1) { 
        clueTracker[puzzleIndex] ++
        hintCount ++
        updateHintCountDisplay() 
    }
    
    const trackerNumber = clueTracker[puzzleIndex]
    const currentClue = trackerNumber < clues.length ? trackerNumber : clues.length - 1
    const { image, imageSrc, text } = clues[currentClue]
    
    // is there an image in the clue?
    clueDisplayImage.style.display = image ? "block" : "none"
    
    // display the puzzle name and clue content
    if (image) { clueDisplayImage.src = image }
    clueTitle.textContent = name
    clueDisplayText.textContent = text
    
    // format the 'next' button
    if (currentClue === clues.length - 1) {
        nextBtnContainer.style.visibility = "hidden"  
    } else if (currentClue === clues.length - 2) {
        nextLabel.textContent = "The solution"
    } else {
        nextLabel.textContent = "Another hint"
    } 
}

// ===== CLUE BUTTONS ===== //

backBtn.addEventListener("click", () => {
    buttonSound()
    keyboardContainer.style.display = "flex"
    clueContainer.style.display = "none"
    nextBtnContainer.style.visibility = "visible"
    clearInput()
})

nextBtn.addEventListener("click", () => {
    buttonSound()
    clueTracker[puzzleIndex] ++
    hintCount ++
    updateHintCountDisplay()
    showClue()
})

// ===== HINT COUNT ===== //

function updateHintCountDisplay() {
    const countDisplay = document.getElementById("hint-count")
    countDisplay.textContent = hintCount
}

// ===== TIMER  ===== //

function decreaseTimer() {
    if (minuteTens + minuteOnes + secondTens + secondOnes > 0) {
        if (secondOnes > 0) {
            secondOnes --
        } else {
            secondOnes = 9

            if (secondTens > 0) {
                secondTens --
            } else {
                secondTens = 5

                if (minuteOnes > 0) {
                    minuteOnes --
                } else {
                    minuteOnes = 9
                    minuteTens --
                }
            }
        }
    }
    
    updateTime()
}

function updateTime() {
    const updatedTime = `${minuteTens}${minuteOnes}:${secondTens}${secondOnes}`
    timeDisplay.textContent = updatedTime
    if (updatedTime === "00:00") {
        failGame()
        currentVoice = failVoice
        voicePlay()
    }
}

// ===== END GAME ===== //

function endGame() {
    clearInterval(timer)
    playBackgroundMusic = false
    backgroundMusicStop()
    keyboardContainer.style.display = "none"
    headerInstruction.style.display = "none"
    mainHeadContainer.style.display = "none"
    logo.addEventListener("click", resetSystem)
}

function failGame() {
    endGame()
    clueContainer.style.display = "none"
    displayEndText("fail")
}

function winGame() {
    endGame()
    calculateTimeTaken()
    endingClueCount.textContent = hintCount
    displayEndText("win")
}

function calculateTimeTaken() {
    const endingMins = ((minuteTens*10) + minuteOnes)*60
    const totalSecsRemaining = endingMins + ((secondTens*10) + secondOnes)
    const totalSecsTaken = timeInSecs - totalSecsRemaining
    const minsTaken = (Math.floor(totalSecsTaken/60)).toString().padStart(2, "0")
    const secsTaken = (totalSecsTaken % 60).toString().padStart(2, "0")
    const endingTime = `${minsTaken}:${secsTaken}`
    endingTimeDisplay.textContent = endingTime
}

function displayEndText(result) {
    const textToDisplay = result === "fail" ? endingFailText : endingWinText
    endingTitle.textContent = result === "fail" ? "WE'RE OUT OF TIME!" : "CONGRATULATIONS!"
    
    textToDisplay.style.display = "block"
    endingContainer.style.display = "flex"
}

// ===== EFFECTS ===== //

function flashElement(element, color, numberOfTimes) {
    const standardBackground = element.style.background
    let count = 1
    const setFlash = setInterval(flash, 500)
    
    function flash() {
        if (count < numberOfTimes) {
            if (element.style.background !== color) {
                element.style.background = color
            } else {
                element.style.background = standardBackground
                count ++
            }
        } else {
            clearInterval(setFlash)
        }
    }
}



let format = ''
let numberOfInnings = 2
let remainingInnings = 2
let players = [];
let team1PlrCount;
let team2PlrCount;
let teamBattingPrefix;
let teamBowlingPrefix;
let numberOfPlayers = 1;
let teamBatting;
let teamBowling;
let striker = 1;
let nonStriker = 0;
let wickets = [];
let wicketsRemaining = 0;
let overs = 0;
let ballsThisOver = 0;
let totalBallsPerOver = 6;
let totalRuns = 0;
let totalBalls = 0;
let remainingPlayers = [];
let bouncersThisOver = 0;
let maxBouncersAllowed = 1;
let isWide = false
let isNoBall = false
let isFreeHit = false
let gameEnded = false
let target;

function byId(id) {
    return document.getElementById(id);
}


function updateFormat() {

    format = byId('selectedFormat').value

    byId('teamSelection').classList.remove('hidden');

    if (format === "Test") {
        numberOfInnings = 4
        remainingInnings = 4
    }
    else {
        numberOfInnings = 2
        remainingInnings = 2
    }
}

function selectTeamNames() {
    let team1Name = byId('team1Name').value.trim();
    let team2Name = byId('team2Name').value.trim();

    // Check if team names are empty
    if (!team1Name || !team2Name) {
        alert("Please enter names for both teams.");
        return;
    }

    byId('confirmTeamsButton').classList.add('hidden')
    byId('team1Name').textContent = team1Name;
    byId('team1Name').disabled = true;
    byId('team2Name').textContent = team2Name;
    byId('team2Name').disabled = true;
    byId('playerSelection').classList.remove('hidden');
    byId('playerSelection').style.display = 'table'
}

function updateTeams() {

}

function updatePlayerNames(team, selectedPlayers) {
    // Create input fields for player names and wickets if there are selected players
    let playerNamesHTML = '';
    let teamName = byId(`${team}Name`).value
    let teamNumber = team.slice(4)
    if (selectedPlayers > 0) {
        for (let i = 1; i <= selectedPlayers; i++) {
            playerNamesHTML +=
                `<div class="playerInfo" style="background-color: rgba(30, 30, 30, 0.9); padding: 5px; border: 1px solid #000; border-radius: 5px; flex-direction: column; align-items: flex-start; max-width: 400px;">
                        <label for="${team}Player${i}" style="margin-right: 10px;">${teamName} Player ${i} Name:</label>
                        <input type="text" id="${team}Player${i}" value="Player ${i}" style="background-color: rgba(45, 45, 45, 0.9); padding: 5px; border: 1px solid #413d46; border-radius: 5px; margin-right: 5px; color: #e1e1e1; width: 100%; box-sizing: border-box;">
                        <label for="${team}Wickets${i}">Wickets:</label>
                        <input type="number" style="background-color: rgba(45, 45, 45, 0.9); padding: 5px; border: 1px solid #413d46; border-radius: 5px; color: #e1e1e1; width: 25px;" id="${team}Wickets${i}" max="5" min="1" value="1">
                    </div>`;
        }
    }

    // Update the playerNames div with the input fields
    byId(`${team}PlayerNames`).innerHTML = playerNamesHTML;

    // Show or hide the playerNames div based on whether there are selected players
    if (selectedPlayers > 0) {
        byId(`${team}PlayerNames`).classList.remove('hidden');
    } else {
        byId(`${team}PlayerNames`).classList.add('hidden');
    }

    // Check if both teams have at least one player selected
    const team1SelectedPlayers = parseInt(byId('team1Players').value);
    const team2SelectedPlayers = parseInt(byId('team2Players').value);

    // Update the numberOfPlayers variable
    numberOfPlayers = team1SelectedPlayers + team2SelectedPlayers;

    if (team1SelectedPlayers > 0 && team2SelectedPlayers > 0) {
        // Both teams have at least one player selected, show the overs and bouncers inputs
        byId('matchRulesInput').classList.remove('hidden');
        byId('startButton').classList.remove('hidden');
        byId('tossButton').classList.remove('hidden')
    } else {
        // Hide the overs and bouncers inputs if any of the teams doesn't have players selected
        byId('matchRulesInput').classList.add('hidden');
        byId('startButton').classList.add('hidden');
        byId('tossButton').classList.add('hidden')
    }
}

function createPlayerObjects(team) {
    // Create player objects for the team
    for (let i = 1; i <= numberOfPlayers; i++) {
        let playerElement = byId(`${team}Player${i}`);
        let wicketsElement = byId(`${team}Wickets${i}`);
        if (playerElement && wicketsElement) {
            let playerName = playerElement.value;
            let playerWickets = parseInt(wicketsElement.value);
            if (playerName.trim() === '') {
                playerName = `Player ${i}`;
            }
            let teamXCount = `${team}PlrCount`
            teamXCount++

            players[`${team}Player${i}`] = {
                name: playerName,
                totalWickets: playerWickets,
                wicketsRemaining: playerWickets,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                extras: 0,
                out: false
            };
        }
    }
}

function updateScorecard() {
    let scorecard = byId('scorecard');
    scorecard.style.fontSize = '22px';
    scorecard.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        let playerKey = `${teamBatting}Player${i}`;
        let player = players[playerKey];

        if (!player) continue; // Skip if the player does not exist

        let strikeRate = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(2) : '0';
        let className = '';
        if (striker === i) {
            className = 'on-strike';
        } else if (nonStriker === i) {
            className = 'off-strike';
        }

        scorecard.innerHTML += `<p id="${playerKey}" class="${className}">${player.name}: ${player.runs} (${player.balls}) [4s: ${player.fours}, 6s: ${player.sixes}, Extras: ${player.extras}, Strike Rate: ${strikeRate}]</p>`;
    }
}

function updateScore() {
    let totalRuns = 0;
    let totalBalls = 0;

    for (let player in players) {
        totalRuns += players[player].runs;
        totalBalls += players[player].balls;
    }

    let target = totalRuns;

    let oversCompleted = Math.floor(totalBalls / totalBallsPerOver);
    let ballsRemaining = totalBalls % totalBallsPerOver;

    let runRate = totalBalls > 0 ? totalRuns / (totalBalls / 6) : 0; // Calculate run rate
    if (isNaN(runRate)) {
        runRate = 0; // Set run rate to 0 if it's NaN
    }

    let oversBowled

    if (ballsRemaining == 0) {
        oversBowled = oversCompleted
    }
    else {
        oversBowled = `${oversCompleted}.${ballsRemaining}`
    }

    let overOrOvers = (oversCompleted == 1) ? 'over' : 'overs'
    let score = byId('score');
    let scoreText = `${totalRuns}/${wickets.length} (${oversBowled} overs) Run Rate: ${runRate.toFixed(2)}`;

    // Check if it's a free hit and modify the score display accordingly
    if (isFreeHit) {
        scoreText = `<span style="color: red; font-weight: bold;">${scoreText} (Free Hit)</span>`;
    }

    score.innerHTML = scoreText;

    // Update the UI to display the list of wickets
    let wicketsList = byId('wickets-list');
    if (!wicketsList) {
        console.warn("Wickets list element not found.");
        return; // Exit function if element not found
    }

    // Clear any existing content inside the wickets list
    wicketsList.innerHTML = '';

    // Check if there are no wickets
    if (wickets.length === 0) {
        // If no wickets have fallen, display a message
        let listItem = document.createElement('li');
        listItem.textContent = "No wickets have fallen.";
        wicketsList.appendChild(listItem);
    } else {
        // Loop through each wicket in the wickets array
        wickets.forEach((wicket, index) => {

            // Create a new list item element for the wicket
            let listItem = document.createElement('li');

            // Set the text content of the list item to display wicket information
            listItem.textContent = `Wicket ${index + 1}: ${wicket.batsman} (b ${wicket.bowler})`;

            // If bowler information is available and wicket is credited, add it to the text content
            if (wicket.bowler && wicket.credited) {
                listItem.textContent += ` (b ${wicket.bowler})`;
            }

            // Append the created list item to the wickets list element
            wicketsList.appendChild(listItem);
        });
    }
}

function endGame() {
    // Check if all players are out
    if (getRemainingPlayers().length === 0 && remainingInnings === 0) {
        // If all players are out, end the game
        console.log("Game over. All players are out.");
        gameEnded = true;
        // Additional logic for ending the game can be added here
    } else {
        // If there are remaining players, prompt the user to end the game
        let endGameConfirmation = confirm("All wickets have not fallen. Do you still want to end the game?");
        if (endGameConfirmation) {
            console.log("Game over. User decided to end the game.");
            gameEnded = true;
            // Additional logic for ending the game can be added here
        } else {
            console.log("Game continues.");
        }
    }
}

function addWicket() {

    if (gameEnded) return;

    let team = teamBatting
    let innings = remainingInnings
    let player = `${team}Player${striker}`;

    // Decrement wickets remaining for the striker
    let wicketsRemainingSelect = byId(`${team}wickets${striker}`);
    let wicketsRemaining = parseInt(wicketsRemainingSelect.value);
    wicketsRemaining--;

    // Update wickets remaining for the striker
    wicketsRemainingSelect.value = wicketsRemaining;

    let ballsFaced = player.balls;

    if (wicketsRemaining === 0) {
        // Mark the player as out
        markPlayerOut(player);

        let message = ballsFaced === 1
            ? `player.name + " is all out at " + player.runs + " runs off " + player.balls + " ball"`
            : `(player.name + " is all out at " + player.runs + " runs off " + player.balls + " balls"`

        console.log(message)
    }

    // Create a new wicket object and add it to the wickets array
    let wicket = {
        batsman: byId(player).value,
        bowler: null,
        credited: true // Set credited to true to add wicket to the score
    };
    wickets.push(wicket);

    if (getRemainingPlayers().length > 0) {

        // Define nextStriker and nextNonStriker
        let nextStriker = (striker + 1) % 3;
        let nextNonStriker = (nextStriker + 1) % 3;

        // Increment balls faced for the striker
        player.balls++;
        // If the wicket falls on the last ball of the over, switch over and update non-striker
        if (ballsFaced % 6 === 0 || !players[nextStriker]) {
            striker = nextNonStriker;
            nonStriker = nextStriker;
            console.log("Switching over...");
            switchOver();
        } else if (getRemainingPlayers().length <= 0 && innings > 0) { //If all out and innings are remaning

            let temp = teamBatting;

            innings--;
            teamBatting = teamBowling;
            teamBowling = temp;
        }
        else {
            // Switch the strike to the next player in the rotation
            striker = nextStriker;
        }
    }
    // Update UI to display wickets
    updateScore();
    updateScorecard();
}

function markPlayerOut(player) {

    for (let player in players) {

        // Set the player's out status to true
        players[player].out = true;

        // Remove all classes from the player's element
        let playerElement = byId(`player${player}`);
        playerElement.classList.remove('on-strike', 'off-strike');
        playerElement.classList.add('out');

        // Set the player's wickets remaining to 0
        let wicketsRemainingSelect = byId(`wickets${player}`);
        wicketsRemainingSelect.value = 0;

        // Remove the player from the list of remaining players
        remainingPlayers = remainingPlayers.filter(p => p !== player);
    }
}

function startGame() {
    console.log('Starting Game');

    if (!teamBatting || !teamBowling) {
        teamBatting = 'team1';
        teamBowling = 'team2'
        console.log('Toss result not found. Setting teamBatting and teamBowling to default values')
    }

    let teamBattingPlrs;
    let teamBowlingPlrs;

    // Get the number of overs and validate it
    let numOvers = parseInt(byId('overs').value);
    numOvers = isNaN(numOvers) || numOvers <= 0 ? Infinity : numOvers; // Default to Infinity if invalid or 0

    createPlayerObjects('team1');
    createPlayerObjects('team2');

    let playerNames = [];
    if (teamBatting === 'team1') {
        teamBattingPrefix = 'team1Player';
        teamBowlingPrefix = 'team2Player';
    } else {
        teamBattingPrefix = 'team2Player';
        teamBowlingPrefix = 'team1Player';
    }

    teamBattingPlrs = `${teamBatting}PlrCount`
    teamBowlingPlrs = `${teamBowling}PlrCount`

    for (let i = 1; i <= teamBattingPlrs; i++) {
        const element = byId(`${teamBattingPrefix}${i}`);
        if (element) {
            let playerName = element.value;
            if (playerName.trim() === '') {
                playerName = `Player ${i}`;
            }
            playerNames.push(playerName);
        } else {
            console.error(`Element ${teamBattingPrefix}${i} does not exist!`);
        }
    }

    numberOfPlayers = players.length;

    if (playerNames.length === numberOfPlayers || numberOfPlayers === 1) {
        // Initialize players for the batting team
        for (let i = 1; i <= numberOfPlayers; i++) {
            players[`${teamBattingPrefix}${i}`] = {
                name: playerNames[i - 1],
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                extras: 0,
                out: false
            };
        }

        // Initialize players for the bowling team
        for (let i = 1; i <= numberOfPlayers; i++) {
            const element = byId(`${teamBowlingPrefix}${i}`);
            let playerName = element ? element.value : `Player ${i}`;
            players[`${teamBowlingPrefix}${i}`] = {
                name: playerName,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                extras: 0,
                out: false
            };
        }

        // Update UI elements
        byId('playerSelection').classList.add('hidden');
        byId('playerSelection').style.display = "none";
        byId('formatSelection').classList.add('hidden');
        byId('startButton').classList.add('hidden');
        byId('tossButton').classList.add('hidden');
        byId('matchRulesInput').classList.add('hidden');
        byId('teamSelection').classList.add('hidden');
        byId('scorecard').classList.add('visible');
        byId('score').classList.remove('hidden');
        byId('runButtons').classList.remove('hidden');

        // Update the score and scorecard displays
        updateScore();
        updateScorecard();
    }
}

function switchOver() {
    switchStrikeIfSingleOrTriple();
    ballsThisOver = 0;
    overs++; // Increment the over count
    bouncersThisOver = 0;
    updateScore();
}

function switchStrike() {
    if (`${teamBatting}PlrCount` === 1) {
        console.log("Only one player selected. Cannot switch strike.");
        return; // Exit function if only one player
    }

    // Update the striker and non-striker variables
    let temp = striker;
    striker = nonStriker;
    nonStriker = temp;

    // Skip players who are out
    while (`${players}${teamBattingPrefix}${striker}`.out) {
        striker = (striker % numberOfPlayers) + 1; // Move to the next player
    }

    // Use setTimeout to queue UI updates
    setTimeout(() => {
        // Update the classes of player elements
        for (let i = 1; i <= numberOfPlayers; i++) {
            let playerElement = byId('player' + i);
            if (playerElement) {
                if (i === striker) {
                    playerElement.classList.add('on-strike');
                } else {
                    playerElement.classList.remove('on-strike');
                }
            } else {
                console.warn("Player element not found for player:", i);
                console.warn("numberOfPlayers:", numberOfPlayers);
                return; // Exit function to prevent further warns
            }
        }
        updateScorecard();
        updateScore(); // Call updateScore() here
    }, 0);
}

function switchStrikeIfSingleOrTriple(run) {
    if (run === 1 || run === 3) {
        if (ballsThisOver !== totalBallsPerOver) {
            switchStrike(); // Switch strike if 1 or 3 on any ball except the 6th ball
        }
    }
}

function addRun(run) {
    if (gameEnded) return;

    let plrKey = `${teamBatting}Player${striker}`
    let player = players[plrKey]

    // Increment runs and balls for the striker
    player.runs += run;
    player.balls++;
    ballsThisOver++;
    handleFreeHit()

    // Increment fours or sixes if applicable
    if (run === 4) {
        player.fours++;
    } else if (run === 6) {
        player.sixes++;
    }

    // Check if the over is completed
    if (ballsThisOver === totalBallsPerOver) {
        switchOver(run); // Switch over if all balls have been bowled
        if (run !== 1 && run !== 3) {
            switchStrike(); // Switch strike if not 1 or 3 on the last ball of the over
        }
    } else if (ballsThisOver < totalBallsPerOver) {
        // Switch strike if 1 or 3 is scored
        switchStrikeIfSingleOrTriple(run);
    }
    updateScorecard();
    updateScore();
}

// Function to count the number of players with wickets remaining
function getRemainingPlayers() {
    let team = teamBatting
    for (let i = 1; i <= numberOfPlayers; i++) {
        let wicketsRemaining = parseInt(byId(`${team}wickets${i}`).value);
        if (wicketsRemaining > 0) {
            remainingPlayers.push(i);
        }
    }
    return remainingPlayers;
}

function addWide() {
    if (gameEnded) return;
    players[striker].runs++;
    players[striker].extras++;
    updateScorecard();
    updateScore();
}

function addNoBall() {
    if (gameEnded) return;
    if (isFreeHit) {
        isNoBall
    }
    isFreeHit = true;
    players[striker].runs++;
    players[striker].extras++;
    updateScorecard();
    updateScore();
}

function handleFreeHit() {
    if (isFreeHit) {
        isFreeHit = false;
        updateScore(); // Update the score display to remove the "(Free Hit)" text
    }
}

function addBouncer() {
    if (gameEnded) return;
    bouncersThisOver++;
    if (bouncersThisOver > maxBouncersAllowed) {
        addNoBall()
    }
    byId('bouncersThisOver').textContent = `Bouncers this over: ${bouncersThisOver}`;
}

function undoLastAction() {
    // Additional functionality for undoing the last action can be added here
}

function updateNonStriker() {
    if (numberOfPlayers === 1) {
        nonStriker = 0; // If only one player selected, nonStriker remains 0
    } else {
        nonStriker = 2; // If two or more players selected, nonStriker becomes 2
    }
}

function resetMatch() {

    let yes = confirm("Are you sure you want to reset the match? Settings will be saved.") // Asks to confirm reset

    if (yes) {

        // Reset all player scores and stats
        for (let player in players) {
            players[player].runs = 0;
            players[player].balls = 0;
            players[player].fours = 0;
            players[player].sixes = 0;
            players[player].extras = 0;
            players[player].out = false;
        }

        // Reset other game variables
        wickets = [];
        overs = 0;
        ballsThisOver = 0;
        bouncersThisOver = 0;
        isFreeHit = false;

        // Reset score and scorecard display
        updateScore();
        updateScorecard();

        // Remove the "on-strike" class from all players
        let allPlayers = document.querySelectorAll('.on-strike');
        allPlayers.forEach(player => {
            player.classList.remove('on-strike');
        });

        // Add the "on-strike" class to player 1 and "off-strike" to player 2
        byId('player1').classList.add('on-strike');
        byId('player2').classList.add('off-strike');
        console.log("RESET");
    }
}

function showWicketsList() {
    let modal = byId('wickets-modal');
    if (modal) {
        modal.style.display = 'block'; // Show the modal
    } else {
        console.warn("Modal element not found.");
    }

    let closeButton = byId('wicketClose');

    // Add event listener to the close button
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            // Get the modal element
            let modal = byId('wickets-modal');
            if (modal) {
                modal.style.display = 'none'; // Hide the modal
            } else {
                console.warn("Modal element not found.");
            }
        });
    } else {
        console.warn("Close button element not found.");
    }
}

const showWicketsButton = byId('show-wickets-button');
const consoleLogViewer = byId('console-log-viewer');

showWicketsButton.addEventListener('click', showWicketsList);

// Get the close button element
const tossCloseButton = byId('tossClose');

// Add event listener to the close button
if (tossCloseButton) {
    tossCloseButton.addEventListener('click', function () {
        // Get the modal element
        let tossModal = byId('toss-modal');
        if (tossModal) {
            byId('batButton').classList.add('hidden')
            byId('bowlButton').classList.add('hidden')
            tossModal.style.display = 'none'; // Hide the toss modal

        } else {
            console.warn("Toss modal element not found.");
        }
    });
} else {
    console.warn("Toss close button element not found.");
}

function updateConsoleLogViewer() {

    consoleLogViewer.innerHTML = '';

    // Get all console log messages
    const logs = console.logHistory.slice().reverse();

    // Add logs to the viewer
    logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.textContent = log;
        consoleLogViewer.appendChild(logEntry);
    });
}
// Override console.log to capture log messages
console.logHistory = [];
console._log = console.log;
console.log = function (...args) {
    // Capture log messages
    console._log.apply(this, args);
    const message = args.join(' ');
    console.logHistory.push(message);

    // Limit log history to 10 messages
    if (console.logHistory.length > 10) {
        console.logHistory.shift();
    }

    // Update the console log viewer whenever a new log message is added
    updateConsoleLogViewer();
};

function forceRotate() {
    if (gameEnded) return;
    let yes = confirm("Are you sure you want to force rotate strike?")
    if (yes) {
        switchStrike();
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const team1Input = byId('team1Name');
    const team2Input = byId('team2Name');
    const tossResultElem = byId('tossResult');
    const tossModal = byId('toss-modal');
    const batButton = byId('batButton');
    const bowlButton = byId('bowlButton');
    const finalDecision = byId('tossResult');
    const tossAnnouncement = byId('tossAnnouncement');

    let tossWinner;
    let choice;

    let batSure = false;
    let bowlSure = false;

    function handleBatClick() {

        if (!batSure && !bowlSure) {
            batButton.textContent = 'Sure?';
            bowlButton.textContent = 'Bowl';
            batSure = true;
            bowlSure = false;
        }
        else if (bowlSure && !batSure) {
            bowlButton.textContent = 'Bowl';
            bowlSure = false;
        }

        else {
            handleChoice('bat');
            batButton.classList.add('hidden')
            bowlButton.classList.add('hidden')
        }
    }

    function handleBowlClick() {
        if (batSure && !bowlSure) {
            batButton.textContent = 'Bat';
            batSure = false;
        }
        else if (!bowlSure && !batSure) {
            bowlButton.textContent = 'Sure?';
            batButton.textContent = 'Bat';
            bowlSure = true;
            batSure = false;
        } else {
            handleChoice('bowl');
            batButton.classList.add('hidden')
            bowlButton.classList.add('hidden')
        }
    }

    function handleChoice(selectedChoice) {
        choice = selectedChoice;
        finalDecision.style.display = 'block';
        finalDecision.textContent = `${tossWinner} won the toss and decided to ${choice === 'bat' ? 'bat' : 'bowl'}`;
        tossAnnouncement.textContent = `${tossWinner} won the toss and decided to ${choice === 'bat' ? 'bat' : 'bowl'}`;
        tossAnnouncement.classList.remove('hidden');

        // Assign teamBatting and teamBowling based on the choice
        if (choice === 'bat') {
            teamBatting = tossWinner === team1Input.value.trim() ? 'team1' : 'team2';
            teamBowling = tossWinner === team1Input.value.trim() ? 'team2' : 'team1';
        } else {
            teamBowling = tossWinner === team1Input.value.trim() ? 'team1' : 'team2';
            teamBatting = tossWinner === team1Input.value.trim() ? 'team2' : 'team1';
        }

        console.log(`Team Batting: ${byId(teamBatting + 'Name').value}`);
        console.log(`Team Bowling: ${byId(teamBowling + 'Name').value}`);
    }

    function closeTossModal(event) {
        if (event.target === tossModal) {
            tossModal.style.display = 'none';
        }
    }

    byId('tossButton').addEventListener('click', function () {
        const team1 = team1Input.value.trim();
        const team2 = team2Input.value.trim();

        tossModal.style.display = 'block';

        tossResultElem.textContent = 'Flipping';
        const dotsInterval = setInterval(() => {
            tossResultElem.textContent += '.';
            if (tossResultElem.textContent.endsWith('....')) {
                tossResultElem.textContent = 'Flipping';
            }
        }, 250);

        setTimeout(() => {
            clearInterval(dotsInterval);
            tossWinner = Math.random() < 0.5 ? team1 : team2;
            tossResultElem.textContent = `${tossWinner} win the toss!`;
            batButton.classList.remove('hidden');
            bowlButton.classList.remove('hidden');
        }, 2000);

        // Hide the buttons initially
        batButton.classList.add('hidden');
        bowlButton.classList.add('hidden');

        // Reset Sure states
        batSure = false;
        bowlSure = false;
    });

    batButton.addEventListener('click', handleBatClick);
    bowlButton.addEventListener('click', handleBowlClick);
    tossModal.addEventListener('click', closeTossModal);
});
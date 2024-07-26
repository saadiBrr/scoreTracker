
let format = ''
let maxInnings;
let remainingInnings;
let players = {
    team1: [],
    team2: []
};
let playerCounts = {
    team1: 0,
    team2: 0
};
let playerNames = [];
let teamBattingPrefix;
let teamBowlingPrefix;
let numberOfPlayers = 1;
let teamBatting;
let teamBowling;
let striker = 0; // This means Player 1, Player 2 is 1 and so on..
let nonStriker = 1;
let wickets = {
    team1: [],
    team2: []
};
let maxOvers = 0;
let oversBowled;
let ballsThisOver = 0;
let maxBallsPerOver = 6;
let totalRuns = {
    team1: 0,
    team2: 0
};
let totalBalls = {
    team1: 0,
    team2: 0
};
let remainingPlayers = [];
let bouncersThisOver = 0;
let maxBouncersAllowed = 1;
let isWide = false;
let isNoBall = false;
let isFreeHit = false;
let gameEnded = false;
let rotateStrikeOnWicket = false;
let target;
// This is for toss announcement update
let max;


function byId(id) {
    return document.getElementById(id);
}

function updateFormat() {

    format = byId('selectedFormat').value;

    byId('teamSelection').classList.remove('hidden');

    if (format === "Test") {
        byId('inningsInput').classList.remove('hidden');
        maxInnings = parseInt(byId('innings').value) === 1 ? 2 : 4;
        remainingInnings = maxInnings;
    }
    else {
        maxInnings = 2;
        remainingInnings = 2;
        byId('inningsInput').classList.add('hidden');
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
        if (team1SelectedPlayers > 1 || team2SelectedPlayers > 1) {
            byId('rotationCheck').classList.remove('hidden')
        } else {
            byId('rotationCheck').classList.add('hidden')
        }
    } else {
        // Hide the overs and bouncers inputs if any of the teams doesn't have players selected
        byId('matchRulesInput').classList.add('hidden');
        byId('startButton').classList.add('hidden');
        byId('tossButton').classList.add('hidden')
        byId('rotationCheck').classList.add('hidden')
    }
}

function updateScorecard() {
    let scorecard = byId('scorecard');
    scorecard.style.fontSize = '22px';
    scorecard.innerHTML = '';

    for (let i = 0; i < playerCounts[teamBatting]; i++) {

        let player = players[teamBatting][i];
        let playerKey = `${teamBatting}Player${(i + 1)}`;
        if (!player) continue; // Skip if the player does not exist

        let strikeRate = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0';
        let className = '';
        if (striker === i) {
            className = 'on-strike';
        } else if (nonStriker === i) {
            className = 'off-strike';
        }
        if (player.out) {
            className = 'out'
        }

        scorecard.innerHTML += `<p id="${playerKey}" class="${className}">${player.name}: ${player.runs} (${player.balls}) [4s: ${player.fours}, 6s: ${player.sixes}, Extras: ${player.extras}, Strike Rate: ${strikeRate}]</p>`;
    }
}

function updateScore() {
    totalRuns[teamBatting] = 0;
    totalBalls[teamBatting] = 0;

    // Iterate over the players using a regular for loop
    for (let i = 0; i < playerCounts[teamBatting]; i++) {
        let player = players[teamBatting][i];
        totalRuns[teamBatting] += player.runs;
        totalBalls[teamBatting] += player.balls;
    }

    let target = totalRuns[teamBatting] + 1;

    let oversCompleted = Math.floor(totalBalls[teamBatting] / maxBallsPerOver);
    let ballsRemaining = totalBalls[teamBatting] % maxBallsPerOver;

    let runRate = totalBalls[teamBatting] > 0 ? totalRuns[teamBatting] / (totalBalls[teamBatting] / 6) : 0; // Calculate run rate
    if (isNaN(runRate)) {
        runRate = 0; // Set run rate to 0 if it's NaN
    }

    if (ballsRemaining == 0) {
        oversBowled = oversCompleted;
    } else {
        oversBowled = `${oversCompleted}.${ballsRemaining}`;
    }

    let overOrOvers = oversCompleted === 1 ? 'over' : 'overs';
    let score = byId('score');
    let z = wickets[teamBatting] ? wickets[teamBatting].length : 0
    let scoreText = `${totalRuns[teamBatting]}/${z} (${oversBowled} ${overOrOvers}) Run Rate: ${runRate.toFixed(2)}`;

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
    if (z === 0) {
        // If no wickets have fallen, display a message
        let listItem = document.createElement('li');
        listItem.textContent = "No wickets have fallen.";
        wicketsList.appendChild(listItem);
    } else {
        // Loop through each wicket in the wickets array
        wickets[teamBatting].forEach((wicket, index) => {

            index = index + 1
            // Create a new list item element for the wicket
            let listItem = document.createElement('li');
            let wi = wicket

            // Set the text content of the list item to display wicket information
            listItem.textContent = `${wi.batsman} ${wi.runs}(${wi.balls})`;

            // If bowler information is available and wicket is credited, add it to the text content
            if (wicket.bowler && wicket.credited) {
                listItem.textContent += ` (b. ${wicket.bowler})`;
            }

            listItem.textContent += ` FOW: ${wi.fallOfWicket}`

            // Append the created list item to the wickets list element
            wicketsList.appendChild(listItem);
        });
    }
}

function endInnings() {

    let j;

    if (maxOvers === 0) {
        j = false
    } else if (oversBowled === maxOvers) {
        j = true
    }

    let z = wickets[teamBatting] ? wickets[teamBatting].length : 0

    if (remainingInnings > 0 && (getRemainingPlayers().length == 0 || j == true)) {
        console.log(`No wickets remaining. Switching sides. Remaining Innings: ${remainingInnings}, getRemainingPlayers().length = ${getRemainingPlayers().length}, j = ${j}`)
        remainingInnings--;
        if (remainingInnings !== 0) {
            let temp = teamBatting
            teamBatting = teamBowling
            teamBowling = temp
            striker = 0
            if (players[teamBatting][1]) {
                nonStriker = 1
            } else
                return;
        }

    } else if (remainingInnings > 0 && getRemainingPlayers().length > 0) {
        let confirmation = confirm('Are you sure you want to declare?')
        if (confirmation) {
            console.log(`${byId(`${teamBatting}Name`).value} has declared their innings at ${totalRuns[teamBatting]}/${z}`)
            remainingInnings--;
            if (remainingInnings !== 0) {
                let temp = teamBatting
                teamBatting = teamBowling
                teamBowling = temp
                striker = 0
                if (players[teamBatting][1]) {
                    nonStriker = 1
                } else
                    return;
            }
        }
    }
    byId('endInningsButton').innerHTML = 'Declare'
    max = 0;
    updateGameUI();
}

function endGame(forced) {
    // Check if all players are out
    if (getRemainingPlayers().length === 0 && remainingInnings === 0) {
        // If all players are out, end the game
        console.log("Game over. All players are out.");
        gameEnded = true;
        // Additional logic for ending the game can be added here
    } else {
        // If there are remaining players, prompt the user to end the game
        if (!forced) {
            let endGameConfirmation = confirm("Wickets are remaining. Do you still want to end the game?");
            if (endGameConfirmation) {
                console.log("Game over. User decided to end the game.");
                gameEnded = true;
                // Additional logic for ending the game can be added here
            } else {
                console.log("Game continues.");
            }
        } else {
            gameEnded = true;
            console.log('Game ended [F]')
        }
    }
}

function addWicket() {
    if (gameEnded) return;

    let player = players[teamBatting][striker];

    // Decrement wickets remaining for the striker
    let remainingWickets = player.remainingWickets
    remainingWickets--;
    player.remainingWickets = remainingWickets;
    console.log(remainingWickets, player.remainingWickets)

    player.balls++;

    updateGameUI();

    let outOnBall = oversBowled;

    let ballsFaced = player.balls;

    if (remainingWickets === 0) {
        // Mark the player as out
        console.log(`Sending input to markPlayerOut function: Current Striker is ${striker}. Player being sent is ${players[teamBatting].indexOf(player)}`);
        markPlayerOut(player);

        let message = ballsFaced === 1
            ? `${player.name} is all out at ${player.runs} runs off of ${player.balls} ball`
            : `${player.name} is all out at ${player.runs} runs off of ${player.balls} balls`;

        console.log(message);
    }

    let runsAtFOW = totalRuns[teamBatting];
    let wicketsAtFOW = wickets[teamBatting].length + 1;

    // ----------------WICKET OBJECT HERE----------------
    let wicket = {
        batsman: player.name,
        fallOfWicket: `${runsAtFOW}/${wicketsAtFOW} ${outOnBall} ov`,
        runs: player.runs,
        balls: player.balls,
        bowler: null,
        credited: false
    };

    wickets[teamBatting].push(wicket);
    updateGameUI();

    let remainingPlayers = getRemainingPlayers().filter(player => player && !player.out);

    if (remainingPlayers.length > 1) {
        // Find the next striker who is not the non-striker
        if (remainingWickets > 0) {
            if (rotateStrikeOnWicket == true) {
                let nextStriker = null;
                for (let i = 0; i < playerCounts[teamBatting]; i++) {
                    if (i !== nonStriker && i !== striker && players[teamBatting][i] && !players[teamBatting][i].out) {
                        nextStriker = i;
                        console.log(`NextStriker = ${nextStriker}`)
                        break;
                    }
                }
                if (nextStriker !== null) {
                    striker = nextStriker;
                } else {
                    striker = nonStriker;
                    nonStriker = null;
                }
            }
            else return;
        } else {
            let nextStriker = null;
            for (let i = 0; i < playerCounts[teamBatting]; i++) {
                if (i !== nonStriker && i !== striker && players[teamBatting][i] && !players[teamBatting][i].out) {
                    nextStriker = i;
                    console.log(`NextStriker = ${nextStriker}`)
                    break;
                }
            }

            if (nextStriker !== null) {
                striker = nextStriker;
            } else {
                striker = nonStriker;
                nonStriker = null;
            }
        }
    } else if (getRemainingPlayers().filter(player => player && !player.out).length === 1) {
        let playerIndex = players[teamBatting].findIndex(player => remainingPlayers.includes(player.name));
        striker = playerIndex;
        nonStriker = null;
    } else {
        // If no players are left, add option to end the innings
        byId('endInningsButton').innerHTML = '<font color="#5e8dc4">End Innings</font>'
    }

    // Switch over if the last ball of the over
    if (ballsFaced % 6 === 0 && !gameEnded) {
        if (striker && nonStriker) {
            let temp = striker;
            striker = nonStriker;
            nonStriker = temp;
            console.log("Switching over...");
            switchOver();
        }
        else {
            striker = striker
            nonStriker = null
        }
    }

    // Update UI to display wickets
    updateGameUI();
}

function markPlayerOut(playerKey) {
    // Get the index of the player in the team's array
    let playerNumber = playerKey.id;
    let playerId = `${teamBatting}Player${playerNumber}`;

    // Set the player's out status to true
    playerKey.out = true;
    console.log(`Player ${playerId} set out = true`);

    let playerElement = document.querySelector(`#scorecard #${playerId}`);
    console.log('playerElement:', playerElement);
    if (document.querySelector(`#scorecard #${playerId}`)) {
        document.querySelector(`#scorecard #${playerId}`).classList.remove('on-strike')
        setTimeout(() => {
            document.querySelector(`#scorecard #${playerId}`).classList.add('out')
        }, 1)
    } else {
        console.error(`Element with ID ${playerId} not found under scorecard div!`);
    }

    // Debug: Print remaining players before filtering
    console.log('Remaining players before filtering:', remainingPlayers);

    // Remove the player from the list of remaining players
    remainingPlayers = remainingPlayers.filter(p => p !== playerKey.name);

    // Debug: Print remaining players after filtering
    console.log('Remaining players after filtering:', remainingPlayers);
    updateGameUI();
}

function startGame() {
    // console.log('Starting Game');

    if (!teamBatting || !teamBowling) {
        teamBatting = 'team1';
        teamBowling = 'team2';
    }

    let teamBattingPlrs;
    let teamBowlingPlrs;

    // Get the number of overs and validate it
    let numOvers = parseInt(byId('overs').value);
    numOvers = isNaN(numOvers) || numOvers <= 0 ? Infinity : numOvers; // Default to Infinity if invalid or 0

    // Functionality from createPlayerObjects for team1
    players['team1'] = [];
    const numberOfPlayersInTeam1 = parseInt(byId('team1Players').value);
    // console.log(`Creating players for team1. Number of players: ${numberOfPlayersInTeam1}`);

    for (let i = 1; i <= numberOfPlayersInTeam1; i++) {
        let playerElement = byId(`team1Player${i}`);
        let wicketsElement = byId(`team1Wickets${i}`);

        // console.log(`Player Element ${i}:`, playerElement ? playerElement.value : 'null');
        // console.log(`Wickets Element ${i}:`, wicketsElement ? wicketsElement.value : 'null');

        if (playerElement && wicketsElement) {
            let playerName = playerElement.value.trim();
            let playerWickets = parseInt(wicketsElement.value);

            if (playerName === '') {
                playerName = `Player ${i}`;
            }

            if (!playerCounts['team1']) {
                playerCounts['team1'] = 0;
            }
            playerCounts['team1'] += 1;

            let player = {
                name: playerName,
                id: i,
                totalWickets: playerWickets,
                remainingWickets: playerWickets,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                extras: 0,
                out: false
            };

            // console.log(`Created player ${i}:`, player);
            players['team1'].push(player);
        } else {
            console.warn(`Missing player or wickets element for index ${i}`);
        }
    }
    console.log(`Final players array for team1:`, players['team1']);

    // Functionality from createPlayerObjects for team2
    players['team2'] = [];
    const numberOfPlayersInTeam2 = parseInt(byId('team2Players').value);
    // console.log(`Creating players for team2. Number of players: ${numberOfPlayersInTeam2}`);

    for (let i = 1; i <= numberOfPlayersInTeam2; i++) {
        let playerElement = byId(`team2Player${i}`);
        let wicketsElement = byId(`team2Wickets${i}`);

        // console.log(`Player Element ${i}:`, playerElement ? playerElement.value : 'null');
        // console.log(`Wickets Element ${i}:`, wicketsElement ? wicketsElement.value : 'null');

        if (playerElement && wicketsElement) {
            let playerName = playerElement.value.trim();
            let playerWickets = parseInt(wicketsElement.value);

            if (playerName === '') {
                playerName = `Player ${i}`;
            }

            if (!playerCounts['team2']) {
                playerCounts['team2'] = 0;
            }
            playerCounts['team2'] += 1;

            let player = {
                name: playerName,
                id: i,
                totalWickets: playerWickets,
                remainingWickets: playerWickets,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                extras: 0,
                out: false
            };

            // console.log(`Created player ${i}:`, player);
            players['team2'].push(player);
        } else {
            console.warn(`Missing player or wickets element for index ${i}`);
        }
    }
    console.log(`Final players array for team2:`, players['team2']);

    let teamBattingPrefix = players[teamBatting];
    let teamBowlingPrefix = players[teamBowling];

    teamBattingPlrs = playerCounts[teamBatting];
    teamBowlingPlrs = playerCounts[teamBowling];
    // console.log(`TeamBattingPlrs: ${teamBattingPlrs}, teamBowlingPlrs: ${teamBowlingPlrs}`);

    for (let i = 1; i <= teamBattingPlrs; i++) {
        const element = byId(`${teamBatting}Player${i}`);
        if (element) {
            let playerName = element ? element.value : `Player ${i}`;
            if (playerName.trim() === '') {
                playerName = `Player ${i}`;
            }
            playerNames.push(playerName);
        }
    }

    maxBouncersAllowed = parseInt(byId('bouncers').value)

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

    updateNonStriker();
    updateGameUI();
    getRemainingPlayers();
}

function switchOver() {
    switchStrikeIfSingleOrTriple();
    ballsThisOver = 0;
    overs++; // Increment the over count
    bouncersThisOver = 0;
    updateScore();
}

function switchStrike() {
    // Check if there are at least two active players
    getRemainingPlayers();
    if (remainingPlayers.length < 2) {
        console.log("Not enough players to switch strike.");
        return; // Exit function if fewer than two active players
    }

    // Update the striker and non-striker variables
    let temp = striker;
    striker = nonStriker;
    nonStriker = temp;

    // Skip players who are out
    while (players[teamBatting][striker] && players[teamBatting][striker].out) {
        striker = (striker % playerCounts[teamBatting]) + 1; // Move to the next player
    }

    while (players[teamBatting][nonStriker] && players[teamBatting][nonStriker].out) {
        nonStriker = (nonStriker % playerCounts[teamBatting]) + 1; // Move to the next player
    }

    // Use setTimeout to queue UI updates
    setTimeout(() => {
        // Update the classes of player elements
        for (let i = 1; i <= playerCounts[teamBatting]; i++) {
            let playerElement = byId(`${teamBatting}Player${i}`);
            if (playerElement) {
                if (i === striker) {
                    playerElement.classList.add('on-strike');
                    playerElement.classList.remove('off-strike');
                } else if (i === nonStriker) {
                    playerElement.classList.add('off-strike');
                    playerElement.classList.remove('on-strike');
                } else {
                    playerElement.classList.remove('on-strike');
                    playerElement.classList.remove('off-strike');
                }
            } else {
                console.warn("Player element not found for player:", i);
                console.warn("Number of Players:", playerCounts[`${teamBatting}PlrCount`]);
                return; // Exit function to prevent further warnings
            }
        }
        updateGameUI();
    }, 0);
}

function switchStrikeIfSingleOrTriple(run) {
    if (run === 1 || run === 3) {
        if (ballsThisOver !== maxBallsPerOver) {
            switchStrike(); // Switch strike if 1 or 3 on any ball except the 6th ball
        }
    }
}

function addRun(run) {
    if (gameEnded) return;

    let plrKey = players[teamBatting];
    let player = plrKey[striker];

    if (!player) {
        if (getRemainingPlayers().length == 0) {
            console.error("Innings has ended.");
            endInnings();
            return;
        } else {
            console.error("Invalid striker index:", striker);
            return;
        }
    }

    // Increment runs and balls for the striker
    player.runs += run;
    player.balls++;
    ballsThisOver++;
    handleFreeHit();

    // Increment fours or sixes if applicable
    if (run === 4) {
        player.fours++;
    } else if (run === 6) {
        player.sixes++;
    }

    // Check if the over is completed
    if (ballsThisOver === maxBallsPerOver) {
        switchOver(run); // Switch over if all balls have been bowled
        if (run !== 1 && run !== 3) {
            // Ensure there are at least two players who are not out before switching strike
            if (players[teamBatting].filter(player => !player.out).length > 1) {
                switchStrike(); // Switch strike if not 1 or 3 on the last ball of the over
            }
        }
    } else if (ballsThisOver < maxBallsPerOver) {
        // Switch strike if 1 or 3 is scored and there are enough players
        if (players[teamBatting].filter(player => !player.out).length > 1) {
            switchStrikeIfSingleOrTriple(run);
        }
    }

    updateGameUI();
}

function getRemainingPlayers() {

    for (let i = 0; i < playerCounts[teamBatting]; i++) {

        let player = players[teamBatting][i];
        if (!player) {
            console.warn(`Player index ${i} does not exist.`);
            continue; // Skip iteration if player is undefined
        }

        let remainingWickets = player.remainingWickets;

        if (remainingWickets > 0) {
            if (!remainingPlayers.includes(player.name)) {
                remainingPlayers.push(player.name);
            }
        }
    }
    return remainingPlayers;
}

function addWide() {
    if (gameEnded) return;
    players[teamBatting][striker].runs++;
    players[teamBatting][striker].extras++;
    updateGameUI();
}

function addNoBall() {
    if (gameEnded) return;
    if (isFreeHit) {
        isNoBall
    }
    isFreeHit = true;
    players[teamBatting][striker].runs++;
    players[teamBatting][striker].extras++;
    updateGameUI();
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
        addNoBall();
    } else {
        players[teamBatting][striker].balls++
    }
    byId('bouncersThisOver').textContent = `Bouncers this over: ${bouncersThisOver}`;
    updateGameUI();
}

function undoLastAction() {
    // Additional functionality for undoing the last action can be added here
}

function updateNonStriker() {
    if (numberOfPlayers === 1) {
        nonStriker = null; // If only one player selected, nonStriker remains null
    } else {
        nonStriker = 1; // If two or more players selected, nonStriker becomes 2
    }
}

function resetInnings() {
    if (confirm("Are you sure you want to reset this innings? This cannot be undone.")) {
        // Reset all player scores and stats
        for (let i = 0; i <= playerCounts[teamBatting]; i++) {

            let player = players[teamBatting][i];
            if (player) {
                player.runs = 0;
                player.balls = 0;
                player.fours = 0;
                player.sixes = 0;
                player.extras = 0;
                player.out = false;
                player.remainingWickets = player.totalWickets
            }
        }

        // Reset other game variables
        wickets = {
            team1: [],
            team2: []
        };
        remainingPlayers = getRemainingPlayers();
        overs = 0;
        ballsThisOver = 0;
        bouncersThisOver = 0;
        isFreeHit = false;
        gameEnded = false;
        max = 0;
        // remainingInnings = maxInnings;

        // Reset score and scorecard display
        byId('endInningsButton').innerHTML = 'Declare'
        updateGameUI();

        // Add the "on-strike" class to player 1 and "off-strike" to player 2 of the batting team
        let playerElements = [];

        for (let i = 1; i <= 3; i++) {
            playerElements[i] = document.querySelector(`#scorecard #${teamBatting}Player${i}`);
        }

        if (playerElements[1] && playerElements[2]) {
            playerElements[1].classList.remove('off-strike');
            playerElements[2].classList.remove('on-strike');
            striker = 0
            playerElements[1].classList.add('on-strike');
            playerElements[2].classList.add('off-strike');
            nonStriker = 1
        }
        else if (playerElements[1] && !playerElements[2] && !playerElements[3]) {
            return
        }

        if (playerElements[3]) {
            playerElements[3].classList.remove('on-strike');
            playerElements[3].classList.remove('off-strike');
            playerElements[3].classList.remove('out');
        }
        console.warn("Innings has been reset");
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

function updateGameUI() {

    updateScore();
    updateScorecard();

    const tossAnnouncement = byId('teamBattingAnnouncement');
    if (max !== 1) {
        teamBattingAnnouncement.innerHTML = `${byId(teamBatting + 'Name').value} is batting`
        tossAnnouncement.classList.remove('hidden');
        max = 1
    } else {
        return;
    }
}

function forceRotate() {
    if (gameEnded) return;
    let yes = confirm("Are you sure you want to force rotate strike?")
    if (yes) {
        switchStrike();
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

function updateConsoleLogViewer(enabled) {

    if (!enabled) return;

    byId('console-log-viewer').classList.remove('hidden')

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

// TOSS HANDLING
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
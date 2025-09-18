console.log("hello from app.js!")




// This function will now fetch the data AND display it.
function fetchLeaderboardData() {
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    

    fetch("https://api.chess.com/pub/leaderboards", requestOptions)
        .then((response) => response.json())
        .then(function (result) {
            console.log("Successfully fetched data!", result);

            // --- Get the Top 5 Live Rapid Players ---
            const top5Rapid = result.live_rapid.slice(0, 5); // .slice(0, 5) gives us the first 5 items
            console.log("Top 5 Rapid Players:", top5Rapid);

            // --- Get the Top 5 Live Blitz Players ---
            const top5Blitz = result.live_blitz.slice(0, 5);
            console.log("Top 5 Blitz Players:", top5Blitz);


            // --- Now, let's display them! ---
            // We need a place in our HTML to put this data. Let's use the 'leaderboards-container'.
            const container = document.getElementById('leaderboards-container');
            
            // Start with a clean slate
            container.innerHTML = '<h2>Top Players</h2>'; 

            // Add Rapid players to the page
            container.innerHTML += '<h4>Live Rapid</h4>';
            top5Rapid.forEach(player => {
                // For each player, create a new paragraph and add it to the container
                const playerInfo = `#${player.rank} - ${player.username} (Rating: ${player.score})`;
                container.innerHTML += `<p>${playerInfo}</p>`;
            });

            // Add Blitz players to the page
            container.innerHTML += '<h4>Live Blitz</h4>';
            top5Blitz.forEach(player => {
                const playerInfo = `#${player.rank} - ${player.username} (Rating: ${player.score})`;
                container.innerHTML += `<p>${playerInfo}</p>`;
            });

        })
        .catch((error) => console.error(error));
}






async function queryAI(userMessage) {
    // The System Prompt gives the AI its personality and purpose!
    const systemPrompt = "You are a world-class chess coach named 'ChessBot'. Your purpose is to teach chess to beginners in a friendly and encouraging way.";

    const data = {
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage } // We use the user's actual message here!
        ],
        model: "openai/gpt-oss-20b:fireworks-ai", // Using a reliable standard model
    };

    const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}


// ==========================================================
// 2. THE MAIN CLICK HANDLER FOR THE CHATBOT
//    We made this 'async' so it can 'await' the AI response.
// ==========================================================
async function clickHandler() {
    console.log("Ask button was clicked");
    let userInputText = getValue("userInput");

    if (userInputText === '') {
        setText('botOutput', "Please enter a message");
        setProperty("botOutput", "color", "red");
    } else {
        setText("botOutput", "Thinking..."); // Show a waiting message
        setProperty("botOutput", "color", "black");
        clearValue("userInput"); // Clear the input box for the next question

        // --- This is where the magic happens! ---
        // Call our AI function and wait for the response.
        const aiResponse = await queryAI(userInputText);

        // Extract the actual message from the complex response object.
        const botMessage = aiResponse.choices[0].message.content;

        // Display the AI's final answer!
        setText("botOutput", botMessage);
    }
}



document.getElementById("Ask").addEventListener("click", clickHandler);

document.getElementById("fetch-players-btn").addEventListener("click", fetchLeaderboardData);

document.getElementById("userInput").style.backgroundColor = "white"

document.getElementById("cardDiv").style.backgroundColor = "red"

document.getElementById("botOutput").style.backgroundColor = "white"
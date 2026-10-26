
const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("wordInput");
const results = document.getElementById("results");
const message = document.getElementById("message");
const favoritesList = document.getElementById("favoritesList");
const themeButton = document.getElementById("themeButton");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function showFavorites() {
    favoritesList.replaceChildren();

    favorites.forEach(function(word) {
        const item = document.createElement("li");
        item.className = "favorite-item";

        const wordButton = document.createElement("button");
        wordButton.textContent = word;
        wordButton.addEventListener("click", function() {
            wordInput.value = word;
            searchWord(word);
        });

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", function() {
            favorites = favorites.filter(function(favorite) {
                return favorite !== word;
            });

            saveFavorites();
            showFavorites();
        });

        item.appendChild(wordButton);
        item.appendChild(removeButton);
        favoritesList.appendChild(item);
    });
}

function toggleFavorite(word, button) {
    if (favorites.includes(word)) {
        favorites = favorites.filter(function(favorite) {
            return favorite !== word;
        });
        button.textContent = "♡ Save Favorite";
    } else {
        favorites.push(word);
        button.textContent = "♥ Saved";
    }

    saveFavorites();
    showFavorites();
}

async function searchWord(word) {
    word = word.trim().toLowerCase();

    if (!word) {
        message.textContent = "Please enter a word.";
        message.className = "error";
        return;
    }

    message.textContent = "Searching...";
    message.className = "";
    results.replaceChildren();

    try {
        const response = await fetch(
            "https://api.dictionaryapi.dev/api/v2/entries/en/" +
            encodeURIComponent(word)
        );

        if (!response.ok) {
            throw new Error("Word not found. Please try another word.");
        }

        const data = await response.json();
        const entry = data[0];

        message.textContent = "";
        displayWord(entry);
    } catch (error) {
        message.textContent = error.message === "Failed to fetch"
            ? "Could not connect. Check your internet and try again."
            : error.message;

        message.className = "error";
    }
}

function displayWord(entry) {
    const word = entry.word.toLowerCase();

    const heading = document.createElement("div");
    heading.className = "word-heading";

    const title = document.createElement("h2");
    title.textContent = entry.word;
    heading.appendChild(title);

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-button";
    favoriteButton.textContent = favorites.includes(word)
        ? "♥ Saved"
        : "♡ Save Favorite";

    favoriteButton.addEventListener("click", function() {
        toggleFavorite(word, favoriteButton);
    });

    heading.appendChild(favoriteButton);
    results.appendChild(heading);

    const phonetic = document.createElement("p");
    phonetic.textContent = "Pronunciation: " +
        (entry.phonetic || "Not available");
    results.appendChild(phonetic);

   
const audio = (entry.phonetics || []).find(function(item) {
    return item.audio && item.audio.trim() !== "";
});

if (audio) {
    const audioButton = document.createElement("button");
    audioButton.textContent = "Play Pronunciation";

    audioButton.addEventListener("click", async function() {
        const audioUrl = audio.audio.startsWith("//")
            ? "https:" + audio.audio
            : audio.audio;

        try {
            const player = new Audio(audioUrl);
            await player.play();
            message.textContent = "";
        } catch (error) {
            message.textContent = "Pronunciation audio is temporarily unavailable. Please try again later.";
            message.className = "error";
            console.error("Audio URL:", audioUrl);
            console.error("Audio playback error:", error);
        }
    });

    results.appendChild(audioButton);
} else {
    const audioMessage = document.createElement("p");
    audioMessage.textContent = "Audio pronunciation is not available for this word.";
    results.appendChild(audioMessage);
}


    entry.meanings.forEach(function(meaning) {
        const partOfSpeech = document.createElement("h3");
        partOfSpeech.textContent = meaning.partOfSpeech;
        results.appendChild(partOfSpeech);

        meaning.definitions.forEach(function(item) {
            const definition = document.createElement("div");
            definition.className = "definition";

            const text = document.createElement("p");
            text.textContent = item.definition;
            definition.appendChild(text);

            if (item.example) {
                const example = document.createElement("p");
                example.textContent = "Example: " + item.example;
                definition.appendChild(example);
            }

            if (item.synonyms && item.synonyms.length > 0) {
                const synonyms = document.createElement("p");
                synonyms.textContent =
                    "Synonyms: " + item.synonyms.join(", ");
                definition.appendChild(synonyms);
            }

            results.appendChild(definition);
        });
    });

    if (entry.sourceUrls && entry.sourceUrls.length > 0) {
        const source = document.createElement("p");
        const link = document.createElement("a");

        link.href = entry.sourceUrls[0];
        link.textContent = "View source";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        source.appendChild(link);
        results.appendChild(source);
    }
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchWord(wordInput.value);
});

themeButton.addEventListener("click", function() {
    document.body.classList.toggle("dark");
});

showFavorites();

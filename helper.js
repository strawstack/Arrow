function helper({
    sectionElem
}) {

    const enc = new TextEncoder();
    const dec = new TextDecoder("utf-8");

    // Create a four character 'seed' of upper case hex digits
    function createSeed() {
        const hexStr = Math.floor(Math.random() * (Math.pow(2, 16))).toString(16).toUpperCase();
        return hexStr.padStart(4, "0");
    }

    function parseIntMaybe(maybeInt, defaultValue) {
        try {
            const num = parseInt(maybeInt);
            if (isNaN(num)) throw Error("Not a number");
            return num;
        } catch(e) {
            return defaultValue;
        }
    }

    function parseSeedMaybe(maybeSeed, defaultValue) {
        try {
            if (!maybeSeed) throw Error("Seed is null");
            return maybeSeed;
        } catch(e) {
            return defaultValue;
        }
    }

    async function sha256(message) {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(10).padStart(2, "0"))
            .join("");
        return hashHex;
    }

    async function createPattern(seed) {
        const pattern = (await sha256(seed))
            .split("")
            .map(x => parseInt(x) % 4)
            .slice(0, 60);
        return pattern;
    }

    function createArrows(pattern) {
        return pattern.map(x => makeArrow(x));
    }

    function makeArrow(dir) {
        const dir_lookup = [270, 0, 90, 180];
        const template = document.querySelector(`#arrow`);
        const clone = template.content.firstElementChild.cloneNode(true);
        clone.style.transform = `rotate(${dir_lookup[dir]}deg)`;
        return clone;
    }

    function symbolToDir(symbol) {
        return {
            0: "UP",
            1: "RIGHT",
            2: "DOWN",
            3: "LEFT",
            "w": "UP",
            "a": "LEFT",
            "s": "DOWN",
            "d": "RIGHT",
            "ArrowUp": "UP",
            "ArrowRight": "RIGHT",
            "ArrowDown": "DOWN",
            "ArrowLeft": "LEFT",
        }[symbol];
    }

    const gameState = {
        "WAITING": 0, // New page game ready to begin
        "ACTIVE": 1, // Game in session
        "RESET": 2, // Game is resetting
    };

    const popoverState = {
        "SHARE": 0,
        "SETTINGS": 1
    };

    function checkInput(state, playerInput) {
        const correctDir = symbolToDir(state.pattern[state.progress]);
        return correctDir === playerInput;
    }

    function copyState(state) {
        const { arrows } = state;
        state.arrows = null;
        const newState = JSON.parse(JSON.stringify(state));
        state.arrows = arrows;
        newState.arrows = arrows;
        return newState;
    }

    function q(selector) {
        return document.querySelector(selector);
    }

    function resetToWaiting(setState) {
        setState(s => {
            s.progress = 0;
            s.gameState = gameState.RESET;
        });
        setState(s => {
            s.gameState = gameState.WAITING;
        });
    }

    function clearUrl() {
        window.location.href = window.location.href.split("?")[0];
    }

    function render(oldState, state) {

        // State Transitions
        // Add class to toggle circles and arrows
        if (oldState.gameState === gameState.WAITING && state.gameState === gameState.ACTIVE) {
            sectionElem.classList.add("active");
        } else if (oldState.gameState === gameState.RESET && state.gameState === gameState.WAITING) {
            sectionElem.classList.remove("active");
            for (let arrow of state.arrows) {
                arrow.classList.remove("done");
            }
        }

        if (state.otheruser) {
            q(".challenge").classList.add("visible");
            q(".challenge .username>span").innerHTML = state.otheruser;
            q(".challenge .score>span").innerHTML = state.goal;
            q(".challenge .seed>span").innerHTML = state.seed;

            state.arrows.slice(0, state.goal).map(a => {
                a.classList.add("goal");
            });

        } else {
            q(".challenge").classList.remove("visible");
        }

        if (state.popoverState === popoverState.SHARE) {
            q(".button.url").innerHTML = `${state.url}?user=${state.username}&goal=${state.best}&seed=${state.seed}`;
            q(".share .score>span").innerHTML = state.best;
            q(".share .seed>span").innerHTML = state.seed;
            q(".overlay").classList.add("visible");
            q(".popover.share").classList.add("visible");
        } else {
            q(".popover.share").classList.remove("visible");
        }
        if (state.popoverState === popoverState.SETTINGS) {
            q(".overlay").classList.add("visible");
            q(".popover.settings").classList.add("visible");
        } else {
            q(".popover.settings").classList.remove("visible");
        }

        if (state.popoverState === null) {
            q(".overlay").classList.remove("visible");
        }

        // Show completed arrows as game progresses
        if (oldState.progress + 1 === state.progress) {
            state.arrows[oldState.progress].classList.add("done");
        }

        // Track best progress
        q(".count>span").innerHTML = state.progress;
        if (state.progress > state.best) {
            state.best = state.progress;
            q(".best>span").innerHTML = state.best;
        }

        // Reset
        if (state.gameState === gameState.RESET) {
            q(".best>span").innerHTML = state.best;
        }
    }

    return {
        createSeed,
        parseIntMaybe,
        parseSeedMaybe,
        createPattern,
        createArrows,
        symbolToDir,
        checkInput,
        gameState,
        popoverState,
        render,
        copyState,
        q,
        resetToWaiting,
        clearUrl,
    };
}
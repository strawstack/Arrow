(async () => {
    async function main() {
        
        const sectionElem = document.querySelector("section");

        const {
            createSeed,
            parseIntMaybe,
            parseSeedMaybe,
            createPattern,
            createArrows,
            symbolToDir,
            gameState,
            popoverState,
            checkInput,
            copyState,
            render,
            q,
            resetToWaiting,
        } = helper({
            sectionElem
        });

        

        // Debug localStorage
        // window.localStorage.setItem("arrow", JSON.stringify({
        //     progress: 5
        // }));

        // Apply default values and localStorage to state
        const local = JSON.parse(window.localStorage.getItem("arrow"));
        const state = {
            ...{
                share: null,
                goal: 0,
                seed: createSeed(),
                pattern: null,
                arrows: null,
                progress: 0,
                best: 0,
                gameState: gameState.WAITING,
                popoverState: null
            },
            ...local
        };

        function setState(callback) {
            const oldState = copyState(state);
            callback(state); // Modifies state
            render(oldState, state); // Sync state with view
        }

        // Extract query parameters
        const params = new URLSearchParams(window.location.search);
        const shareParam = params.get('share');
        const goalParam = params.get('goal');
        const seedParam = params.get('seed');

        // Assign query params
        state.share = shareParam;
        state.goal = parseIntMaybe(goalParam, 0);
        state.seed = parseSeedMaybe(seedParam, "0000");

        // Generate and assign 'pattern' to state
        state.pattern = await createPattern(state.seed);
        state.arrows = createArrows(state.pattern);

        for (let arrow of state.arrows) {
            sectionElem.appendChild( arrow );
        }

        window.addEventListener("keydown", e => {
            const key_lookup = {
                "d": true,
                "w": true,
                "a": true,
                "s": true,
                "ArrowUp": true,
                "ArrowRight": true,
                "ArrowDown": true,
                "ArrowLeft": true,
            };
            // Deliver input to game unless 
            // key not rechognized, or
            // popover menu is shown
            if (state.popoverState === null && e.key in key_lookup) {
                e.preventDefault();
                setState(s => {
                    s.gameState = gameState.ACTIVE;
                    if (checkInput(s, symbolToDir(e.key))) {
                        s.progress += 1;
                    } else {
                        resetToWaiting(setState);
                    }
                });
            }
        });

        q(".reset").addEventListener("click", e => {
            if (state.popoverState === null) {
                setState(s => {
                    s.best = 0;
                    s.progress = 0;
                });
                resetToWaiting(setState);
            };
        });
        q(".regen").addEventListener("click", e => {
            if (state.popoverState === null) {
                const value = confirm("Are you sure you would like to generate a new pattern?");
                if (value) {
                    const existing = window.location.href.split("?")[0];
                    window.location.href = `${existing}?seed=${createSeed()}`;
                }
            }
        });
        q(".share").addEventListener("click", e => {
            if (state.popoverState === null) {
                setState(s => {
                    s.popoverState = popoverState.SHARE;
                });
            }
        });
        q(".settings").addEventListener("click", e => {
            if (state.popoverState === null) {
                setState(s => {
                    s.popoverState = popoverState.SETTINGS;
                });
            }
        });

    }

    await main();
})();
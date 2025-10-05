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
            clearUrl,
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
                otheruser: "",
                url: window.location.href.split("?")[0],
                username: "",
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
        const otheruserParam = params.get('user');
        const goalParam = params.get('goal');
        const seedParam = params.get('seed');

        // Assign query params
        state.otheruser = otheruserParam || "";
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
            clearUrl();
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
                    s.username = q("#username").value;
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
        q("#username").addEventListener("keyup", e => {
            if (state.popoverState === popoverState.SHARE) {
                setState(s => {
                    s.username = e.target.value;
                });
            }
        });
        q(".button.url").addEventListener("click", e => {
            navigator.clipboard.writeText(
                e.target.innerHTML.replaceAll("&amp;", "&")
            );
            q(".copy.msg").classList.add("visible");
            setTimeout(() => {
                q(".copy.msg").classList.remove("visible");
            }, 1500);
        });
        q(".button.close").addEventListener("click", e => {
            setState(s => {
                s.popoverState = null;
            });
        });
        q(".button.remove").addEventListener("click", e => {
            clearUrl();
            setState(s => {
                s.otheruser = "";
            });
        });

        // Initial render
        setState(s => {});
    }

    await main();
})();
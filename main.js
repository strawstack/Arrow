(async () => {
    async function main() {
        
        const {
            createSeed,
            parseIntMaybe,
            createPattern,
            makeArrow
        } = helper();

        const sectionElem = document.querySelector("section");

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
                progress: 0,
            },
            ...local
        };

        // Extract query parameters
        const params = new URLSearchParams(window.location.search);
        const shareParam = params.get('share');
        const goalParam = params.get('goal');
        const seedParam = params.get('seed');

        // Assign query params
        state.share = shareParam;
        state.goal = parseIntMaybe(goalParam, 0);
        state.seed = seedParam;

        // Generate and assign 'pattern' to state
        state.pattern = await createPattern(state.seed);

        for (let arrow of state.pattern) {
            sectionElem.appendChild( arrow );
        }

    }

    await main();
})();
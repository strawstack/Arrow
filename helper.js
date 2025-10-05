function helper() {

    const enc = new TextEncoder();
    const dec = new TextDecoder("utf-8");

    // Create a four character 'seed' of upper case hex digits
    function createSeed() {
        const hexStr = Math.floor(Math.random() * (Math.pow(2, 16))).toString(16).toUpperCase();
        return hexStr.padStart(4, "0");
    }

    function parseIntMaybe(maybeInt, defaultValue) {
        try {
            return parseInt(maybeInt);
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
            .slice(0, 60)
            .map(x => makeArrow(x));
        return pattern;
    }

    function makeArrow(dir) {
        const dir_lookup = [270, 0, 90, 180];
        const template = document.querySelector(`#arrow`);
        const clone = template.content.cloneNode(true);
        clone.children[0].style.transform = `rotate(${dir_lookup[dir]}deg)`;
        return clone;
    }

    return {
        createSeed,
        parseIntMaybe,
        createPattern,
        makeArrow
    };
}
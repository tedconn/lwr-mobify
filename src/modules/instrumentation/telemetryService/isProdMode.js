export function isProdMode() {
    const supportedModes = {
            "PRODDEBUG": true,
            "PROD": true
    };
    const aura = window.aura;
    if (aura) {
        const mode = aura.getContext().mode;
        return !!supportedModes[mode];
    }
    return true;
}
export function selectRandom(arr) {
    return arr[Math.trunc(Math.random() * arr.length)];
}
export function percent(num) {
    return `${(num * 100).toFixed(3)}%`;
}
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function delayInterruptible() {
    let interrupt;
    let interrupted = false;
    const interruptPromise = new Promise((_, reject) => {
        interrupt = () => {
            interrupted = true;
            reject();
        };
    });
    const retval = async (ms) => {
        await Promise.race([interruptPromise, delay(ms)]);
    };
    retval.interrupt = interrupt;
    return retval;
}
//# sourceMappingURL=lib.js.map
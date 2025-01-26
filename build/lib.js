export function selectRandom(arr) {
    return arr[Math.trunc(Math.random() * arr.length)];
}
export function percent(num) {
    return `${(num * 100).toFixed(3)}%`;
}
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=lib.js.map
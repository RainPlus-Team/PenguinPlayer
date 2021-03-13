let running = 0;

let waiting = [];

function runTask(func: () => void, delay: number) {
    setTimeout(() => {
        try {
            func();
        } catch(ex) {
            console.error("Failed to run task", ex);
        }
        running--;
        updateTasks();
    }, delay);
}

function updateTasks() {
    while (running < 2 && waiting.length > 0) {
        running++;
        setTimeout(runTask, 0, ...waiting.shift());
    }
}

export function schedule(func: () => void, delay: number = 100) {
    waiting.push([func, delay]);
    updateTasks();
}
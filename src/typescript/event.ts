export function dispatchEvent(name: string, detail?: object) {
    let event: Event;
    if (typeof(Event) === "function") {
        event = detail == undefined ? new Event(name) : new CustomEvent(name, detail);
    } else {
        event = document.createEvent("Event");
        event.initEvent(name, true, true);
    }
    window.dispatchEvent(event);
}

export function callHandlers(handlers: Array<(e: any) => void>, ...args: any) {
    for (let callback of handlers) {
        try {
            callback.apply(null, args);
        } catch(e) { console.error(e); }
    }
}
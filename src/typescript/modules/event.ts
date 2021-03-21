let events = {};

export function addEventListener(name: string, handler: Function) {
    events[name] = events[name]?.concat([handler]) || [handler];
    console.log("handler added", events);
}

export function removeEventListener(name: string, handler: Function) {
    if (events[name] && events[name].indexOf(handler) != -1) {
        events[name].splice(events[name].indexOf(handler), 1);
    }
}

export function dispatchEvent(name: string, ...parameters: any) {
    console.log("event fired", name);
    for (let handler of (events[name] || [])) {
        try {
            handler.apply(null, parameters);
        } catch (e) {
            console.error(e);
        }
    }
}

export function dispatchWindowEvent(name: string, detail?: object) {
    let event: Event;
    if (typeof(Event) === "function") {
        event = detail == undefined ? new Event(name) : new CustomEvent(name, detail);
    } else {
        event = document.createEvent("Event");
        event.initEvent(name, true, true);
    }
    window.dispatchEvent(event);
}

export function callHandlers(handlers: Array<(e: any) => void>, ...args: any): boolean {
    let ret = false;
    for (let callback of handlers) {
        try {
            ret = ret || callback.apply(null, args);
        } catch(e) { console.error(e); }
    }
    return ret;
}
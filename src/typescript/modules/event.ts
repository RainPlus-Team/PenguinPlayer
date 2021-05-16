let events = {};

export function addEventListeners(el: HTMLElement, name: string, listener: EventListener, options?: boolean | EventListenerOptions) {
    let types = name.split(" ");
    for (let type of types) {
        el.addEventListener(type, listener, options);
    }
}

export function addEventListener(name: string, handler: Function) {
    events[name] = events[name]?.concat([handler]) || [handler];
}

export function removeEventListener(name: string, handler: Function) {
    if (events[name] && events[name].indexOf(handler) != -1) {
        events[name].splice(events[name].indexOf(handler), 1);
    }
}

export function dispatchEvent(name: string, ...parameters: any) {
    for (let handler of (events[name] || [])) {
        try {
            handler.apply(null, parameters);
        } catch (e) {
            console.error(e);
        }
    }
}

function createEvent(name: string, detail?: object) {
    let event: Event;
    if (typeof(Event) === "function") {
        event = detail == undefined ? new Event(name) : new CustomEvent(name, detail);
    } else {
        event = document.createEvent("Event");
        event.initEvent(name, true, true);
    }
    return event;
}

export function dispatchWindowEvent(name: string, detail?: object) {
    window.dispatchEvent(createEvent(name, detail));
}

export function fireEvent(target: EventTarget, name: string, ...args: any) {
    if ("dispatchEvent" in target) {
        target.dispatchEvent(createEvent(name, args));
    } else {
        (<any>target).fireEvent(createEvent(name, args));
    }
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
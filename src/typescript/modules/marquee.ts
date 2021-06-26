import { getElementWidth } from "./element-helper";

export default class Marquee {
    private element: HTMLElement;
    private child: HTMLElement;
    private time: number;
    private delay = -1;
    private _useAutoMarquee = true;
    private autoMarqueeTimeout: number;

    public get autoMarqueeDelay() {
        return this.delay;
    }
    public set autoMarqueeDelay(value: number) {
        if (value < 0 && this.autoMarqueeTimeout) {
            clearTimeout(this.autoMarqueeTimeout);
            this.autoMarqueeTimeout = null;
        } else if (this._useAutoMarquee)
            this.autoMarquee();
        this.delay = value;
    }

    public get marqueeTime() {
        return this.time;
    }
    public set marqueeTime(value: number) {
        this.child.style.transition = `left ${this.time}ms linear`;
        if (this.autoMarqueeTimeout) {
            clearTimeout(this.autoMarqueeTimeout);
            this.autoMarqueeTimeout = null;
        } else if (this._useAutoMarquee)
            this.autoMarquee();
        this.time = value;
    }

    public get useAutoMarquee() {
        return this._useAutoMarquee;
    }
    public set useAutoMarquee(value: boolean) {
        if (this.autoMarqueeTimeout) {
            clearTimeout(this.autoMarqueeTimeout);
            this.autoMarqueeTimeout = null;
        }
        if (value)
            this.autoMarquee();
        this._useAutoMarquee = value;
    }

    private autoMarquee() {
        if (this.autoMarqueeTimeout) {
            clearTimeout(this.autoMarqueeTimeout);
            this.autoMarqueeTimeout = null;
        }
        this.startMarquee();
        this.autoMarqueeTimeout = window.setTimeout(() => this.autoMarquee(), this.time + this.delay);
    }

    public startMarquee() {
        this.stopMarquee();
        setTimeout(() => {
            this.child.style.left = `-${getElementWidth(this.child) - getElementWidth(this.element)}px`;
        });
    }

    public stopMarquee() {
        this.child.style.transition = "";
        setTimeout(() => {
            this.child.style.left = "0";
            this.child.style.transition = `left ${this.time}ms linear`;
        });
    }

    public setText(text: string) {
        this.child.innerText = text;
    }

    constructor(element: HTMLElement, marqueeTime: number, autoMarquee = true) {
        let child = document.createElement("span");
        child.style.position = "relative";
        element.appendChild(child);
        this.element = element;
        this.child = child;
        this.marqueeTime = marqueeTime;
        this.useAutoMarquee = autoMarquee;
    }
}
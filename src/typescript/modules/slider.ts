import { container as el } from "../player";
import { deepEventHandler, getPropertySum } from "./helper";
import { callHandlers } from "./event";

export default class Slider {
    private readonly activeEl: HTMLElement
    private readonly barEl: HTMLElement
    private readonly innerEl: HTMLElement
    
    private value: number
    private dragging = false

    private beginDragHandlers: Array<(e: MouseEvent | TouchEvent) => void> = []
    private endDragHandlers: Array<(e: MouseEvent | TouchEvent) => void> = []
    private valueChangeHandlers: Array<(e: number) => void> = []

    public minValue: number = null
    public maxValue: number = null

    constructor(options: SliderOptions) {
        this.activeEl = el.querySelector(options.activeSelector);
        this.barEl = el.querySelector(options.barSelector);
        this.innerEl = el.querySelector(options.innerSelector);
        this.value = options.value || 1;

        deepEventHandler(this.activeEl, "mousedown", (e: MouseEvent | TouchEvent) => { this.handleBeginDrag(e) }, false);
        deepEventHandler(this.activeEl, "touchstart", (e: MouseEvent | TouchEvent) => { this.handleBeginDrag(e) }, false);
        window.addEventListener("mousemove", (e: MouseEvent | TouchEvent) => { this.update(e) });
        window.addEventListener("touchmove", (e: MouseEvent | TouchEvent) => { this.update(e) });
        window.addEventListener("mouseup", (e: MouseEvent | TouchEvent) => { this.handleEndDrag(e) });
        window.addEventListener("touchend", (e: MouseEvent | TouchEvent) => { this.handleEndDrag(e) });
    }

    private handleBeginDrag(e: MouseEvent | TouchEvent) {
        if (e instanceof MouseEvent)
            e.preventDefault();
        if (this.dragging) return;
        this.dragging = true;
        this.barEl.classList.add("penguin-player--slider-dragging");
        callHandlers(this.beginDragHandlers, e);
        this.update(e);
    }

    private handleEndDrag(e: MouseEvent | TouchEvent) {
        if (!this.dragging || ("TouchEvent" in window && e instanceof TouchEvent && e.touches.length > 0)) return;
        this.dragging = false;
        this.barEl.classList.remove("penguin-player--slider-dragging");
        callHandlers(this.endDragHandlers, e);
    }

    private update(e: MouseEvent | TouchEvent) {
        if (!this.dragging) return;
        let cx: number;
        if (e instanceof MouseEvent)
            cx = e.pageX;
        else
            cx = e.touches[0].pageX;
        let width = this.barEl.clientWidth;
        let left = Math.min(Math.max(0, cx - getPropertySum(this.barEl, "offsetLeft")), width);
        let progress = left / width;
        progress = Math.max(Math.min(progress, this.maxValue || 1), this.minValue || 0);
        if (progress != this.value)
            this.setValue(progress);
    }

    addEventHandler(name: "begindrag" | "enddrag" | "valuechange", callback: (e: any) => void) {
        switch (name) {
            case "begindrag": this.beginDragHandlers.push(callback); break;
            case "enddrag": this.endDragHandlers.push(callback); break;
            case "valuechange": this.valueChangeHandlers.push(callback); break;
        }
    }

    setValue(e: number) {
        let ret = callHandlers(this.valueChangeHandlers, e);
        if (!ret) {
            this.innerEl.style.width = `${e * 100}%`;
            this.value = e;
        }
    }
}
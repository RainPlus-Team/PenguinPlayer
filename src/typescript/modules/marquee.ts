import { getElementWidth } from "./element-helper";

export default class Marquee {
    private element: HTMLElement;
    public speed: number;
    public delay: number;

    public get marqueeElement() {
        return this.element;
    }

    private marqueeAnim: number;

    private updateMarquee() {

    }

    startMarquee() {
        
    }

    stopMarquee() {

    }

    reset() {

    }
    
    constructor(element: HTMLElement, speed: number, delay: number = 0) {
        this.element = element;
        this.speed = speed;
        this.delay = delay;
    }
}
// Polyfills for Internet Explorer
import "core-js/features/promise";
import "core-js/features/number/is-integer";
import "core-js/features/object/values";
import "core-js/features/array/includes";

if (!Element.prototype.matches)
    Element.prototype.matches =
        (<any>Element.prototype).msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function (s: string) {
        let el = this;

        do {
            if (Element.prototype.matches.call(el, s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };

if (typeof NodeList !== "undefined" && NodeList.prototype && !NodeList.prototype.forEach)
    (<any>NodeList).prototype.forEach = Array.prototype.forEach;

// Required by Smooth Scrollbar
import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/weak-map';
import 'core-js/es/array/from';
import 'core-js/es/object/assign';

// Required by Lazy Load
import 'intersection-observer';
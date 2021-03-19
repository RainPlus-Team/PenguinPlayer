// Polyfills for Internet Explorer
import "core-js/features/promise";
import "core-js/features/number/is-integer";

if (!Element.prototype.matches) {
    Element.prototype.matches =
        (<any>Element.prototype).msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function (s: string) {
        var el = this;

        do {
            if (Element.prototype.matches.call(el, s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

// Required by Smooth Scrollbar
import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/weak-map';
import 'core-js/es/array/from';
import 'core-js/es/object/assign';
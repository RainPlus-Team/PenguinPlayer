function makeRequest(ajax: any) {
    ajax._xmlHttp.addEventListener("load", () => {
        let data = ajax._xmlHttp.responseText || null;
        try {
            data = JSON.parse(data);
        } catch {}
        ajax._resolve({
            code: ajax._xmlHttp.status,
            data
        });
    });
    ajax._xmlHttp.addEventListener("error", ajax._reject);
    ajax._xmlHttp.open(ajax._method, ajax._url);
    ajax._xmlHttp.send();
}

function ajax(url?: string): AjaxPromise {
    let _resolve: any, _reject: any;
    let promise: any = new Promise<AjaxResponse>(function(resolve, reject) { _resolve = resolve; _reject = reject });
    promise._resolve = _resolve; promise._reject = _reject;
    promise._url = url;
    promise._method = "GET";
    promise._xmlHttp = "XMLHttpRequest" in window ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    promise._then = promise.then;
    promise._catch = promise.catch;
    promise._finally = promise.finally;
    promise.then = function(...args: any) { this._then.apply(this, args); return this; }
    promise.catch = function(...args: any) { this._catch.apply(this, args); return this; }
    promise.finally = function(...args: any) { this._finally.apply(this, args); return this; }
    promise.method = function(method: "GET" | "POST") { this._method = method; return this; }
    promise.url = function(url: string) { this._url = url; return this; }
    promise.send = function() { makeRequest(this); return this; }
    promise.cancel = function() {
        try { this._xmlHttp.abort(); } catch {}
        return this;
    }
    return promise;
}

export default ajax;
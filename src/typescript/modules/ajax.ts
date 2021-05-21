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

export default function ajax(url?: string, method: "GET" | "POST" = "GET"): AjaxPromise {
    let _resolve: any, _reject: any;
    let promise: any = new Promise<AjaxResponse>(function(resolve, reject) { [_resolve, _reject] = [resolve, reject] });
    [promise._resolve, promise._reject] =[_resolve, _reject];
    promise._url = url;
    promise._method = method;
    promise._xmlHttp = "XMLHttpRequest" in window ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    promise.method = function(method: "GET" | "POST") { this._method = method; return this; }
    promise.url = function(url: string) { this._url = url; return this; }
    promise.send = function() { makeRequest(this); return this; }
    promise.cancel = function() {
        try { this._xmlHttp.abort(); } catch {}
        return this;
    }
    return promise;
}
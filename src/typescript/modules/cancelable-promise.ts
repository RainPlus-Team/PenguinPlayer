class CancelablePromise<T> extends Promise<T> {
    private cancelCallback: () => void;
    constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void, cancel: () => void) {
        super(executor);
        this.cancelCallback = cancel;
    }

    cancel() {
        this.cancelCallback();
    }
}
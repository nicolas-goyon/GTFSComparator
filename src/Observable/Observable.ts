class Observable<T> {
    private observers: Map<string, (value: T) => void> = new Map();

    subscribe(name: string, callback: (value: T) => void) {
        this.observers.set(name, callback);
    }

    unsubscribe(name: string) {
        this.observers.delete(name);
    }

    notify(name: string | null = null, value: T){
        if (name) {
            const callback = this.observers.get(name);
            if (callback) {
                callback(value);
            }
        } else {
            this.observers.forEach(callback => callback(value));
        }
    }
}

export default Observable
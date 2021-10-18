
/**
 * Based off https://javascript.info/fetch-progress
 */
export class Fetch {
    constructor(uri) {
        this.uri = uri;
        this.received = 0;
    }

    async begin() {
        let response = await fetch(this.uri);

        this.reader = response.body.getReader();
        
        // Step 2: get total length
        this.length = +response.headers.get('Content-Length');

        this.chunks = [];
        this.received = 0;
        this.result = undefined;

        return this;
    }

    async update() {
        if (!this.isDone() && this.reader) {
            const {done, value} = await this.reader.read();

            if (done) {    
                let chunksAll = new Uint8Array(this.received); 
                let position = 0;
         
                for(let chunk of this.chunks) {
                    chunksAll.set(chunk, position); // (4.2)
                    position += chunk.length;
                }

                this.result = new TextDecoder("utf-8").decode(chunksAll);
            } else {
                this.chunks.push(value);
                this.received += value.length;         
            }
        }

        return this;
    }

    progress() {
        return this.received / this.length;
    }

    isDone() {
        return this.result !== undefined;
    }
}

export function startFetch(uri, progressCallback, onComplete, onError) {

    const fetchRequest = new Fetch(uri);

    try {
        fetchRequest.begin();

        let handle = -1;

        const updateFetch = function() {
            try {
                fetchRequest.update();

                if (fetchRequest.isDone())   {
                    onComplete(fetchRequest.result);
                    clearInterval(handle);
                } else {
                    if (progressCallback) {
                        progressCallback(fetchRequest.progress());
                    }
                }
            } catch (error) {
                if (onError) {
                    onError(error);
                    clearInterval(handle);
                }
            }
        }

         handle = setInterval(updateFetch);

    } catch (error) {
        if (onError) {
            onError(error);
        }
    }
}


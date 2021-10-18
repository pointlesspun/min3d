
/**
 * Iterative Fetch implementation allowing for progress tracking. The fetched resource is assumed to 
 * be a text file. Call begin() then followed by updates() until isDone() returns true. Read 
 * the object's result to get the text data.
 * 
 * Based off https://javascript.info/fetch-progress
 */
export class Fetch {

    constructor(uri) {
        this.uri = uri;
        this.received = 0;
    }

    /**
     * Starts the fetch process 
     * @returns this
     */
    async begin() {
        let response = await fetch(this.uri);

        this.reader = response.body.getReader();
        
        this.length = +response.headers.get('Content-Length');

        this.chunks = [];
        this.received = 0;
        this.result = undefined;

        return this;
    }

    /**
     * Updates the fetch process if fetching the resource is not done yet
     * @returns this
     */
    async update() {
        if (!this.isDone() && this.reader) {
            const {done, value} = await this.reader.read();

            if (done) {    
                let chunksAll = new Uint8Array(this.received); 
                let position = 0;
         
                for(let chunk of this.chunks) {
                    chunksAll.set(chunk, position); 
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

/**
 * Wrapper around a Fetch request, retrieves the text resource at the given uri and calls the
 * provided callbacks as needed
 * 
 * @param {string} uri 
 * @param {function(number)} progressCallback 
 * @param {function(string)} onComplete 
 * @param {function(error)} onError 
 */
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


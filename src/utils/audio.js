export class Speaker {
    constructor() {
        this.frames = [];
        this.speakerOn = false;
    }

    // decode base64 string to float32Array that can be consumed by the audio context
    decodeAudioData(base64String) {
        // base64 decoding to binary string
        const binaryString = atob(base64String);

        // binary string to bytes
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // bytes to float32 with normalization
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        // final output is float32Array with values between -1 and 1
        return float32Array;
    }

    pushAudioData(base64String) {
        this.frames.push(this.decodeAudioData(base64String));
    }

    async run() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.speakerOn = true;
        let nextBufferStartTime = 0;
        while (this.speakerOn) {
            // frame is not empty, draw audio data from it
            if (this.frames.length > 1) {
                // pop first chunk
                const audioData = this.frames.shift();

                // create source buffer for audio data consumption, copy audioData to the buffer
                const source = this.audioContext.createBufferSource();
                source.buffer = this.audioContext.createBuffer(1, audioData.length, 16000);
                source.buffer.copyToChannel(audioData, 0, 0);
                source.connect(this.audioContext.destination);

                // if the last updated next buffer start time is in the past
                // update it to the current time
                if (nextBufferStartTime < this.audioContext.currentTime) {
                    nextBufferStartTime = this.audioContext.currentTime;
                }

                // set the next projected buffer start time
                nextBufferStartTime += source.buffer.duration;

                // schedule the chunk to be played at the next buffer start time
                // notice this function is not blocking. ie it will return immediately
                // even tho the audio is still playing. And multiple sources can be played
                // in parallel. Therefore, we need to set the next buffer start time to make
                // sure they are played in order.
                source.start(nextBufferStartTime);
            } else {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    stop() {
        this.speakerOn = false;
        this.frames = [];
        // Close the AudioContext to release audio processing resources
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().then(() => {
            console.log('Output AudioContext closed and resources released');
            });
        } 
    }
}

export class Microphone {
    // each time audioContext collect 128 samples to generate
    // one chunk of audio data regardless of the sample rate.
    // For 16k sample rate, 128 samples is ~8ms of audio data.
    // we will group 5 chunks together to form a 40ms audio data
    // to match what the server expects.
    GROUP_SIZE = 5;

    constructor() {
        this.audioStream = null;
        this.streaming = false;
    }

    async run(handleData) {
        this.audioCtx = new AudioContext({ sampleRate: 16000 });
        await this.audioCtx.audioWorklet.addModule('input-processor.js');
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            channelCount: 1,
        });
        this.sourceNode = this.audioCtx.createMediaStreamSource(this.stream);
        this.processorNode = new AudioWorkletNode(this.audioCtx, 'recording-processor');

        this.frames = [];
        this.groupChunks(handleData);
        // Set up message handling from the AudioWorklet
        this.processorNode.port.onmessage = (event) => {
            this.frames.push(event.data);
        };

        this.sourceNode.connect(this.processorNode).connect(this.audioCtx.destination);
    }

    async groupChunks(handleData) {
        this.streaming = true;
        while (this.streaming) {
            if (this.frames.length >= this.GROUP_SIZE) {
                const chunkFrames = this.frames.splice(0, this.GROUP_SIZE);
                const chunkSize = chunkFrames[0].length
                let pcmData = new Int16Array(chunkSize * this.GROUP_SIZE);
                for (let i = 0; i < chunkFrames.length; i++) {
                    const frame = chunkFrames[i];
                    if (pcmData === null) {
                        pcmData.set(frame);
                    } else {
                        pcmData.set(frame, i * chunkSize);
                    }
                }
                // Here, you could send the Base64-encoded data via WebSocket or handle it as needed
                handleData(this.int16ToBase64(pcmData));
            } else {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    int16ToBase64(int16Array) {
        // Create a DataView directly from the Int16Array
        const view = new DataView(int16Array.buffer);
        
        // Then, encode the DataView to Base64
        let binary = '';
        for (let i = 0; i < int16Array.length * 2; i++) {
            binary += String.fromCharCode(view.getUint8(i));
        }

        return window.btoa(binary) 
    }

    stop() {
        // Stop all tracks on the stream to release the media device
        this.streaming = false;

        const stream = this.stream
        const sourceNode = this.sourceNode
        const processorNode = this.processorNode
        const audioContext = this.audioCtx
        if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Disconnect the sourceNode and processorNode from the AudioContext
        if (sourceNode) {
            sourceNode.disconnect();
        }
        if (processorNode) {
            processorNode.disconnect();
        }

        // Close the AudioContext to release audio processing resources
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().then(() => {
                console.log('Input AudioContext closed and resources released');
            });
        }
    }
}


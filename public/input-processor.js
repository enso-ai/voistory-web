class RecordingProcessor extends AudioWorkletProcessor {
    process(inputs) {
        const input = inputs[0];
        if (input) {
            const inputChannelData = input[0];
            // Allocate an Int16Array to hold the 16-bit PCM data
            const pcmData = new Int16Array(inputChannelData.length);
            // Convert float32 to int16
            for (let i = 0; i < inputChannelData.length; ++i) {
                // Scale float32 array (-1.0 to 1.0) to int16 range (-32768 to 32767)
                pcmData[i] = Math.max(-32768, Math.min(32767, inputChannelData[i] * 32768));
            }
            // Send the 16-bit PCM data to the main thread
            this.port.postMessage(pcmData);
        }
        return true;
    }
}

registerProcessor('recording-processor', RecordingProcessor);

import { useEffect, useRef } from 'react';
import styled from 'styled-components'

const CanvasContainer = styled.div`
    position: relative;
    height: ${props => props.height};
    width: ${props => props.width};

    border-radius: 50%;
    // box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    
    margin: 50px;

    opacity: 0;
    animation: fadeIn 1s ease-in-out forwards;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`

const CanvasMask = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, #6d6875ff, transparent, #6d6875ff);

`

const clearCanvas = (canvas) => {
    const canvasContext = canvas.getContext('2d');
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}

const visualizeAudio = (analyser, canvas, color, bgColor) => {
    const canvasContext = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        // background color, can't comment this as it's for refreshing
        if (bgColor) {
            canvasContext.fillStyle = bgColor;
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        }

        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = color;
        canvasContext.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        const windowWidth = 50;

        for(let i = 0; i < bufferLength; i++) {
            // use window average
            let window = dataArray.slice(i, i + windowWidth)
            let ave = window.reduce((a, b) => a + b, 0) / window.length;
            // each value is a byte in the range [-128, 127], so we need to normalize to [-1, 1)
            const v = ave / 128.0;
            // rescale to canvas height, since the line starts at the middle,
            // we use half the canvas height
            const y = v * canvas.height / 2;

            if(i === 0) {
                canvasContext.moveTo(x, y);
            } else {
                canvasContext.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasContext.lineTo(canvas.width, canvas.height/2);
        canvasContext.stroke();
    }

    draw();
}


const AudioVisualizer = ({ source, color, enable, height, width }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current && source) {
            if (enable) {
                visualizeAudio(source.analyser, canvasRef.current, color)
            } else {
                clearCanvas(canvasRef.current)
            }
        }
    }, [enable])

    if (color === undefined) {
        color = 'black'
    }

    if (height === undefined) {
        height = "150"
    }

    if (width === undefined) {
        width = "400"
    }

    if (enable) {
        return (
            <CanvasContainer width={width} height={height}>
                <canvas ref={canvasRef} id="audioVisualizer" width={width} height={height}></canvas>
                <CanvasMask/>
            </CanvasContainer>
        )
    } else {
        return (<div/>)
    }

}

export default AudioVisualizer
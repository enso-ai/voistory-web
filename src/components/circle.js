import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define the animation
const scaleAnimation = keyframes`
    from {
        transform: scale(1);
    }
    to {
        transform: scale(var(--scale-factor));
    }
`;

// transform: scale(var(--scale-factor));
// Styled component for the circle
const AnimatedCircle = styled.div`
    width: var(--initial-size);
    height: var(--initial-size);
    animation: ${scaleAnimation} 0.8s ease-out infinite;
    transform-origin: center;

    border: 5px solid gray;
    border-radius: 50%;
    background-color: transparent;
    box-sizing: border-box;
`;

// Component that uses the AnimatedCircle
const CircleComponent = ({ initialSize, targetScale }) => {
    // Calculate the target scale based on the percentage
    // Assuming the targetSize prop is a value between 0 and 1 (e.g., 0.5 for 50%)

    return <AnimatedCircle style={{
        '--initial-size': `${initialSize}px`,
        '--scale-factor': `${targetScale}`,
    }} />;
};

export default CircleComponent;

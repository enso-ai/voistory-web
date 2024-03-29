import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define the animation
const scaleAnimation = keyframes`
    from {
        opacity: 1;
        transform: scale(1);
        transform-origin: center;
    }
    to {
        opacity: 0;
        transform: scale(2.1);
        transform-origin: center;
    }
`;

// transform: scale(var(--scale-factor));
// Styled component for the circle
const AnimatedCircle = styled.div`
    width: ${props => props.$initialSize}px;
    height: ${props => props.$initialSize}px;

    transform-origin: center;
    animation: ${scaleAnimation} 1s ease-out infinite;

    border: 5px solid gray;
    border-radius: 50%;
    background-color: transparent;
`;

// Component that uses the AnimatedCircle
const CircleLoader = ({ initialSize }) => {
    // Calculate the target scale based on the percentage
    // Assuming the targetSize prop is a value between 0 and 1 (e.g., 0.5 for 50%)

    return <AnimatedCircle
        $initialSize={initialSize}
    />;

};

export default CircleLoader;

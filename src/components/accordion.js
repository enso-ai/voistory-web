import {useEffect, useState} from 'react';
import styled, { keyframes } from 'styled-components';
import {
    IoIosArrowUp, IoIosArrowDown
} from "react-icons/io";

// Keyframe animation for sliding
const slidingOut = keyframes`
    from {
        max-height: 0px;
    }
    to {
        overflow: visible;
        max-height: 300px;
    }
`;

// Keyframe animation for sliding
const slidingIn = keyframes`
    from {
        max-height: 300px;
        overflow: visible;
    }
    to {
        max-height: 0px;
    }
`;

const AdvancedConfigContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: start;
`

const AdvancedConfigSwitch = styled.div`
    position: relative; 
    display: flex;
    flex-direction: row;
    cursor: pointer;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
`

const AdvancedConfigItemContainer = styled.div`
    position: relative;
    max-height: 0px;
    overflow: hidden;
    animation: ${({ isInit, isOpen }) => (
        isInit? 'none': isOpen? slidingOut: slidingIn
    )} 0.5s forwards;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px 20px;
    align-items: center;
    justify-items: start;
    justify-content: start;
`

const AdvancedConfig = ({ children }) => {
    const [isInit, setIsInit] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isInit && isOpen) {
            console.log("isInit changed to false", isInit)
            setIsInit(false);
        }
    }, [isOpen])

    return (
        <AdvancedConfigContainer>
            <AdvancedConfigSwitch onClick={() => {setIsOpen(!isOpen)}}>
                <p style={{"padding": "0px", "margin": "0px"}}>
                    Advanced Options:
                </p>
                {
                    isOpen ?
                        <IoIosArrowUp size="20px" />
                    : 
                        <IoIosArrowDown size="20px" />
                }
            </AdvancedConfigSwitch>
            <AdvancedConfigItemContainer isInit={isInit} isOpen={isOpen}>
                {children}
            </AdvancedConfigItemContainer>
        </AdvancedConfigContainer>
    )
}

export default AdvancedConfig;
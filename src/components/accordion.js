import {useState} from 'react';
import styled, { keyframes } from 'styled-components';
import {
    IoIosArrowUp, IoIosArrowDown
} from "react-icons/io";

// Keyframe animation for sliding
const sliding = keyframes`
    from {
        max-height: 1000px;
    }
    to {
        overflow: hidden;
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
    animation: ${sliding} 0.2s ${({isOpen}) => (isOpen? 'forwards': 'backwards')};
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px 20px;
    align-items: center;
    justify-items: start;
    justify-content: start;
`

const AdvancedConfig = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

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
            <AdvancedConfigItemContainer isOpen={isOpen}>
                {children}
            </AdvancedConfigItemContainer>
        </AdvancedConfigContainer>
    )
}

export default AdvancedConfig;
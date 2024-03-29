import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownButton = styled.button`
    color: #495057;
    padding: 10px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    width: 100px;
    padding: 12px 16px;
`;

const DropdownContent = styled.div`
    display: ${props => (props.$isOpen ? 'block' : 'none')};
    position: absolute;
    background-color: #f9f9f9;
    width: 100%;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
`;

const DropdownItem = styled.div`
    font-size: 12px;
    font-weight: 600;
    padding: 12px 16px;
    cursor: pointer;

    &:hover {
        background-color: #ddd;
    }
`;

const Dropdown = ({ options, defaultOptionIdx, optionPlaceholder, onChange }) => {
    if (!(defaultOptionIdx && defaultOptionIdx < options.length))
        defaultOptionIdx = 0;

    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(options[defaultOptionIdx]);
    const dropdownContainerRef = useRef(null);

    useEffect(() => {
        if (selectedOption)
            onChange(selectedOption)
    }, [selectedOption])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDropdownToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionSelect = option => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    return (
        <DropdownContainer ref={dropdownContainerRef}>
            <DropdownButton onClick={handleDropdownToggle}>
                {selectedOption || optionPlaceholder || 'Select an option'} &#9660;
            </DropdownButton>
            <DropdownContent $isOpen={isOpen}>
                {options.map(option => (
                    <DropdownItem key={option} onClick={() => handleOptionSelect(option)}>
                        {option}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </DropdownContainer>
    );
};

export default Dropdown;
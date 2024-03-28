import React, { useState } from 'react';
import Dropdown from './dropdown';
import { CLUSTER_LIST } from 'services/chatService';
import styled from 'styled-components';

const ArrorwRight = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        style={{ "verticalAlign": "middle" }}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"
            fill="#ffffff"
        />
    </svg>
);

const ModalContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const ModalCard = styled.div`
    position: relative;
    width: 320px;
    background-color: white;
    border-radius: 16px;
    padding: 0px 24px;
    padding-bottom: 80px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const TitleContainer = styled.div`
    flex: 0;
    color: #495057;
    margin-bottom: 32px;
    font-size: 28px;
    font-weight: 800;
    margin: 32px 0px;
`

const ConfigContainer = styled.div`
    position: relative;
    max-width: 100%;
`

const PhoneInput = styled.input`
    position: relative;
    vertical-align: bottom;
    border: 2px solid #495057;
    border-radius: 24px;
    padding: 4px 18px;
    align-self: center;
    width: 100%;
    height: 40px;
    font-size: 21px;
    box-sizing: border-box;
`;

const ConfirmButton = styled.button`
    height: 80%;
    aspect-ratio: 1;
    border: 1px solid #495057;
    background-color: #495057;
    border-radius: 50%;

    position: absolute;
    top: 10%;
    right: 0px;
    transform: translateX(-10%);

    &:hover {
        transform: translateX(-10%) scale(1.15);
    }
`;

const DropdownContainer = styled.div`
    position: absolute;
    bottom: 24px;
    right: 24px;
`

const Modal = ({ onConfirm }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCluster, setSelectedCluster] = useState('');


    const handlePhoneNumberChange = (event) => {
        setPhoneNumber(event.target.value);
    };


    const handleClusterChange = (cluster) => {
        setSelectedCluster(cluster);
    };


    const validatePhoneNumber = () => {
        // Implement your phone number validation logic here
        // Return true if the phone number is valid, false otherwise
        console.log("validate phone number is called:", phoneNumber)
    };


    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            validatePhoneNumber(phoneNumber);
        }
    };

    return (
        <ModalContainer>
            <ModalCard>
                <TitleContainer> Welcome to Voistory! </TitleContainer>
                <ConfigContainer>
                    <PhoneInput
                        type="text"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        onKeyUp={handleKeyPress}
                        placeholder="Enter your phone number"
                    />
                    <ConfirmButton onClick={validatePhoneNumber}>
                        <ArrorwRight />
                    </ConfirmButton>
                </ConfigContainer>
                <DropdownContainer>
                    <Dropdown
                        options={CLUSTER_LIST}
                        optionPlaceholder={'Select a cluster'}
                        onChange={handleClusterChange}
                    />
                </DropdownContainer>
            </ModalCard>
        </ModalContainer>
    );
};


export default Modal;
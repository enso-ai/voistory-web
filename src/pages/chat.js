import { useState } from 'react'
import styled from 'styled-components'
import CircleLoader from 'components/circleLoader'

import { getChatSession } from 'services/chatService'
import WebSocketClient from 'services/websocket'
import { Speaker, Microphone} from 'utils/audio'
import Modal from 'components/modal'
import AudioVisualizer from 'components/audioVisualizer'
import {
    TbMicrophone, TbMicrophoneOff
} from "react-icons/tb";


const Base = styled.div`
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #6d6875;
`

const IndicatorContainer = styled.div`
    position: absolute;
    top: 0;
`;

const ConIndicator = styled.img`
    height: 100px;
    margin-top: 36px;

    user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;

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
`;

const ConIndicatorEmpty = styled.div`
    height: 100px;
    margin-top: 36px;
`


const MicButtonContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
`

const LoaderContainer = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    visibility: ${(props) => props.$visiable};
`

const MicButton = styled.div`
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    width: 140px;
    height: 140px;
    padding: 15px;
    border-radius: 50%;
    background-color: white;

    &:hover {
        cursor: pointer;
        transform: scale(1.05);
        box-shadow: 0 0 0.2rem 0.4rem rgba(200, 200, 200, 0.9);
    }

    &:active {
        scale: 0.9;
    }
`
const FooterContainer = styled.div`
    position: absolute;
    bottom: 0;

    height: 36px;
    width: 100%;
    box-sizing: border-box;
    background-color: rgba(128, 128, 128, 0.5);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px 12px;
`;

const FooterBlock = styled.div`
    display: flex;
    flex-direction: row;
    color: white;
`;

const SystemInfo = styled.div`
    color: white;
    padding: 0px 5px;
    border-right: 1px solid white;
`;

const ChatPage = () => {
    const [isModalVisible, setModalVisible] = useState(true)
    const [isLoading, setLoading] = useState(false)
    const [connected, setConnected] = useState(false)
    const [ws, setWs] = useState(false)
    const [mic, setMic] = useState(null)
    const [speaker, setSpeaker] = useState(null)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [targetCluster, setTargetCluster] = useState("None")
    const [filterCode, setFilterCode] = useState("")

    const initChatPage = (phoneNumber, targetCluster, filterCode) => {
        console.log("initChatPage", phoneNumber, targetCluster, filterCode)
        setPhoneNumber(phoneNumber)
        setTargetCluster(targetCluster)
        setFilterCode(filterCode)
        setModalVisible(false)
    }

    const handleClick = () => {
        setLoading(true)

        if (connected) {
            ws.close()
            speaker.stop()
            mic.stop()
            setConnected(false)
            setLoading(false)
        } else {
            getChatSession(targetCluster, phoneNumber, filterCode).then(async (resp) => {
                let {chat_session_id, websocket_url} = resp
                console.log(chat_session_id, websocket_url)
                const newSpeaker = new Speaker()
                setSpeaker(newSpeaker)
                newSpeaker.run()
                const newMic = new Microphone()
                setMic(newMic)

                const newWs = new WebSocketClient(websocket_url)
                // set up the receiver pipeline
                newWs.connect({
                    streamSid: 'web' + chat_session_id,
                    recvHandler: (data) => {
                        if (data['event'] === 'media') {
                            newSpeaker.pushAudioData(data['media']['payload'])
                        } else {
                            console.log("receiver handler received unknown data", data['event'])
                        }
                    },
                    onOpen: () => {
                        newMic.run(
                            (base64AudioData) => {
                                const wsPayload = {
                                    'event': 'media',
                                    'streamSid': 'web' + chat_session_id,
                                    'media': {
                                        'payload': base64AudioData,
                                    },
                                }
                                newWs.send(wsPayload);
                            },
                            (error) => {
                                console.log("error", error)
                            },
                        )
                        setWs(newWs)
                    },
                    onClose: () => {
                        newSpeaker.stop()
                        newMic.stop()

                        setConnected(false)
                    }
                })

                // waiting for the first message
                setLoading(false)
                setConnected(true)
            })
        }
    }

    return (
        <Base>
            <Modal onConfirm={initChatPage} showModal={isModalVisible} />
            <IndicatorContainer >
                {connected ?
                    <ConIndicator src="/off-air.svg" alt="Off Air" draggable='false' />
                    : <ConIndicatorEmpty />
                }
            </IndicatorContainer>
            <AudioVisualizer source={speaker} enable={connected} bgColor={"#6d6875"}/>
            <MicButtonContainer>
                <LoaderContainer $visiable = { isLoading ? 'visible' : 'hidden' }>
                    <CircleLoader initialSize={130} targetScale={1.1}/>
                </LoaderContainer>
                <MicButton onClick={handleClick} disabled={isLoading}>
                    { connected ? <TbMicrophoneOff size="100%"/> : <TbMicrophone size="100%"/>}
                </MicButton>
            </MicButtonContainer>
            <AudioVisualizer source={mic} enable={connected} bgColor={"#6d6875"}/>
            <FooterContainer>
                <FooterBlock>
                    <SystemInfo>Status: {connected ? "connected" : "disconnected"}</SystemInfo>
                    <SystemInfo>#Cell: {phoneNumber}</SystemInfo>
                    <SystemInfo>Backend: { targetCluster }</SystemInfo>
                    <SystemInfo>Filter: { filterCode }</SystemInfo>
                </FooterBlock>
                <FooterBlock>Powered by Voistory</FooterBlock>
            </FooterContainer>
        </Base>
    )
}

export default ChatPage

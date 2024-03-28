import { useState } from 'react'
import styled from 'styled-components'
import CircleLoader from './circleLoader'

import { getChatSession } from 'services/chatService'
import WebSocketClient from 'services/websocket'
import { Speaker, Microphone} from 'utils/audio'
import Modal from './modal'
import MicrophoneIcon from 'icons/microphone'

const Base = styled.div`
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #6d6875;
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

const ConIndicator = styled.img`
    height: 100px;
    margin-top: 36px;

    user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;
`;

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

    const initChatPage = (phoneNumber, targetCluster) => {
        console.log("initChatPage", phoneNumber, targetCluster)
        setPhoneNumber(phoneNumber)
        setTargetCluster(targetCluster)
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
            getChatSession(targetCluster, phoneNumber).then(async (resp) => {
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

                // set up the sender pipeline


                // waiting for the first message
                setLoading(false)
                setConnected(true)
            })
        }
    }

    return (
        <Base>
            <Modal onConfirm={initChatPage} showModal={isModalVisible} />
            <MicButtonContainer>
                <LoaderContainer $visiable = { isLoading ? 'visible' : 'hidden' }>
                    <CircleLoader initialSize={130} targetScale={1.1}/>
                </LoaderContainer>
                {/* <MicButton onClick={handleClick} disabled={isLoading}> */}
                <MicButton onClick={() => {setConnected(!connected)}} disabled={isLoading}>
                    <MicrophoneIcon />
                </MicButton>
                {connected ? (
                    <ConIndicator src="/on-air.svg" alt="On Air" draggable='false'/>
                ) : (
                    <ConIndicator src="/off-air.svg" alt="Off Air" draggable='false' />
                )}
            </MicButtonContainer>
            <FooterContainer>
                <FooterBlock>
                    <SystemInfo>Status: {connected ? "connected" : "disconnected"}</SystemInfo>
                    <SystemInfo>#Cell: {phoneNumber}</SystemInfo>
                    <SystemInfo>Backend: { targetCluster }</SystemInfo>
                </FooterBlock>
                <FooterBlock>Powered by Voistory</FooterBlock>
            </FooterContainer>
        </Base>
    )
}

export default ChatPage

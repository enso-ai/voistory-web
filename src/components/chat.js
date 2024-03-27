import { useState } from 'react'
import styled from 'styled-components'
import CircleComponent from './circle'

import { getChatSession } from 'services/chatService'
import WebSocketClient from 'services/websocket'
import { Speaker, Microphone} from 'utils/audio'

const Base = styled.div`
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #0d99ff;
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
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background-color: #fff;
`

const MicIcon = styled.img`
    position: relative;
    top: -5px;
    left: -5px;
    width: 160px;
    height: 160px;
    object-fit: fill;
`

const ChatPage = () => {
    const [isLoading, setLoading] = useState(false)
    const [connected, setConnected] = useState(false)
    const [ws, setWs] = useState(false)
    const [mic, setMic] = useState(null)
    const [speaker, setSpeaker] = useState(null)
    const [phoneNumber, setPhoneNumber] = useState("13142508541")

    const handleClick = () => {
        setLoading(true)

        if (connected) {
            ws.close()
            speaker.stop()
            mic.stop()
            setConnected(false)
            setLoading(false)
        } else {
            getChatSession(phoneNumber).then(async (resp) => {
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
        <div style={{border: "1px solid pink", position: "relative"}}>
            <LoaderContainer $visiable = { isLoading ? 'visible' : 'hidden' }>
                <CircleComponent initialSize={150} targetScale={1.5}/>
            </LoaderContainer>
            <MicButton onClick={handleClick} disabled={isLoading}>
                {connected ? (
                    <MicIcon src="/mic_icon_on.png" alt="Image" />
                ) : (
                    <MicIcon src="/mic_icon_off.png" alt="Image" />
                )}
            </MicButton>
        </div>
        </Base>
    )
}

export default ChatPage

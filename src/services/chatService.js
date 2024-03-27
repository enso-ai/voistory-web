import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:8000',
    // baseURL: 'https://murky.enso-ai.app',
})

export const getChatSession = async (phone_number) => {
    const data = {
        phone_number,
        call_platform: 'webbrowser',
        filter_code: '',
        refer_code: '',
    }

    const response = await client.post('/chat/start/client/', data)

    if (response.status === 201) {
        return response.data // { chat_session_id, websocket_url }
    } else {
        console.error('Failed to get chat session')
    }

    return null
}
import axios from 'axios'

const LOCAL = 'LOCAL'
const STAGING = 'STAGING'
const ALPHA = 'ALPHA'
const PROD = 'PROD'

export const CLUSTER_LIST = [
    PROD,
    ALPHA,
    STAGING,
    LOCAL,
]

const clients = {
    LOCAL: axios.create({
        baseURL: 'http://localhost:8000',
    }),
    STAGING: axios.create({
        baseURL: 'https://murky-staging.enso-ai.dev',
    }),
    ALPHA: axios.create({
        baseURL: 'https://murky-alpha.enso-ai.dev',
    }),
    PROD: axios.create({
        baseURL: 'https://murky.enso-ai.app',
    }),
}

export const getChatSession = async (cluster, phone_number) => {
    if (!CLUSTER_LIST.includes(cluster)) {
        throw Error(
            `Invalid cluster: ${cluster}. Valid clusters: ${CLUSTER_LIST}`
        );
    }

    const client = clients[cluster]
    const data = {
        phone_number: "+1" + phone_number, // for now, hard code the number to us/ca only
        call_platform: 'webbrowser',
        filter_code: '1',
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
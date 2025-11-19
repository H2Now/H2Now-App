import PubNub from 'pubnub'
import { useState, useEffect } from 'react'

export default function usePubNub(userId) {
    const [bottleConnected, setBottleConnected] = useState(false)

    useEffect(() => {
        if (!userId) return

        const pubnub = new PubNub({
            subscribeKey: import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY,
            uuid: `user-${userId}`
        })

        const channel = import.meta.env.VITE_FRONTEND_PUBNUB_CHANNEL
            console.log("🔍 Subscribing to channel:", channel)
        const listener = {
            message: (event) => {
                const message = event.message
                console.log("Frontend received:", message)

                switch (message.type) {
                    case 'connection_status':
                        setBottleConnected(message.connected)
                        console.log("Bottle connection status: ", message.connected)
                        break
                    case 'intake_update':
                    // TBC

                    default:
                        console.log("Unknown message type: ", message.type)
                }
            },
            status: (event) => {
                if (event.error && event.statusCode === 404) {
                    console.log('PubNub: Ignoring 404 (session expired)')
                    return
                }
                if (event.category === 'PNConnectedCategory') {
                    console.log('Frontend connected to PubNub')
                }
            }
        }

        pubnub.addListener(listener)
        pubnub.subscribe({ channels: [channel] })

        console.log(`Frontend subscribed to: ${channel}`)

        // Cleanup on unmount
        return () => {
            console.log('Frontend unsubscribing from PubNub')
            pubnub.removeListener(listener)
            pubnub.unsubscribeAll()
        }
    }, [userId])

    return {
        bottleConnected,
    }
}
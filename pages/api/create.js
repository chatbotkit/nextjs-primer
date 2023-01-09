import fetch from 'node-fetch'

// This is the only private API method you need to implement. Here we use the
// ChatBotKit conversation/create route to create a new conversation based on
// our specifications. Then we use the conversation/{conversationId}/token route
// to create a temporary token to continue the chat exchange directly with the
// ChatBotKit API.
//
// This is by far the most secure and simplest method to interact with the
// ChatBotKit platform. Other types of method are available. Please refer to the
// API for more information https://chatbotkit.com/docs/api/v1/spec.

export default async function handler(req, res) {
    // STEP 1
    // Create a new conversation. Alternative this step can be skipped if a
    // previous conversation already exists and we simply want to continue it.

    const response01 = await fetch(`https://api.chatbotkit.com/v1/conversation/create`, {
        method: 'POST',

        headers: {
            'Authorization': `Bearer ${process.env.CHATBOTKIT_TOKEN}`,
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            backstory: 'This is a friendly chat bot.'
        })
    })

    if (!response01.ok) {
        return res.status(400).send({ message: 'Cannot create conversation' })
    }

    const { id: conversationId } = await response01.json()

    // STEP 2
    // Get a temporary conversation token. This is useful in order to carry the
    // rest of the conversation directly with ChatBotKit instead of defining our
    // own proxy API routes.

    const response02 = await fetch(`https://api.chatbotkit.com/v1/conversation/${conversationId}/token/create`, {
        method: 'POST',

        headers: {
            'Authorization': `Bearer ${process.env.CHATBOTKIT_TOKEN}`,
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            durationInSeconds: 3600 // 1 hour in seconds
        })
    })

    if (!response02.ok) {
        return res.status(400).send({ message: 'Cannot create conversation token' })
    }

    const { token } = await response02.json()

    // STEP 3
    // Return the token to the client.

    return res.status(200).send({ conversationId, token })
}

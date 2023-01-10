import Head from 'next/head'
import { useState } from 'react'

export default function Index() {
  // STEP 1
  // Setup state to track send and received messages, the text input and the
  // conversation id and token.

  const [messages, setMessages] = useState([])

  const [text, setText] = useState('')

  const [conversationId, setConversationId] = useState(null)

  const [token, setToken] = useState(null)

  // STEP 2
  // Define a generic method to handle any errors.

  function handleError(err) {
    console.error(err)
  }

  // STEP 3
  // Here we define two methods. The continueConversation sends and receives the
  // next message. Note that this method interfaces directly with the ChatBotKit
  // API using the temporary conversation token. The startConversation method
  // is used to start the conversation using our own API. See the code for route
  // pages/api/create.js for more information.

  async function continueConversation(cid = conversationId, tkn = token) {
    // set the text input to empty string

    setText('')

    // get hold of a new instances of messages in order to update the state

    let newMessages = messages.slice(0)

    // Sub-step A: send the user message to the conversation instance

    const response01 = await fetch(`https://api.chatbotkit.com/v1/conversation/${cid}/send`, {
      method: 'POST',

      headers: {
          'Authorization': `Bearer ${tkn}`,
          'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        text
      })
    })

    if (!response01.ok) {
      handleError(await response01.json())

      return
    }

    const { id: sendMessageId } = await response01.json()

    newMessages = newMessages.concat([{ id: sendMessageId, text: text, type: 'user' }])

    setMessages(newMessages)

    // Sub-step B: receive a message from the conversation instance

    const response02= await fetch(`https://api.chatbotkit.com/v1/conversation/${cid}/receive`, {
      method: 'POST',

      headers: {
          'Authorization': `Bearer ${tkn}`,
          'Content-Type': 'application/json'
      },

      body: JSON.stringify({})
    })

    if (!response02.ok) {
      handleError(await response02.json())

      return
    }

    const { id: receiveMessageId, text: receiveText } = await response02.json()

    newMessages = newMessages.concat([{ id: receiveMessageId, text: receiveText, type: 'bot' }])

    setMessages(newMessages)
  }

  async function startConversation() {
    const response = await fetch('/api/create')

    if (!response.ok) {
      handleError(await response.json())

      return
    }

    const { conversationId, token } = await response.json()

    setConversationId(conversationId)
    setToken(token)

    continueConversation(conversationId, token)
  }

  function handleOnKeyDown(event) {
    // ENTER KEY

    if (event.keyCode === 13) {
      event.preventDefault()

      if (conversationId) {
        continueConversation()
      } else {
        startConversation()
      }
    }
  }

  return (
    <>
      <Head>
        <title>ChatBotKit Next.js Primer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {/* messages */}
        <div>
          {
            messages.map(({ id, type, text }) => {
              return (
                <div key={id}>
                  <div>{{ user: '🧠', bot: '🤖' }[type]}</div>
                  <div>{text}</div>
                </div>
              )
            })
          }
        </div>
        {/* input */}
        <textarea style={{width: '500px', height: '50px'}} value={text} onChange={() => setText(event.target.value)} onKeyDown={handleOnKeyDown} placeholder="Say something..."/>
      </main>
    </>
  )
}

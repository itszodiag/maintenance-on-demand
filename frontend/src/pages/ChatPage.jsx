import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { conversationsApi } from '../api/modules.js'
import { ChatWorkspace } from '../components/chat/ChatWorkspace.jsx'
import { SectionHeading } from '../components/layout/AppLayout.jsx'
import { getEcho } from '../lib/reverb.js'
import { toFormData } from '../lib/formData.js'
import { useAuthStore } from '../state/authStore.js'

function appendUniqueMessage(messages = [], message) {
  return messages.some((item) => item.id === message.id) ? messages : [...messages, message]
}

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [typingState, setTypingState] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const typingTimer = useRef()

  useEffect(() => {
    conversationsApi.list().then((data) => {
      const items = data.data ?? data
      setConversations(items)

      const conversationId = Number(searchParams.get('conversation'))
      const initialConversation = items.find((item) => item.id === conversationId) ?? items[0]

      if (initialConversation) {
        openConversation(initialConversation)
      }
    })
  }, [searchParams])

  useEffect(() => {
    if (!selectedConversation || !token) {
      return undefined
    }

    const echo = getEcho(token)

    if (!echo) {
      return undefined
    }

    const channel = echo.private(`conversation.${selectedConversation.id}`)
    channel.listen('.message.sent', ({ message }) => {
      setSelectedConversation((current) => current ? { ...current, messages: appendUniqueMessage(current.messages, message) } : current)
      setConversations((current) => current.map((item) => (item.id === selectedConversation.id ? { ...item, last_message: message, updated_at: message.created_at } : item)))
    })
    channel.listen('.conversation.seen', () => {
      conversationsApi.details(selectedConversation.id).then((data) => setSelectedConversation(data.conversation))
    })
    channel.listenForWhisper('typing', ({ userId }) => {
      if (userId !== currentUser.id) {
        setTypingState(true)
        window.clearTimeout(typingTimer.current)
        typingTimer.current = window.setTimeout(() => setTypingState(false), 1500)
      }
    })

    return () => {
      echo.leave(`private-conversation.${selectedConversation.id}`)
    }
  }, [currentUser?.id, selectedConversation, token])

  const openConversation = async (conversation) => {
    const response = await conversationsApi.details(conversation.id)
    setSelectedConversation(response.conversation)
    await conversationsApi.seen(conversation.id)
  }

  const onSendMessage = async (payload) => {
    if (!selectedConversation) return

    setSendLoading(true)
    try {
      const response = await conversationsApi.send(selectedConversation.id, toFormData(payload))
      setSelectedConversation((current) => current ? { ...current, messages: appendUniqueMessage(current.messages, response.message) } : current)
      setConversations((current) => current.map((item) => (item.id === selectedConversation.id ? { ...item, last_message: response.message, updated_at: response.message.created_at } : item)))
    } finally {
      setSendLoading(false)
    }
  }

  const onTyping = () => {
    const echo = token ? getEcho(token) : null
    if (echo && selectedConversation) {
      echo.private(`conversation.${selectedConversation.id}`).whisper('typing', {
        userId: currentUser.id,
      })
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Chat" title="WhatsApp-style communication workspace" description="Keep service requests, marketplace discussions, and order follow-ups moving in real time." />
      <ChatWorkspace
        conversations={conversations}
        selectedConversation={selectedConversation}
        currentUser={currentUser}
        onSelectConversation={openConversation}
        onSendMessage={onSendMessage}
        sendLoading={sendLoading}
        typingState={typingState}
        onTyping={onTyping}
      />
    </div>
  )
}

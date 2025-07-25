import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://biciwtpjavbbeqbxcslx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2l3dHBqYXZiYmVxYnhjc2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxOTk3MTcsImV4cCI6MjA2MDc3NTcxN30.sdXmQSf4y7ZgQLXNa6byNKzg9980LCpZYuJcCaUB7ic')

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";


export default function Chat() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    getMessage()
  }, []);

  async function getMessage() {
    const { data, error } = await supabase
          .from('cloud_chat')
          .select('message,direction')
    setMessages(data)
  }

  async function handleSend(text) {

    //display question
    const questionMessage = {
      message: text,
      direction: "outgoing",
    }
    setMessages(prev => [...prev, questionMessage]);

    //insert question into supabase
    await supabase
          .from('cloud_chat')
          .insert({
            message: text,
            direction: "outgoing",
          })

    //display answer
    setIsTyping(true)
    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{
            role: "user",
            content: text
          }]
      })
    })
    .then(response => {
      return response.json();
    })
    .then(async(data) => {

      //display answer from LLM
      const replyMessage = {
        //based on response data structure
        message: data.choices[0].message.content,
        direction: "incoming",
      }
      setMessages(prev => [...prev, replyMessage]);

      //insert answer into supabase
      await supabase
          .from('cloud_chat')
          .insert({
            message: data.choices[0].message.content,
            direction: "incoming",
          })
                      
      setIsTyping(false);
      
    })
  }

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={
              isTyping ? <TypingIndicator content="Waiting for reply..." /> : null
            }
          >
            {messages.map((msg, index) => (
              <Message key={index} model={msg} />
            ))}
          </MessageList>

          <MessageInput 
            placeholder="Type message here" 
            attachButton={false} 
            onSend={handleSend}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

import { useState, useEffect } from 'react'

//supabase config
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://biciwtpjavbbeqbxcslx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2l3dHBqYXZiYmVxYnhjc2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxOTk3MTcsImV4cCI6MjA2MDc3NTcxN30.sdXmQSf4y7ZgQLXNa6byNKzg9980LCpZYuJcCaUB7ic')

//supabase auth
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

//routing
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

//pages
import DB from './pages/DB'
import Storage from './pages/StorageShow'
import Chat from './pages/Chat'
import ChatSearchUser from './pages/ChatSearchUser'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (<Auth 
              supabaseClient={supabase} 
              appearance={{ theme: ThemeSupa }} 
              providers={['google']}
              onlyThirdPartyProviders={false}
            />)
  }
  else {
    return (
      <BrowserRouter>
        <div style={{marginBottom:20}}>
          <Link to="/">DB</Link> | <Link to="/storage">Storage</Link> | <Link to="/chat">Chat</Link> | <Link to="/chatsearch">Chat Search</Link> | <Link onClick={logout}>Logout</Link>
        </div>

        <Routes>
          <Route path="/" element={<DB />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chatsearch" element={<ChatSearchUser />} />
          
        </Routes>
      </BrowserRouter>
    )
  }
}
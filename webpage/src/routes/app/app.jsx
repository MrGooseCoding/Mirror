import { useEffect, useState } from 'react'
import '../../styles/style.css'
import NavBar from '../../components/navBar'
import Modal from '../../components/modal'
import Input from '../../components/input'
import Button from '../../components/button'
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { user_getByToken } from '../../server/api'

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function App() {
  var [token, setToken] = useState('')
  var [user, setUser] = useState({})

  var navigate = useNavigate()

  useEffect(() => {
    var tokenCookie = getCookie("token")

    async function prepare(token) {
      const [ok, result] = await user_getByToken(token)
      
      if (!ok) {
        // Go back to login
        navigate('/login')
        return
      }
      
      // Authenticated correctly.
      
      setToken(token)
      setUser(result)
    }
    
    prepare(tokenCookie)
  
  }, [])
  return (
    <div>
      <div className='App'>
        <Outlet context={{token, user}}/>
      </div>
      <NavBar items={[
          ["", "Create Room", "/app/createRoom"],
          ["", "Join Room", "/app/joinRoom"],
          ["", "Profile", "/app/profile"]
      ]}/>
    </div>
  )
}

export default App
import { useEffect, useState } from 'react'
import './../styles/style.css'
import NavBar from '../components/navBar'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getByToken(token) {
  const data = fetch('http://localhost:3000/api/users/getByToken/', {
    method: 'POST',
    //mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token
    })
  })
  return data
}

function App() {
  var [token, setToken] = useState('')
  var [user, setUser] = useState({})

  var navigate = useNavigate()

  useEffect(() => {
    var tokenCookie = getCookie("token")

    async function prepare(token) {
      const data = await getByToken(token)
      const result = await data.json()
      
      if (!data.ok) {
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
        <Outlet/>
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
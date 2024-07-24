import { useState } from 'react'
import './../styles/style.css'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()


  async function submitCallback() {
    try {
      const data = await fetch('http://localhost:3000/api/users/login/', {
        method: 'POST',
        //mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      })
  
      const result = await data.json()

      if (!data.ok) {
        setErrors(result["error"])
        return
      }

      // Authenticated correctly.

      // Saving token as cookie

      const { token } = result

      document.cookie = `token=${token}`

      navigate('/app')

    } catch (error) {
      setErrors({general: error})
    }
  }

  function usernameCallback(e) {
    const username = e.target.value
    setUsername(username)
  }

  function passwordCallback(e) {
    const password = e.target.value
    setPassword(password)
  }

  //<TextInput placeholder = "@yourcoolusername" onChange={usernameCallback}/>
  return (
    <div>
      <Modal title = "Login">
        <Input type="text" label="Username" placeholder="@yourcoolusername" onChange={usernameCallback} error={errors["username"]}/>

        <Input type="password" label="Password" placeholder="keepItSecret123" onChange={passwordCallback} error={errors["password"]}/>
        <Button text="Submit" color="red" onClick={submitCallback}/>
      </Modal>
    </div>
  )
}

export default Login
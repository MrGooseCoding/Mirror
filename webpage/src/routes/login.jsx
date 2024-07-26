import { useState } from 'react'
import './../styles/style.css'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import { useNavigate } from "react-router-dom";
import { user_login } from '../server/api'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()

  
  async function submitCallback() {
    const [ok, result] = await user_login(username, password)
    
    if (!ok) {
      setErrors(result["error"])
      return
    }

    const { token } = result

    document.cookie = `token=${token}`

    navigate('/app')
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
        <div className="slide">
          <Input type="text" label="Username" placeholder="@yourcoolusername" onChange={usernameCallback} error={errors["username"]}/>
          <Input type="password" label="Password" placeholder="keepItSecret123" onChange={passwordCallback} error={errors["password"]}/>
          <Button text="Submit" color="red" onClick={submitCallback}/>
        </div>
      </Modal>
    </div>
  )
}

export default Login
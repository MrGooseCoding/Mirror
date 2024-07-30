import { useState } from 'react'
import './../styles/style.css'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import { useNavigate } from "react-router-dom";
import { user_create } from '../server/api'

function inputCallback (e, set) {
    const { value } = e.target
    set(value)
}

function SignUp() {
  const [display_name, setDisplay_name] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()
  
  async function submitCallback() {
    const [ok, result] = await user_create(display_name, username, password, description)
    
    if (!ok) {
      setErrors(result)
      return
    }

    const { token } = result

    document.cookie = `token=${token}`

    navigate('/app')
  }

  const usernameCallback = (e) => inputCallback(e, setUsername)
  const passwordCallback = (e) => inputCallback(e, setPassword)
  const display_nameCallback = (e) => inputCallback(e, setDisplay_name)
  const descriptionCallback = (e) => inputCallback(e, setDescription)

  return (
    <div>
      <Modal title = "Sign up">
        <div className="container flex no-padding">
          <Input type="text" label="Display Name" placeholder="VIP User" onChange={display_nameCallback} error={errors["display_name"]}/>
          <Input type="text" label="Username" placeholder="@yourcoolusername" onChange={usernameCallback} error={errors["username"]}/>
          <Input type="password" label="Password" placeholder="keepItSecret123" onChange={passwordCallback} error={errors["password"]}/>
          <Input type="textarea" label="Description" placeholder="Yo what's up?" onChange={descriptionCallback} error={errors["description"]}/>
          <Button text="Submit" color="red" onClick={submitCallback}/>
        </div>
      </Modal>
    </div>
  )
}

export default SignUp
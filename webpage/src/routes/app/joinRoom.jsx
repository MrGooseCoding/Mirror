import { useState } from 'react'
import './../styles/style.css'
import NavBar from '../../components/navBar'
import Modal from '../../components/modal'
import Input from '../../components/input'
import Button from '../../components/button'
import { useNavigate } from "react-router-dom";

function JoinRoom({}) {
  var [ roomCode, setRoomCode ] = useState(0)
  var [ errors, setErrors ] = useState({})

  async function submitCallback(e) {
  }
  
  function roomCodeCallback(e) {
    const roomCode = e.target.value
    setRoomCode(roomCode)
  }
  return (
    <div>
      <Modal title="Join Room">
        <Input type="text" label="Room Code" placeholder="000000" onChange={roomCodeCallback} error={errors["username"]}/>

        <Button text="Go!" color="red" onClick={submitCallback}/>
      </Modal>
    </div>
  )
}

export default JoinRoom
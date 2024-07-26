import { useState } from 'react'
import '../../styles/style.css'
import NavBar from '../../components/navBar'
import Modal from '../../components/modal'
import Input from '../../components/input'
import Button from '../../components/button'
import { useNavigate } from "react-router-dom";
import { room_canJoin } from '../../server/api'
import { useOutletContext } from "react-router-dom";

function JoinRoom({}) {
  var [ roomCode, setRoomCode ] = useState(0)
  var [ errors, setErrors ] = useState({})

  const { token, user } = useOutletContext()
  const navigate = useNavigate()

  async function submitCallback(e) {
    const [ok, result] = await room_canJoin(roomCode, token)

    if (!ok) {
      if (result.token) {
        navigate('/login')
        return
      }
      setErrors({error: result.error})
      return
    }

    navigate('/app/room/' + roomCode)
  }
  
  function roomCodeCallback(e) {
    const roomCode = e.target.value
    setRoomCode(roomCode)
  }
  return (
    <div>
      <Modal title="Join Room">
        <div className="slide">
          <Input type="text" label="Room Code" placeholder="000000" onChange={roomCodeCallback} error={errors["error"]}/>
          <Button text="Go!" color="red" onClick={submitCallback}/>
        </div>
      </Modal>
    </div>
  )
}

export default JoinRoom
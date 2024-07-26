import { useState } from 'react'
import '../../styles/style.css'
import NavBar from '../../components/navBar'
import Modal from '../../components/modal'
import Input from '../../components/input'
import Button from '../../components/button'
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { room_create } from '../../server/api'

function CreateRoom({}) {
  var [ roomCode, setRoomCode ] = useState(0)
  var [ errors, setErrors ] = useState({})

  const { token, user } = useOutletContext()
  const navigate = useNavigate()

  async function submitCallback(e) {
    const [ ok, result ] = await room_create(token)
    
    if (!ok) {
      if (result.token) {
        navigate('/login')
        return
      }
      setErrors({error: result.error})
      return
    }

    const { code } = result

    navigate('/app/room/' + code)
  }

  return (
    <div>
      <Modal title="Create Room">
        <div className="slide">
          <div className={`error ${errors["error"] ? 'visible' : ''}`}>{errors["error"]}</div>
          <Button text="New" color="red" onClick={submitCallback}/>
        </div>
      </Modal>
    </div>
  )
}

export default CreateRoom
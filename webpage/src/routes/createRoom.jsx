import { useState } from 'react'
import './../styles/style.css'
import NavBar from '../components/navBar'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

function CreateRoom({}) {
  var [ roomCode, setRoomCode ] = useState(0)
  var [ errors, setErrors ] = useState({})

  async function submitCallback(e) {
  }

  return (
    <div>
        <Modal title="Create Room">
        <Button text="New" color="red" onClick={submitCallback}/>
      </Modal>
    </div>
  )
}

export default CreateRoom
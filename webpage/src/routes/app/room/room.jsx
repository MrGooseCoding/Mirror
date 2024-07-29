import { useEffect, useState } from 'react'
import '../../../styles/style.css'
import NavBar from '../../../components/navBar'
import Modal from '../../../components/modal'
import Input from '../../../components/input'
import Button from '../../../components/button'
//import { RoomWebsocket } from '../../server/ws'
import { useOutletContext, useLocation, useNavigate, Outlet } from "react-router-dom";

function Room({}) {
  var [ redirectionKey, setRedirectionKey ] = useState('')
  var [ game, setGame ] = useState('')

  const { token, user } = useOutletContext()

  useEffect(() => {
    if (!game || !redirectionKey) {
      return
    }

    navigate('/app/room/game/'+game)

  }, [game, redirectionKey])

  const navigate = useNavigate()

  return (
    <div>
      <Outlet context={{token, user, redirectionKey, setRedirectionKey, game, setGame}}/>
    </div>
  )
}

export default Room
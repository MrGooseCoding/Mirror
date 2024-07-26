import { useEffect, useState } from 'react'
import '../../styles/style.css'
import NavBar from '../../components/navBar'
import Modal from '../../components/modal'
import Input from '../../components/input'
import Button from '../../components/button'
//import { RoomWebsocket } from '../../server/ws'
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";

function Room({}) {
  var [ members, setMembers ] = useState([])
  var [ room, setRoom ] = useState([])

  const { token, user } = useOutletContext()
  const navigate = useNavigate()

  const { pathname } = useLocation()
  const pathname_split = pathname.split('/')
  const code = pathname_split[3]
  
  useEffect(() => {
    if (!token) {
      return
    }

    const socket = new WebSocket(`ws://localhost:3000/ws/room/?code=${code}&token=${token}`)

    // Event listener for when the connection is opened
    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    // Event listener for incoming messages
    socket.onmessage = (e) => {
      const message = JSON.parse(e.data)
      console.log(message)

      if (message.type == "room") {
        setRoom(message.data)
      }

      if (message.type == "members") {
        setMembers(message.data)
      }
      
      if (message.type === "member_joined") {
        setMembers((prevMembers) => [...prevMembers, message.data]);
      }

      if (message.type === "member_left") {
        setMembers((prevMembers) => prevMembers.filter(member => member.id !== message.data.id));
      }
    }

    // Event listener for errors
    socket.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    // Event listener for when the connection is closed
    socket.onclose = () => {
      navigate('/app')
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, [token])

  return (
    <div>
      <Modal title={"Room"}>
        <div>
          <div className='label'>Code</div>
          <div className='container'>{code}</div>
        </div>
        <div>
          <div className='label'>Members</div>
          <div className='memberContainer'>
            {
              members.map((v, i, arr) => {
                return <div className={`member ${v.id == user.id ? 'self' : ''}`} key={v.id}>
                  <div className='icon'></div>
                  <div className= "name">{v.display_name}</div>
                </div>
              })
            }
          </div>
        </div>
        {
          room.admin == user.id && <Button text="Start Voting!" color="red"/>
        }
      </Modal>
    </div>
  )
}

export default Room
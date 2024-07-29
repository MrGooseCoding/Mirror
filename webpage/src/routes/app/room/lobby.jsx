import { useEffect, useState } from 'react'
import '../../../styles/style.css'
import NavBar from '../../../components/navBar'
import Modal from '../../../components/modal'
import Input from '../../../components/input'
import Button from '../../../components/button'
//import { RoomWebsocket } from '../../server/ws'
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";

function Lobby({}) {
  var [ members, setMembers ] = useState([])
  var [ room, setRoom ] = useState([])
  var [ ws, setWs ] = useState()
  var [ slide, setSlide ] = useState(0)
  var [ games, setGames ] = useState([])
  var [ votes, setVotes ] = useState({})
  var [ vote, setVote ] = useState('')
  var [ errors, setErrors ] = useState('')

  const { token, user, setRedirectionKey, setGame } = useOutletContext()
  const navigate = useNavigate()

  const { pathname } = useLocation()
  const pathname_split = pathname.split('/')
  const code = pathname_split[3]
  
  useEffect(() => {
    if (!token) {
      return
    }

    const socket = new WebSocket(`ws://localhost:3000/ws/room/?code=${code}&token=${token}`)

    setWs(socket)

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

      if (message.type === "start_voting") {
        setSlide(1)
      }

      if (message.type === "start_game") {
        setRedirectionKey(message.data.redirection_key)
        setGame(message.data.game)
      }
      
      if (message.type === "games") {
        setGames(message.data)
      }

      if (message.type === "votes") {
        setVotes(message.data)
      }

      if (message.type === "error") {
        setErrors({error: message.data})
        if (message.data === "Invalid code") {
          navigate('/app')
        }
      }
    }

    // Event listener for errors
    socket.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    // Event listener for when the connection is closed
    socket.onclose = () => {
      //navigate('/app')
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, [token])

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.log('WebSocket is not open. Ready state:', ws.readyState);
    }
  };

  function voteGame (e) {
    const game_id = e.currentTarget.id

    setVote(game_id)

    sendMessage({
      type: "vote",
      data: game_id
    })
  }

  return (
    <div>
      <Modal title={"Room"}>
        <div className={`slide ${slide == 0 ? '' : 'hidden'}`}>
          <div>
            <div className='label'>Code</div>
            <div className='container grey'>{code}</div>
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
            room.admin == user.id && <Button text="Start Voting!" color="red" onClick={()=> {
              sendMessage({
                type: "start_voting"
              })
            }}/>
          }
        </div>
        <div className={`slide ${slide == 1 ? '' : 'hidden'}`}>
          <div>
            <div className={`error ${errors["error"] ? 'visible' : ''}`}>{errors["error"]}</div>
            <div className='label'>Vote </div>
            <div className='gamesContainer'>
              {
                games.map((v, i, arr) => {
                  return <Button key={v} color="grey" id={v} onClick={voteGame} selected={ vote == v }>
                      <div className="game">
                        <div className='name'>{v}</div>
                        <div className='votes'>{votes[v]}</div>
                      </div>
                  </Button>
                })
              }
            </div>
          </div>
          {
            room.admin == user.id && <Button text="Start Game!" color="red" onClick={()=> {
              sendMessage({
                type: "start_game"
              })
            }}/>
          }
        </div>
      </Modal>
    </div>
  )
}

export default Lobby
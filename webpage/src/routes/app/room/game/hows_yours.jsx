import { useEffect, useState } from 'react'
import '../../../../styles/style.css'
import Modal from '../../../../components/modal'
import Input from '../../../../components/input'
import Button from '../../../../components/button'
//import { RoomWebsocket } from '../../server/ws'
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { help_game } from "../../../../server/api"

function Hows_yours({}) {
  var [ ws, setWs ] = useState()
  var [ status, setStatus ] = useState("")
  var [ topic, setTopic ] = useState("")
  var [ members, setMembers ] = useState([])
  var [ turn, setTurn ] = useState("")
  var [ messages, setMessages ] = useState([])
  var [ resultMessages, setResultMessages ] = useState([])
  var [ gameData, setGameData ] = useState({})

  var [ word, setWord ] = useState()

  var [ errors, setErrors ] = useState('')

  var [ role, setRole ] = useState('')

  const { user, redirectionKey } = useOutletContext()

  // const navigate = useNavigate()
  
  useEffect(() => {
    if (!redirectionKey) {
      return
    }
     
    async function getHelp () {
      const data = await help_game("hows_yours")
      if (data[0]) {
        setGameData(data[1])
      }
    }

    getHelp()
    //const socket = new WebSocket(`wss://${window.location.host}/ws/game/hows_yours/?key=${redirectionKey}`)
    const socket = new WebSocket(`ws://localhost:3000/ws/game/hows_yours/?key=${redirectionKey}`)

    setWs(socket)

    // Event listener for when the connection is opened
    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    // Event listener for incoming messages
    socket.onmessage = (e) => {
        const message = JSON.parse(e.data)
        console.log(message)

        if (message.type == "guesser") {
            setRole(message.data == user.id ? "guesser" : "crew")
        }

        if (message.type == "topic") {
            setTopic(message.data)
        }

        if (message.type == "inside_game") {
            setStatus("inside_game")
        }

        if (message.type == "guessing") {
            setStatus("guessing")
            setResultMessages([{
                type: "start_guessing",
                data: `Time to guess!`
            }])
        }

        if (message.type == "member_order") {
            setMembers(message.data)
        }

        if (message.type == "turn") {
            setMessages((prev) => {
                var all_messages = [...prev]
                all_messages.push(message)
                return all_messages
            })
            setTurn(message.data)
        }

        if (message.type == "property") {
            setMessages((prev) => {
                var all_messages = [...prev]
                all_messages.push(message)
                return all_messages
            })
        }

        if (message.type == "result") {
            setResultMessages((prev) => [
                ...prev,
                {
                    type: "message",
                    data: message.data.message
                },
                {
                    type: "winners",
                    data: `${message.data.winners} wins`
                }
            ])
        }

        if (message.type == "end_round") {
            setMessages((prev) => {
                var all_messages = [...prev]
                all_messages.push(message)
                return all_messages
            })
        }

        if (message.type == "error") {
            setErrors({ error: message.data })
        }

    }

    // Event listener for errors
    socket.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    // Event listener for when the connection is closed
    socket.onclose = () => {
      console.log("Websocket connection closed")
      navigate('/app')
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, [redirectionKey])

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.log('WebSocket is not open. Ready state:', ws.readyState);
    }
  };

  function onWordInputChange (e) {
    const { value } = e.target
    setWord(value)
  };

  function onWordInputSubmit (e) {
    e.preventDefault()
    sendMessage({
      type: role == "crew" ? "property" : "guess",
      data: word
    })
  };

  return (
    <div>
      <div className={`screen ${status == "" ? 'active' : ''}`}>
        <Modal title="How's yours?">
            {
              gameData.players && 
                <div>
                  <div className="label">Players</div>
                  <div className="container grey">
                    From {gameData.players.from} to {gameData.players.to} players
                  </div>
                </div>
            }
            {
              gameData.description &&
                <div>
                  <div className="label">Description:</div>
                  <div className='container grey'>{gameData.description}</div>
                </div>
            }
            <div className='label margin'>
              Waiting for every member to join...
            </div>
        </Modal>
      </div>

      <div className={`screen ${status == "inside_game" ? 'active' : ''}`}>
        <div className = "gameInfoContainer">
          <div>
            <div className="label">Role: </div>
            <div className="container grey">{role}</div>
          </div>
          {
            role == "crew" && <div>
              <div className="label">Topic:</div>
              <div className='container grey'>{topic}</div>
            </div>
          }
        </div>
        <div className="container">
          <div className='label'>Messages:</div>
          <div className='messagesContainer'>
            {
              messages.map((v, i, arr) => {
                if (v.type == "turn") {
                  const member = members.filter(m => v.data == m.id)[0]
                  return <div className='message' key={`turn_${v.data}`}>
                    Its {member.display_name}'s turn
                  </div>
                }
                if (v.type == "property") {
                  const member = members.filter(m => v.data.user == m.id)[0]
                  return <div className='message' key={`word_${v.data.user}`}>
                    Hows yours? {member.display_name}'s is {v.data.property}
                  </div>
                }
                if (v.type == "end_round") {
                  return <div className='message' key={`end_round`}>
                    End of round
                  </div>
                }
              })
            }
          </div>
        </div>
        {
            role == "crew" && <div className="bottom">
                <form className="container" onSubmit={onWordInputSubmit}>
                    <Input type="text" placeholder="Mine is..." error={errors["error"]} onChange={onWordInputChange}/>
                </form>
            </div>
        }
      </div>

      <div className={`screen ${status == "guessing" ? 'active' : ''}`}>
        <div className = "gameInfoContainer">
          <div>
            <div className="label">Role: </div>
            <div className="container grey">{role}</div>
          </div>
          {
            role == "crew" && <div>
              <div className="label">Topic:</div>
              <div className='container grey'>{topic}</div>
            </div>
          }
        </div>
        <div className='container'>
          <div className="label">Result: </div>
          <div className="container grey">
          {
            resultMessages.map((v, i, arr) => {
                return <div key={`result`}>
                  {v.data}
                </div>
            })
          }
          </div>
        </div>

        <div className='label margin'>Go back to <span className='link' onClick={()=> window.location.replace("/app")}>home</span></div>
        {
            role == "guesser" && <div className="bottom">
                <form className="container" onSubmit={onWordInputSubmit}>
                    <Input type="text" placeholder="Make your guess" error={errors["error"]} onChange={onWordInputChange}/>
                </form>
            </div>
        }
      </div>

    </div>
  )
}

export default Hows_yours
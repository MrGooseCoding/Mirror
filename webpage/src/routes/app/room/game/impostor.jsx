import { useEffect, useState } from 'react'
import '../../../../styles/style.css'
import Modal from '../../../../components/modal'
import Input from '../../../../components/input'
import Button from '../../../../components/button'
//import { RoomWebsocket } from '../../server/ws'
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";

function Impostor({}) {
  var [ ws, setWs ] = useState()
  var [ status, setStatus ] = useState("")
  var [ topic, setTopic ] = useState("")
  var [ members, setMembers ] = useState([])
  var [ turn, setTurn ] = useState("")
  var [ vote, setVote ] = useState("")
  var [ mostVoted, setMostVoted ] = useState("")
  var [ messages, setMessages ] = useState([])
  var [ resultMessages, setResultMessages ] = useState([])

  var [ word, setWord ] = useState()

  var [ errors, setErrors ] = useState('')

  var [ role, setRole ] = useState('')

  const { redirectionKey } = useOutletContext()

  console.log(redirectionKey)

  // const navigate = useNavigate()
  
  useEffect(() => {
    console.log(redirectionKey)
    if (!redirectionKey) {
      return
    }

    const socket = new WebSocket(`ws://localhost:3000/ws/game/impostor/?key=${redirectionKey}`)

    setWs(socket)

    // Event listener for when the connection is opened
    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    // Event listener for incoming messages
    socket.onmessage = (e) => {
      const message = JSON.parse(e.data)
      console.log(message)

      if (message.type == "role") {
        setRole(message.data)
      }

      if (message.type == "topic") {
        setTopic(message.data)
      }

      if (message.type == "inside_game") {
        setStatus("inside_game")
      }

      if (message.type == "start_voting") {
        setStatus("voting")
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

      if (message.type == "relative_word") {
        setMessages((prev) => {
          var all_messages = [...prev]
          all_messages.push(message)

          console.log(all_messages)
          return all_messages
        })
      }

      if (message.type == "result") {
        setResultMessages([
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

      if (message.type == "most_voted") {
        setMostVoted(message.data)
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
      type: "relative_word",
      data: word
    })
  };
  
  function onVoteMemberButtonClick (id) {
    setVote(id)
    sendMessage({
      type: "vote",
      data: id
    })
  };

  return (
    <div>
      <div className={`screen ${status == "" ? 'active' : ''}`}>
        <Modal>
          Waiting for every member to join...
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
                if (v.type == "relative_word") {
                  const member = members.filter(m => v.data.user == m.id)[0]
                  return <div className='message' key={`word_${v.data.user}`}>
                    {member.display_name} said {v.data.word}
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
        <div className="bottom">
          <form className="container" onSubmit={onWordInputSubmit}>
            <Input type="text" placeholder="Type your word..." error={errors["error"]} onChange={onWordInputChange}/>
          </form>
        </div>
      </div>

      <div className={`screen ${status == "voting" ? 'active' : ''}`}>
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
          <div className='label'>Vote for a member</div>
          <div className='memberVoteContainer'>
            {
              members.map((v, i, arr) => {
                return <div>
                  <Button color="grey" selected={vote == v.id} onClick={
                    () => onVoteMemberButtonClick(v.id)
                  }> {v.display_name} </Button>
                </div>
              })
            }
          </div>
          <div className="label">Most voted:</div>
          <div className="container grey">
            {
              mostVoted ? members.filter(v => v.id == mostVoted)[0].display_name : '...'
            }
          </div>
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
      </div>

    </div>
  )
}

export default Impostor
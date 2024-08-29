import './../styles/style.css'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import Header from '../components/header'
import { help_game, help_getGames } from '../server/api'

import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { user_login } from '../server/api'
import Shrinkable from '../components/shrinkable'

function Help() {
  var [modalHidden, setModalHidden] = useState(true)
  var [games, setGames] = useState([])
  var [game, setGame] = useState("")
  var [gameData, setGameData] = useState({})

  useEffect(() => {
    async function getGames () {
      const data = await help_getGames()
      if (data[0]) {
        setGames(data[1])
      }
    }
    getGames()
  }, [])

  async function openModal (game_name) {
    const data = await help_game(game_name)
    if (data[0]) {
      setModalHidden(false)
      setGame(game_name)
      setGameData(data[1])
    }
  }

  async function closeModal () {
    setModalHidden(true)
    setGame("")
    setGameData({})
  }
  return (
    <div>
        <Modal title={game} hidden={modalHidden} dominant onCloseBtn={closeModal}>
          <div className="slide">
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
          </div>
        </Modal>
        <div className='Help'>
            <Header/>
            <div className='mainWrapper'>
              <div className="main">
                <Shrinkable title="Games">
                  <div className='gamesGrid'>
                    {
                      games.map((v, i, arr) => 
                        <Button color='grey' onClick={() => openModal(v)} key={`help_games_${v}`}>{v}</Button>
                      )
                    }
                  </div>
                </Shrinkable>
                <Shrinkable title="FAQ">
                  This section is empty
                </Shrinkable>
              </div>
            </div>
        </div>
    </div>
  )
}

export default Help
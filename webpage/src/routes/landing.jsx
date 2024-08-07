import { useState } from 'react'
import './../styles/style.css'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import Icon from '../components/icon'
import { useNavigate } from "react-router-dom";
import { user_login } from '../server/api'

function Landing() {
  return (
    <div>
      <div className='Landing'>
        <div className='header'>
          <Icon className="h-50" name={"logowithname"}/>
          <div className="items">
            <div className='item'>News</div>
            <div className='item'>About</div>
            <div className='item'>Help</div>
          </div>
          <Button text="Go to app" notransform color="red"/>
        </div>
        <div className="mainWrapper">
          <div className='main'>
            <div className="mainSection">
              <div className="imageandlogo">
                <div className='mainImage'> </div>
                <Icon className="h-100 mainLogo" name={"logowithname"}/>
              </div>
              <div className="info">
                <div className='title'>Where the fun beggins</div>
                <div className='text'>Mirror is a great place to play online games with your friends. Create a room, invite people, and start playing! </div>
                <Button text="Go to app" color="red"/>
              </div>
            </div>
            <div className="sectionsContainer">
              <div className='section'>
                <div className='info'>
                  <div className='title'>Cross-device compatible</div>
                  <div className='text'>Use the web version on your phone, tablet, or computer. It doesn't matter from where you access the web app, you can play toguether! </div>
                </div>
                <div className='image'></div>
              </div>
              <div className='section'>
                <div className='info'>
                  <div className='title'>Simple and intuitive flow</div>
                  <div className='text'>Playing with your friends is easy! Simply create a room, send the code to your friends, and have them join! The app will then offer you a list of games you can play, so all the members can vote and start having fun </div>
                </div>
                <div className='image'></div>
              </div>
              <div className='section'>
                <div className='info'>
                  <div className='title'>Games for all gamers</div>
                  <div className='text'>You will be able to find neverending entertainment of all types, from 1 to 8 players</div>
                </div>
                <div className='image'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
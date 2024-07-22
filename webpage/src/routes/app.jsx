import { useState } from 'react'
import './../styles/style.css'
import NavBar from '../components/navBar'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import { useNavigate } from "react-router-dom";

function App() {
  return (
    <div>
        <NavBar items={[
            ["", "New Game"],
            ["", "Join Game"],
            ["", "Profile"]
        ]}/>
    </div>
  )
}

export default App
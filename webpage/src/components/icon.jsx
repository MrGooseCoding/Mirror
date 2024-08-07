import { useState } from 'react'
import './../styles/style.css'
import Logo from './../assets/logo.svg?react'
import Logowithname from './../assets/logowithname.svg?react'
import Modal from '../components/modal'
import Input from '../components/input'
import Button from '../components/button'
import { useNavigate } from "react-router-dom";
import { user_login } from '../server/api'

function Icon({ name, color, className}) {
  if (name == "logo") {
    return (
      <Logo className="logo"/>
    )
  }
  if (name == "logowithname") {
    return (
      <Logowithname className={`logo ${className}`}/>
    )
  }
}

export default Icon
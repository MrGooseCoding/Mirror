import { useState } from 'react'
import '../../styles/style.css'
import NavBar from '../../components/navBar'
import Modal from '../../components/modal'
import Input from '../../components/input'
import Button from '../../components/button'
import { useNavigate, useOutletContext } from "react-router-dom";

function Profile({}) {
  
  const { token, user } = useOutletContext()

  return (
    <div>
      <div className="container">
        <b>{user.display_name}</b>
        <div>@{user.username}</div>
        <div className='container grey'>{user.description}</div>
      </div>
    </div>
  )
}

export default Profile
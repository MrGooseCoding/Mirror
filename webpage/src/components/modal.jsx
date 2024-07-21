import { useState } from 'react'
import './../styles/style.css'

function Modal({ title, children }) {
  return (
    <div className='Modal'>
      { title && <div className='title'>{title}</div> }

      { children }
    </div>
  )
}

export default Modal
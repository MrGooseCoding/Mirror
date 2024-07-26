import { useState } from 'react'
import './../styles/style.css'

function Modal({ title, children }) {
  return (
    <div className='Modal'>
      { title && <div className='title'>{title}</div> }

      <div className="slidesWrapper">
        { children }
      </div>
    </div>
  )
}

export default Modal
import { useState } from 'react'
import './../styles/style.css'

function Button({ id, text, color, onClick, children }) {
  return (
    <div className={`Button ${color}`}>
        <div className='exterior'>
            <div className='interior' id={id} onClick={onClick}>
                { text }
                { children }  
            </div>
        </div>
    </div>
  )
}

export default Button
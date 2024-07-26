import { useState } from 'react'
import './../styles/style.css'

function Button({ id, text, color, onClick }) {
  return (
    <div className={`Button ${color}`}>
        <div className='exterior'>
            <div className='interior' id={id} onClick={onClick}>
                { text }  
            </div>
        </div>
    </div>
  )
}

export default Button
import { useState } from 'react'
import './../styles/style.css'

function Button({ text, color, onClick }) {
  return (
    <div className={`Button ${color}`}>
        <div className='exterior'>
            <div className='interior' onClick={onClick}>
                { text }  
            </div>
        </div>
    </div>
  )
}

export default Button
import { useState } from 'react'
import './../styles/style.css'

function Button({ id, text, color, onClick, children, selected, notransform, className }) {
  return (
    <div className={`Button ${color} ${selected ? 'selected': ''} ${notransform ? 'no-transform': ''} ${className}`}>
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
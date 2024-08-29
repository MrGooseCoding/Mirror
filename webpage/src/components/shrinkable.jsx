import { useState } from 'react'
import './../styles/style.css'
import Icon from './icon'

function Shrinkable({ title, children }) {
    var [shrinked, setShrinked] = useState(false)

    function onTitleClick () {
        setShrinked((prev) => !prev)
    }

    return (
        <div className={`Shrinkable`}>
            <div className='title' onClick={onTitleClick}>
                <Icon name="arrow" className={`icon ${shrinked ? 'shrinked': ''}`}/> 
                <div>{title}</div>
            </div>
            <div className={`content ${shrinked ? 'shrinked' : ''}`}>
                {children}
            </div>
        </div>
    )
}

export default Shrinkable
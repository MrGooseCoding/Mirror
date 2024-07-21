import { useState } from 'react'
import './../styles/style.css'

function NavBar({ items, itemsCallback }) {
    return <div className='NavBar'>
        {
            items.map((v, i, arr) => {
                return <div className='item'>
                    <div className='icon'>{v[0]}</div>
                    <div className='name'>{v[1]}</div>
                </div>
            })
        }
    </div>
}

export default NavBar
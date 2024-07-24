import { useState } from 'react'
import './../styles/style.css'
import { useNavigate } from "react-router-dom";

function NavBar({ items, itemsCallback }) {
    const navigate = useNavigate()

    function onClick(e) {
        e.preventDefault()
        const element = e.currentTarget
        const path = element.id
        navigate(path)
    }

    return <div className='NavBar'>
        {
            items.map((v, i, arr) => {
                return <div className='item' key={v[2]} id={v[2]} onClick={onClick}>
                    <div className='icon'>{v[0]}</div>
                    <div className='name'>{v[1]}</div>
                </div>
            })
        }
    </div>
}

export default NavBar
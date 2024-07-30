const fetchPOST = async (url, request_json) => {
    const data = await fetch(url, {
        method: 'POST',
        //mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            request_json
        )
    })
    return [data.ok, await data.json()]
}

async function user_getByToken(token) {
    return await fetchPOST('http://localhost:3000/api/users/getByToken/', {
        token
    })
}

async function user_create(display_name, username, password, description) {
    return await fetchPOST('http://localhost:3000/api/users/create/', {
        display_name,
        username,
        password,
        description
    })
}
async function user_login(username, password) {
    return await fetchPOST('http://localhost:3000/api/users/login/', {
        username,
        password
    })
}

async function room_create(token) {
    return await fetchPOST('http://localhost:3000/api/rooms/create/', {
        token
    })
}

async function room_canJoin(code, token) {
    return await fetchPOST('http://localhost:3000/api/rooms/canJoin/' + code, {
        token
    })
}

export { user_getByToken, user_create, user_login, room_create, room_canJoin }
import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';

import Login from './routes/login';

import App from './routes/app/app';
import JoinRoom from './routes/app/joinRoom'
import CreateRoom from './routes/app/createRoom'

import Room from './routes/app/room/room'
import RoomLobby from './routes/app/room/lobby'
import ImpostorGame from './routes/app/room/game/impostor'
import Hows_yoursGame from './routes/app/room/game/hows_yours'
import Profile from './routes/app/profile'
import SignUp from './routes/signup';
import Landing from './routes/landing';
import Help from './routes/help';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" key='index'>
      <Route path="/" element={<Landing />} key={'landing'} />
      <Route path="/help" element={<Help />} key={'help'} />
      <Route path="/login" element={<Login />} key={'login'} />
      <Route path="/signup" element={<SignUp />} key={'login'} />
      <Route path="/app" element={<App />} key={'app'} 
        children={[
          <Route path="/app/joinRoom/" element={<JoinRoom/>} key={'joinRoom'}/>,
          <Route path="/app/createRoom/" element={<CreateRoom/>} key={'createRoom'}/>,
          <Route path="/app/room/" element={<Room />} key={'room'} 
            children={[
              <Route path="/app/room/:roomId" element={<RoomLobby />} key={'roomLobby'}/>,
              <Route path="/app/room/game/impostor" element={<ImpostorGame />} key={'impostorGame'}/>,
              <Route path="/app/room/game/hows_yours" element={<Hows_yoursGame />} key={'hows_yoursGame'}/>
            
            ]}/>,
          <Route path="/app/profile/" element={<Profile/>} key={'profile'}/>,
          // <Route path="/app/game/" element={} />

        ]}/>
    </Route>
  )
)
// <Route path="/register" element={} />
// <Route path="/" element={} />

// <Route index element={<Home />} />
function Index({routes}) {
  return (
    <div className='flex-1'>
      <RouterProvider router={router}/>
    </div>
  );
}

export default Index;

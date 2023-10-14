import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Singnin from './components/pages/Signin'
import Signup from './components/pages/Signup'
import JoinRoom from './components/pages/JoinRoom'
import Room from './components/pages/Room'
import Modal from './components/Modal/Modal'
import { LoginContext } from './context/LoginContext'


const App = () => {
    const [userLogin, setUserLogin] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <BrowserRouter>
            <LoginContext.Provider value={{ setUserLogin, setModalOpen, userLogin }}>
                <Routes>
                    <Route path='/' element={<JoinRoom />} />
                    <Route path='/login' element={<Singnin />} />
                    <Route path='/register' element={<Signup />} />
                    <Route path='/room/:roomId' element={<Room />} />
                </Routes>
                {modalOpen && <Modal setModalOpen={setModalOpen}></Modal>}
            </LoginContext.Provider>
        </BrowserRouter>
    )
}

export default App
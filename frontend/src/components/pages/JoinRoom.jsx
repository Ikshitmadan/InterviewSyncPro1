import React, { useCallback, useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import './JoinRoom.css'
import { v4 as uuidv4, validate } from 'uuid';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketProvider';


const JoinRoom = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("auth");
        if (!token) {
            navigate("/login")
        }
        // eslint-disable-next-line
    }, [])


    const handleSubmit = useCallback((e)=>{
        e.preventDefault();
        if (!validate(roomId)) {
            toast.error('Invalid roomID');
            return;
        }
        if (!username) {
            toast.error('Please enter username');
            return;
        }
        socket.emit('room:join', {username, roomId})
    },[username,roomId,socket])
    const handleJoinRoom = useCallback((data) =>{
        const {username, roomId} = data
        navigate(`/room/${roomId}`, { state: { username } })
     },[navigate])
     useEffect(() =>{
        socket.on('room:join',handleJoinRoom);
        return () =>{
          socket.off('room:join')
        }
       },[socket, handleJoinRoom]);
    const createRoomId = () => {
        try {
            setRoomId(uuidv4());
            toast.success('Room Created');
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Layout>
            <div className="joinBoxWrapper">
                <form className="joinBox" onSubmit={handleSubmit}>
                    <p>Paste your invitation code down below</p>
                    <div className='joinBoxInputWrapper'>
                        <input
                            type="text"
                            className='joinBoxInput'
                            id='roomIdInput'
                            placeholder='Enter Room ID'
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                        <label htmlFor="roomIdInput" className='joinBoxWarning'>
                            {roomId ? '' : 'Room ID required'}
                        </label>
                    </div>
                    <div className='joinBoxInputWrapper'>
                        <input
                            type="text"
                            className='joinBoxInput'
                            id='usernameInput'
                            placeholder='Enter Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="usernameInput" className='joinBoxWarning'>
                            {username ? '' : 'Room ID required'}
                        </label>
                    </div>
                    <button type='submit' className='joinBoxBtn'>Join</button>
                    <p>Don't have invite code?
                        Create your <span onClick={createRoomId} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                            own room</span></p>
                </form>
                <Toaster />
            </div>
        </Layout>
    )
}

export default JoinRoom
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AceEditor from 'react-ace'
import { useNavigate, useParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import './Room.css'
//import io from 'socket.io-client'
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/keybinding-emacs";
import "ace-builds/src-noconflict/keybinding-vim";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import { ChatBot } from '../ChatBot'
import { useSocket } from '../../context/SocketProvider'
import peer from "../../services/peer";
import ReactPlayer from "react-player";
import RoomHeader from '../Layout/RoomHeader'

const Room = () => {
    // const [socket,setsocket]=useState();
    // useEffect(()=>{
    //             const socket = io('http://localhost:8080');
    //     console.log(socket);
    //    setsocket(socket)      
    //             return ()=>{
    //     setsocket(null);
    //             }
    //         },[])
    const navigate = useNavigate();
    const socket = useSocket();
    const { roomId } = useParams()
    const [language, setLanguage] = useState('javascript');
    const [codeKeyBinding, setCodeKeyBinding] = useState(undefined);
    const [fetchedUsers, setFetchedUsers] = useState([]);

    const languagesAvailable = ["javascript", "typescript", "python", "java", "yaml", "golang", "c_cpp", "html", "css"]
    const codeKeyBindingsAvailable = ["default", "emacs", "vim"];

    const [code, setcode] = useState("");

    const AceEditorRef = useRef(null);

    const [input, setinput] = useState('');

    const [output, setoutput] = useState('');
    var qs = require('qs');

    const handleLanguage = (e) => {
        setLanguage(e.target.value);
    }
    const handleCodeKeyBinding = (e) => {
        setCodeKeyBinding(e.target.value === 'default' ? undefined : e.target.value);
    }

    const generateRandomColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xff;
            color += value.toString(16).padStart(2, '0');
        }
        return color;
    }
    const copyToClipboard = (text) => {
        try {
            navigator.clipboard.writeText(text)
            toast.success('Copied to clipboard')
        } catch (error) {
            console.log(error)
        }
    }
    function handleChange(change) {
        setcode(change);
        if (socket) {
            socket.emit('codechange', { code: change })
        }
    }
    useEffect(() => {
        if (socket !== null) {
            socket.on('codeadded', (codeData) => {
                console.log(codeData.code);
                const newText = codeData.code
                setcode(newText);
            })
            socket.on('outputchange', (outputData) => {
                setoutput(outputData)
            })
            socket.on('inputchange', (inputData) => {
                setinput(inputData)
            })
        }
    })

    useEffect(() => {
        if (output && socket) {
            socket.emit('outputchange', output);
        }
    }, [output, socket])

    function InputHandler(event) {
        socket.emit('inputchange', event.target.value);
        setinput(event.target.value)
    }

    const compile = () => {
        var data = qs.stringify({
            'code': code,
            'language': language,
            'input': input
        });
        console.log(data);

        console.log(code);
        var config = {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        };
        fetch('https://api.codex.jaagrav.in', config)
            .then(res => res.json())
            .then(data => {
                if (data['error'].length == 0) {
                    // setTc(true)
                    setoutput(data['output']);

                    toast.success("compiled sucessfully")
                    console.log(data['output']);
                    // setOutput(data['output'])
                }
                else {
                    // setTc(false)
                    toast.error("compilation error")
                    setoutput(data['error'])
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);
    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            console.log("Incoming call", from, offer);
            const ans = await peer.getAnswer(offer);
            socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
    );
    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream])
    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans);
            console.log("Call Accepted");
            sendStreams();
        },
        [sendStreams]
    );

    const handleLeave = () => {
        socket.disconnect()
        !socket.connected && navigate('/', { replace: true, state: {} })
    }

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [socket, remoteSocketId]);
    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);
    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
    },
        [socket]
    );
    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);
    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const RemoteStream = ev.streams;
            console.log("GOT TRACKS!!")
            setRemoteStream(RemoteStream[0]);
        });
    }, []);
    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncoming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [
        socket,
        handleUserJoined,
        handleIncomingCall,
        handleCallAccepted,
        handleNegoNeedIncoming,
        handleNegoNeedFinal,
    ]);



    return (
        <div className='room'>
            <div class="container">
                <div class="toppane">
                    <RoomHeader
                        handleLanguage={handleLanguage}
                        language={language}
                        languagesAvailable={languagesAvailable}
                        codeKeyBinding={codeKeyBinding}
                        handleCodeKeyBinding={handleCodeKeyBinding}
                        codeKeyBindingsAvailable={codeKeyBindingsAvailable}
                        fetchedUsers={fetchedUsers}
                        generateRandomColor={generateRandomColor}
                        copyToClipboard={copyToClipboard}
                        roomId={roomId}
                        compile={compile}
                        handleLeave={handleLeave}
                    />
                </div>
                <div class="leftpane">
                    {/* left */}
                    <div className="roomSidebar">
                        <div className="roomSidebarUsersWrapper">
                            <div className="roomSidebarHeading px-6 py-4">
                                <p>Connected Users:</p>
                            </div>
                            <div className="roomSidebarUsers py-4 px-6">
                                {
                                    fetchedUsers.map((eachUser) => (
                                        <div
                                            key={eachUser}
                                            className="roomSidebarUsersEach"
                                        >
                                            <div
                                                className='roomSidebarUsersEachAvatar'
                                                style={{
                                                    backgroundColor: `${generateRandomColor(eachUser)}`,
                                                }}
                                            >
                                                {eachUser.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className='roomSidebarUsersEachName'>{eachUser}</div>
                                        </div>
                                    )
                                    )
                                }
                            </div>
                            <ChatBot socket={socket} />
                        </div>
                    </div>
                </div>
                <div class="middlepane">
                    {/* middle */}
                    <div className="coding">
                        <AceEditor
                            ref={AceEditorRef}
                            setOptions={{ useWorker: false }}
                            placeholder='Write your code here'
                            className='roomCodeEditor'
                            mode={language}
                            keyboardHandler={codeKeyBinding}
                            theme='monokai'
                            name='collabEditor'
                            width='auto'
                            height='600px'
                            fontSize={15}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            enableLiveAutocompletion={true}
                            enableBasicAutocompletion={false}
                            enableSnippets={false}
                            wrapEnabled={true}
                            tabSize={2}
                            editorProps={{
                                $blockScrolling: true
                            }}
                            value={code}
                            onChange={(change) => handleChange(change)}
                        />
                        <div className="op">
                            <textarea
                                type="text"
                                id="input"
                                name="input"
                                placeholder='input'
                                value={input}
                                onChange={InputHandler}>
                            </textarea>
                            <br />
                            <textarea
                                type="text"
                                id="output"
                                name="output"
                                placeholder='output'
                                value={output}>
                            </textarea>
                        </div>
                    </div>
                </div>
                <div class="rightpane">
                    {/* right */}
                    <div className="roomSidebar">
                        <div className="roomSidebarUsersWrapper">
                            <h1>RoomPage</h1>
                            <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
                            {myStream && <button className="bt" onClick={sendStreams}>Send Stream</button>}
                            {remoteSocketId && <button className="bt" onClick={handleCallUser}>CALL</button>}
                            {myStream && (
                                <>
                                    <h1>My Stream</h1>
                                    <ReactPlayer
                                        playing
                                        muted
                                        height="200px"
                                        width="200px"
                                        url={myStream}
                                    />
                                </>
                            )}
                            {remoteStream && (
                                <>
                                    <h1>Remote Stream</h1>
                                    <ReactPlayer
                                        playing
                                        muted
                                        height="200px"
                                        width="200px"
                                        url={remoteStream}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    )
}

export default Room
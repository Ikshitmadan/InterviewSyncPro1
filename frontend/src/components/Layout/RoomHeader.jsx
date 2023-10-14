import React, { useEffect, useState, useContext } from "react";
import {
    Navbar,
    Typography,
    Button,
    MobileNav,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { LoginContext } from "../../context/LoginContext";

const RoomHeader = ({ handleLanguage, language, languagesAvailable, codeKeyBinding, handleCodeKeyBinding, codeKeyBindingsAvailable, copyToClipboard, roomId, compile, handleLeave }) => {
    const { setModalOpen } = useContext(LoginContext);
    const [openNav, setOpenNav] = useState(false);

    useEffect(() => {
        window.addEventListener(
            "resize",
            () => window.innerWidth >= 960 && setOpenNav(false),
        );
    }, []);

    return (
        <Navbar className="mx-auto max-w-screen-xl px-4 lg:py-4">
            <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
                <h1
                    className="mr-4 cursor-pointer py-1.5 font-bold"
                >
                    InterviewSyncPro
                </h1>

                <div className="roomSidebar">
                    <div className="navbarCenter">
                        <div className="languageFieldWrapper">
                            <select
                                className='languageField'
                                name="language"
                                id="language"
                                onChange={handleLanguage}
                                value={language}
                            >
                                {
                                    languagesAvailable.map((lang) => {
                                        return (
                                            <option key={lang} value={lang}>{lang}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div className="languageFieldWrapper">
                            <select
                                className='languageField'
                                name="codeKeyBinding"
                                id="codeKeyBinding"
                                value={codeKeyBinding}
                                onChange={handleCodeKeyBinding}
                            >
                                {
                                    codeKeyBindingsAvailable.map((each) => {
                                        return (
                                            <option key={each} value={each}>{each}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <Button
                            variant="outlined"
                            size="sm"
                            className='roomSidebarCopyBtn roomSidebarBtn rounded-full'
                            onClick={() => {
                                copyToClipboard(roomId)
                                console.log(roomId)
                            }}
                        >
                            <span>Room ID</span>
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            className='roomSidebarBtn rounded-full'
                            onClick={() => handleLeave()}
                        >
                            <span>Leave</span>
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={compile}
                            className='roomSidebarBtn rounded-full'
                        >
                            <span>Run</span>
                        </Button>
                    </div>
                </div>
                <Link>
                    <Button
                        variant="gradient"
                        size="sm"
                        className="hidden lg:inline-block"
                        onClick={() => setModalOpen(true)}
                    >
                        <span>Logout</span>
                    </Button>
                </Link>
            </div>
            <MobileNav open={openNav}>
                <div className="container mx-auto">
                    <Link>
                        <Button
                            variant="gradient"
                            size="sm"
                            fullWidth
                            className="mb-2"
                            onClick={() => setModalOpen(true)}
                        >
                            <span>Logout</span>
                        </Button>
                    </Link>
                </div>
            </MobileNav>
        </Navbar>
    );
}

export default RoomHeader
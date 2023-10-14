import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSumbit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/register', {
                name,
                email,
                password
            });
            console.log(res.data)
            if (res && res.data.success) {
                toast.success(res.data.message);
                navigate('/login');
            }
            else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong');
        }
    }

    return (
        <>
            <div className="grid h-screen place-items-center">
                <form
                    className="w-full max-w-sm border-solid border-2 border-purple-500 rounded"
                    onSubmit={handleSumbit}
                >
                    <h1 className='text-gray-500 font-bold flex items-center justify-center m-10 text-2xl'>Create New Account</h1>
                    <div className="flex items-center justify-center mb-6">
                        <div className="md:w-2/3">
                            <input
                                type="text"
                                name='name'
                                id='name'
                                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                                placeholder='Enter Your Name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="md:w-2/3">
                            <input
                                type="email"
                                name='email'
                                id='email'
                                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                                placeholder='Enter Your Email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="md:w-2/3">
                            <input
                                type="password"
                                name='password'
                                id='password'
                                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                                placeholder='Enter Your Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center justify-center">
                            <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="submit">
                                Sign Up
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        Already have an Account ?
                        <Link to='/login'><span style={{ color: 'blue', cursor: 'pointer' }}> Sign In</span></Link>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Signup
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import LoginGoogle from './LoginGoogle';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { message } from 'antd';
import authApi from '../../../api/authApi';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../../assets/images/image1.png';

function Login() {
    const googleRef = useRef(null);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">


            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />


            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black" />


            <LoginGoogle ref={googleRef} />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">

                <div className="w-full max-w-sm space-y-8">


                    <div className="space-y-2 text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-white">
                            Rout<span className="text-lime-400">in</span>
                        </h1>

                        <p className="text-sm text-zinc-300">
                            Discover millions of{' '}
                            <span className="font-semibold text-lime-400">
                                smart habits
                            </span>{' '}
                            shared daily.
                        </p>
                    </div>

                    <div className="space-y-4">

                        <Link
                            to="/login-email"
                            className="flex h-12 w-full items-center justify-center rounded-full bg-lime-400 text-sm font-semibold text-black transition-all hover:bg-lime-500"
                        >
                            Login
                        </Link>

                        <div className="space-y-3">


                            <button
                                onClick={() => googleRef.current?.triggerLogin()}
                                className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-black/30 text-sm font-medium hover:bg-black/50"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <button className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-black/30 text-sm font-medium hover:bg-black/50">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    f
                                </span>
                                Continue with Facebook
                            </button>

                            <button className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-black/30 text-sm font-medium hover:bg-black/50">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-black">

                                </span>
                                Continue with Apple
                            </button>

                        </div>

                        {/* Signup */}
                        <div className="pt-2 text-center">
                            <Link
                                to="/signup"
                                className="text-sm text-zinc-300 underline-offset-4 hover:underline"
                            >
                                Sign up
                            </Link>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Login;

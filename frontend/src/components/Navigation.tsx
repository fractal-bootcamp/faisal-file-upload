import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { NavLink } from 'react-router-dom'

const Navigation = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">FileShare</h1>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <SignedIn>
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500'} 
                    inline-flex items-center px-1 pt-1 border-b-2`
                                    }
                                >
                                    Home
                                </NavLink>
                                <NavLink
                                    to="/files"
                                    className={({ isActive }) =>
                                        `${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500'} 
                    inline-flex items-center px-1 pt-1 border-b-2`
                                    }
                                >
                                    Files
                                </NavLink>
                            </SignedIn>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-gray-500 hover:text-gray-900">
                                    Sign in
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navigation

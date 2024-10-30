import { SignedIn } from '@clerk/clerk-react'

const Files: React.FC = () => {
    return (
        <SignedIn>
            <div className="py-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Your Files
                </h1>
                <p className="text-gray-500 mt-4">
                    You don't have any files yet.
                </p>
            </div>
        </SignedIn>
    )
}

export default Files 
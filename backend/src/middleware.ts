// Import required types and dependencies
import type { Request, Response, NextFunction } from 'express'
import { getAuth, clerkClient } from '@clerk/express'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client instance for database operations
const prisma = new PrismaClient();

// Middleware function to handle authentication and user management
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the authenticated user ID from Clerk
        const { userId } = getAuth(req)
        console.log('Auth middleware - userId:', userId)

        // If no user ID is found, return unauthorized error
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized, Login to continue' })
            return
        }

        // Fetch the user details from Clerk's authentication service
        const clerkUser = await clerkClient.users.getUser(userId)
        console.log('Auth middleware - clerkUser:', clerkUser.id)

        let user = await prisma.user.findUnique({
            where: { clerkId: userId }
        })

        // If user doesn't exist in our database, create a new user record
        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
                    firstName: clerkUser.firstName,
                    password: ''
                }
            })
            console.log('Auth middleware - new user created:', user.id)
        }

        (req as any).user = user
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
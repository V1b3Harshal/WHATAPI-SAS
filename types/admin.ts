export interface User {
    _id: string
    name: string
    email: string
    emailVerified?: Date
    onboarded: boolean
    banned: boolean
    createdAt: string
    lastSeen?: string
  }
  
  export interface OnlineSessions {
    [userId: string]: string
  }
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'manager' | 'support'
      supabase_token: string
    } & DefaultSession["user"]
  }
}

import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      firstName: string
      lastName: string
      company: string
      email: string
      supabase_token: string
    } & DefaultSession["user"]
  }
}

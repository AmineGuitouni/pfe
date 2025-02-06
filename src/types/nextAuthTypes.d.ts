import {} from "next-auth"

declare module "next-auth" {
  interface Session {
    user: User
  }

  interface User {
    id: string
    role: string
    first_name: string
    last_name: string
    company: string
    email: string
    supabase_token: string
  }
}

import {} from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      name: string
      first_name: string
      last_name: string
      company: string
      email: string
      supabase_token: string
      email_verified: boolean
      image?: string | null
      country: string
      phone_number : string
      company_id?: string | null
      cv_informations ?: string | null
    }
  }

  interface User {
    id: string
    role: string
    first_name: string
    last_name: string
    company: string
    country: string
    email: string
    email_verified: boolean
    phone_number: string
    company_id?: string | null
    cv_informations ?: string | null
  }
}

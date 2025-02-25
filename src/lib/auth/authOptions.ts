import {AuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import { getUser } from "./helper";

export const authOptions:AuthOptions = {
    providers:[
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "text"},
                password: { label: "Password", type: "password" },
                company: {type: "text"}
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error("invalid credentials")
                }

                const user = await getUser(credentials)

                if(!user || !user.password_hash){
                    throw new Error("invalid credentials")
                }
                
                const validPass = await bcrypt.compare(
                    credentials.password,
                    user.password_hash
                )

                if(!validPass){
                    throw new Error("invalid credentials")
                }
                
                return user
            }
        }),
    ],
    session:{
        strategy: "jwt",
        maxAge: 60 * 60 * 6,
    },
    jwt: {
        maxAge: 60 * 60 * 10
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks:{
        async session({session, token}){
            session.user.id = token.sub as string
            session.user.role = token.role as string
            session.user.email = token.email as string
            session.user.name = token.name as string
            session.user.first_name = token.first_name as string
            session.user.last_name = token.last_name as string
            session.user.email_verified = token.email_verified as boolean
            session.user.country = token.country as string
            session.user.phone_number = token.phone_number as string

            const supabaseTokenPayload = {
                sub: session.user.id,
                role:"authenticated",
                user_metadata:{
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    role: session.user.role
                },
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10),
            }

            session.user.supabase_token = jwt.sign(supabaseTokenPayload, process.env.SUPABASE_JWT_SECRET!)

            return session
        },
        async jwt({token, user, trigger}){
            if(!token.sub){
                throw new Error("invalid token")
            }

            if(!user){
                if(trigger === "update"){
                    user = await getUser({email: token.email as string})
                }
                else{
                    return token
                }
            }
            
            if(!user || !user.first_name || !user.email || !user.last_name){
                throw new Error("invalid user")
            }

            token.name = user.first_name + " " + user.last_name
            token.first_name = user.first_name
            token.last_name = user.last_name
            token.email = user.email
            token.role = user.role ? user.role : "owner"
            token.email_verified = user.email_verified
            token.country = user.country
            token.phone_number = user.phone_number

            return token
        }
    }
}
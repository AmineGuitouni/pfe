import {AuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import bcrypt from "bcrypt";
import { supabase  } from "./database/supabase";
import jwt from 'jsonwebtoken'

export const authOptions:AuthOptions = {
    providers:[
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "text"},
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error("invalid credentials")
                }

                const { data: user , error} = await supabase.from("users")
                .select("*")
                .eq("email", credentials.email)
                .single() 
                
                if(error){
                    console.log(error)
                    throw new Error(error.message)
                }

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
            session.user.role = ""
            session.user.email = token.email as string
            session.user.name = token.name as string

            const supabaseTokenPayload = {
                sub: session.user.id,
                role:"authenticated",
                user_metadata:{
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                },
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10),
            }

            session.user.supabase_token = jwt.sign(supabaseTokenPayload, process.env.SUPABASE_JWT_SECRET!)

            return session
        },
        async jwt({token}){
            if(!token.sub){
                throw new Error("invalid token")
            }

            const {data: user, error} = await supabase.from("users")
            .select("*")
            .eq("id", token.sub)
            .single() as { data: dbDashboardUserType, error: any }
            
            if(error){
                console.log(error)
                throw new Error(error.message)
            }

            if(!user || !user.first_name || !user.email || !user.last_name){
                throw new Error("invalid user")
            }

            token.name = user.first_name + " " + user.last_name
            token.email = user.email

            return token
        }
    }
}
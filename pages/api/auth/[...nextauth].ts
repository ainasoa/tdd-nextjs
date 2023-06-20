import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import jwt from "jsonwebtoken";
import { Role } from "@/pages/lib/isGranted";

type CredentialType = {
  email: string;
  password: string;
};

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: CredentialType) => {
        // You need to replace this URL with your external API endpoint.
        const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/jwt/create/`;
        const payload = {
          email: credentials.email,
          password: credentials.password,
        };

        try {
          const response = await axios.post(apiBaseUrl, payload);
          console.log("response from server: ", response);

          if (response.data) {
            console.log("authorize method being executed...");
            console.log("response: ", response);
            let accessToken = response.data.access;
            let refreshToken = response.data.refresh;
            let is_owner = response.data.is_owner;
            let decoded: any = jwt.decode(accessToken);
            console.log("decoded: ", decoded);
            // Assuming the API response to be in this format: { "access_token": "...", "refresh_token": "...", ...otherUserFields }
            return {
              accessToken,
              refreshToken,
              expires_at: decoded.exp,
              user_id: decoded.userId,
              is_owner: is_owner,
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  // jwt: {
  //   maxAge: 24*60*60,
  // },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      console.log("jwt callback being executed...");
      console.log("token: ", token);
      console.log("user: ", user);
      if (user) {
        // token.accessToken = user.data.access
        // token.refreshToken = user.data.refresh
        // ...copy other fields from user if needed
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expires_at: user.expires_at,
          user_id: user.user_id,
          is_owner: user.is_owner,
        };
      } else if (Date.now() < token.expires_at * 1000 - 60000) {
        // If the access token has not expired yet, return it
        return token;
      } else {
        // If the access token has expired, try to refresh it
        const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/jwt/refresh/`;
        const payload = {
          refresh: token.refreshToken,
        };

        try {
          const response = await axios.post(apiBaseUrl, payload);

          if (response.data) {
            console.log("access token has expired...");
            console.log("response: ", response);
            let accessToken = response.data.access;
            let decoded: any = jwt.decode(accessToken);
            console.log("decoded: ", decoded);
            // Assuming the API response to be in this format: { "access_token": "...", "refresh_token": "...", ...otherUserFields }
            return {
              accessToken,
              refreshToken: token.refreshToken,
              expires_at: decoded.exp,
              user_id: decoded.userId,
              is_owner: token.is_owner,
              user: { role: "ADMIN" },
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Error refreshing access token", error);
          return null;
        }
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log("session callback being executed...");
      console.log("session: ", session);
      console.log("token: ", token);
      // session.accessToken = token.accessToken
      // session.refreshToken = token.refreshToken
      if (token) {
        return {
          user_id: token.user_id,
          is_owner: token.is_owner,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expires_at: token.expires_at,
          user: {
            role: Role.USER,
          },
        };
      }
      return null;
    },
  },
};

export default NextAuth(options);

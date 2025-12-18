import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

// Custom HCA OAuth provider
const HCAProvider = {
  id: 'hca',
  name: 'HCA',
  type: 'oauth' as const,
  authorization: {
    url: process.env.HCA_AUTHORIZATION_URL || 'https://hca.example.com/oauth/authorize',
    params: { scope: 'read:user' },
  },
  token: process.env.HCA_TOKEN_URL || 'https://hca.example.com/oauth/token',
  userinfo: process.env.HCA_USERINFO_URL || 'https://hca.example.com/oauth/userinfo',
  clientId: process.env.HCA_CLIENT_ID,
  clientSecret: process.env.HCA_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.avatar_url,
    };
  },
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user repo',
        },
      },
    }),
    HCAProvider as any,
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Fetch additional user data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            isAdmin: true,
            githubId: true,
            githubAccessToken: true,
            slackUserId: true,
          },
        });
        
        if (dbUser) {
          (session.user as any).isAdmin = dbUser.isAdmin;
          (session.user as any).githubId = dbUser.githubId;
          (session.user as any).hasGithubToken = !!dbUser.githubAccessToken;
          (session.user as any).slackUserId = dbUser.slackUserId;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'github' && account.access_token) {
        // Store GitHub access token
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: account.providerAccountId,
            githubAccessToken: account.access_token,
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      githubId?: string | null;
      hasGithubToken?: boolean;
      slackUserId?: string | null;
    };
  }
}

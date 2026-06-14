// GitHub OAuth strategy: finds or auto-creates a user on successful authentication.
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import type { Profile } from "passport-github2";
import User from "../models/User.js";

export const initGitHubStrategy = () => {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: process.env.GITHUB_CALLBACK_URL!,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any) => void,
      ) => {
        try {
          // Fall back to a synthetic email if GitHub doesn't expose the user's email.
          const email =
            profile.emails?.[0]?.value || `${profile.username}@github.com`;

          let user = await User.findOne({ email });

          if (!user) {
            // Auto-create account; password is a placeholder since auth is via GitHub.
            user = await User.create({
              email,
              username: profile.username || email.split("@")[0],
              password: "github-oauth",
              isVerified: true,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      },
    ),
  );
};

export default passport;

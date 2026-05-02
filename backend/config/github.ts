import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import type { Profile } from "passport-github2";
import User from "../models/User.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@github.com`;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            password: "github-oauth"
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
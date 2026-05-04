import passport from "passport";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import User from "../models/User.js";

export const initLinkedInStrategy = () => {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
        callbackURL: process.env.LINKEDIN_CALLBACK_URL!,
        scope: ["openid", "profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value || `${profile.id}@linkedin.local`;

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              email,
              password: "linkedin-oauth-user",
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      },
    ),
  );
};

export default passport;

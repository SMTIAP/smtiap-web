// LinkedIn OAuth strategy using OpenID Connect (openid, profile, email scopes).
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
        // OpenID Connect scopes required by LinkedIn's modern API.
        scope: ["openid", "profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Fall back to a synthetic email if LinkedIn doesn't expose the user's email.
          const email =
            profile.emails?.[0]?.value || `${profile.id}@linkedin.local`;

          let user = await User.findOne({ email });

          if (!user) {
            // Auto-create account; password is a placeholder since auth is via LinkedIn.
            user = await User.create({
              email,
              username: profile.displayName || email.split("@")[0],
              password: "linkedin-oauth-user",
              isVerified: true,
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

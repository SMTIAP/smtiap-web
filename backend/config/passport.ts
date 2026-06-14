// Google OAuth 2.0 strategy: finds or auto-creates a user on successful authentication.
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export const initGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          // Reject authentication if Google did not provide an email address.
          if (!email) return done(new Error("No email"), false);

          let user = await User.findOne({ email });

          if (!user) {
            // Auto-create account; password is a placeholder since auth is via Google.
            user = await User.create({
              email,
              username: profile.displayName || email.split("@")[0],
              password: "google-oauth",
              isVerified: true,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, false);
        }
      },
    ),
  );
};

export default passport;

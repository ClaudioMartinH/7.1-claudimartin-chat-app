import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import GoogleUserModel from "../src/models/googleUser.model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import GoogleUserModelMongoose from "../src/models/googleUser.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT;
console.log("Client ID:", process.env.CLIENT_ID);
console.log("Client Secret:", process.env.CLIENT_SECRET);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `http://localhost:${PORT}/api/users/auth/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        let user = await GoogleUserModelMongoose.findOne({
          googleId: profile.id,
        });

        if (!user) {
          user = new GoogleUserModelMongoose({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails ? profile.emails[0].value : "",
            profilePic: profile._json.picture || "",
          });
          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);
// Guardar el usuario en la sesión
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user._id);
});

// Recuperar el usuario a partir del ID en la sesión
passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await GoogleUserModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
);

export default passport;

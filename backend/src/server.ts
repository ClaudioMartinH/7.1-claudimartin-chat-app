import express from "express";
import logger from "morgan";
import { createServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./DB/connectMongoDB.js";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./infraestructure/routes/user.routes.js";
import messageRouter from "./infraestructure/routes/message.routes.js";
import roomRouter from "./infraestructure/routes/rooms.routes.js";
import { socketHandler } from "../utils/socketHandler.js";
import multer from "multer";
import { createMainRoom } from "../utils/createMainRoom.js";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import authMiddlewareJWT from "./middleware/auth.middleware.js";
import session from "express-session";
import passport from "../utils/passport.config.js";
import favicon from "serve-favicon";
import UserController from "./infraestructure/controllers/UserController.js";
import MongoStore from "connect-mongo";

dotenv.config();

const PORT = process.env.PORT || 3030;
const app = express();
const server = createServer(app);
const origin =
  process.env.NODE_ENV === "production"
    ? "https://7-1-claudimartin-chat-app.vercel.app"
    : `http://localhost:${PORT}`;

const io = new Server(server, {
  cors: {
    origin: `http://localhost:${PORT}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 5000,
  },
});

const userController = new UserController();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../../frontend");
const backendPath = path.resolve(__dirname, "../../../backend");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "profilePic", maxCount: 1 },
  { name: "userName" },
  { name: "fullName" },
  { name: "email" },
  { name: "password" },
]);
const sessionSecret = process.env.SESSION_SECRET || "defaultSecret";
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URI,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://code.jquery.com",
          "https://cdn.socket.io",
          "https://*.googleapis.com",
          "https://*.gstatic.com",
          "https://cdn.jsdelivr.net",
          "'unsafe-inline'",
        ],
        "script-src-attr": ["'self'", "'unsafe-inline'"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
        ],
        "img-src": [
          "'self'",
          "data:",
          "https://*.googleusercontent.com",
          "https://anonymous-animals.azurewebsites.net",
        ],
        "connect-src": [
          "*",
          "https://*.googleapis.com",
          "http://localhost:5050",
          "https://anonymous-animals.azurewebsites.net/",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "frame-ancestors": ["'self'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "object-src": ["'none'"],
        "frame-src": ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: [
      `http://localhost:${PORT}`,
      "https://7-1-claudimartin-chat-app.vercel.app",
      "https://7-1-claudimartin-chat-qj1v1ft6o-claudimartins-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(favicon(path.join(frontendPath, "public", "img", "favicon.ico")));
app.use(express.static(path.join(frontendPath, "public")));
app.use("/uploads", express.static(path.join(backendPath, "uploads")));
socketHandler(io);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong" });
  }
);

app.use("/api/users", userRouter);
app.use("/api/messages", authMiddlewareJWT, messageRouter);
app.use("/api/rooms", authMiddlewareJWT, roomRouter);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Error logging out" });
    }
    res.redirect("/");
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "public/pages/welcome.html"));
});
app.get("/api/users/login", (req, res) => {
  res.sendFile(path.join(frontendPath, "public/pages/login.html"));
});
app.get("/api/users/signup", (req, res) => {
  res.sendFile(path.join(frontendPath, "public/pages/signup.html"));
});
app.get("/chat", authMiddlewareJWT, (req, res) => {
  res.sendFile(path.join(frontendPath, "public/pages/main.html"));
});
app.get("/settings", authMiddlewareJWT, (req, res) => {
  res.sendFile(path.join(frontendPath, "public/pages/settings.html"));
});

app.get("/api/users/auth/google", (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});
app.get(
  "/api/users/auth/google/callback",
  (req, res, next) => {
    res.clearCookie("authToken");
    next();
  },
  (req, res, next) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/" },
      async (err, user, info) => {
        if (err) {
          console.error("Error during Google authentication: ", err);
          return res.redirect("/");
        }
        if (!user) {
          console.log("No user authenticated, redirecting to login");
          return res.redirect("/");
        }
        req.logIn(user, async (err) => {
          if (err) {
            console.error("Error during login after authentication: ", err);
            return res.redirect("/");
          }
          console.log("User successfully authenticated");
          try {
            await userController.googleUserLogin(req, res);
            console.log("Aqui hace el google login");
          } catch (error) {
            console.error("Error handling Google callback: ", error);
            if (!res.headersSent) {
              console.log("Aqui envia a login porque no hay res.headerssent");
              res.redirect("/api/users/login");
            }
          }
        });
      }
    )(req, res, next);
  }
);

server.listen(PORT, () => {
  connectToMongoDB();
  createMainRoom();
  console.log(`Server is running on port ${PORT}`);
});

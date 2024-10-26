// @ts-ignore
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

window.addEventListener("DOMContentLoaded", () => {
  const userNameInput = document.getElementById("userName") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const formData = document.getElementById(
    "form-data"
  ) as HTMLFormElement | null;

  if (!userNameInput || !passwordInput || !formData) {
    console.error("Todos los campos son necesarios");
    return;
  }
  const socket = io();

  const emitUserConnected = (
    userId: string,
    userName: string,
    userType: "registered" | "guest" | "google",
    profilePic: string
  ) => {
    console.log(`Emitiendo evento 'user connected':`, {
      userId,
      userName,
      userType,
      profilePic,
    });
    socket.emit("user connected", { userId, userName, userType, profilePic });
  };

  formData.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userName = userNameInput.value.trim();
    const password = passwordInput.value.trim();
    const userType = "registered";

    if (!userName || !password) {
      console.error("Nombre de usuario y contraseña son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5050/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password, userType }),
        credentials: "include",
      });

      if (!response.ok) {
        const responseData = await response.json();
        alert("Error en las credenciales");
        console.error(responseData.error || "Algo salió mal durante el acceso");
        return;
      }

      const responseData = await response.json();
      const profilePic = responseData.profilePic;
      const { token, userId } = responseData;

      if (token && userId) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);
        localStorage.setItem("profilePic", profilePic);
        localStorage.setItem("userType", userType);
        console.log("Token recibido:", token);
        console.log(`localstorage.setItem de userType = ${userType}`);
        console.log(`localstorage.setItem de profilepic = ${profilePic}`);
        emitUserConnected(userId, userName, userType, profilePic);
        window.location.href = window.location.href = "/chat";
      } else {
        console.error("Token no recibido en la respuesta");
      }
    } catch (error) {
      console.error(
        "Error interno al intentar conectar con el servidor",
        error
      );
    }
  });

  const guestLoginButton = document.getElementById("guestLoginButton");
  if (guestLoginButton) {
    guestLoginButton.addEventListener("click", async () => {
      const userType = "guest";
      try {
        const response = await fetch(
          `http://localhost:5050/api/users/guest-login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const responseData = await response.json();
          console.error(
            responseData.error ||
              "Algo salió mal durante el acceso como invitado"
          );
          return;
        }

        const responseData = await response.json();
        const profilePic = responseData.profilePic;
        const { token, userId, userName } = responseData;

        if (token && userId && userName) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userId", userId);
          localStorage.setItem("userName", userName);
          localStorage.setItem("profilePic", profilePic);
          localStorage.setItem("userType", userType);
          console.log("Token recibido:", token);
          emitUserConnected(userId, userName, userType, profilePic);
          window.location.href = "/chat";
        } else {
          console.error("Token no recibido en la respuesta");
        }
      } catch (error) {
        console.error(
          "Error interno al intentar conectar con el servidor",
          error
        );
      }
    });
  } else {
    console.error("Botón de acceso como invitado no encontrado");
  }

  const googleLoginButton = document.getElementById("googleLoginButton");
  if (googleLoginButton) {
    googleLoginButton.addEventListener("click", () => {
      window.location.href = `http://localhost:5050/api/users/auth/google`;
    });
  } else {
    console.error("Botón de inicio de sesión con Google no encontrado");
  }
});

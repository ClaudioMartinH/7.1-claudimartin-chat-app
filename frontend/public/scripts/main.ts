// @ts-ignore
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io("http://localhost:5050", {
  transports: ["websocket"],
});
document.addEventListener("DOMContentLoaded", () => {
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }
  const cookiesToken = getCookie("authToken");
  const cookiesUserId = getCookie("userId");
  const cookiesUserName = getCookie("userName");
  if (cookiesToken) localStorage.setItem("authToken", cookiesToken);
  if (cookiesUserId) localStorage.setItem("userId", cookiesUserId);
  if (cookiesUserName) localStorage.setItem("userName", cookiesUserName);
  const token = localStorage.getItem("authToken");
  console.log("Token recibido: ", token);
  if (!token) {
    window.location.href = "api/users/login";
  }

  function getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  }

  const roomInput = getElementById<HTMLInputElement>("roomInput");
  const searchRoomButton = getElementById<HTMLButtonElement>("searchRoom");
  const createRoomButton = getElementById<HTMLButtonElement>("createRoom");
  const joinRoomButton = getElementById<HTMLButtonElement>("joinRoom");
  const logoutButton = getElementById<HTMLButtonElement>("logoutButton");
  const settingsButton = getElementById<HTMLButtonElement>("settingsButton");
  const configMenu = getElementById<HTMLUListElement>("configMenu");
  const editButton = getElementById<HTMLButtonElement>("editButton");
  const submitButton = getElementById<HTMLButtonElement>("submitButton");
  const deleteButton = getElementById<HTMLButtonElement>("deleteButton");
  const formContainer = getElementById<HTMLDivElement>("formContainer");
  const backToChatButton =
    getElementById<HTMLButtonElement>("backToChatButton");
  const backToChatButton2 =
    getElementById<HTMLButtonElement>("backToChatButton2");
  const searchUsers = getElementById<HTMLInputElement>("searchUsers");
  const usersList = getElementById<HTMLUListElement>("users-online");
  const searchUsersButton =
    getElementById<HTMLButtonElement>("searchUsersButton");
  const searchUsersForm = getElementById<HTMLFormElement>("search-users-form");
  const messages = getElementById<HTMLUListElement>("messages");
  const form = getElementById<HTMLFormElement>("form");
  const input = getElementById<HTMLInputElement>("input");
  const roomNameElement = getElementById<HTMLElement>("roomName");
  const roomsList = getElementById<HTMLUListElement>("rooms-list");
  const updateFullName = getElementById<HTMLInputElement>("fullName");
  const updateUserName = getElementById<HTMLInputElement>("userName");
  const updatePassword = getElementById<HTMLInputElement>("password");
  const updateConfirmPassword =
    getElementById<HTMLInputElement>("confirmPassword");
  const updateEmail = getElementById<HTMLInputElement>("email");
  const updateProfilePic = getElementById<HTMLInputElement>("profilePic");

  const debounce = (func: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  type Message = {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
  };
  const displayMessage = (msg: Message, isSent: boolean) => {
    const dateNow = new Date();
    const hours = String(dateNow.getHours()).padStart(2, "0");
    const minutes = String(dateNow.getMinutes()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;
    const messageClass = isSent ? "sent" : "received";
    const senderNameDisplay = isSent ? "Tu" : msg.senderName;
    const itemHTML = `
      <li class="message${messageClass}">     ${msg.content} <br>
      <span class="senderSpan">${senderNameDisplay} a las ${formattedTime}</span>
      </li>`;

    if (messages) {
      //console.log("Añadiendo mensajes a la UI", itemHTML);
      messages.insertAdjacentHTML("beforeend", itemHTML);
      messages.scrollTop = messages.scrollHeight;
    } else {
      console.error("Messages element not found");
    }
  };

  if (
    !roomInput ||
    !searchRoomButton ||
    !createRoomButton ||
    !joinRoomButton ||
    !logoutButton ||
    !settingsButton ||
    !configMenu ||
    !editButton ||
    !submitButton ||
    !deleteButton ||
    !formContainer ||
    !backToChatButton ||
    !backToChatButton2 ||
    !searchUsers ||
    !usersList ||
    !searchUsersButton ||
    !searchUsersForm ||
    !form ||
    !roomsList ||
    !updateFullName ||
    !updateUserName ||
    !updateEmail ||
    !updatePassword ||
    !updateConfirmPassword ||
    !updateProfilePic
  ) {
    console.error("Error: Document elements not found");
  } else {
    const currentUserId = localStorage.getItem("userId");
    console.log("Current user id: ", currentUserId);
    const currentUserName = localStorage.getItem("userName");
    console.log("Current user name: ", currentUserName);

    if (!currentUserId || !currentUserName) {
      console.error("User ID or User Name not found. Please log in.");
      window.location.href = "api/users/login";
    } else {
      socket.on("connect_error", (err: any) => {
        console.error("Socket connection error:", err);
      });

      socket.on("connect", () => {
        console.log("Connected to Socket.io server");
        const urlParams = new URLSearchParams(window.location.search);
        let roomName = urlParams.get("roomName");
        const currentUserName = localStorage.getItem("userName");
        const currentUserType = localStorage.getItem("userType");
        const currentUserProfilePic = localStorage.getItem("profilePic");

        if (!roomName) {
          roomName = "Principal";
          console.log(`Room Name not found, defaulting to: ${roomName}`);
        }
        if (roomNameElement) {
          roomNameElement.textContent = `${currentUserName} Bienvenid@ a Sala ${roomName}`;
        }

        console.log("Joining room:", roomName);
        console.log("Current user ID:", localStorage.getItem("userId"));
        console.log("Current user name:", currentUserName);
        console.log("Current userType in frontend: ", currentUserType);
        console.log("Current profile pic in frontend: ", currentUserProfilePic);
        socket.emit("join room", {
          roomName,
          userId: localStorage.getItem("userId"),
          userName: currentUserName,
          userType: currentUserType,
          profilePic: currentUserProfilePic,
        });

        socket.emit("user connected", {
          userId: currentUserId,
          userName: currentUserName,
          userType: currentUserType,
          profilePic: currentUserProfilePic,
        });
      });

      socket.on(
        "active users",
        (
          users: { userName: string; userType: string; profilePic: string }[]
        ) => {
          console.log("Usuarios activos recibidos:", users);
          const usersList = document.getElementById("users-online");
          if (usersList) {
            usersList.innerHTML = "";
            users.forEach((user) => {
              const whoOnline =
                user.userName === currentUserName ? "Tu" : `${user.userName}`;
              const currentProfilePic = user.profilePic
                ? `${user.profilePic}`
                : `https://anonymous-animals.azurewebsites.net/avatar/${user.userName}`;
              const itemHTML = `
            <li class="badge d-flex p-0 align-items-center text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-pill">
               <img src="${currentProfilePic}" class="profile-pic" alt="${whoOnline}"> ${whoOnline} en línea
            </li>`;
              usersList.insertAdjacentHTML("beforeend", itemHTML);
            });
            usersList.scrollTop = usersList.scrollHeight;
          }
        }
      );

      socket.on(
        "chat message",
        (msg: {
          senderId: string;
          content: string;
          senderName: string;
          roomName: string;
        }) => {
          console.log("Received message:", msg);

          const currentUserId = localStorage.getItem("userId");
          const currentRoomName =
            new URLSearchParams(window.location.search).get("roomName") ||
            "Principal";
          console.log("Current room:", currentRoomName);

          if (!currentUserId) {
            console.error("User ID not found. Please log in.");
            return;
          }
          if (msg.roomName !== currentRoomName) {
            console.log(
              `Message received for room ${msg.roomName}, but current room is ${currentRoomName}. Ignoring message.`
            );
            return;
          }
          const isSentByMe = msg.senderId === currentUserId;
          displayMessage(
            {
              id: "",
              senderId: msg.senderId,
              senderName: msg.senderName,
              content: msg.content,
            },
            isSentByMe
          );
        }
      );
      socket.on(
        "rooms-available",
        (data: { roomName: string; isPrivate: boolean }[]) => {
          console.log("Received rooms:", data, typeof data);
          if (Array.isArray(data)) {
            const roomsList = document.getElementById(
              "rooms-list"
            ) as HTMLUListElement;
            if (roomsList) {
              roomsList.innerHTML = "";
              data.forEach((room) => {
                if (room.isPrivate !== true) {
                  const itemHTML = `<li  class="badge text-bg-primary rounded-pill">${room}</li>`;
                  roomsList.insertAdjacentHTML("beforeend", itemHTML);
                }
              });
              roomsList.scrollTop = roomsList.scrollHeight;
            } else {
              console.error("Could not find element with id 'rooms-list'.");
            }
          } else {
            console.error("Expected data to be an array, but got:", data);
          }
        }
      );

      socket.on("chat-history", (messages: Message[]) => {
        if (Array.isArray(messages)) {
          const messagesList = document.getElementById("messages");
          if (messagesList) {
            messagesList.innerHTML = "";
          }
          messages.forEach((message) => {
            const isSentByMe = message.senderName === currentUserName;
            displayMessage(message, isSentByMe);
          });
        }
      });
      socket.on("disconnect", () => {
        console.log("Disconnected from Socket.io server");
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentRoomName =
          new URLSearchParams(window.location.search).get("roomName") ||
          "Principal";
        if (input && input.value) {
          const message = {
            userId: currentUserId,
            senderName: currentUserName,
            content: input.value,
            roomName: currentRoomName,
          };
          console.log("Sending message:", message);
          displayMessage(
            {
              id: "",
              senderId: currentUserId,
              senderName: currentUserName,
              content: input.value,
            },
            true
          );
          socket.emit("chat message", message);
          input.value = "";
        }
      });
      searchRoomButton.addEventListener("click", async () => {
        const roomName = roomInput.value.trim();
        if (roomName) {
          try {
            const response = await fetch(`/api/rooms/name/${roomName}`);
            const data = await response.json();
            if (response.ok) {
              showToast(`Sala ${roomName} encontrada, redirigiendo`);
              window.location.href = `/chat?roomName=${data.name}`;
            } else {
              console.error("Room not found");
              showToast("Sala no encontrada");
            }
          } catch (error) {
            console.error("Error searching room:", error);
          }
        } else {
          console.error("Room name is required");
          showToast("Error buscando la sala, se requiere un nombre");
        }
      });

      createRoomButton.addEventListener("click", async () => {
        const roomName = roomInput.value.trim();
        if (!roomName) {
          console.error("Room name is required");
        } else {
          try {
            const response = await fetch("/api/rooms/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify({ name: roomName, isPrivate: false }),
            });
            console.log(`Response Status-->, ${response.status}`);
            const data = await response.json();
            if (response.ok && data.id) {
              window.location.assign(`/chat?roomName=${data.name}`);
            } else {
              console.error("Error creating room:", data.error);
            }
          } catch (error) {
            console.error("Error creating room:", error);
          }
        }
      });

      joinRoomButton.addEventListener("click", (e) => {
        e.preventDefault();
        const roomName = roomInput.value.trim();
        if (roomName) {
          window.location.assign(
            `/chat?roomName=${encodeURIComponent(roomName)}`
          );
        } else {
          console.error("Room name is required");
        }
      });
      logoutButton.addEventListener("click", (e) => {
        e.preventDefault();

        window.localStorage.removeItem("token");
        window.location.href = "api/users/login";
      });

      submitButton.addEventListener("click", async function () {
        const userId = localStorage.getItem("userId");
        const userName = updateUserName.value.trim();
        const fullName = updateFullName.value.trim();
        const email = updateEmail.value.trim();
        const password = updatePassword.value.trim();
        const confirmPassword = updateConfirmPassword.value.trim();
        if (password !== confirmPassword) {
          showToast("Las contraseñas no coinciden", "error");
          console.error("Las contraseñas no coinciden");
          return;
        }
        if (
          !updateProfilePic ||
          !updateProfilePic.files ||
          updateProfilePic.files.length === 0
        ) {
          showToast("Debes seleccionar una imagen de perfil", "error");
          console.error("Debes seleccionar una imagen de perfil");
          return;
        }

        const profilePic = updateProfilePic.files[0];
        const formData = new FormData();
        formData.append("userName", userName);
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("password", password);
        if (profilePic) {
          formData.append("profilePic", profilePic);
        }

        try {
          const response = await fetch(`/api/users/update/${userId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: formData,
          });

          if (response.ok) {
            console.log("Usuario actualizado con éxito");
            alert("Usuario actualizado con éxito");
            window.location.reload();
          } else {
            console.error(
              "Error al actualizar el usuario:",
              await response.text()
            );
            showToast("Error al actualizar el usuario", "error");
          }
        } catch (error) {
          console.error("Error al actualizar el usuario:", error);
          showToast("Error al actualizar el usuario", "error");
        }
      });

      deleteButton.addEventListener("click", async function () {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const confirmation = confirm(
            "¿Estás seguro de que quieres eliminar tu cuenta?"
          );

          if (confirmation) {
            try {
              const response = await fetch(`/api/users/delete/${userId}`, {
                method: "DELETE",
              });

              if (response.ok) {
                console.log("Usuario eliminado con éxito");
                showToast("Usuario eliminado con éxito", "success");

                window.location.href = "api/users/login";
              } else {
                console.error("Error al eliminar el usuario");
                showToast("Error al eliminar el usuario", "error");
              }
            } catch (error) {
              console.error("Error al hacer la solicitud", error);
            }
          }
        }
      });
      backToChatButton.addEventListener("click", () => {
        window.location.href = "/chat";
      });
      backToChatButton2.addEventListener("click", () => {
        window.location.href = "/chat";
      });

      if (searchUsers && usersList) {
        const filterUsers = () => {
          const searchTerm = searchUsers.value.trim().toLowerCase();
          const users = usersList.getElementsByTagName("li");

          Array.from(users).forEach((user) => {
            const userName = user.textContent?.trim().toLowerCase();
            if (userName && userName.includes(searchTerm)) {
              user.style.display = "";
            } else {
              user.style.display = "none";
            }
          });
        };
        const debouncedFilterUsers = debounce(filterUsers, 300);
        searchUsers.addEventListener("input", (e) => {
          e.preventDefault();
          debouncedFilterUsers();
        });
      } else {
        console.error("Elementos de búsqueda de usuarios no encontrados.");
      }

      if (roomInput && roomsList) {
        const filterRoomsSearch = () => {
          const searchTerm = roomInput.value.trim().toLowerCase();
          const rooms = roomsList.getElementsByTagName("li");
          Array.from(rooms).forEach((room) => {
            const roomName = room.textContent?.trim().toLowerCase();
            if (roomName && roomName.includes(searchTerm)) {
              room.style.display = "";
            } else {
              room.style.display = "none";
            }
          });
        };
        const debouncedFilterRoomsSearch = debounce(filterRoomsSearch, 300);
        roomInput.addEventListener("input", (e) => {
          e.preventDefault();
          debouncedFilterRoomsSearch();
        });
      }
      let currentRoomName = "";

      async function searchUserByUsername(
        username: string,
        token: string
      ): Promise<any> {
        const response = await fetch(`/api/users/search/userName/${username}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.user && data.user.id) {
            return data.user;
          } else {
            console.error("User data is missing or malformed:", data);
            return null;
          }
        } else {
          console.error("User not found or server error");
          return null;
        }
      }

      if (!searchUsers || !searchUsersButton) {
        console.error("Elemento de búsqueda de usuarios no encontrado.");
      } else {
        searchUsersButton.addEventListener("click", async (e) => {
          e.preventDefault();
          const recipientName = searchUsers.value.trim().toLowerCase();
          if (!recipientName) {
            console.error("Recipient name is missing or empty.");
            return;
          }
          const token = localStorage.getItem("authToken");
          if (!token) {
            console.error("Token is missing");
            return;
          }
          const currentUserName = localStorage.getItem("userName");
          if (!currentUserName) {
            console.error("User name is missing");
            return;
          }
          const recipientUser = await searchUserByUsername(
            recipientName,
            token
          );
          const senderUser = await searchUserByUsername(currentUserName, token);
          if (recipientUser && senderUser) {
            console.log("Preparing to create private room with data:", {
              sender: senderUser.userName,
              recipient: recipientUser.userName,
            });
            const roomResponse = await fetch("/api/rooms/private", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                sender: senderUser.id,
                recipient: recipientUser.id,
              }),
            });

            const roomData = await roomResponse.json();
            if (roomResponse.ok) {
              console.log("Private room created successfully:", roomData);
              currentRoomName = roomData.roomName;
              socket.emit("join room", {
                roomName: currentRoomName,
                userId: senderUser.id,
                userName: senderUser.userName,
              });
              window.location.href = `/chat?roomName=${currentRoomName}`;
              socket.emit("request chat-history", {
                roomName: currentRoomName,
              });
            } else {
              console.error("Error opening private room:", roomData.error);
            }
          } else {
            console.error("Recipient or sender user data is missing");
          }
        });
      }
    }
  }
});

// @ts-ignore
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

document.addEventListener("DOMContentLoaded", function () {
  // Conectar al servidor de Socket.IO
  const socket = io();

  const editButton = document.getElementById(
    "editButton"
  ) as HTMLButtonElement | null;
  const submitButton = document.getElementById(
    "submitButton"
  ) as HTMLButtonElement | null;
  const deleteButton = document.getElementById(
    "deleteButton"
  ) as HTMLButtonElement | null;
  const formContainer = document.getElementById(
    "formContainer"
  ) as HTMLDivElement | null;
  const backToChatButton = document.getElementById(
    "backToChatButton"
  ) as HTMLButtonElement | null;

  if (
    !editButton ||
    !submitButton ||
    !deleteButton ||
    !formContainer ||
    !backToChatButton
  ) {
    console.error("Error: Botones o contenedor del formulario no encontrados");
    return;
  }

  // Mostrar/ocultar el formulario
  editButton.addEventListener("click", function () {
    if (formContainer) {
      formContainer.classList.toggle("hidden");
    }
  });

  // Enviar cambios de usuario
  submitButton.addEventListener("click", async function () {
    if (formContainer) {
      const form = document.getElementById(
        "form-data"
      ) as HTMLFormElement | null;
      if (form) {
        const formData = new FormData(form);
        const userId = localStorage.getItem("userId"); // Asume que el ID del usuario está en localStorage
        if (userId) {
          try {
            const response = await fetch(`/api/users/update/${userId}`, {
              method: "PUT",
              body: formData,
            });

            if (response.ok) {
              console.log("Usuario actualizado con éxito");
              alert("Usuario actualizado con éxito");
              // Aquí puedes emitir un evento a todos los clientes si es necesario
            } else {
              console.error("Error al actualizar el usuario");
              alert("Error al actualizar el usuario");
            }
          } catch (error) {
            console.error("Error al hacer la solicitud", error);
            alert("Error al hacer la solicitud");
          }
        }
      }
    }
  });

  // Eliminar usuario
  deleteButton.addEventListener("click", async function () {
    const userId = localStorage.getItem("userId"); // Asume que el ID del usuario está en localStorage
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
            alert("Usuario eliminado con éxito");
            // Aquí puedes redirigir al usuario a la página de inicio de sesión o hacer cualquier otra acción necesaria
            window.location.href = "/api/users/login"; // O la página de tu elección
          } else {
            console.error("Error al eliminar el usuario");
            alert("Error al eliminar el usuario");
          }
        } catch (error) {
          console.error("Error al hacer la solicitud", error);
          alert("Error al hacer la solicitud");
        }
      }
    }
  });
  backToChatButton.addEventListener("click", () => {
    window.location.href = "/chat";
  });
});

// // @ts-ignore
// import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

// document.addEventListener("DOMContentLoaded", function () {
//   // Conectar al servidor de Socket.IO
//   const socket = io();

//   const editButton = document.getElementById(
//     "editButton"
//   ) as HTMLButtonElement | null;
//   const deleteButton = document.getElementById(
//     "deleteButton"
//   ) as HTMLButtonElement | null;
//   const form = document.getElementById("form-data") as HTMLFormElement | null;

//   if (!editButton || !deleteButton || !form) {
//     console.error("Error: Botones o formulario no encontrados");
//     return;
//   }

//   editButton.addEventListener("click", async function () {
//     if (form) {
//       const formData = new FormData(form);
//       const userId = localStorage.getItem("userId"); // Asume que el ID del usuario está en localStorage
//       if (userId) {
//         try {
//           const response = await fetch(`/api/users/update/${userId}`, {
//             method: "PUT",
//             body: formData,
//           });

//           if (response.ok) {
//             console.log("Usuario actualizado con éxito");
//             alert("Usuario actualizado con éxito");
//             // Aquí puedes emitir un evento a todos los clientes si es necesario
//           } else {
//             console.error("Error al actualizar el usuario");
//             alert("Error al actualizar el usuario");
//           }
//         } catch (error) {
//           console.error("Error al hacer la solicitud", error);
//           alert("Error al hacer la solicitud");
//         }
//       }
//     }
//   });

//   deleteButton.addEventListener("click", async function () {
//     const userId = localStorage.getItem("userId"); // Asume que el ID del usuario está en localStorage
//     if (userId) {
//       try {
//         const response = await fetch(`/api/users/delete/${userId}`, {
//           method: "DELETE",
//         });

//         if (response.ok) {
//           console.log("Usuario eliminado con éxito");
//           alert("Usuario eliminado con éxito");
//           socket.emit("userDeleted", userId); // Envía un evento de eliminación a todos los clientes
//           window.location.href = "/api/users/login"; // O la URL que desees para redirigir al usuario
//         } else {
//           console.error("Error al eliminar el usuario");
//           alert("Error al eliminar el usuario");
//         }
//       } catch (error) {
//         console.error("Error al hacer la solicitud", error);
//         alert("Error al hacer la solicitud");
//       }
//     }
//   });
// });

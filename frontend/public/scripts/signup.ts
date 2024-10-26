window.addEventListener("DOMContentLoaded", () => {
  const userNameInput = document.getElementById("userName") as HTMLInputElement;
  const fullNameInput = document.getElementById("fullName") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const passwordConfirmInput = document.getElementById(
    "confirmPassword"
  ) as HTMLInputElement;
  const profilePicInput = document.getElementById(
    "profilePic"
  ) as HTMLInputElement;

  if (
    !userNameInput ||
    !fullNameInput ||
    !emailInput ||
    !passwordInput ||
    !passwordConfirmInput
  ) {
    console.error("Error en los inputs");
    return;
  }

  const signupForm = document.getElementById("form-data") as HTMLFormElement;
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userName = userNameInput.value.trim();
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();
    const profilePic = profilePicInput?.files?.[0];
    const userType = "registered";

    if (password !== passwordConfirm) {
      showToast("Las contraseñas no coinciden");
      console.error("Las contraseñas no coinciden");
      return;
    }

    const formData = new FormData();
    formData.append("userName", userName);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("userType", userType);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    } else {
      formData.append(
        "profilePic",
        `https://anonymous-animals.azurewebsites.net/avatar/${userName}`
      );
    }
    try {
      const response = await fetch(`http://localhost:5050/api/users/signup`, {
        method: "POST",
        body: formData,
      });

      // Leer el cuerpo de la respuesta solo una vez como texto
      const responseBody = await response.text();

      if (!response.ok) {
        // Intentar convertir la respuesta a JSON
        let errorData;
        try {
          errorData = JSON.parse(responseBody);
        } catch (jsonError) {
          // Si no es JSON, usar el texto original como mensaje de error
          console.error("Error al parsear respuesta JSON:", jsonError);
          throw new Error(`Error al crear el usuario: ${responseBody}`);
        }

        // Lanzar error con el mensaje del JSON si está presente
        throw new Error(
          `Error al crear el usuario: ${errorData.error || "Unexpected error"}`
        );
      }

      // Intentar parsear la respuesta como JSON válida para los casos exitosos
      let data;
      try {
        data = JSON.parse(responseBody);
      } catch (jsonError) {
        console.error("Error al parsear respuesta JSON exitosa:", jsonError);
        throw new Error(
          `Unexpected format of success response: ${responseBody}`
        );
      }

      showToast("Usuario registrado correctamente");
      console.log("Usuario creado correctamente:", data);
      window.location.href = "/api/users/login";
    } catch (error: any) {
      // Mostrar el error capturado
      console.error("Error al crear el usuario:", error);
      showToast(
        "Error al crear el usuario: " + (error.message || "Unexpected error")
      );
    }

    // Limpiar campos del formulario
    userNameInput.value = "";
    fullNameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    passwordConfirmInput.value = "";
  });
});
function showToast(message: string | null, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Mostrar el toast y luego ocultarlo después de un tiempo
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 500); // Tiempo de espera para eliminar el toast después de que desaparece
  }, 3000); // Tiempo de visualización del toast
}

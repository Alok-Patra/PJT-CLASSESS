
(() => {
  // Register the service worker.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js", { scope: "/" })
        .then(() => {
          console.log("PJT CLASSES PWA service worker registered.");
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    });
  }

  let installPrompt = null;

  function createInstallButton() {
    if (document.getElementById("pjtInstallAppButton")) return;

    const button = document.createElement("button");
    button.id = "pjtInstallAppButton";
    button.type = "button";
    button.textContent = "Install PJT CLASSES";
    button.setAttribute("aria-label", "Install PJT CLASSES app");

    Object.assign(button.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "9999",
      padding: "12px 18px",
      border: "none",
      borderRadius: "10px",
      background: "#0864f7",
      color: "#ffffff",
      fontWeight: "700",
      fontSize: "14px",
      boxShadow: "0 5px 18px rgba(9, 37, 75, 0.2)",
      cursor: "pointer",
      display: "none"
    });

    button.addEventListener("click", async () => {
      if (!installPrompt) {
        alert(
          "To install PJT CLASSES, open your browser menu and select " +
          "'Install app' or 'Add to Home Screen'."
        );
        return;
      }

      installPrompt.prompt();
      await installPrompt.userChoice;

      installPrompt = null;
      button.style.display = "none";
    });

    document.body.appendChild(button);
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;

    const showButton = () => {
      createInstallButton();

      const button = document.getElementById("pjtInstallAppButton");
      if (button) button.style.display = "block";
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showButton, {
        once: true
      });
    } else {
      showButton();
    }
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;

    const button = document.getElementById("pjtInstallAppButton");
    if (button) button.remove();
  });
})();

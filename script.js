const SECRET_WORD = "1711";

// EmailJS — remplace ces trois valeurs par celles de ton compte EmailJS.
const EMAILJS_PUBLIC_KEY = "sJ8JN723wfZpR9AO8";
const EMAILJS_SERVICE_ID = "service_yap3xau";
const EMAILJS_TEMPLATE_ID = "template_pdx4mxs";

const invitation = document.querySelector("#invitation");
const envelopeStage = document.querySelector("#envelope-stage");
const giftSite = document.querySelector("#gift-site");
const page = document.querySelector(".page");
const footerNote = document.querySelector("#footer-note");
const form = document.querySelector("#unlock-form");
const secretInput = document.querySelector("#secret-word");
const message = document.querySelector("#form-message");
const envelopeButton = document.querySelector("#open-envelope");
const musicAudio = document.querySelector(".music-audio");
const musicDisc = document.querySelector(".music-disc");
const noteForm = document.querySelector("#note-form");
const noteMessage = document.querySelector("#note-message");
const noteWebsite = document.querySelector("#note-website");
const noteSubmit = document.querySelector("#note-submit");
const noteStatus = document.querySelector("#note-status");
const noteLoadedAt = Date.now();
let lastNoteSentAt = 0;
const memoryDialog = document.querySelector("#memory-dialog");
const dialogCaption = document.querySelector("#dialog-caption");
const dialogArt = document.querySelector(".dialog-art");
const dialogPhoto = document.querySelector("#dialog-photo");
const destinationResult = document.querySelector("#destination-result");
const memoryCards = [...document.querySelectorAll(".memory-card")];
let currentPhotoIndex = 0;

musicAudio.addEventListener("play", () => {
  musicDisc.classList.add("is-playing");
});

["pause", "ended", "error"].forEach((eventName) => {
  musicAudio.addEventListener(eventName, () => {
    musicDisc.classList.remove("is-playing");
  });
});

function normalizeWord(word) {
  return word
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (normalizeWord(secretInput.value) !== normalizeWord(SECRET_WORD)) {
    message.textContent = "Ce n’est pas le bon mot… essaie encore, mon cœur.";
    secretInput.setAttribute("aria-invalid", "true");
    secretInput.focus();
    return;
  }

  message.textContent = "";
  secretInput.removeAttribute("aria-invalid");
  invitation.hidden = true;
  envelopeStage.hidden = false;
  page.classList.add("envelope-open");
  footerNote.hidden = true;
  envelopeButton.focus();
});

secretInput.addEventListener("input", () => {
  message.textContent = "";
  secretInput.removeAttribute("aria-invalid");
});

envelopeButton.addEventListener("click", () => {
  if (envelopeButton.disabled) return;

  envelopeButton.disabled = true;
  envelopeButton.classList.add("is-opening");
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100;

  window.setTimeout(() => {
    envelopeStage.hidden = true;
    giftSite.hidden = false;
    page.classList.remove("envelope-open");
    page.classList.add("story-open");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, delay);
});

function showMemoryPhoto(index) {
  currentPhotoIndex = (index + memoryCards.length) % memoryCards.length;
  const card = memoryCards[currentPhotoIndex];
  const photo = card.querySelector(".memory-photo");
  dialogPhoto.hidden = photo.hidden;
  dialogArt.hidden = !photo.hidden;
  if (!photo.hidden) dialogPhoto.src = photo.src;
  dialogCaption.textContent = `${currentPhotoIndex + 1} / ${memoryCards.length}`;
}

memoryCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    showMemoryPhoto(index);
    memoryDialog.showModal();
    document.querySelector("#dialog-close").focus();
  });
});

document.querySelector("#photo-prev").addEventListener("click", () => {
  showMemoryPhoto(currentPhotoIndex - 1);
});

document.querySelector("#photo-next").addEventListener("click", () => {
  showMemoryPhoto(currentPhotoIndex + 1);
});

document.querySelector("#dialog-close").addEventListener("click", () => {
  memoryDialog.close();
});

memoryDialog.addEventListener("click", (event) => {
  if (event.target === memoryDialog) {
    memoryDialog.close();
  }
});

document.querySelectorAll(".destination-options button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".destination-options button").forEach((option) => {
      option.classList.remove("correct", "wrong");
      option.removeAttribute("aria-pressed");
    });

    if (button.dataset.correct === "true") {
      button.classList.add("correct");
      button.setAttribute("aria-pressed", "true");
      destinationResult.textContent = "Tu me connais très bien, ma MJ (Michelle Jones Watson) ♥";
      return;
    }

    button.classList.add("wrong");
    destinationResult.textContent = "Presque… essaie encore.";
  });
});

const emailjsReady =
  window.emailjs &&
  EMAILJS_PUBLIC_KEY !== "REMPLACE_MOI" &&
  EMAILJS_SERVICE_ID !== "REMPLACE_MOI" &&
  EMAILJS_TEMPLATE_ID !== "REMPLACE_MOI";

if (emailjsReady) {
  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isBot = noteWebsite.value.trim() !== "" || Date.now() - noteLoadedAt < 2000;

  if (isBot) {
    noteStatus.textContent = "Merci pour ton petit mot, il est bien arrivé ♥";
    noteForm.reset();
    return;
  }

  if (lastNoteSentAt && Date.now() - lastNoteSentAt < 30000) {
    noteStatus.textContent = "Patiente un petit instant avant d’envoyer un autre mot…";
    noteStatus.classList.add("is-error");
    return;
  }

  const text = noteMessage.value.trim();

  if (!text) {
    noteStatus.textContent = "Écris-moi un petit mot avant d’envoyer…";
    noteStatus.classList.add("is-error");
    noteMessage.focus();
    return;
  }

  if (!emailjsReady) {
    noteStatus.textContent = "Le service d’envoi n’est pas encore configuré.";
    noteStatus.classList.add("is-error");
    return;
  }

  noteSubmit.disabled = true;
  noteStatus.classList.remove("is-error");
  noteStatus.textContent = "Envoi en cours…";

  try {
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      message: text,
      date: new Date().toLocaleString("fr-FR"),
    });
    lastNoteSentAt = Date.now();
    noteStatus.textContent = "Merci pour ton petit mot, il est bien arrivé ♥";
    noteForm.reset();
  } catch (error) {
    noteStatus.textContent = "Oups… l’envoi a échoué. Réessaie dans un instant.";
    noteStatus.classList.add("is-error");
  } finally {
    noteSubmit.disabled = false;
  }
});

noteMessage.addEventListener("input", () => {
  noteStatus.textContent = "";
  noteStatus.classList.remove("is-error");
});

import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import logoSrc from "../images/Logo.svg";
import editIconSrc from "../images/edit_pencil.svg";
import plusIconSrc from "../images/plus.svg";
import closeIconSrc from "../images/Close_Icon.svg";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

let selectedCard = null;
let selectedCardId = null;
let currentUserId = null;

// Set static assets
document.getElementById("logo").src = logoSrc;
document.getElementById("edit-icon").src = editIconSrc;
document.getElementById("plus-icon").src = plusIconSrc;
document.getElementById("close-icon-1").src = closeIconSrc;
document.getElementById("close-icon-2").src = closeIconSrc;
document.getElementById("close-icon-3").src = closeIconSrc;
document.getElementById("close-icon-4").src = closeIconSrc;

// API setup
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "ab8dc431-ba9b-41ea-813d-3d243375af30",
    "Content-Type": "application/json",
  },
});

// DOM elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalButton = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector("#profile__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const avatarModalButton = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = document.querySelector("#edit-avatar-form");
const avatarInput = avatarForm.querySelector("#profile-avatar-input");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteCancelBtn = deleteModal.querySelector(
  ".modal__submit-btn:last-of-type"
);

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

// Load user and cards
api
  .getAppInfo()
  .then(([user, cards]) => {
    currentUserId = user._id;
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
    document.getElementById("profile-avatar").src = user.avatar;

    cards.forEach((cardData) => {
      cardsList.append(getCardElement(cardData));
    });
  })
  .catch(console.error);

// Create card DOM
function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-button");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  const likes = Array.isArray(data.likes) ? data.likes : [];

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  const isLikedByUser = likes.some((user) => user._id === currentUserId);
  if (isLikedByUser) {
    cardLikeBtn.classList.add("card__like-button_liked");
  }

  cardLikeBtn.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardDeleteBtn.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
  });

  return cardElement;
}

// Handle like/unlike
function handleLike(evt, cardId) {
  const likeBtn = evt.target;
  const isLiked = likeBtn.classList.contains("card__like-button_liked");

  api
    .changeLikeStatus(cardId, isLiked)
    .then((updatedCard) => {
      if (updatedCard && typeof updatedCard.isLiked === "boolean") {
        likeBtn.classList.toggle(
          "card__like-button_liked",
          updatedCard.isLiked
        );
      } else {
        console.warn("Unexpected like response structure:", updatedCard);
      }
    })
    .catch((err) => {
      console.error("Like request failed:", err);
    });
}

// Handle delete
function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
      selectedCard = null;
      selectedCardId = null;
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete", "Deleting...");
    });
}

// Modal logic
function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscKeyPress);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscKeyPress);
}

function handleEscKeyPress(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) closeModal(openedModal);
  }
}

function handleOverlayClick(event) {
  if (event.target.classList.contains("modal")) {
    closeModal(event.target);
  }
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", handleOverlayClick);
});

function setupCloseModalButton(closeButton, modal) {
  closeButton.addEventListener("click", () => closeModal(modal));
}

// Form handlers
function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  // Show "Saving..." and disable button
  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  api
    .addCard({ name, link })
    .then((cardData) => {
      const cardEl = getCardElement(cardData);
      cardsList.prepend(cardEl);
      cardForm.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

// Avatar form
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .editUserAvatar({ avatar: avatarInput.value })
    .then((user) => {
      document.getElementById("profile-avatar").src = user.avatar;
      avatarForm.reset();
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
});

// Event listeners
document.querySelectorAll(".modal__close-btn").forEach((btn) => {
  const modal = btn.closest(".modal");
  setupCloseModalButton(btn, modal);
});

deleteCancelBtn.addEventListener("click", () => closeModal(deleteModal));

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings);
  openModal(editModal);
});

cardModalButton.addEventListener("click", () => openModal(cardModal));
avatarModalButton.addEventListener("click", () => openModal(avatarModal));
editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

// Enable validation
enableValidation(settings);

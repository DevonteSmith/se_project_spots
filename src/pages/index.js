import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import logoSrc from "../images/Logo.svg";
import avatarSrc from "../images/avatar.jpg";
import editIconSrc from "../images/edit_pencil.svg";
import plusIconSrc from "../images/plus.svg";
import closeIconSrc from "../images/Close_Icon.svg";
import Api from "../utils/Api.js";
import { data } from "autoprefixer";

document.getElementById("logo").src = logoSrc;

document.getElementById("edit-icon").src = editIconSrc;

document.getElementById("plus-icon").src = plusIconSrc;

document.getElementById("close-icon-1").src = closeIconSrc;
document.getElementById("close-icon-2").src = closeIconSrc;
document.getElementById("close-icon-3").src = closeIconSrc;
document.getElementById("close-icon-4").src = closeIconSrc;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "ab8dc431-ba9b-41ea-813d-3d243375af30",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([user, cards]) => {
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
    document.getElementById("profile-avatar").src = user.avatar;

    cards.forEach((cardData) => {
      cardsList.append(getCardElement(cardData));
    });
  })
  .catch(console.error);

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
const avatarSubmitBtn = avatarForm.querySelector(".modal__submit-btn");

const deleteModal = document.querySelector("#delete-modal");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-button");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeBtn.addEventListener("click", () => {
    cardLikeBtn.classList.toggle("card__like-button_liked");
  });

  cardDeleteBtn.addEventListener("click", () => {
    openModal(deleteModal);

    const confirmDeleteBtn = deleteModal.querySelector(".modal__confirm-btn");
    confirmDeleteBtn.onclick = () => {
      cardElement.remove();
      closeModal(deleteModal);
    };
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
  });
  return cardElement;
}

function handleEscKeyPress(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscKeyPress);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscKeyPress);
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

function handleEditFormSubmit(evt) {
  evt.preventDefault();
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
    .catch(console.error);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };
  const cardEl = getCardElement(inputValues);
  cardsList.prepend(cardEl);
  evt.target.reset();
  disableButton(cardSubmitBtn, settings);
  closeModal(cardModal);
}

setupCloseModalButton(editModalCloseBtn, editModal);
setupCloseModalButton(cardModalCloseBtn, cardModal);
setupCloseModalButton(previewModalCloseBtn, previewModal);
setupCloseModalButton(avatarModalCloseBtn, avatarModal);

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings);
  openModal(editModal);
});

cardModalButton.addEventListener("click", () => openModal(cardModal));

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

avatarModalButton.addEventListener("click", () => openModal(avatarModal));
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  api
    .editUserAvatar({ avatar: avatarInput.value })
    .then((user) => {
      document.getElementById("profile-avatar").src = user.avatar;
      avatarForm.reset();
      closeModal(avatarModal);
    })
    .catch(console.error);
});

enableValidation(settings);

const settings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error",
  modal: ".modal",
  openModal: ".modal_opened",
};

const showInputError = (formEl, inputEl, errorMsg, config) => {
  const errorMsgEL = formEl.querySelector(`#${inputEl.id}-error`);
  if (!errorMsgEL) return;
  errorMsgEL.textContent = errorMsg;
  inputEl.classList.add(config.inputErrorClass);
};

const hideInputError = (formEl, inputEl, config) => {
  const errorMsgEL = formEl.querySelector(`#${inputEl.id}-error`);
  if (!errorMsgEL) return;
  errorMsgEL.textContent = "";
  inputEl.classList.remove(config.inputErrorClass);
};

const checkInputValidity = (formEl, inputEl, config) => {
  if (!inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage, config);
  } else {
    hideInputError(formEl, inputEl, config);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((input) => !input.validity.valid);
};

const disableButton = (buttonEl, config) => {
  buttonEl.disabled = true;
  buttonEl.classList.add(config.inactiveButtonClass);
};

const toggleButtonState = (inputList, buttonEl, config) => {
  if (hasInvalidInput(inputList)) {
    disableButton(buttonEl, config);
  } else {
    buttonEl.disabled = false;
    buttonEl.classList.remove(config.inactiveButtonClass);
  }
};

const setEventListeners = (formEl, config) => {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const buttonElement = formEl.querySelector(config.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formEl, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });

  formEl.addEventListener("submit", (event) => {
    if (hasInvalidInput(inputList)) {
      event.preventDefault();
    } else {
      inputList.forEach((input) => hideInputError(formEl, input, config));
    }
  });
};

function resetValidation(formEl, config) {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const submitButton = formEl.querySelector(config.submitButtonSelector);

  inputList.forEach((inputEl) => {
    hideInputError(formEl, inputEl, config);
  });

  toggleButtonState(inputList, submitButton, config);
}

function handleOverlayClick(event, config) {
  if (event.target.classList.contains("modal")) {
    closeModal(event.target);
  }
}

function handleEscKeyPress(event, config) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(config.openModal);
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

document.querySelectorAll(settings.modal).forEach((modal) => {
  modal.addEventListener("click", (event) =>
    handleOverlayClick(event, settings)
  );
});

document.addEventListener("keydown", (event) =>
  handleEscKeyPress(event, settings)
);

const enableValidation = (config) => {
  const formList = document.querySelectorAll(config.formSelector);
  formList.forEach((formEl) => {
    setEventListeners(formEl, config);
  });
};

enableValidation(settings);

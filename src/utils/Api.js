class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _handleResponse(res) {
    if (res.ok) {
      return res.json();
    }

    return res
      .json()
      .then((err) => Promise.reject(err.message || `Error: ${res.status}`));
  }

  _request(endpoint, options = {}) {
    const finalOptions = {
      headers: this._headers,
      ...options,
    };
    const url = `${this._baseUrl}${endpoint}`;
    return fetch(url, finalOptions).then((res) => this._handleResponse(res));
  }

  getAppInfo() {
    return Promise.all([this.getUserInfo(), this.getInitialCards()]);
  }

  getUserInfo() {
    return this._request("/users/me");
  }

  getInitialCards() {
    return this._request("/cards");
  }

  addCard({ name, link }) {
    return this._request("/cards", {
      method: "POST",
      body: JSON.stringify({ name, link }),
    });
  }

  deleteCard(cardId) {
    return this._request(`/cards/${cardId}`, { method: "DELETE" });
  }

  changeLikeStatus(cardId, isLiked) {
    return this._request(`/cards/${cardId}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
    });
  }

  editUserInfo({ name, about }) {
    return this._request("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name, about }),
    });
  }

  editUserAvatar({ avatar }) {
    return this._request("/users/me/avatar", {
      method: "PATCH",
      body: JSON.stringify({ avatar }),
    });
  }
}

export default Api;

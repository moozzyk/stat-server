export class DevToStats {
  #apiKey;
  constructor(apiKey) {
    this.#apiKey = process.env.DEVTO_API_KEY;
  }

  async getDevToArticles() {
    const resp = await fetch("https://dev.to/api/articles/me", {
      headers: {
        "api-key": this.#apiKey,
      },
    });
    console.log(resp.status, resp.statusText);
    return await resp.json();
    // return await resp.json();
  }
}

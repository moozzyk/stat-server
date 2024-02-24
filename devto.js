export class DevToStats {
  #apiKey;
  constructor(apiKey) {
    this.#apiKey = process.env.DEVTO_API_KEY;
  }

  initiateSendToRequest(url) {
    return fetch(url, {
      headers: {
        "api-key": this.#apiKey,
      },
    });
  }

  async getDevToArticles() {
    const resp = await this.initiateSendToRequest(
      "https://dev.to/api/articles/me"
    );
    if (!resp.ok) {
      throw new Error(
        `Error fetching stats. Status: ${resp.status}, StatusText: ${resp.statusText}`
      );
    }
    return await resp.json();
  }

  async initiateArticleStatRequest(article, startDate) {
    const startDateStr = startDate.toISOString().split("T")[0];
    console.log(
      `https://dev.to/api/analytics/historical?start=${startDateStr}&article_id=${article.id}`
    );
    return this.initiateSendToRequest(
      `https://dev.to/api/analytics/historical?start=${startDateStr}&article_id=${article.id}`
    );
  }

  async getArticleStats(articles, startDate) {
    const statResponses = [];
    // Poor's man rate limiting to avoid 429: Too Many Requests
    for (const article of articles) {
      const resp = await this.initiateArticleStatRequest(article, startDate);
      statResponses.push(resp.ok ? await resp.json() : {});
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return articles.map((article, index) => ({
      article: article,
      stats: statResponses[index],
    }));
  }

  createPerDayStats(articleStats) {
    const perDayStats = new Map();
    for (const { article, stats } of articleStats) {
      // console.log(article.title, stats);
      for (const date in stats) {
        if (!perDayStats.has(date)) {
          perDayStats.set(date, []);
        }
        const totalViews = stats[date].page_views.total;
        if (totalViews > 0) {
          perDayStats
            .get(date)
            .push({ article: article.title, views: totalViews });
        }
      }
    }
    console.log(perDayStats);
    return [...perDayStats.entries()].sort();
  }

  async getDevToStats(startDate) {
    const articles = await this.getDevToArticles();
    const stats = await this.getArticleStats(articles, startDate);
    return this.createPerDayStats(stats);
  }
}

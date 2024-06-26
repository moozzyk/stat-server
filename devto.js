function initiateSendToRequest(url) {
  return fetch(url, {
    headers: {
      "api-key": process.env.DEVTO_API_KEY,
    },
  });
}

async function getDevToArticles() {
  const resp = await initiateSendToRequest(
    "https://dev.to/api/articles/me/published"
  );
  if (!resp.ok) {
    throw new Error(
      `Error fetching stats. Status: ${resp.status}, StatusText: ${resp.statusText}`
    );
  }
  return await resp.json();
}

async function initiateArticleStatRequest(article, startDate) {
  const startDateStr = startDate.toISOString().split("T")[0];
  return initiateSendToRequest(
    `https://dev.to/api/analytics/historical?start=${startDateStr}&article_id=${article.id}`
  );
}

async function getArticleStats(articles, startDate) {
  const statResponses = [];
  // Poor man's rate limiting to avoid 429: Too Many Requests
  for (const article of articles) {
    const resp = await initiateArticleStatRequest(article, startDate);
    statResponses.push(resp.ok ? await resp.json() : {});
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return articles.map((article, index) => ({
    article: article,
    stats: statResponses[index],
  }));
}

function createPerDayStats(articleStats) {
  const perDayStats = new Map();
  for (const { article, stats } of articleStats) {
    for (const date in stats) {
      if (!perDayStats.has(date)) {
        perDayStats.set(date, []);
      }
      const totalViews = stats[date].page_views.total;
      const totalReactions = stats[date].reactions.total;
      if (totalViews > 0 || totalReactions > 0) {
        perDayStats.get(date).push({
          article: article.title,
          views: totalViews,
          reactions: totalReactions,
          likes: stats[date].reactions.like,
          unicorns: stats[date].reactions.unicorn,
          readingList: stats[date].reactions.readinglist,
          averageReadTime: stats[date].page_views.average_read_time_in_seconds,
        });
      }
    }
  }
  return [...perDayStats.entries()].sort().reverse();
}

export async function getDevToStats(startDate) {
  const articles = await getDevToArticles();
  const stats = await getArticleStats(articles, startDate);
  return createPerDayStats(stats);
}

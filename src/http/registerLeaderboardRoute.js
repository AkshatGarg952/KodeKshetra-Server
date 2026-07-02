export default function registerLeaderboardRoute(app, { getPaginatedLeaderboardFromRedis }) {
  app.get("/leaderboard/:period/:page", async (req, res) => {
    const period = Number.parseInt(req.params.period, 10);
    const page = Number.parseInt(req.params.page, 10);

    if (![1, 7].includes(period)) {
      return res.status(400).json({ message: "Invalid period. Use 1 or 7." });
    }

    if (Number.isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }

    try {
      const { result, hasNextPage } = await getPaginatedLeaderboardFromRedis(
        `leaderboard:${period}`,
        page,
      );

      return res.status(200).json({
        data: result,
        isNextPage: hasNextPage,
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return res.status(500).json({ message: "Failed to load leaderboard." });
    }
  });
}


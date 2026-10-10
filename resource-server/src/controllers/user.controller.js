const MAX_TITLE_LENGTH = 120;

export function createUserController({ userRepository }) {
  return {
    list(req, res) {
      res.json({ users: userRepository.listBySub(req.user.sub) });
    },

    create(req, res) {
      const title =
        typeof req.body?.title === "string" ? req.body.title.trim() : "";

      if (!title) {
        return res
          .status(400)
          .json({ error: "Invalid request", message: "Title is required." });
      }
      if (title.length > MAX_TITLE_LENGTH) {
        return res
          .status(400)
          .json({
            error: "Invalid request",
            message: `Title must not exceed ${MAX_TITLE_LENGTH} characters.`,
          });
      }
      const user = userRepository.add(req.user.sub, { title });
      res.status(201).json({ user });
    },
  };
}

export function getProfile(req, res) {
  res.json({
    message: "Profile retrieved successfully.",
    user: {
      sub: req.user.sub,
      name: req.user.name,
      email: req.user.email,
      scope: req.user.scope,
    },
  });
}

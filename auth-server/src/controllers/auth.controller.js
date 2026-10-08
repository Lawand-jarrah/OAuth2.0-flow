import { renderLoginPage, getSafeReturnTo } from "../views/loginPage.js";

export function createAuthController({
  authenticationService,
  sessionCookieName,
  sessionTtlMs,
}) {
  return {
    showLoginForm(req, res) {
      const returnTo = getSafeReturnTo(req.query.return_to);
      res.send(renderLoginPage(returnTo));
    },

    async login(req, res) {
      const { email, password } = req.body;
      const returnTo = getSafeReturnTo(req.body.return_to);

      const user = await authenticationService.authenticateUser(
        email,
        password,
      );
      if (!user) {
        return res
          .status(401)
          .send(renderLoginPage(returnTo, "Invalid email or password."));
      }

      const sessionId = await authenticationService.createAuthenticationSession(
        user.sub,
      );
      res.cookie(sessionCookieName, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: "production",
        maxAge: sessionTtlMs,
      });

      return res.redirect(returnTo);
    },

    async logout(req, res) {
      await authenticationService.logout(req.cookies[sessionCookieName]);
      res.clearCookie(sessionCookieName);
      return res.redirect("/login");
    },
  };
}

export function loadUser({ authenticationService, sessionCookieName }) {
    return async function loadUsreMiddleware(req, res, next) {
        const sessionId = req.cookies(sessionCookieName);
        req.user = await authenticationService.getAuthenticatedUser(sessionId);
        next()
    }
}
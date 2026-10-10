import { generateOpaqueCode, verifyPassword } from "./cryptoHelper.service.js";

export function authenticationService({ userRepository, authenticationSessionRepository, sessionTtlMs }) {
  return {
    async authenticateUser(email, password) {
      const user = await userRepository.findByEmail(email);
      if (
        !user ||
        !verifyPassword(password, user.password_salt, user.password_hash)
      ) {
        return null;
      }
      return user;
    },

    async createAuthenticationSession(userSub) {
      const sessionId = generateOpaqueCode();
      const expiresAt = Date.now() + sessionTtlMs;
      await authenticationSessionRepository.create({
        session_id: sessionId,
        user_sub: userSub,
        expires_at: new Date(expiresAt),
      });
      return { sessionId, expiresAt };
    },

    async getAuthenticatedUser(sessionId) {
      if (!sessionId) {
        return null;
      }
      const session = await authenticationSessionRepository.findById(sessionId);
      if (!session) {
        return null;
      }
      if (session.expires_at < new Date()) {
        await authenticationSessionRepository.deleteById(sessionId);
        return null;
      }
      return userRepository.findBySub(session.user_sub);
    },

    async logout(sessionId) {
      if (sessionId) {
        await authenticationSessionRepository.deleteById(sessionId);
      }
    },
  };
}

export function getSafeReturnTo(returnTo) {
  if (typeof returnTo === "string" && returnTo.startsWith("/authorize")) {
    return returnTo;
  }
  return "/";
}

export function renderLoginPage(returnTo, errorMessage = "") {
  return `
        <h2>Sign in to Authorization Server</h2>
        <p>Sign in with a provisioned local account.</p>
        ${errorMessage ? `<p style="color:red;">${errorMessage}</p>` : ""}
        <form method="POST" action="/login">
            <input type="hidden" name="return_to" value="${returnTo}" />
            <label>Email <input type="email" name="email" required /></label>
            <br/><br/>
            <label>Password <input type="password" name="password" required /></label>
            <br/><br/>
            <button type="submit">Sign in</button>
        </form>
    `;
}

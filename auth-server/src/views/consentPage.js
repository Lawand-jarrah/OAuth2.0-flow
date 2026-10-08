export function renderConsentPage({ clientId, user, params }) {
  const {
    response_type,
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method,
  } = params;

  return `
        <h2>Authorize ${clientId}</h2>
        <p>Signed in as <strong>${user.email}</strong></p>
        <p>Requested scopes: <code>${scope || "(none)"}</code></p>
        <form method="POST" action="/authorize/decision">
            <input type="hidden" name="response_type" value="${response_type}" />
            <input type="hidden" name="client_id" value="${clientId}" />
            <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
            <input type="hidden" name="scope" value="${scope}" />
            <input type="hidden" name="state" value="${state || ""}" />
            <input type="hidden" name="code_challenge" value="${code_challenge}" />
            <input type="hidden" name="code_challenge_method" value="${code_challenge_method}" />
            <button type="submit" name="decision" value="approve">Approve</button>
            <button type="submit" name="decision" value="deny">Deny</button>
        </form>
        <br/>
        <form method="POST" action="/session/logout">
            <button type="submit">Sign out</button>
        </form>
    `;
}

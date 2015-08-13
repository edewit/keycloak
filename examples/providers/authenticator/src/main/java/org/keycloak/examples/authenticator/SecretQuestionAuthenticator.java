package org.keycloak.examples.authenticator;

import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.AbstractFormAuthenticator;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserCredentialValueModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.CredentialValidation;
import org.keycloak.services.util.CookieHelper;

import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

/**
 * @author <a href="mailto:bill@burkecentral.com">Bill Burke</a>
 * @version $Revision: 1 $
 */
public class SecretQuestionAuthenticator extends AbstractFormAuthenticator {

    public static final String CREDENTIAL_TYPE = "secret_question";

    protected boolean hasCookie(AuthenticationFlowContext context) {
        Cookie cookie = context.getHttpRequest().getHttpHeaders().getCookies().get("SECRET_QUESTION_ANSWERED");
        return cookie != null;
    }

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        if (hasCookie(context)) {
            context.success();
            return;
        }
        Response challenge = loginForm(context).createForm("secret_question.ftl");
        context.challenge(challenge);
    }

    @Override
    public void action(AuthenticationFlowContext context) {
        boolean validated = validateAnswer(context);
        if (!validated) {
            Response challenge =  loginForm(context)
                    .setError("badSecret")
                    .createForm("secret_question.ftl");
            context.failureChallenge(AuthenticationFlowError.INVALID_CREDENTIALS, challenge);
            return;
        }
        setCookie(context);
        context.success();
    }

    protected void setCookie(AuthenticationFlowContext context) {
        AuthenticatorConfigModel config = context.getAuthenticatorConfig();
        int maxCookieAge = 60 * 60 * 24 * 30; // 30 days
        if (config != null) {
            maxCookieAge = Integer.valueOf(config.getConfig().get("cookie.max.age"));

        }
        CookieHelper.addCookie("SECRET_QUESTION_ANSWERED", "true",
                context.getUriInfo().getBaseUri().getPath() + "/realms/" + context.getRealm().getName(),
                null, null,
                maxCookieAge,
                true, true);
    }

    protected boolean validateAnswer(AuthenticationFlowContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        String secret = formData.getFirst("secret");
        UserCredentialValueModel cred = null;
        for (UserCredentialValueModel model : context.getUser().getCredentialsDirectly()) {
            if (model.getType().equals(CREDENTIAL_TYPE)) {
                cred = model;
                break;
            }
        }

        return CredentialValidation.validateHashedCredential(context.getRealm(), context.getUser(), secret, cred);
    }

    @Override
    public boolean requiresUser() {
        return true;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return session.users().configuredForCredentialType(CREDENTIAL_TYPE, realm, user);
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
        user.addRequiredAction(CREDENTIAL_TYPE + "_CONFIG");
    }
}

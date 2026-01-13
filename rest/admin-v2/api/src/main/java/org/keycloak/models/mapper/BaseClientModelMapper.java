package org.keycloak.models.mapper;

import java.util.HashSet;
import java.util.Objects;
import java.util.stream.Collectors;

import org.keycloak.models.ClientModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RoleModel;
import org.keycloak.representations.admin.v2.BaseClientRepresentation;

/**
 * @author Vaclav Muzikar <vmuzikar@redhat.com>
 */
public abstract class BaseClientModelMapper<T extends BaseClientRepresentation> implements ClientModelMapper {
    protected final KeycloakSession session;

    public BaseClientModelMapper(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public BaseClientRepresentation fromModel(ClientModel model) {
        Objects.requireNonNull(model, "model must not be null");
        // We don't want reps to depend on any unnecessary fields deps, hence no generated builder.

        T rep = createClientRepresentation();

        rep.setEnabled(model.isEnabled());
        rep.setClientId(model.getClientId());
        rep.setDescription(model.getDescription());
        rep.setDisplayName(model.getName());
        rep.setAppUrl(model.getBaseUrl());
        rep.setRedirectUris(new HashSet<>(model.getRedirectUris()));
        rep.setRoles(model.getRolesStream().map(RoleModel::getName).collect(Collectors.toSet()));

        fromModelSpecific(model, rep);

        return rep;
    }

    @Override
    @SuppressWarnings("unchecked")
    public ClientModel updateModel(BaseClientRepresentation rep, ClientModel existingModel) {
        existingModel.setEnabled(Boolean.TRUE.equals(rep.getEnabled()));
        existingModel.setClientId(rep.getClientId());
        existingModel.setDescription(rep.getDescription());
        existingModel.setName(rep.getDisplayName());
        existingModel.setBaseUrl(rep.getAppUrl());
        existingModel.setRedirectUris(new HashSet<>(rep.getRedirectUris()));
        // Roles are not handled here

        toModelSpecific((T) rep, existingModel);

        return existingModel;
    }

    protected abstract T createClientRepresentation();

    protected abstract void fromModelSpecific(ClientModel model, T rep);

    protected abstract void toModelSpecific(T rep, ClientModel model);

    @Override
    public void close() {
    }
}

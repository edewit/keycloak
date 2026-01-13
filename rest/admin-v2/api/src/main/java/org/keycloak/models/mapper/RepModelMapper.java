package org.keycloak.models.mapper;

import java.util.Objects;

/**
 * Maps between representation objects and model objects.
 * <p>
 * This mapper is designed for updating existing models only. Model creation
 * should be handled by the service layer, not the mapper.
 *
 * @author Vaclav Muzikar <vmuzikar@redhat.com>
 */
public interface RepModelMapper <T, U> {
    /**
     * Converts a model to its representation.
     *
     * @param model the model to convert, must not be null
     * @return the representation
     * @throws NullPointerException if model is null
     */
    T fromModel(U model);

    /**
     * Updates an existing model with values from the representation.
     * <p>
     * This method requires a non-null existing model. Model creation should be
     * handled by the service layer before calling this method.
     *
     * @param rep the representation containing the values to apply
     * @param existingModel the model to update, must not be null
     * @return the updated model
     * @throws NullPointerException if existingModel is null
     */
    default U toModel(T rep, U existingModel) {
        Objects.requireNonNull(existingModel, "existingModel must not be null - model creation should be handled by the service layer");
        return updateModel(rep, existingModel);
    }

    /**
     * Internal method to update the model with values from the representation.
     * Implementations should override this method.
     *
     * @param rep the representation containing the values to apply
     * @param existingModel the model to update (guaranteed non-null)
     * @return the updated model
     */
    U updateModel(T rep, U existingModel);
}

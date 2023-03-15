import {
  createRouter,
  providers,
  defaultAuthProviderFactories,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,
      // See the auth documentation for more details on how to enable
      // and customize sign-in:
      //
      // https://backstage.io/docs/auth/identity-resolver
      github: providers.github.create({
        // Authenticate everyone as a guest
        signIn: {
          resolver: async (_, ctx) => {
            const userRef = 'user:default/guest';
            return ctx.issueToken({
              claims: {
                sub: userRef,
                ent: [userRef],
              },
            });
          },
        },
      }),
      google: providers.google.create({
        signIn: {
          async resolver({ result }, ctx) {
            const name = result.fullProfile.emails![0].value;
            console.log(result.accessToken);
            console.log(result.fullProfile.id);

            if (!name) {
              throw new Error('Request did not contain a user');
            }

            try {
              // Attempts to sign in existing user
              const signedInUser = await ctx.signInWithCatalogUser({
                entityRef: { name },
              });

              return Promise.resolve(signedInUser);
            } catch (e) {
              // Create stub user
              const userEntityRef = stringifyEntityRef({
                kind: 'User',
                name: name,
                namespace: DEFAULT_NAMESPACE,
              });
              return ctx.issueToken({
                claims: {
                  sub: userEntityRef,
                  ent: [userEntityRef],
                },
              });
            }
          },
        },
      }),
    },
  });
}

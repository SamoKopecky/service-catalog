# Contributing

Any contributions are welcome!

## Issues

We'd love you to open issues, if they're relevant to this repository: feature requests, bug reports, etc. are all welcome.

In particular, if you have a large PR you want to send our way, it may make sense to open an issue to discuss it with the maintainers first.

## Submitting a pull request

1. [Fork][1] and clone the repository
2. Make your changes
3. Push to your fork and submit a [pull request][2]
4. Pat your self on the back and wait for your pull request to be reviewed and merged.

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- Install and use [pre-commit][3] to follow the same code style and conventions.
- Keep your change as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- Write a [good commit message][4], please use [conventional commits][5]

Work in Progress pull requests are also welcome to get feedback early on, or if there is something blocked you. Please open such pull requests as *Draft*.

## Development setup

You can either run a development setup locally or in a k8s cluster.

### Run locally

Before you begin please install and use the supported Node.js version (we support [NVM][6]), check `.nvmrc` for the appropriate version.

Configurations for the local setup are located in `app-config.local.yaml`.

1. Firstly create your `.env` file from the template in `.env.example`.

2. If you are running the app for the first time run:

    ```sh
    # Install depedencies
    yarn install

    # Compile
    yarn tsc
    ```

3. Run the app with:

    ```sh
    # Run with hot reload capabilities
    yarn dev
    ```

4. A tab in your default browser should open by default if not, the app will be available on http://localhost:3000.

For local development with the kubernetes plugin, kubectl proxy is by default started on port `8001`, if you have something already running on this port make sure to add the `--port=<your_port>` option to the kubectl proxy command in `yarn dev` script.

### Run in a Kubernetes cluster

Configurations for the cluster dev setup are in `app-config.dev.yaml`. Make sure to edit the `.app.baseUrl`, `.backend.baseUrl` and `.backend.cors.origin` urls to the address backstage will be hosted on.

Some plugins require secrets to function, they can configured in the `manifests/overlays/dev/secret.yaml` file.

1. Update the image repository URL with your image repository:

    ```sh
    cd manifests/overlays/dev && kustomize edit set image quay.io/operate-first/service-catalog=<your url> && cd -
    ```

2. Deploy using

    ```sh
    {oc,kubectl} apply -k manifests/overlays/dev
    ```

### Local GitHub integration

If you want to gain access to GitHub content in development setup, please create a GitHub OAuth application [as described here](https://roadie.io/blog/github-auth-backstage/) and update your `.env` file accordingly.

### S2I image

This repository uses s2i to create images. To create image run script located in `packages/backend`:

```sh
./packages/backend/build-image.sh
```

This will generate an image called `service-catalog`, this image is aimed to be used in production so it needs access to PostgreSQL database. To run this image with podman run:

```sh
export BACKEND_SECRET=$(node -p 'require("crypto").randomBytes(24).toString("base64")')
podman run -it -p 7007:7007 --env "BACKEND_SECRET" service-catalog:latest
```

[1]: https://github.com/operate-first/service-catalog/fork
[2]: https://github.com/operate-first/service-catalog/compare
[3]: https://pre-commit.com
[4]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
[5]: https://www.conventionalcommits.org/en/v1.0.0
[6]: https://github.com/nvm-sh/nvm

# Update "sample" references

If this repository has been cloned from the base api, there are many references to "sample" as a namespace or resource. Those must be updated to your application's namespace. Common examples are found in the following files:
- overlay/prod/webapi-deployment.yaml
- base/kustomization.yaml
- base/webapi-deployment.yaml
- base/webapi-service.yaml
- base/webapi-ingress.yaml

# Create the namespace

Before running any subsequent commands, ensure the namespace is created. You can create a namespace from a yaml definition and use kubectl create/apply.

```sh
kubectl create -f sample-namespace.yaml
```

# Create the Kubernetes resources

To create kubernetes resources, use the -k flag to specify a kustomization file. This will apply environment specific overrides to the base resources.

```sh
kubectl apply -k ./overlay/dev/
```

# Token Replacement

Some of the resources (such as webapi-ingress) can contain token replacements using the syntax `#{Token}#`. This replacement happens during the Azure DevOps release pipeline.

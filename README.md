````
kube-counter/
├── backend/                # Golang API
├── frontend/               # React app
├── k8s/
│   ├── base/               # Kustomize base
│   └── overlays/
│       ├── dev/
│       └── prod/
├── helm/
│   └── postgresql/         # Helm release config (values.yaml)
├── scripts/                # Utility scripts
├── README.md
```
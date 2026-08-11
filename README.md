# KubeCounter

A cloud-native counter application built with Kubernetes, featuring a React frontend, REST API backend, and PostgreSQL database.

## Description

KubeCounter is a full-stack web application demonstrating modern Kubernetes deployment practices. It showcases a three-tier architecture with proper service mesh configuration, persistent storage, zero-trust network policies, and Gateway API routing.

## Architecture

- **Frontend**: React-based client served via Nginx
- **Backend**: REST API server (Port 8080)
- **Database**: PostgreSQL 16 with persistent storage
- **Ingress**: Gateway API (HTTPRoute) with path-based routing
- **Security**: Granular NetworkPolicies enforcing zero-trust segmentation

## Features

- Kubernetes-native deployment managed with Kustomize
- Zero-trust network security with granular NetworkPolicies
- Secret management for database credentials
- Persistent data storage with StatefulSets
- Gateway API routing for frontend and API
- PostgreSQL database with initialization scripts
- Consistent labeling and best practices

## Network Security

KubeCounter implements a zero-trust network model using Kubernetes NetworkPolicies:

- **Default Deny All**: Restricts all incoming and outgoing traffic across the namespace by default
- **Frontend Policy**: Allows inbound HTTP traffic on port 80 from ingress gateways and DNS egress
- **Backend Policy**: Allows inbound API traffic on port 8080 from frontend pods/gateways, DNS egress, and outbound egress on port 5432 to PostgreSQL
- **Database Policy**: Restricts inbound database traffic on port 5432 strictly to backend API pods only

## Prerequisites

- Kubernetes cluster (v1.33+)
- kubectl configured
- Gateway API controller / Gateway installed
- Docker images available at `mmaous/kubecounter-client` and `mmaous/kubecounter-server`

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/kubecounter.git
cd kubecounter
```

### 2. Deploy to Kubernetes

Using Kustomize (recommended):

```bash
kubectl apply -k kube/overlays/dev
```

Or apply individual base manifests:

```bash
# Create namespace and default deny security policy
kubectl apply -f kube/base/namespace.yaml
kubectl apply -f kube/base/default-deny.yaml

# Deploy PostgreSQL
kubectl apply -f kube/base/postgres/statefulset.yaml
kubectl apply -f kube/base/postgres/service.yaml
kubectl apply -f kube/base/postgres/networkpolicy.yaml

# Deploy backend API
kubectl apply -f kube/base/backend/deployment.yaml
kubectl apply -f kube/base/backend/service.yaml
kubectl apply -f kube/base/backend/networkpolicy.yaml

# Deploy frontend
kubectl apply -f kube/base/frontend/deployment.yaml
kubectl apply -f kube/base/frontend/service.yaml
kubectl apply -f kube/base/frontend/httproute.yaml
kubectl apply -f kube/base/frontend/networkpolicy.yaml
```

### 3. Verify deployment

```bash
kubectl get pods -n kubecounter
kubectl get netpol -n kubecounter
kubectl get httproute -n kubecounter
```

### 4. Access the application

The application will be available at your gateway hostname:
- Frontend: `https://kubecounter.mmlabs.me/`
- API: `https://kubecounter.mmlabs.me/api/`

## Configuration

### Database Credentials

Default credentials are configured via Kustomize secret generator:
- Username: `devuser`
- Password: `devpass`

⚠️ **Important**: Change these credentials in production!

### Environment Variables

Backend configuration (see `kube/base/backend/deployment.yaml`):
- `DB_HOST`: PostgreSQL service hostname (`postgres-svc`)
- `DB_PORT`: PostgreSQL port (`5432`)
- `DB_NAME`: Database name (`counterdb`)
- `DB_USER`: Database username (from secret)
- `DB_PASSWORD`: Database password (from secret)
- `SERVER_PORT`: API server port (`8080`)

## Project Structure

```
kubecounter/
├── backend/
│   ├── Dockerfile
│   └── main.go
├── frontend/
│   ├── Dockerfile
│   └── src/
├── kube/
│   ├── base/
│   │   ├── kustomization.yaml
│   │   ├── namespace.yaml
│   │   ├── default-deny.yaml
│   │   ├── backend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── networkpolicy.yaml
│   │   ├── frontend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── httproute.yaml
│   │   │   └── networkpolicy.yaml
│   │   └── postgres/
│   │       ├── statefulset.yaml
│   │       ├── service.yaml
│   │       ├── init.sql
│   │       └── networkpolicy.yaml
│   └── overlays/
│       └── dev/
│           └── kustomization.yaml
└── README.md
```

## Database Schema

The application uses a simple counter schema:

```sql
CREATE TABLE counters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value INTEGER DEFAULT 0
);
```

## Resource Limits

All components are configured with resource limits:
- Frontend: 128Mi memory, 250m CPU
- Backend: 128Mi memory, 250m CPU
- Database: 10Gi persistent storage

## Troubleshooting

### Check pod status
```bash
kubectl get pods -n kubecounter
kubectl describe pod <pod-name> -n kubecounter
```

### Check network policies
```bash
kubectl get netpol -n kubecounter
kubectl describe netpol <policy-name> -n kubecounter
```

### View logs
```bash
kubectl logs -n kubecounter deployment/kubecounter-server
kubectl logs -n kubecounter deployment/kubecounter-client
kubectl logs -n kubecounter statefulset/app-postgres
```

### Test database connectivity
```bash
kubectl exec -it app-postgres-0 -n kubecounter -- psql -U devuser -d counterdb
```

### Common Issues

1. **Connection timeouts or 503 errors**: Ensure `frontend-network-policy` and `backend-network-policy` are applied to allow gateway and inter-pod traffic through `default-deny-all`.
2. **Database connection errors**: Verify backend network policy permits egress on port 5432 and PostgreSQL network policy allows ingress from backend pods.
3. **HTTPRoute not routing**: Ensure Gateway API controller is installed and `mpes-gateway` is running.

## Development

To build and push new Docker images:

```bash
# Backend
docker build -t mmaous/kubecounter-server:latest ./backend
docker push mmaous/kubecounter-server:latest

# Frontend
docker build -t mmaous/kubecounter-client:latest ./frontend
docker push mmaous/kubecounter-client:latest
```

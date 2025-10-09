# KubeCounter

A cloud-native counter application built with Kubernetes, featuring a React frontend, REST API backend, and PostgreSQL database.

## Description

KubeCounter is a full-stack web application demonstrating modern Kubernetes deployment practices. It showcases a three-tier architecture with proper service mesh configuration, persistent storage, and ingress routing.

## Architecture

- **Frontend**: React-based client served via Nginx
- **Backend**: REST API server (Port 8080)
- **Database**: PostgreSQL 16 with persistent storage
- **Ingress**: Nginx Ingress Controller with path-based routing

## Features

- Kubernetes-native deployment
- Secret management for database credentials
- Persistent data storage with StatefulSets
- Ingress routing for frontend and API
- PostgreSQL database with initialization scripts
- Consistent labeling and best practices

## Prerequisites

- Kubernetes cluster (v1.33+)
- kubectl configured
- Nginx Ingress Controller installed
- Docker images available at `mmaous/kubecounter:client` and `mmaous/kubecounter:server`

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/kubecounter.git
cd kubecounter
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f kube/namespace.yaml

# Deploy secrets
kubectl apply -f kube/secrets.yaml

# Deploy PostgreSQL
kubectl apply -f kube/postgres/init-sql-configmap.yaml
kubectl apply -f kube/postgres/statefulset.yaml
kubectl apply -f kube/postgres/service.yaml

# Deploy backend
kubectl apply -f kube/backend/deployment.yaml
kubectl apply -f kube/backend/service.yaml
kubectl apply -f kube/backend/ingress.yaml

# Deploy frontend
kubectl apply -f kube/frontend/deployment.yaml
kubectl apply -f kube/frontend/service.yaml
kubectl apply -f kube/frontend/ingress.yaml
```

### 3. Verify deployment

```bash
kubectl get pods -n kubecounter
kubectl get ingress -n kubecounter
```

### 4. Access the application

The application will be available at your ingress controller's IP address:
- Frontend: `http://<ingress-ip>/`
- API: `http://<ingress-ip>/api/`

## Configuration

### Database Credentials

Default credentials are stored in `kube/secrets.yaml` (base64 encoded):
- Username: `devuser`
- Password: `devpass`

⚠️ **Important**: Change these credentials in production!

To update credentials:

```bash
echo -n 'newuser' | base64
echo -n 'newpassword' | base64
```

Update the values in `kube/secrets.yaml` and reapply.

### Environment Variables

Backend configuration (see `kube/backend/deployment.yaml`):
- `DB_HOST`: PostgreSQL service hostname
- `DB_PORT`: PostgreSQL port (5432)
- `DB_NAME`: Database name
- `DB_USER`: Database username (from secret)
- `DB_PASSWORD`: Database password (from secret)
- `SERVER_PORT`: API server port (8080)

## Project Structure

```
kubecounter/
├── kube/
│   ├── namespace.yaml
│   ├── secrets.yaml
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── postgres/
│       ├── statefulset.yaml
│       ├── service.yaml
│       └── init-sql-configmap.yaml
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
- Frontend: 128Mi memory, 500m CPU
- Backend: 128Mi memory, 500m CPU
- Database: 1Gi persistent storage

## Troubleshooting

### Check pod status
```bash
kubectl get pods -n kubecounter
kubectl describe pod <pod-name> -n kubecounter
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

1. **Pods not starting**: Check if secrets are created before deployments
2. **Database connection errors**: Verify the postgres service is running and accessible
3. **Ingress not working**: Ensure Nginx Ingress Controller is installed

## Development

To build and push new Docker images:

```bash
# Backend
docker build -t mmaous/kubecounter:server ./backend
docker push mmaous/kubecounter:server

# Frontend
docker build -t mmaous/kubecounter:client ./frontend
docker push mmaous/kubecounter:client
```

# Linux Devnet Setup

### Experimental Setup Script

There's an experimental one command setup script that should install dependencies for you on Linux and configure everything properly. This is only recommended if you're running headless Linux and unable to use Docker Desktop, as with Docker Desktop you don't need `minikube` and can just enable Kubernetes from Docker.

```sh
curl $URL | sh install_linux.sh
cd wormhole/
./tilt.sh
```

## Regular Setup

### 1. Install Go

```sh
wget https://go.dev/dl/go1.18.1.linux-amd64.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.1.linux-amd64.tar.gz
```

### 2. Install Docker

If you're using Linux with a window manager, consider getting Docker Desktop instead of the following command. It comes with Kubernetes built in and you won't need to download `minikube`. It's recommended to have at least 4 CPUs and 16GB RAM dedicated to Docker.

Also make sure that you set up docker as a NON ROOT USER!

[https://docs.docker.com/engine/install/ubuntu/#installation-methods](https://docs.docker.com/engine/install/ubuntu/#installation-methods)

### 3. (Docker Desktop Install)

Enable Kubernetes by going into Settings > Kubernetes

### 3. (Non Docker Desktop)

Install [`minikube`](https://minikube.sigs.k8s.io/docs/start/)

Configure minikube

```
minikube start --driver=docker --kubernetes-version=v1.23.3 --cpus=4 --memory=14G --disk-size=10G --namespace=wormhole
```

If you reboot your VM you'll need to run the `minikube start` command again before you bring up tilt.

### 4. Install Tilt

Install tilt by copy pasting this into the Terminal

```sh
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```

### 5. Clone the Wormhole Repo and start Tilt

```sh
git clone --branch dev.v2 https://github.com/wormhole-foundation/wormhole.git
```

If you're running tilt on your machine

```sh
cd wormhole/
tilt up
```

If you're running tilt in a VM, we need to pass in some extra flags to enable Tilt to listen to incoming traffic from external addresses.

```sh
cd wormhole
tilt up --host=0.0.0.0 -- --webHost=0.0.0.0
```

You can now access the Tilt UI at either your `localhost:10350` or `vm_external_ip:10350`.

If the VM's external IP doesn't work, check firewall and port settings to make sure your VM allows incoming traffic.

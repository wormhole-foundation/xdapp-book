# Troubleshooting

Tilt, Kubernetes, and Docker may be new tools for developers entering the Wormhole ecosystem. This section is meant to provide some additional support when setting up the Wormhole Tilt environment.

# macOS Install

## Prerequisites

Install [Homebrew](https://brew.sh) if you don't already have it.

You can grab it with:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

From there, all the other installs are one-liners.

### 1. Install Go

```sh
brew install go
```

### 2. Install Docker

```sh
brew install docker
```

After installation, go into Docker settings and switch ON `kubernetes`. Also configure Docker to have 4 CPUs and ~16GB of RAM.

### 3. Install Tilt

```sh
brew install tilt
```

### 4. Clone Wormhole Repo and Start Tilt

```sh
git clone --branch main https://github.com/wormhole-foundation/wormhole.git
cd wormhole/
tilt up
```

You'll be able to access the Tilt UI at
`localhost:10350`

# Linux & WSL Install

## Script Setup

If you're using a Debian distro, you should run the [dev-setup.sh](https://github.com/wormhole-foundation/wormhole/blob/main/scripts/dev-setup.sh) script. Even if you're not using Debian, this script still contains the main steps for setup.

## Regular Setup

### 1. Install Go

```sh
wget https://go.dev/dl/go1.18.1.linux-amd64.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.1.linux-amd64.tar.gz
```

### 2. Install Docker

If you're using Linux with a window manager, consider getting Docker Desktop instead of the following command. It comes with Kubernetes built in and you won't need to download `minikube`. It's recommended to have at least 4 CPUs and 16GB RAM dedicated to Docker.

Also, make absolutely sure that you set up Docker as a non-root user.

[https://docs.docker.com/engine/install/ubuntu/#installation-methods](https://docs.docker.com/engine/install/ubuntu/#installation-methods)

### 3a. (Docker Desktop Install)

Enable Kubernetes by going into Settings > Kubernetes

### 3b. (Non Docker Desktop)

Install [`minikube`](https://minikube.sigs.k8s.io/docs/start/).

Configure minikube:

```
minikube start --driver=docker --kubernetes-version=v1.23.3 --cpus=4 --memory=14G --disk-size=10G --namespace=wormhole
```

Minikube needs to be running for tilt to work, so always make sure to run `minikube start` before you bring up tilt.

### 4. Install Tilt

Install Tilt by copy pasting this into the Terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```

### 5. Clone the Wormhole Repo and start Tilt

```sh
git clone --branch main https://github.com/wormhole-foundation/wormhole.git
```

If you're running Tilt on your machine:

```sh
cd wormhole/
tilt up
```

If you're running Tilt in a VM, you'll need to pass in some extra flags to enable Tilt to listen to incoming traffic from external addresses:

```sh
cd wormhole
tilt up --host=0.0.0.0 -- --webHost=0.0.0.0
```

You can now access the Tilt UI at either `localhost:10350` or `vm_external_ip:10350`.

If the VM's external IP doesn't work, check firewall and port settings to make sure your VM allows incoming traffic.

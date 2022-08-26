# macOS Setup

## Prerequisites

You'll need to have `homebrew` on your system if you don't already. You can grab it with:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Install Go

```sh
brew install go
```

## Install Docker

```sh
brew install docker
```

After installation, go into Docker settings and switch ON `kubernetes`. Also configure Docker to have 4 CPUs and ~16GB of RAM.

## Install Tilt

```sh
brew install tilt
```

## Clone Wormhole Repo and Start Tilt

```sh
git clone --branch dev.v2 https://github.com/wormhole-foundation/wormhole.git
```

```sh
cd wormhole/
tilt up
```

You'll be able to access the Tilt UI at
`localhost:10350`

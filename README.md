# Instructions (WSL Ubuntu environment)

Deploying this project requires git, docker, and docker compose.

## Setting up Docker

### Installing Docker and Docker Compose

Source: <https://docs.docker.com/engine/install/ubuntu/>

Uninstall all conflicting packages:

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

Set up Docker's APT repository:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

Finally, install the latest version of Docker:

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Follow the common Docker post-installation steps

Source: <https://docs.docker.com/engine/install/linux-postinstall/>

To avoid having to use 'sudo' with Docker commands:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

For the changes to take effect, re-log or run:

```bash
newgrp docker
```

To configure Docker to start on boot with systemd:

```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

You can stop Docker from starting on boot by running:

```bash
sudo systemctl disable docker.service
sudo systemctl disable containerd.service
```

## Cloning and running the project

Navigate to where you want to clone the repository:
```bash
cd projects
```

Clone the repository:
```bash
git clone https://github.com/Caderk/sani-task.git
```

Navigate inside the cloned project:
```bash
cd sani-task/
```

Run the docker compose:
```bash
docker compose up --build -d
```
Tests will be run on deployment.

To see the logs of the current execution run:
```bash
docker compose logs
```

To remove the containers run:
```bash
docker compose down
```
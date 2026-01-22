#!/bin/bash
set -e

echo "🔧 Setting up Ubuntu VPS for Podman..."

# 1. Install Podman and helper tools
echo "📦 Installing Podman..."
sudo apt-get update -qq
sudo apt-get install -y podman podman-compose

# 2. Allow unprivileged users to bind ports 80 & 443
# By default, non-root users can only bind ports > 1024
echo "🔓 Configuring port binding permissions..."
if ! grep -q "net.ipv4.ip_unprivileged_port_start=80" /etc/sysctl.conf; then
    echo "net.ipv4.ip_unprivileged_port_start=80" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
fi

# 3. Enable lingering
echo "👻 Enabling user lingering..."
loginctl enable-linger $USER

# 4. Configure registries (fixes short-name resolution error)
echo "🌐 Configuring image registries..."
sudo mkdir -p /etc/containers
echo 'unqualified-search-registries = ["docker.io", "quay.io"]' | sudo tee /etc/containers/registries.conf

echo "✅ Setup complete! You can now use ./deploy.sh"

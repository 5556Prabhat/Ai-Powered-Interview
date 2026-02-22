FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install compilers and runtimes
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    openjdk-17-jdk \
    python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Default command
CMD ["bash"]

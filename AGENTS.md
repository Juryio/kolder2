@@ -0,0 +1,86 @@
# Running the Kolder Application without Docker

This document provides instructions for setting up and running the Kolder application on a local machine without using Docker.

## Prerequisites

- Node.js (v18 or later)
- npm
- MongoDB

## 1. Install and Run MongoDB

The application requires a running MongoDB instance. If you do not have MongoDB installed, you will need to install it first.

On Debian-based systems (like Ubuntu), you can install it using the following commands. You may need to find different instructions for other operating systems.

```bash
# Add the MongoDB repository GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

# Add the MongoDB repository to your sources list
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Update your package list and install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable the MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

You can check that the service is running with `sudo systemctl status mongod`.

## 2. Install Application Dependencies

The project has two parts, a backend server and a frontend application, each with its own dependencies.

### Backend Dependencies

Navigate to the `server` directory and install the dependencies:
```bash
cd server
npm install
cd ..
```

### Frontend Dependencies

Navigate to the `kolder-app` directory and install the dependencies:
```bash
cd kolder-app
npm install
cd ..
```

## 3. Run the Application

Now you can start the application.

### Start the Backend Server

The backend server connects to MongoDB and serves the API and the frontend. Run it from the **root of the project directory**.

```bash
# Run the server in the background
node server/server.js &
```

The server will be running on `http://localhost:3001`. You can check the `server/server.log` file for any output or errors.

### Build the Frontend

The frontend application needs to be built into static assets that the server can use.

```bash
cd kolder-app
npm run build
cd ..
```

## 4. Access the Application

Once the backend server is running and the frontend has been built, you can access the application by opening a web browser and navigating to:

[http://localhost:8448](http://localhost:8448)

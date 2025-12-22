#!/bin/bash

# This script sets up the Swaas project environment

# Navigate to the backend directory and install dependencies
cd backend
npm install

# Navigate to the frontend directory and install dependencies
cd ../frontend
npm install

# Print a message indicating that the setup is complete
echo "Setup complete! You can now run the backend and frontend applications."
#!/bin/bash

# Start the Django backend server
cd backend
python manage.py runserver &
BACKEND_PID=$!

# Start the student frontend
cd ../studentfrontend
npm run dev &
FRONTEND_PID=$!

# Function to kill both servers on script termination
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Set up trap to catch termination signal
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 
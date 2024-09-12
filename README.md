Eleveg Backend

Welcome to the backend service for the Eleveg application, which supports user management, personalized recommendations, and a rewards system. This project demonstrates my skills in building robust backend systems with Node.js, Express, and MongoDB.

Features

User Authentication & Management

Register, login, and manage user profiles

Secure authentication with JWT tokens

Personalized Recommendations

Generate and save meal recommendations based on user data
Utilize OpenAI for intelligent meal planning

Rewards System

Daily tasks and challenges to earn coins
Track user coin balances
Technologies Used
Node.js & Express: Server-side logic and API routing
MongoDB & Mongoose: Database management and schema modeling
JWT: Secure user authentication
OpenAI API: Generating personalized meal plans
Getting Started
Prerequisites
Node.js
npm
MongoDB
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/your-username/eleveg-backend.git
cd eleveg-backend
Install dependencies:

bash
Copy code
npm install
Create a .env file in the root of the project and add your MongoDB URI and JWT secret:

env
Copy code
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Start the server:

bash
Copy code
node server.js
The server will start on port 5000 by default.

API Overview
User Routes
Register: POST /api/users/register
Login: POST /api/users/login
Get Profile: GET /api/users/me
Update Profile: PUT /api/users/me
Recommendation Routes
Generate Recommendations: POST /api/recommendations/generate
Save Recommendations: POST /api/recommendations/save
Get Recommendations: GET /api/recommendations
Reward Routes
Create Reward: POST /api/rewards/create
Get Rewards: GET /api/rewards
Check-in: POST /api/rewards/checkin
Get Balance: GET /api/rewards/balance
Highlights
Scalable Architecture: Designed to handle a growing user base and increasing data volume.
Security: Implemented JWT for secure user authentication.
Integration with OpenAI: Leveraged OpenAI's API for generating personalized recommendations, showcasing the ability to integrate with external APIs.

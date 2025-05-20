# Project Bidding Platform - Frontend
This repository contains the frontend of the Project Bidding Platform, a web application that connects buyers and sellers for project-based bidding. Buyers can create projects, sellers can place bids with estimated completion times, and buyers can select the best bid. The frontend is built with Next.js and deployed on Vercel.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Approach](#approach)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Deployment (Vercel)](#deployment-vercel)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Related Repositories](#related-repositories)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Register, login, and logout with role-based access (buyer/seller).
- **Project Creation**: Buyers can create projects with titles and descriptions.
- **Bidding System**: Sellers can place bids, specifying bid amount and estimated completion time.
- **Bid Selection**: Buyers can view bids and select one, triggering a notification mail to the seller.
- **Toast Notifications**: In-app success/error messages using React Hot Toast (e.g., "Bid placed successfully!").
- **Professional UI**: Responsive design with light/dark mode, styled with Tailwind CSS.
- **Role-Based Navigation**: Dynamic UI based on user role (e.g., "Place a Bid" for sellers, "Select Bid" for buyers).
- **Loading/Error States**: Polished loading and error messages for better UX.

## Tech Stack
- **Next.js**: React framework for server-side rendering, routing, and API routes.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **React Hot Toast**: Lightweight toast notifications for user feedback.
- **Vercel**: Hosting platform with automatic scaling and deployment.

## Approach
The frontend was designed with a focus on user experience and modularity:
- **Modular Components**: Reusable components like `NavBar` and `ProtectedRoute` for consistency.
- **State Management**: Used React Context (`authContext`) for managing user authentication state.
- **UI/UX**: Implemented a professional design with Tailwind CSS, including light/dark mode support, responsive layouts, and toast notifications for feedback.
- **API Integration**: Fetches data from the backend API (e.g., projects, bids) and handles user actions (e.g., placing bids, selecting bids).
- **Error Handling**: Added loading spinners, error states, and authentication redirects to enhance usability.

## Project Structure
Project-Bidding-Frontend/
├── app/
│   ├── globals.css                # Global styles (Tailwind CSS and custom styles)
│   └── layout.tsx                 # Root layout with NavBar, AuthProvider, and Toaster
├── components/
│   ├── NavBar.tsx                 # Navigation bar with role-based links and logout
│   └── ProtectedRoute.tsx         # Component to protect routes based on authentication
├── lib/
│   └── authContext.tsx            # Authentication context for managing user state
├── pages/
│   ├── projects/
│   │   ├── [id]/
│   │   │   └── page.tsx           # Project details page (view bids, select bid)
│   │   └── create/
|   |       └── page.tsx           # Form to create a new project
│   │   └── list/
|   |       └── page.tsx           # List of projects (completed,In progress,pending)
│   ├── login.tsx                  # Login page
│   ├── signup.tsx                 # Registration page
│   └── dashboard.tsx              # Dashboard for authenticated users
├── public/                        # Static assets (e.g., images)
├── tailwind.config.js             # Tailwind CSS configuration
├── package.json                   # Dependencies and scripts
├── next.config.mjs                # Next.js configuration (if applicable)
└── README.md                      # Project documentation

## Setup Instructions

### Prerequisites
- **Node.js**: Version 20.x (specified in `package.json` engines).
- **npm**: Version 10.x (specified in `package.json` engines).
- **Vercel CLI**: For deployment.

### Local Setup
1. **Clone the Repository**:
   ```bash
   git clone <frontend-repo-url>
   cd Project-Bidding-Frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_API_URL=https://project-bidding-backend-e8985cdcf68d.herokuapp.com/api
   ```

4. **Run Locally**:
   ```bash
   npm run dev
   ```
   - The app will be available at `http://localhost:3000`.

### Deployment (Vercel)
1. **Log in to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy the App**:
   ```bash
   vercel --prod
   ```
   - Vercel will provide a URL (e.g., `https://bidding-system-frontend.vercel.app/`).

3. **Set Environment Variables in Vercel**:
   - Go to the Vercel dashboard > Settings > Environment Variables.
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://project-bidding-backend-e8985cdcf68d.herokuapp.com/api
     ```

### Environment Variables
| Variable             | Description                              | Example Value                                  |
|----------------------|------------------------------------------|------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API                  | `https://project-bidding-backend-e8985cdcf68d.herokuapp.com/api` |

## Usage
1. **Register/Login**:
   - Visit `/signup` or `/login` to create an account or log in.
   - Choose a role: `buyer` (to create projects) or `seller` (to bid on projects).

2. **Create a Project (Buyer)**:
   - Navigate to `/projects/create`.
   - Enter a title and description, then submit.

3. **Place a Bid (Seller)**:
   - Go to a project details page (e.g., `/projects/1`).
   - Click "Place a Bid", enter your bid amount and estimated completion time, then submit.

4. **Select a Bid (Buyer)**:
   - On the project details page, view all bids and their completion times.
   - Click "Select Bid" to choose a bid and notify the seller.

## Related Repositories
- **Backend**: [Project-Bidding-Backend](#) (replace with the actual repo URL)
- **Deployed App**:
  - Frontend: [https://bidding-system-frontend.vercel.app/](https://bidding-system-frontend.vercel.app)
  - Backend: [https://project-bidding-backend-e8985cdcf68d.herokuapp.com](https://project-bidding-backend-e8985cdcf68d.herokuapp.com)

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Create a pull request.

## License
This project is licensed under the MIT License.
```
# Firebase Studio - StudyQuest

StudyQuest is a Next.js application designed as a daily learning companion. Users can access learning materials, take quizzes, and earn points. Administrators can manage content such as learning materials, quizzes, and announcements. The application also features GenAI capabilities for content generation (though not fully implemented in the current user-facing version).

## Repository

The source code for this project is hosted on GitHub at:
[https://github.com/peter29ljf/knowledge](https://github.com/peter29ljf/knowledge)

## Features

- **User Authentication:** Simple role-based login (User/Admin).
- **Dashboard:** Personalized welcome, date display, user score, and admin announcements.
- **Learning Materials:** Daily content accessible by date.
- **Quizzes:** Daily quizzes with immediate feedback and scoring.
- **Admin Panel:**
    - Manage Learning Materials (Add/Edit/Delete - Edit/Delete are UI only for now).
    - Manage Quizzes (Add/Edit/Delete - Edit/Delete are UI only for now).
    - Manage Announcements (Add/Delete - Delete is UI only for now).
    - View user messages (basic implementation).
- **Responsive Design:** Adapts to different screen sizes.
- **Styling:** Uses ShadCN UI components and Tailwind CSS.
- **GenAI Integration (Backend):** Uses Genkit for potential AI-powered features (e.g., content generation, though specific flows are not yet exposed in UI).

## File Structure

The project follows a standard Next.js App Router structure:

```
.
├── public/                 # Static assets
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/          # Genkit flow definitions (if any were added)
│   │   ├── dev.ts          # Genkit development server entry point
│   │   └── genkit.ts       # Genkit global AI object initialization
│   ├── app/                # Next.js App Router
│   │   ├── (app)/          # Authenticated user routes (dashboard, learning, quiz)
│   │   │   ├── dashboard/
│   │   │   ├── learning/
│   │   │   └── quiz/
│   │   ├── (auth)/         # Authentication routes (login)
│   │   │   └── login/
│   │   ├── admin/          # Admin panel routes
│   │   │   ├── announcements/
│   │   │   ├── materials/
│   │   │   └── quizzes/
│   │   ├── api/            # API routes (e.g., webhook)
│   │   ├── globals.css     # Global styles and ShadCN theme
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Root page (handles initial redirection)
│   ├── components/         # React components
│   │   ├── auth/           # Authentication related components
│   │   ├── dashboard/      # Dashboard specific components
│   │   └── ui/             # ShadCN UI components
│   ├── contexts/           # React context providers (Auth, AppData)
│   ├── hooks/              # Custom React hooks (useLocalStorage, useMobile, useToast)
│   ├── lib/                # Utility functions and type definitions
│   │   ├── dataService.ts  # Mock data service
│   │   └── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # ShadCN utility functions
├── components.json         # ShadCN UI configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Key Dependencies

- **Framework:** Next.js (@latest)
- **UI Components:** ShadCN UI, Radix UI primitives, Lucide React (icons)
- **Styling:** Tailwind CSS
- **State Management:** React Context API, `react-hook-form`
- **GenAI:** Genkit, @genkit-ai/googleai
- **Utilities:** date-fns, Zod (for schema validation, primarily in Genkit)
- **Data Persistence (Mock):** LocalStorage (`useLocalStorage` hook), in-memory `dataService.ts`

For a full list, see `package.json`.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/peter29ljf/knowledge.git
    cd knowledge
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables (Optional)

If you plan to use Google AI with Genkit and have specific API keys, you might need to set them up. Genkit typically looks for `GOOGLE_API_KEY` or uses application default credentials. For this project's current mock setup, no specific GenAI environment variables are strictly required for basic operation unless you extend the GenAI functionalities.

Create a `.env.local` file in the root of your project if needed:
```env
GOOGLE_API_KEY=your_google_api_key_here
```
(Note: The current `src/ai/genkit.ts` initializes GoogleAI plugin without explicit API key, relying on ADC or environment variables if set.)


## Usage

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```
This will typically start the application on `http://localhost:9002`.

### Running Genkit Development Server (Optional)

If you are working with Genkit flows and want to inspect or test them separately (though none are user-facing in the current version):

```bash
npm run genkit:dev
# or to watch for changes
npm run genkit:watch
```
This will start the Genkit development UI, usually on `http://localhost:4000`.

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

### Starting the Production Server

After building, to start the production server:

```bash
npm run start
# or
yarn start
```

## Project Structure Details

-   **`src/app`**: Contains all routes, layouts, and pages.
    -   **`(app)` group**: For routes accessible after user login (e.g., `/dashboard`, `/learning`).
    -   **`(auth)` group**: For authentication-related routes (e.g., `/login`).
    -   **`admin` group**: For administrator-specific routes and functionalities.
    -   **`api` group**: For backend API endpoints.
-   **`src/components`**: Reusable UI components.
    -   **`ui`**: Auto-generated components from ShadCN.
-   **`src/contexts`**: Global state management using React Context.
    -   `AuthContext.tsx`: Manages user authentication state.
    -   `AppDataContext.tsx`: Manages application data like learning materials, quizzes, user scores.
-   **`src/hooks`**: Custom React hooks for shared logic.
-   **`src/lib`**: Core logic, type definitions, and utility functions.
    -   `dataService.ts`: Simulates a backend by providing and managing mock data. In a real application, this would interact with a database.
    -   `types.ts`: TypeScript interfaces for data structures.
-   **`src/ai`**: Genkit related code.
    -   `genkit.ts`: Initializes and configures the Genkit AI object.
    -   `dev.ts`: Entry point for the Genkit development server, typically imports flows to make them available.

## Styling

-   The project uses **Tailwind CSS** for utility-first styling.
-   **ShadCN UI** is used for pre-built, accessible components.
-   The base theme (colors, radius, etc.) is configured in `src/app/globals.css` using CSS variables, following ShadCN's theming approach.

## Data Handling

-   **Client-side data (User profile, Score):** Persisted in LocalStorage using the `useLocalStorage` hook.
-   **Application Content (Learning Materials, Quizzes, Announcements):** Currently managed by a mock `dataService.ts`. This service uses in-memory data structures. For persistence beyond a session or across different instances, this would need to be replaced with a proper backend database (e.g., Firebase Firestore).
-   **Admin actions (Add/Update/Delete content):** Interact with `dataService.ts`. Note that "update" and "delete" operations in the admin panel might be UI-only for some features in the current state and don't permanently alter the base mock data in `dataService.ts` across server restarts (though `add` operations do modify the in-memory data for the current session).

## GenAI Integration with Genkit

-   The application is set up to use **Genkit** with the **Google AI (Gemini)** plugin.
-   The Genkit instance is configured in `src/ai/genkit.ts`.
-   AI "Flows" (sequences of operations, potentially involving LLM calls) would typically reside in `src/ai/flows/`. These flows can be invoked from server components or API routes.
-   The provided codebase sets up the foundation for Genkit but does not include specific user-facing GenAI features out-of-the-box without further development of flows and their integration.

## Webhook

-   An example webhook endpoint is available at `src/app/api/webhook/content/route.ts`.
-   This endpoint allows for external updates to daily content (materials and quizzes) via a POST request.
-   It interacts with the `dataService.ts` to update the mock data.

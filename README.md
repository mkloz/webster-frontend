<p align="center">
  <img src="./public/logo.svg" width="100" />
</p>
<p align="center">
    <h1 align="center">Webster</h1>
</p>
<p align="center">
    <em>Design Without Limits</em>
</p>
<p align="center">
    <img src="https://img.shields.io/github/license/yourusername/webster-frontend?style=flat&color=0080ff" alt="license">
    <img src="https://img.shields.io/github/last-commit/yourusername/webster-frontend?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
    <img src="https://img.shields.io/github/languages/top/yourusername/webster-frontend?style=flat&color=0080ff" alt="repo-top-language">
    <img src="https://img.shields.io/github/languages/count/yourusername/webster-frontend?style=flat&color=0080ff" alt="repo-language-count">
<p>
<p align="center">
        <em>Developed with the software and tools below.</em>
</p>
<p align="center">
    <img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" alt="ESLint">
    <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=Docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/Zod-000000.svg?style=flat&logo=Zod&logoColor=white" alt="Zod">
    <img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=flat&logo=Prettier&logoColor=white" alt="Prettier">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind-CSS">
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/Zustand-000000.svg?style=flat&logo=Zustand&logoColor=white" alt="Zustand">
    <img src="https://img.shields.io/badge/Day.js-FF5F5F.svg?style=flat&logo=Day.js&logoColor=white" alt="Day.js">
    <img src="https://img.shields.io/badge/PostCSS-DD3A0A.svg?style=flat&logo=PostCSS&logoColor=white" alt="PostCSS">
    <img src="https://img.shields.io/badge/React_Query-FF4154?style=flat&logo=react-query&logoColor=white" alt="React Query">
    <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat&logo=reacthookform&logoColor=white" alt="React Hook Form">
    <img src="https://img.shields.io/badge/Konva.js-13A3E6.svg?style=flat&logoColor=white" alt="Konva.js">
</p>
<hr>

## 🔗 Quick Links

> - [📋 Overview](#-overview)
> - [🚀 Tech Stack](#-tech-stack)
> - [💻 Getting Started](#-getting-started)
>   - [⚙️ Installation](#️-installation)
>   - [🕜 Running Webster](#-running-webster)
> - [📂 Project Structure](#-project-structure)
> - [🔧 Environment Variables](#-environment-variables)
> - [🤝 Contributing](#-contributing)
> - [📄 License](#-license)

---

## 📋 Overview

Webster is a comprehensive design tool platform that empowers teams and individuals to create, edit, and manage professional designs directly in the browser. Featuring a high-performance canvas-based editor built with React and Konva.js, Webster offers real-time collaboration, advanced asset management, and multi-format export capabilities. Its modern, intuitive interface and robust toolset make it ideal for designers seeking flexibility and power.

### Key Features

- **Canvas-Based Editor**: High-performance, interactive editor for complex shape manipulation and rendering (60 FPS with Konva.js)
- **Asset Management**: Upload, organize, and search assets in a cloud-synced library
- **Multi-Format Export**: Export designs in PNG, SVG, PDF, and more with custom resolution settings
- **Performance Optimized**: Virtualized canvas and optimized rendering for handling 1000+ objects
- **User Authentication**: Secure login, registration, and account management
- **Project Management**: Create, open, duplicate, and manage design projects
- **Responsive Design**: Seamless experience across all devices
- **Modern UI/UX**: Minimalistic, user-friendly interface

---

## 🚀 Tech Stack

- **Core**: [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Konva.js](https://konvajs.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Communication**: [KY](https://github.com/sindresorhus/ky)
- **Data Fetching**: [React Query](https://tanstack.com/query/latest)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Date Handling**: [Day.js](https://day.js.org/)
- **Development**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [PostCSS](https://postcss.org/), [Husky](https://typicode.github.io/husky/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 💻 Getting Started

### ⚙️ Installation

1. Clone the webster-frontend repository:

```sh
git clone https://github.com/yourusername/webster-frontend
```

2. Change to the project directory:

```sh
cd webster-frontend
```

3. Install the dependencies:

```sh
npm install
```

### 🕜 Running Webster

Use the following command to run Webster in development mode:

```sh
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified in your Vite configuration).

### 📦 Building for Production

To build the application for production:

```sh
npm run build
```

To preview the production build locally:

```sh
npm run preview
```

## 📂 Project Structure

```plaintext
src/
├── assets/           # Static assets like logos
├── config/           # Application configuration
├── modules/          # Feature-based modules
│   ├── auth/         # Authentication related components
│   ├── canvas/       # Canvas editor and related components
│   ├── home/         # Home page and layout
│   ├── project/      # Project management features
│   ├── shared/       # Shared pages and utilities
│   ├── user/         # User profile and settings
│   └── ...
├── shared/           # Shared utilities, components, and hooks
│   ├── api/          # API client setup
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Library configurations
│   ├── store/        # Global state management
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   └── validators/   # Form validation schemas
├── styles/           # Global styles
└── main.tsx          # Application entry point
```

## 🔧 Environment Variables

The application may require the following environment variables:

```plaintext
VITE_API_URL=your_api_url
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Create a `.env` file in the root directory and add these variables with your specific values.

## 🤝 Contributing

Contributions are welcome! Here are several ways you can contribute:

- **Submit Pull Requests**: Review open PRs, and submit your own PRs.
- **Join the Discussions**: Share your insights, provide feedback, or ask questions.
- **Report Issues**: Submit bugs found or log feature requests for Webster.

<details><summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your GitHub account.
2. **Clone Locally**: Clone the forked repository to your local machine using a Git client.

```sh
git clone https://github.com/yourusername/webster-frontend
```

3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.

```sh
git checkout -b new-feature-x
```

4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.

```sh
git commit -m 'Implemented new feature x.'
```

6. **Push to GitHub**: Push the changes to your forked repository.

```sh
git push origin new-feature-x
```

7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.

Once your PR is reviewed and approved, it will be merged into the main branch.

</details>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

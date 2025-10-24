# R3 WebForm Builder

A modern, interactive web form builder application designed to create dynamic forms from R3 datasets. Built with React, TypeScript, and Vite, this tool provides a drag-and-drop interface for designing web forms connected to R3 data structures.

## Features

- **Visual Form Builder**: Intuitive drag-and-drop interface for creating forms
- **R3 Integration**: Connect to R3 environments and fetch datasets dynamically
- **Dataset Schema Explorer**: Browse and explore dataset tables and fields
- **Field Management**: Add, remove, and configure form fields with properties
- **Tree Structure Support**: Build hierarchical form structures with root and child tables
- **Session Persistence**: Connection details and form state saved across browser sessions
- **Real-time Preview**: See your form as you build it
- **Responsive Design**: Collapsible panels and adaptive layout

## Technology Stack

- **React 19.1.1** - UI framework
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.1.7** - Fast build tool and dev server
- **@dnd-kit** - Drag and drop functionality
- **React Icons** - Icon library
- **ESLint** - Code quality and consistency

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/eea/r3-webform-builder.git

# Navigate to project directory
cd r3-webform-builder

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# The application will be available at http://localhost:5173
```

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Docker Deployment

The application is containerized using a multi-stage Docker build with Nginx.

### Build Docker Image

```bash
docker build -t r3-webform-builder:1.0.0 .
```

### Run Docker Container

```bash
docker run -d -p 80:80 r3-webform-builder:1.0.0
```

### Remove Docker Image

```bash
docker rmi r3-webform-builder:1.0.0
```

## Application Structure

```
src/
├── components/
│   ├── formBuilder/       # Form builder components
│   │   ├── DraggableField.tsx
│   │   ├── DroppableFormArea.tsx
│   │   ├── FieldPropertiesPanel.tsx
│   │   └── SortableFormField.tsx
│   ├── modals/            # Modal dialogs
│   │   └── ConnectionModal.tsx
│   ├── ActionView.tsx     # Action panel component
│   ├── FormBuilderView.tsx # Main form builder view
│   ├── Navbar.tsx         # Navigation bar
│   └── SchemaView.tsx     # Dataset schema explorer
├── context/
│   └── AppContext.tsx     # Global application state
├── services/
│   └── api.ts             # R3 API integration
├── utils/
│   ├── formBuilder/       # Form builder utilities
│   └── sessionStorage.ts  # Session storage utilities
└── App.tsx                # Main application component
```

## Usage

1. **Connect to R3**: Click the "Connection" button in the navbar and provide:
   - Environment URL
   - API Key
   - Dataflow ID
   - Optional: WebForm Name

2. **Explore Schema**: Browse available datasets and tables in the left panel

3. **Build Form**: Drag fields from the schema explorer to the form builder area

4. **Configure Fields**: Adjust field properties, labels, and requirements

5. **Generate Output**: Export your form configuration as JSON

## Development

### React + TypeScript + Vite

This project uses Vite for fast development and optimized production builds with Hot Module Replacement (HMR) and ESLint rules.

**Available Vite plugins:**
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) - Uses Babel for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) - Uses SWC for Fast Refresh

**Note**: The React Compiler is not enabled due to its impact on dev & build performance. To enable it, see the [React Compiler documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

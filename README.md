# what3words Autosuggest Component

A high-performance, accessible, and responsive what3words address capture component built from scratch using React, TypeScript, and the what3words REST API.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18 or higher
- **API Key**: A what3words API Key ([Get one here](https://developer.what3words.com))

### Installation
1. Clone the private repository.
2. Install dependencies:
   ```bash
   npm install
3. Create a .env file in the root directory
   ```bash
   VITE_W3W_API_KEY=your_api_key_here
4. Start the development server:
   ```bash
   npm run dev
### Running Tests
- Unit Tests (Vitest): `npm test`
- E2E Tests (Playwright): `npm run test:e2e`

## 🏗️ Architecture & Technical Decisions
### Separation of Concerns (Headless Logic):
I implemented a **Custom Hook pattern** (`useAutosuggest`) to encapsulate all business logic, API calls, and state management. This ensures the UI components remain "dumb" and focused purely on rendering, making the system easier to test and maintain.
### Branding:
The `///` prefix is implemented via **CSS pseudo-elements (::before)**. This ensures the branding is visually fixed and cannot be manipulated by the user, preserving data integrity.
### Performance Optimizations
- **Debouncing**: API calls are throttled to 300ms to optimize network usage and cost.
- **Request Cancellation**: Utilized `AbortController` to cancel stale API requests during fast typing, preventing race conditions.
- **Memoization**: `useCallback` for event handlers to minimize unnecessary re-renders.
### Accessibility (WCAG 2.1 AA)
- **WAI-ARIA**: Implemented the **Combobox pattern** with `aria-activedescendant`, `aria-expanded`, and `role="listbox"`.
- **Keyboard Navigation**: Full support for `ArrowUp`, `ArrowDown`, `Enter` (selection), and `Escape` (closing).

## ⚖️ Trade-offs & Future Improvements

### Trade-offs
- **Custom Hooks vs. Compound Components:** While a Compound Component pattern offers more flexibility for libraries, I chose a **Modular Hook + Component** structure for this specific branded requirement. This keeps the implementation lean while maintaining a clear separation of logic.
- **Tailwind CSS:** Chose `Tailwind` for rapid UI development, allowing more time to focus on complex keyboard navigation and `ARIA` logic.
### Future Improvements
- **Offline Support:** Implement a Service Worker to cache common addresses.
- **Fuzzy Matching:** Enhance the local validator to handle common typos.

## 🛠️ Tech Stack
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library, Playwright



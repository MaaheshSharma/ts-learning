import ApiProducts from "./components/ApiProducts";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ApiProducts />
    </ErrorBoundary>
  );
}

export default App;

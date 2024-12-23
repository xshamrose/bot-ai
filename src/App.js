import "./App.css";
import Chatbot from "./Chatbot";

function App() {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

  return (
    <div className="App">
      <Chatbot apiEndpoint={apiEndpoint} />
    </div>
  );
}

export default App;

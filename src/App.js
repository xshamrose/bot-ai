import logo from "./logo.svg";
import "./App.css";
import Chatbot from "./Chatbot";

function App() {
  const apiEndpoint = "http://192.168.1.9:5001/api/chatbot-config";

  return (
    <div className="App">
      <Chatbot apiEndpoint={apiEndpoint} />
    </div>
  );
}

export default App;

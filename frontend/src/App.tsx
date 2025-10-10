import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SessionList from "./components/SessionList";
import SessionDetails from "./components/SessionDetails";
import CreateSession from "./components/CreateSession";
import ManagementView from "./components/ManagementView"

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Sessions</Link> | <Link to="/create">Create</Link> | <Link to="/sessions/:sessionId/manage">Manage Session</Link>
      </nav>
      <Routes>
        <Route path="/" element={<SessionList />} />
        <Route path="/sessions/:sessionId" element={<SessionDetails />} />
        <Route path="/create" element={<CreateSession />} />
        <Route path="/sessions/:sessionId/manage" element={<ManagementView/>}/>
      </Routes>
    </Router>
  );
}

export default App;

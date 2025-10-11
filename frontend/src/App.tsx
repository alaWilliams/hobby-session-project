import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SessionList from "./components/SessionList";
import SessionDetails from "./components/SessionDetails";
import CreateSession from "./components/CreateSession";
import ManagementView from "./components/ManagementView";
import Verify from "./components/Verify";
import PrivateSessionDetails from "./components/PrivateSessionDetails";
import JoinPrivateSession from "./components/JoinPrivateSession";


function App() {
  return (
    <Router>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Sessions</Link> | <Link to="/private">Private Sessions </Link>
 | <Link to="/create">Create</Link> | <Link to="/verify">Manage Session</Link> | 
     </nav>
        <Routes>
      <Route path="/" element={<SessionList />} />
      <Route path="/create" element={<CreateSession />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/sessions/:sessionId/manage" element={<ManagementView />} />
      <Route path="/sessions/:sessionId" element={<SessionDetails />} /> 
      <Route path="/session/:privateCode" element={<PrivateSessionDetails />} />
      <Route path="/private" element={<JoinPrivateSession />} />


    </Routes>

    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandPage from "./Landpage.jsx";
import Leaderboard from './Leaderboard.jsx';
import Dashboard from './Dashboard.jsx';
import BattlePage from './BattlePage.jsx';
import WaitingPage1 from './WaitingPage1.jsx';
import WaitingPage2 from './WaitingPage2.jsx';
import AdminImporterPage from "./AdminImporterPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandPage/>}/>
        <Route path='/leaderboard' element={<Leaderboard/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/battlepage' element={<BattlePage/>}/>
        <Route path='/waitingpage' element={<WaitingPage1/>}/>
        <Route path='/waitingpage2' element={<WaitingPage2/>}/>
        <Route path='/admin/importer' element={<AdminImporterPage/>}/>
      </Routes>
    </Router>

  )
}

export default App;

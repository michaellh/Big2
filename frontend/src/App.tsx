import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import Game from './components/Game/Game';

const App = () => (
  <Router>
    <Routes>
      <Route
        path='/'
        element={<MainMenu />}
      />
      <Route
        path='/lobby'
        element={<Lobby />}
      />
      <Route
        path='/game'
        element={<Game />}
      />
    </Routes>
  </Router>
);

export default App;

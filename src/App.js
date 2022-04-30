import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Spectrum from './components/protocols/spectrum/Spectrum';
import PrismProtocol from './components/protocols/prism/Prism';

import Dashboard from './components/dashboard/Dashboard';
import Sidebar from './components/sidebar/Sidebar';
import { Container } from 'react-bootstrap';
import './App.css';

function Layout ({ children }) {
  return (
    <div style={{display: "flex"}}>
      <Sidebar />
      <Container>
        {children}
      </Container>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" exact element={<Layout><Dashboard /></Layout>}></Route>
        <Route path="/prism" exact element={<Layout><PrismProtocol /></Layout>}></Route>
        <Route path="/spectrum" exact element={<Layout><Spectrum /></Layout>}></Route>

        <Route path="*" element={<Layout><Dashboard /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

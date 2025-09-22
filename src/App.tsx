import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { Calculator } from './components/Calculator/Calculator';
import { ViewCalculation } from './components/ViewCalculation';
import { EditCalculation } from './components/EditCalculation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/:id" element={<ViewCalculation />} />
        <Route path="/:id/insert" element={<EditCalculation />} />
      </Routes>
    </Router>
  );
}

export default App;
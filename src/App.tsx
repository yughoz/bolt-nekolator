import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { Calculator } from './components/Calculator/Calculator';
import { ReceiptUpload } from './components/ReceiptUpload/ReceiptUpload';
import { ExpertCalculator } from './components/ExpertCalculator/ExpertCalculator';
import { ViewCalculation } from './components/ViewCalculation';
import { EditCalculation } from './components/EditCalculation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/upload" element={<ReceiptUpload />} />
        <Route path="/expert" element={<ExpertCalculator />} />
        <Route path="/:id" element={<ViewCalculation />} />
        <Route path="/:id/insert" element={<EditCalculation />} />
      </Routes>
    </Router>
  );
}

export default App;
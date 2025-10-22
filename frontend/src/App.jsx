import React, { useState } from 'react';
import IncomeDistributionViz from './components/IncomeDistributionViz';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Income Comparison Canada 🇨🇦
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Compare your employment income with Census 2021 data
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <IncomeDistributionViz apiUrl={API_URL} />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Data source: <strong>Statistics Canada Census 2021</strong> (2020 employment income)
            </p>
            <p className="text-xs">
              Made with ❤️ in Canada | Open Source Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

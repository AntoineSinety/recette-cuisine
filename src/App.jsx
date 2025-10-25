// src/App.jsx
import React from 'react';
import PageNavigator from './components/PageNavigator';
import { ToastProvider } from './components/ToastContainer';
import './assets/styles/app.scss';
import './assets/styles/components/page-navigator.scss';
import './assets/styles/composants/import-recipe.scss';
import './assets/styles/composants/cooking-mode.scss';
import './assets/styles/composants/step-editor.scss';
import './assets/styles/planning/index.scss';

const App = () => {
  return (
    <ToastProvider>
      <PageNavigator />
    </ToastProvider>
  );
};

export default App;

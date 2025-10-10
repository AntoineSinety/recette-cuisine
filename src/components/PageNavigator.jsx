// Composant de navigation par cookies
import React, { useState, useEffect, Suspense } from 'react';
import { NavigationProvider } from '../context/NavigationContext';
import { 
  PAGES, 
  PAGE_COMPONENTS, 
  PAGE_NAMES, 
  PAGE_ICONS, 
  VISIBLE_PAGES,
  saveLastPage, 
  getLastPage,
  getCookie
} from '../utils/navigation';

const PageNavigator = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    // Vérifier s'il y a une recette en cours d'édition
    const editId = getCookie('recette_edit_id');
    if (editId) {
      return PAGES.EDIT_RECIPE;
    }
    return getLastPage();
  });
  const [CurrentComponent, setCurrentComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Charger le composant de la page courante
  useEffect(() => {
    const loadComponent = async () => {
      setIsLoading(true);
      try {
        const componentModule = await PAGE_COMPONENTS[currentPage]();
        setCurrentComponent(() => componentModule.default);
      } catch (error) {
        console.error('Erreur lors du chargement du composant:', error);
        // Fallback vers la page d'accueil
        const homeModule = await PAGE_COMPONENTS[PAGES.HOME]();
        setCurrentComponent(() => homeModule.default);
        setCurrentPage(PAGES.HOME);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [currentPage]);

  // Changer de page
  const navigateToPage = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      saveLastPage(page);
      setIsMenuOpen(false); // Fermer le menu après navigation

      // Si on quitte la page d'édition, supprimer l'ID de recette
      if (currentPage === PAGES.EDIT_RECIPE && page !== PAGES.EDIT_RECIPE) {
        document.cookie = 'recette_edit_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="page-loading">
      <div className="page-loading__spinner">
        <div className="page-loading__dot"></div>
        <div className="page-loading__dot"></div>
        <div className="page-loading__dot"></div>
      </div>
      <p>Chargement...</p>
    </div>
  );

  return (
    <div className="page-navigator">
      {/* Header mobile avec titre uniquement */}
      <header className="page-header">
        <h1 className="page-header__title">
          {PAGE_ICONS[currentPage]} {PAGE_NAMES[currentPage]}
        </h1>
      </header>

      {/* Navigation Desktop */}
      <nav className="page-nav">
        <div className="page-nav__brand">
          <h1 className="page-nav__title">
            {PAGE_ICONS[currentPage]} {PAGE_NAMES[currentPage]}
          </h1>
        </div>

        <div className="page-nav__menu">
          {Object.entries(VISIBLE_PAGES).map(([key, page]) => (
            <button
              key={page}
              className={`page-nav__btn ${currentPage === page ? 'page-nav__btn--active' : ''}`}
              onClick={() => navigateToPage(page)}
              title={PAGE_NAMES[page]}
            >
              <span className="page-nav__btn-icon">{PAGE_ICONS[page]}</span>
              <span className="page-nav__btn-text">{PAGE_NAMES[page]}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <main className="page-content">
        <NavigationProvider currentPage={currentPage} onNavigate={navigateToPage}>
          {isLoading ? (
            <LoadingSpinner />
          ) : CurrentComponent ? (
            <Suspense fallback={<LoadingSpinner />}>
              <CurrentComponent />
            </Suspense>
          ) : (
            <div className="page-error">
              <h2>⚠️ Erreur</h2>
              <p>Impossible de charger la page demandée.</p>
              <button
                className="page-error__btn"
                onClick={() => navigateToPage(PAGES.HOME)}
              >
                Retour à l'accueil
              </button>
            </div>
          )}
        </NavigationProvider>
      </main>

      {/* Bottom Navigation Bar - Mobile uniquement */}
      <nav className="bottom-nav">
        {Object.entries(VISIBLE_PAGES).map(([key, page]) => (
          <button
            key={page}
            className={`bottom-nav__btn ${currentPage === page ? 'bottom-nav__btn--active' : ''}`}
            onClick={() => navigateToPage(page)}
            title={PAGE_NAMES[page]}
          >
            <span className="bottom-nav__icon">{PAGE_ICONS[page]}</span>
            <span className="bottom-nav__label">{PAGE_NAMES[page]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PageNavigator;
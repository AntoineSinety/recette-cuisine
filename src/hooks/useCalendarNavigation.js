import { useState, useMemo, useCallback } from 'react';

const useCalendarNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtenir le premier jour du mois
  const getFirstDayOfMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }, []);

  // Obtenir le dernier jour du mois
  const getLastDayOfMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }, []);

  // Obtenir le lundi de la semaine courante
  const getWeekStart = useCallback((date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Lundi = 1
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Obtenir le dimanche de la semaine courante
  const getWeekEnd = useCallback((date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [getWeekStart]);

  // Vérifier si une date est aujourd'hui
  const isToday = useCallback((date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Vérifier si une date est dans le passé
  const isPast = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  }, []);

  // Vérifier si une date est dans le futur
  const isFuture = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  }, []);

  // Générer tous les jours d'un mois (incluant jours voisins pour grille complète)
  const getMonthDays = useMemo(() => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);

    // Trouver le lundi de la première semaine
    const startDate = getWeekStart(firstDay);

    // Trouver le dimanche de la dernière semaine
    const endDate = new Date(lastDay);
    const lastDayOfWeek = endDate.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(endDate.getDate() + daysToAdd);

    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push({
        date: new Date(current),
        dateKey: current.toISOString().split('T')[0],
        day: current.getDate(),
        month: current.getMonth(),
        year: current.getFullYear(),
        isCurrentMonth: current.getMonth() === currentDate.getMonth(),
        isToday: isToday(current),
        isPast: isPast(current),
        isFuture: isFuture(current),
        dayName: current.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNameLong: current.toLocaleDateString('fr-FR', { weekday: 'long' }),
        monthName: current.toLocaleDateString('fr-FR', { month: 'long' }),
        formattedDate: current.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate, getFirstDayOfMonth, getLastDayOfMonth, getWeekStart, isToday, isPast, isFuture]);

  // Générer les 7 jours de la semaine courante
  const getCurrentWeekDays = useMemo(() => {
    const start = getWeekStart(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      days.push({
        date: new Date(date),
        dateKey: date.toISOString().split('T')[0],
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: isToday(date),
        isPast: isPast(date),
        isFuture: isFuture(date),
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNameLong: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        monthName: date.toLocaleDateString('fr-FR', { month: 'long' }),
        formattedDate: date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long'
        })
      });
    }

    return days;
  }, [currentDate, getWeekStart, isToday, isPast, isFuture]);

  // Générer les 7 jours de la semaine précédente (historique)
  const getPreviousWeekDays = useMemo(() => {
    const currentStart = getWeekStart(currentDate);
    const previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - 7);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(previousStart);
      date.setDate(previousStart.getDate() + i);

      days.push({
        date: new Date(date),
        dateKey: date.toISOString().split('T')[0],
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: isToday(date),
        isPast: true, // Toujours dans le passé
        isFuture: false,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNameLong: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        monthName: date.toLocaleDateString('fr-FR', { month: 'long' }),
        formattedDate: date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long'
        })
      });
    }

    return days;
  }, [currentDate, getWeekStart, isToday]);

  // Navigation
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setCurrentDate(prev => {
      const previous = new Date(prev);
      previous.setDate(prev.getDate() - 7);
      return previous;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => {
      const previous = new Date(prev);
      previous.setMonth(prev.getMonth() - 1);
      return previous;
    });
  }, []);

  const goToDate = useCallback((date) => {
    setCurrentDate(new Date(date));
  }, []);

  // Infos actuelles
  const currentMonthName = useMemo(() => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const currentWeekNumber = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), 0, 1);
    const diff = currentDate - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }, [currentDate]);

  const isCurrentWeek = useCallback((date) => {
    const weekStart = getWeekStart(new Date());
    const weekEnd = getWeekEnd(new Date());
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= weekStart && checkDate <= weekEnd;
  }, [getWeekStart, getWeekEnd]);

  // Label de la semaine courante (ex: "Semaine du 21-27 Oct 2025")
  const currentWeekLabel = useMemo(() => {
    const start = getWeekStart(currentDate);
    const end = getWeekEnd(currentDate);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleDateString('fr-FR', { month: 'short' });
    const year = start.getFullYear();

    return `Semaine du ${startDay}-${endDay} ${month} ${year}`;
  }, [currentDate, getWeekStart, getWeekEnd]);

  return {
    currentDate,
    currentMonthName,
    currentWeekNumber,
    currentWeekLabel,
    getMonthDays,
    getCurrentWeekDays,
    getPreviousWeekDays,
    goToToday,
    goToNextWeek,
    goToPreviousWeek,
    goToNextMonth,
    goToPreviousMonth,
    goToDate,
    isToday,
    isPast,
    isFuture,
    isCurrentWeek,
    getWeekStart,
    getWeekEnd
  };
};

export default useCalendarNavigation;

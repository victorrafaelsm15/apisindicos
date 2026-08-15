import { createStore } from './createStore';

export const newsStore = createStore('news', { orderBy: 'created_at', ascending: false });
export const eventsStore = createStore('events', { orderBy: 'event_date', ascending: true });
export const documentsStore = createStore('documents', { orderBy: 'created_at', ascending: false });
export const boardStore = createStore('board_members', { orderBy: 'display_order', ascending: true });
export const partnersStore = createStore('partners', { orderBy: 'created_at', ascending: false });
export const filiacaoStore = createStore('filiacao_solicitacoes', { orderBy: 'created_at', ascending: false });

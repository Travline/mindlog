import type { Card } from './api';

export const PRIORITIES = ['Baja', 'Media', 'Alta'] as const;
export type Priority = typeof PRIORITIES[number];
export const SORT_OPTIONS = ['Recientes', 'Fecha', 'Prioridad'] as const;
export type TicketSort = typeof SORT_OPTIONS[number] | 'Fecha y prioridad';
const rank: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };

export function selectTickets(cards: Card[], columnId: number | null, priorities: readonly Priority[], order: TicketSort): Card[] {
  return cards.filter(card => card.column_id === columnId && priorities.some(priority => priority === card.priority)).sort((a, b) => {
    const newest = b.card_id - a.card_id;
    const priority = (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
    const date = a.due_date && b.due_date ? a.due_date.localeCompare(b.due_date) : a.due_date ? -1 : b.due_date ? 1 : 0;
    if (order === 'Fecha') return date || newest;
    if (order === 'Prioridad') return priority || newest;
    if (order === 'Fecha y prioridad') return date || priority || newest;
    return newest;
  });
}

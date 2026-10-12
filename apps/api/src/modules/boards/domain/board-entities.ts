export type BoardEntity = {
  boardId?: number;
  title: string;
  description?: string | null;
  ownerId: string;
  createdAt?: string | null;
};

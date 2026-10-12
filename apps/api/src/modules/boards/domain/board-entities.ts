export type BoardEntity = {
  boardId?: number;
  title: string;
  description?: string | null;
  ownerId: string;
  isOwner?: boolean;
  createdAt?: string | null;
};

import { AppNotification, FoodPost, Order, User } from '../types';

export function getInitialSeedData(): {
  users: User[];
  posts: FoodPost[];
  orders: Order[];
  notifications: AppNotification[];
  currentUserId: string | null;
} {
  return {
    users: [],
    posts: [],
    orders: [],
    notifications: [],
    currentUserId: null
  };
}

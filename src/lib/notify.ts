import { AppNotification } from '../types';
import { now } from './time';

export function createNotification(
  toUserId: string,
  title: string,
  body: string,
  postId?: string,
  orderId?: string
): AppNotification {
  return {
    id: crypto.randomUUID(),
    toUserId,
    title,
    body,
    postId,
    orderId,
    createdAt: now(),
    read: false
  };
}

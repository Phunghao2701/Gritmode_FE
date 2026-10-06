import { API_BASE_URL } from '../../../shared/services/api';
import { tokenService } from '../../auth/services/token.service';

const parseEventBlock = (block) => {
  let event = 'message';
  let id = '';
  const dataLines = [];

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('id:')) id = line.slice(3).trim();
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
  }

  const rawData = dataLines.join('\n');
  let data = rawData;
  try {
    data = rawData ? JSON.parse(rawData) : null;
  } catch {
    // Keep non-JSON SSE data as a string.
  }

  return { event, id, data };
};

export const openAdminNotificationStream = async ({ signal, onEvent }) => {
  const token = tokenService.getAccessToken();
  if (!token) throw new Error('Missing admin access token');

  const response = await fetch(`${API_BASE_URL}/admin/notifications/stream`, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Notification stream failed with ${response.status}`);
  }
  if (!response.body) throw new Error('Notification stream has no response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex).replace(/\r$/, '');
      buffer = buffer.slice(separatorIndex + 2);
      if (block.trim() && !block.startsWith(':')) onEvent(parseEventBlock(block));
      separatorIndex = buffer.indexOf('\n\n');
    }

    if (done) break;
  }
};

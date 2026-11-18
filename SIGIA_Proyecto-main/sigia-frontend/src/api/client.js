const BASE = '/api';

async function req(url, opts = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  stats: {
    get: () => req('/stats'),
  },
  pedidos: {
    list: () => req('/pedidos'),
    create: (data) => req('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
    confirmar: (id) => req(`/pedidos/${id}/confirmar`, { method: 'PUT' }),
    despachar: (id) => req(`/pedidos/${id}/despachar`, { method: 'PUT' }),
    entregar: (id) => req(`/pedidos/${id}/entregar`, { method: 'PUT' }),
    cancelar: (id) => req(`/pedidos/${id}/cancelar`, { method: 'PUT' }),
  },
  alertas: {
    list: () => req('/alertas'),
    create: (data) => req('/alertas', { method: 'POST', body: JSON.stringify(data) }),
  },
};

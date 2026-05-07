function getCsrf() {
  return (
    document.cookie
      .split('; ')
      .find((r) => r.startsWith('csrftoken='))
      ?.split('=')[1] ?? ''
  )
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrf(),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const err = Object.assign(new Error(data.error ?? 'Erro na requisição'), {
      status: res.status,
      data,
    })
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

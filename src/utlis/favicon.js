export async function getFavicon(url) {
  const domain = new URL(url).hostname;
  const apis = [
    { name: 'google', url: `https://api.20010522.xyz/icon-1/${domain}` },
    { name: 'iowen', url: `https://api.20010522.xyz/icon-2/${domain}` },
    { name: 'horse', url: `https://api.20010522.xyz/icon-3/${domain}` },
    { name: 'kongfandong', url: `https://api.20010522.xyz/icon-4/${domain}` }
  ];

  const fetchWithTimeout = (resource, options = {}) => {
    const { timeout = 5000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, {
      ...options,
      signal: controller.signal
    }).then(response => {
      clearTimeout(id);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    });
  };

  const convertToBase64 = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return `data:${blob.type};base64,${base64}`;
  };

  const results = await Promise.allSettled(
    apis.map(api => 
      fetchWithTimeout(api.url)
        .then(response => response.blob())
        .then(async blob => {
          if (blob.size === 0) {
            throw new Error('Empty response');
          }
          const base64Icon = await convertToBase64(blob);
          return { api: api.name, icon: base64Icon };
        })
    )
  );

  const successfulResults = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);

  if (successfulResults.length === 0) {
    console.error('All favicon requests failed');
    throw new Error('Unable to fetch favicon from any API');
  }

  return successfulResults;
}
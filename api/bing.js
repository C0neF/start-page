// 文件路径：api/bing.js 或 functions/bing.js

export default async function handler(req, res) {
  const BING_API_URL = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US';
  
  try {
    const response = await fetch(BING_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Bing daily image:', error);
    res.status(500).json({ error: 'Failed to fetch Bing daily image' });
  }
}
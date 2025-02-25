export async function fetchLinkPreview(url: string) {
  try {
    const response = await fetch("https://noembed.com/embed?url=" + url);
    const data = await response.json();

    if (data.error) {
      console.error('Error fetching link preview:', data.error);
      return null;
    }

    return {
      title: data.title,
      description: data.description,
      image: data.thumbnail_url,
      url: data.url,
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
}
import ky from 'ky';

// Lorem Picsum service - Free images without API key required
// Documentation: https://picsum.photos/

export interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
  description: string;
}

// Raw API response interface from Lorem Picsum
interface PicsumApiResponse {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export class PicsumService {
  private static readonly BASE_URL = 'https://picsum.photos';
  private static readonly LIST_URL = 'https://picsum.photos/v2/list';

  // Get paginated list of images
  static async getImages(page = 1, limit = 30): Promise<PicsumImage[]> {
    try {
      const images = await ky.get(`${this.LIST_URL}?page=${page}&limit=${limit}`).json<PicsumApiResponse[]>();

      return images.map((img: PicsumApiResponse) => ({
        ...img,
        description: `Photo by ${img.author}`,
        url: `${this.BASE_URL}/id/${img.id}/800/600`,
        download_url: `${this.BASE_URL}/id/${img.id}/1200/800`
      }));
    } catch (error) {
      console.error('Error fetching Picsum images:', error);
      throw error;
    }
  }
}

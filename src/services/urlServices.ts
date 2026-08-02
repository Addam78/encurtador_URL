import { urlRepository } from "../repositories/urlRepository"
import { urlCacheRepository } from "../repositories/urlCacheRepository"
import { NotFoundError,ExpiredError } from "../errors/AppErrors"
import { generateShortCode } from '../shortCode'

export const urlServices = {
  async getOriginalUrl(shortCode: string) {
    const cached = await urlCacheRepository.get(shortCode);

    let urlData: { originalUrl: string; expiresAt: string | null };

    if (cached) {
      urlCacheRepository.recordHit();
      urlData = cached;
    } else {
      const url = await urlRepository.findByShortCode(shortCode);

      if (!url) {
        throw new NotFoundError("Url não encontrada , é necessario gerar");
      }

      urlData = {
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt ? url.expiresAt.toISOString() : null,
      };

      await urlCacheRepository.set(shortCode, urlData);
      urlCacheRepository.recordMiss();
    }

    const expirada = urlData.expiresAt && new Date(urlData.expiresAt) < new Date();
    if (expirada) {
      throw new ExpiredError("Este link expirou");
    }

    await urlCacheRepository.incrementClicks(shortCode);

    return urlData;
  },

  async findExistingShortCode(originalUrl: string) {
    return urlRepository.findByOriginalUrl(originalUrl);
  },

  async createShortUrl(originalUrl: string, expiresAt?: Date) {
    let shortCode: string;
    let existe;

    do {
      shortCode = generateShortCode();
      existe = await urlRepository.findByShortCode(shortCode);
    } while (existe !== null);

    return urlRepository.create({ shortCode, originalUrl, expiresAt })
  },
  
};
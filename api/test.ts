import { gitHubContentCache } from "./_shared/cache";

export default async function handler(req: any, res: any) {
    res.json({
        ok: true,
        cacheExists: !!gitHubContentCache
    });
}

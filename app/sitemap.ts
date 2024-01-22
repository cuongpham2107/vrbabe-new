import db from '@/lib/admin/db'
import { MetadataRoute } from 'next'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || ""

  const scenes = await db.scene.findMany({
    where: {
      publish: 'publish',
      groupId: {
        not: null
      }
    }
  })

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...scenes.map(v => ({
      url: `${baseUrl}/${v.slug}`,
      lastModified: new Date(),
    }))
  ]
}
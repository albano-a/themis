import { tablesDB, DATABASE_ID, PROFESSORS_TABLE_ID } from '$lib/appwrite';

export async function GET() {
	const staticRoutes = [
		'', // for /
		'about',
		'search',
		'login',
		'register',
		'forgot-password',
		'reset-password',
		'profile',
		'settings'
	];

	let sitemap =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

	const baseUrl = 'https://classefy.vercel.app';

	// Add static routes
	for (const route of staticRoutes) {
		sitemap += `  <url>\n    <loc>${baseUrl}/${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
	}

	// Add dynamic professor routes
	try {
		const professors = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: PROFESSORS_TABLE_ID
		});
		for (const prof of professors.rows) {
			sitemap += `  <url>\n    <loc>${baseUrl}/professor/${prof.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
		}
	} catch (err) {
		console.error('Error fetching professors for sitemap:', err);
	}

	sitemap += '</urlset>';

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}

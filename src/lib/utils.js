/**
 *
 * @param {String | undefined} name
 * @returns
 */
export function getInitials(name) {
	if (!name) return 'AA';
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

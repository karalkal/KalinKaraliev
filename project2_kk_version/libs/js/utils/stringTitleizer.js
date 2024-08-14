export default function titleizeString(originalWord) {
    const dontTitalize = ['and', 'von', 'van', 'de', 'der', 'da', 'di', 'la'];

    let capitalizedWord = originalWord
        .split(' ')
        .map(w => {
            if (dontTitalize.includes(w.toLowerCase())) {		// Res and Dev (lowercase and)
                return w.toLowerCase()
            }		// else
            return w[0].toUpperCase() + w.substring(1).toLowerCase()
        })
        .join(' ');

    return capitalizedWord;
}

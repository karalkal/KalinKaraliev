export default function titleizeString(originalWord) {
    let capitalizedWord = originalWord
        .split(' ')
        .map(w => {
            if (w.toLowerCase() === "and") {		// Res and Dev (lowercase and)
                return w.toLowerCase()
            }		// else
            return w[0].toUpperCase() + w.substring(1).toLowerCase()
        })
        .join(' ');
        
    return capitalizedWord;
}

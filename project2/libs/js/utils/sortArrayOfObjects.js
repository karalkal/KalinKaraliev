export default function sortByName(array, propToSortBy) {
    // propToSortBy is String, hence square bracket syntax

    let resultArr = array.sort(function (a, b) {
        if (a[propToSortBy] < b[propToSortBy]) {
            return -1;
        }
        if (a[propToSortBy] > b[propToSortBy]) {
            return 1;
        }
        return 0;
    })

    return resultArr
}

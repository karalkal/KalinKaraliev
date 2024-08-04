export function locationIdInDepartmentForeighKeys(locationId, departments) {
    let fkIsFound = departments.find(d => d.locationId == locationId)
        ? true
        : false;
    return fkIsFound
}

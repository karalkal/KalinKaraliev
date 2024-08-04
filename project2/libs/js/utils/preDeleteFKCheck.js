export function checkLocationIdInDeptFKeys(locationId, departments) {
    let dptIsFound = departments.find(d => d.locationId == locationId)
        ? true
        : false;
    return dptIsFound
}

export function checkDeptIdInPersonnelFKeys(departmentId, staff) {
    let locIsFound = staff.find(s => s.departmentId == departmentId)
        ? true
        : false;
    return locIsFound
}

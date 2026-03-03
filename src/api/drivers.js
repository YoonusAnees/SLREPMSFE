import { http } from "./http";

export async function getDriverByLicense(licenseNo) {
    const { data } = await http.get(
        `/drivers/by-license/${encodeURIComponent(licenseNo.trim())}`
    );
    return data; // { user, driver, vehicles }
}
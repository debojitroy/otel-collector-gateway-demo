const serviceName = process.env.SERVICE_NAME || "serviceC";
const productServiceUrl = process.env.SERVICE_B_URL;

export const getServiceName = () => {
    return serviceName;
}

export const getProductServiceUrl = () => productServiceUrl;

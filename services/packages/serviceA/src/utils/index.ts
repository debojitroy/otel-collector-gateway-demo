const serviceName = process.env.SERVICE_NAME || "serviceA";
const productServiceUrl = process.env.SERVICE_B_URL;
const customerServiceUrl = process.env.SERVICE_C_URL;

export const getServiceName = () => {
    return serviceName;
}

export const getProductServiceUrl = () => productServiceUrl;

export const getCustomerServiceUrl = () => customerServiceUrl;

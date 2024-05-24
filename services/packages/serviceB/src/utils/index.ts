const serviceName = process.env.SERVICE_NAME || "serviceB";

export const getServiceName = () => {
    return serviceName;
}

export const delay = (timeInMs: number) => {
    return new Promise(resolve => setTimeout(resolve, timeInMs));
}
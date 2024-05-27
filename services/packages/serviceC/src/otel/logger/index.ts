import logsAPI from "@opentelemetry/api-logs";
import {LoggerProvider} from "@opentelemetry/sdk-logs";
import {getServiceName} from "../../utils";

const serviceName = getServiceName();

const loggerProvider = new LoggerProvider();

logsAPI.logs.setGlobalLoggerProvider(loggerProvider);
const logger = logsAPI.logs.getLogger(serviceName);

export const logDebug = (body: string | Record<string, any>, attributes?: Record<string, string>, traceId?: string, spanId?: string) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.DEBUG,
        severityText: 'DEBUG',
        body : typeof body === 'string' ? {message: body, serviceName, traceId, spanId} : JSON.stringify({...body, serviceName, traceId, spanId}),
        attributes: attributes ? { ...attributes , serviceName, traceId, spanId} : { serviceName, traceId, spanId },
    });
}

export const logInfo = (body: string | Record<string, any>, attributes?: Record<string, string>, traceId?: string, spanId?: string) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.INFO,
        severityText: 'INFO',
        body : typeof body === 'string' ? {message: body, serviceName, traceId, spanId} : JSON.stringify({...body, serviceName, traceId, spanId}),
        attributes: attributes ? { ...attributes , serviceName, traceId, spanId} : { serviceName, traceId, spanId },
    });
}

export const logError = (body: string | Record<string, any>, attributes?: Record<string, string>, traceId?: string, spanId?: string) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.ERROR,
        severityText: 'ERROR',
        body : typeof body === 'string' ? {message: body, serviceName, traceId, spanId} : JSON.stringify({...body, serviceName, traceId, spanId}),
        attributes: attributes ? { ...attributes , serviceName, traceId, spanId} : { serviceName, traceId, spanId },
    });
}

export const logFatal = (body: string | Record<string, any>, attributes?: Record<string, string>, traceId?: string, spanId?: string) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.FATAL,
        severityText: 'FATAL',
        body : typeof body === 'string' ? {message: body, serviceName, traceId, spanId} : JSON.stringify({...body, serviceName, traceId, spanId}),
        attributes: attributes ? { ...attributes , serviceName, traceId, spanId} : { serviceName, traceId, spanId },
    });
}


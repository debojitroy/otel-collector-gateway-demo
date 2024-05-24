import logsAPI from "@opentelemetry/api-logs";
import {LoggerProvider} from "@opentelemetry/sdk-logs";

const serviceName = process.env.SERVICE_NAME || "serviceB";

const loggerProvider = new LoggerProvider();

logsAPI.logs.setGlobalLoggerProvider(loggerProvider);
const logger = logsAPI.logs.getLogger(serviceName);

export const logDebug = (body: string | Record<string, string>, attributes?: Record<string, string>) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.DEBUG,
        severityText: 'DEBUG',
        body : typeof body === 'string' ? body : JSON.stringify(body),
        attributes,
    });
}

export const logInfo = (body: string | Record<string, string>, attributes?: Record<string, string>) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.INFO,
        severityText: 'INFO',
        body : typeof body === 'string' ? body : JSON.stringify(body),
        attributes,
    });
}

export const logError = (body: string | Record<string, string>, attributes?: Record<string, string>) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.ERROR,
        severityText: 'ERROR',
        body : typeof body === 'string' ? body : JSON.stringify(body),
        attributes,
    });
}

export const logFatal = (body: string | Record<string, string>, attributes?: Record<string, string>) => {
    logger.emit({
        severityNumber: logsAPI.SeverityNumber.FATAL,
        severityText: 'FATAL',
        body : typeof body === 'string' ? body : JSON.stringify(body),
        attributes,
    });
}


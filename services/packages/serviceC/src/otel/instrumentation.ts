import opentelemetry from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import {AggregationTemporality, PeriodicExportingMetricReader} from "@opentelemetry/sdk-metrics";
import {
    BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const logExporter = new OTLPLogExporter({
    keepAlive: true,
});

const sdk = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter({
        keepAlive: true,
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            temporalityPreference: AggregationTemporality.DELTA,
            keepAlive: true,
        }),
        exportIntervalMillis: 10000, // 10 secs
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: process.env.SERVICE_NAME || "serviceB",
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
});

sdk.start();
import {metrics, trace} from "@opentelemetry/api";
import {getServiceName} from "../utils";

const serviceName = getServiceName()

const tracer = trace.getTracer(serviceName);
const meter = metrics.getMeter(serviceName);

export {tracer, meter}
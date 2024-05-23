# otel-custom-demo
Demo Project to showcase the power OTEL Gateway pattern

## Test Cases

**NOTE:** Logs are still experimental in OTEL, so use with caution

### No external Store

In this use case **nothing is exported** to any external store

### Enable Telemetry counting for - Service A

In this use case **only counting** is enabled for **Service A**

### Send metrics to CloudWatch - Service A

In this use case **only metrics** is exported to **CloudWatch**

### Send All telemetry to CloudWatch - Service A

In this use case all **telemetry data** is sent to **CloudWatch**

### Enable Telemetry counting for - Service B and Service C

In this use case only **counting** is enabled for **Service B and C**

### Enable metrics and traces to NewRelic for Service B

In this use case **only metrics and traces** are sent to **NewRelic** for **Service B**

### Enable High severity logs to CloudWatch for Service B

In this use case only **high severity logs** are sent to **CloudWatch Logs** for **Service B**

### Enable metrics and traces to Datadog for Service C

In this use case **only metrics and traces** are sent to **Datadog** for **Service C**

### Enable High severity logs to Datadog for Service C

In this use case only **high severity logs** are sent to **Datadog** for **Service B**

### Send normal logs to CloudWatch for Service C

In this use case all **normal logs** are sent to **Datadog** for **Service C**
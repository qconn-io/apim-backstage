# ${{ values.name | title }}

${{ values.description }}

## Event API Documentation

This Event-driven API follows AsyncAPI 2.6 specification and provides comprehensive documentation for all event channels and message schemas.

### Getting Started

1. **API Specification**: The complete API specification is available in `asyncapi.yaml`
2. **Protocol**: ${{ values.protocol | title }}
3. **Server**: `${{ values.server_url }}`
4. **Version**: ${{ values.version }}

### Features

- ✅ AsyncAPI 2.6 compliant specification
- ✅ Comprehensive message schemas
- ✅ Event-driven architecture support
{% if values.protocol == 'kafka' %}- ✅ Kafka bindings and configuration{% endif %}
{% if values.include_security %}- ✅ Security configurations (SASL/SSL){% endif %}
{% if values.include_examples %}- ✅ Message examples{% endif %}
- ✅ Health check events
- ✅ Correlation ID support for tracing
- ✅ Versioned event schemas

### Event Types

This API handles the following event types:

{% for event_type in values.event_types %}
- **${{ event_type }}**: ${{ event_type.split('.')[1] | title if '.' in event_type else event_type | title }} event
{% endfor %}

### Channels

| Channel | Description | Operations |
|---------|-------------|------------|
{% for event_type in values.event_types %}
| `${{ event_type.replace('.', '/') }}` | ${{ event_type.title() }} events | Publish, Subscribe |
{% endfor %}
| `health/check` | Health monitoring | Subscribe |

### Message Schema

All events follow a common base schema:

```json
{
  "eventId": "string (uuid)",
  "eventType": "string",
  "timestamp": "string (date-time)",
  "version": "string",
  "source": "string",
  "correlationId": "string (uuid, optional)",
  "data": {
    // Event-specific payload
  }
}
```

{% if values.include_examples %}
### Example Events

{% for event_type in values.event_types %}
#### ${{ event_type.title() }} Event

```json
{
  "eventId": "evt-123e4567-e89b-12d3-a456-426614174000",
  "eventType": "${{ event_type }}",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0",
  "source": "user-service",
  "data": {
    {% if 'created' in event_type %}
    "id": "usr-123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-01T12:00:00Z"
    {% elif 'updated' in event_type %}
    "id": "usr-123e4567-e89b-12d3-a456-426614174000",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "updatedAt": "2024-01-01T12:30:00Z",
    "changes": [
      {
        "field": "name",
        "oldValue": "John Doe",
        "newValue": "John Smith"
      }
    ]
    {% elif 'deleted' in event_type %}
    "id": "usr-123e4567-e89b-12d3-a456-426614174000",
    "deletedAt": "2024-01-01T13:00:00Z"
    {% else %}
    "message": "Event data goes here"
    {% endif %}
  }
}
```
{% endfor %}
{% endif %}

{% if values.protocol == 'kafka' %}
### Kafka Configuration

- **Topics**: Events are published to dedicated Kafka topics
- **Partitions**: 3 partitions per topic for scalability
- **Replication**: 2 replicas for fault tolerance
- **Message Key**: Uses entity ID for proper partitioning

### Producer Configuration

```javascript
const producer = kafka.producer({
  keySerializer: 'string',
  valueSerializer: 'json'
});

await producer.send({
  topic: 'user-created',
  messages: [{
    key: userId,
    value: eventPayload
  }]
});
```

### Consumer Configuration

```javascript
const consumer = kafka.consumer({
  groupId: 'my-consumer-group',
  valueDeserializer: 'json'
});

await consumer.subscribe({ topic: 'user-created' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const event = message.value;
    // Process event
  }
});
```
{% endif %}

{% if values.include_security %}
### Security

{% if values.protocol == 'kafka' %}
This API uses SASL/SSL for secure communication:

```properties
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username="your-username" password="your-password";
```
{% else %}
Authentication is required for all channels. Include appropriate credentials based on your messaging system configuration.
{% endif %}
{% endif %}

### Development

1. **Validate the specification**:
   ```bash
   asyncapi validate asyncapi.yaml
   ```

2. **Generate documentation**:
   ```bash
   asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template -o ./docs
   ```

3. **Generate client code**:
   ```bash
   asyncapi generate fromTemplate asyncapi.yaml @asyncapi/nodejs-template -o ./client
   ```

### Monitoring

- **Health Check**: Subscribe to `health/check` channel for service health status
- **Correlation IDs**: Use correlation IDs for distributed tracing
- **Event Ordering**: Events are ordered by timestamp within each partition

### Contact

{% if values.contact_name %}**Maintainer**: ${{ values.contact_name }}{% endif %}
{% if values.contact_email %}**Email**: ${{ values.contact_email }}{% endif %}

---

*Generated with Backstage Software Template*

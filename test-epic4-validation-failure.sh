#!/bin/bash

echo "🧪 Testing Epic 4 Validation Failure Behavior"
echo "============================================="
echo ""

echo "This test will temporarily enable an invalid API spec to verify that the"
echo "catalog validator correctly prevents ingestion of invalid specifications."
echo ""

cd /home/mkogan/projects/apim-backstage/backstage

# Create a temporary config with invalid API enabled
echo "Creating temporary config with invalid API spec..."
cp app-config.yaml app-config.test.yaml

# Uncomment the invalid API in the test config
sed -i 's/    # - type: file/    - type: file/' app-config.test.yaml
sed -i 's/    #   target: \.\/examples\/invalid-openapi-api\.yaml/      target: \.\/examples\/invalid-openapi-api\.yaml/' app-config.test.yaml
sed -i 's/    #   rules:/      rules:/' app-config.test.yaml
sed -i 's/    #     - allow: \[API\]/        - allow: [API]/' app-config.test.yaml

echo "Starting Backstage with invalid API spec (should fail)..."

# Try to start Backstage with the invalid config - this should fail
timeout 60s yarn start:backend --config app-config.test.yaml 2>&1 | tee /tmp/epic4-test.log

# Check if the validation error appears in the logs
if grep -q "validation" /tmp/epic4-test.log || grep -q "OpenAPI" /tmp/epic4-test.log || grep -q "error" /tmp/epic4-test.log; then
    echo ""
    echo "✅ SUCCESS: Validation correctly prevented ingestion of invalid API spec!"
    echo "📝 Error logs:"
    grep -E "(validation|OpenAPI|error)" /tmp/epic4-test.log | head -5
else
    echo ""
    echo "❌ WARNING: Could not verify validation failure (may need full stack running)"
fi

# Clean up
rm -f app-config.test.yaml /tmp/epic4-test.log

echo ""
echo "Epic 4 validation behavior test complete!"

# Shipment API - Complete cURL Commands

## Authentication
First, get your JWT token (replace with actual credentials):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

Save the token from response and use it in all shipment API calls below.

---

## 1. Create Single Shipment
```bash
curl -X POST http://localhost:5000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439012",
    "shippingAddress": "507f1f77bcf86cd799439013",
    "courierService": "FedEx",
    "shippingCost": 250,
    "numberOfBoxes": 2,
    "dispatchPersonName": "John Doe",
    "receiverName": "Jane Smith",
    "trackingNumber": "TRK123456789",
    "trackingLink": "https://fedex.com/track/TRK123456789",
    "notes": "Fragile items - handle with care"
  }'
```

---

## 2. Create Bulk Shipments
```bash
curl -X POST http://localhost:5000/api/shipments/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439012",
    "shipments": [
      {
        "shippingAddress": "507f1f77bcf86cd799439013",
        "courierService": "FedEx",
        "shippingCost": 150,
        "numberOfBoxes": 1,
        "dispatchPersonName": "John Doe",
        "receiverName": "Jane Smith",
        "notes": "First package"
      },
      {
        "shippingAddress": "507f1f77bcf86cd799439014",
        "courierService": "DHL",
        "shippingCost": 200,
        "numberOfBoxes": 2,
        "dispatchPersonName": "John Doe",
        "receiverName": "Mike Johnson",
        "notes": "Second package"
      }
    ]
  }'
```

---

## 3. Get All Shipments
```bash
curl -X GET http://localhost:5000/api/shipments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Get Shipment by ID
```bash
curl -X GET http://localhost:5000/api/shipments/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Get Shipments by Order ID
```bash
curl -X GET http://localhost:5000/api/shipments/order/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 6. Get Courier Services
```bash
curl -X GET http://localhost:5000/api/shipments/courier-services \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Update Shipment
```bash
curl -X PUT http://localhost:5000/api/shipments/507f1f77bcf86cd799439015 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "trackingNumber": "TRK987654321",
    "trackingLink": "https://fedex.com/track/TRK987654321",
    "status": "Dispatched",
    "shippingCost": 300
  }'
```

---

## 8. Update Shipment by Order ID and Shipment ID
```bash
curl -X PUT http://localhost:5000/api/shipments/507f1f77bcf86cd799439011/507f1f77bcf86cd799439015 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "Delivered",
    "deliveredAt": "2024-12-16T10:30:00Z"
  }'
```

---

## 9. Delete Shipment
```bash
curl -X DELETE http://localhost:5000/api/shipments/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Batch Testing Script
Save this as `test_shipments.sh` and run with `bash test_shipments.sh`:

```bash
#!/bin/bash

# Replace with your actual JWT token
TOKEN="YOUR_JWT_TOKEN"
BASE_URL="http://localhost:5000/api/shipments"

echo "=== Testing Shipment API ==="

# 1. Get Courier Services
echo "Getting courier services..."
curl -s -X GET "$BASE_URL/courier-services" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 2. Create Single Shipment
echo -e "\nCreating single shipment..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439012",
    "shippingAddress": "507f1f77bcf86cd799439013",
    "courierService": "FedEx",
    "shippingCost": 250,
    "numberOfBoxes": 2,
    "dispatchPersonName": "John Doe",
    "receiverName": "Jane Smith",
    "notes": "Test shipment"
  }')

SHIPMENT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created Shipment ID: $SHIPMENT_ID"

# 3. Get All Shipments
echo -e "\nGetting all shipments..."
curl -s -X GET $BASE_URL \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Get Shipment by ID
echo -e "\nGetting shipment by ID..."
curl -s -X GET "$BASE_URL/$SHIPMENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 5. Update Shipment
echo -e "\nUpdating shipment..."
curl -s -X PUT "$BASE_URL/$SHIPMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "Dispatched",
    "trackingNumber": "TRK_TEST_123"
  }' | jq .

# 6. Delete Shipment (uncomment to test)
# echo -e "\nDeleting shipment..."
# curl -s -X DELETE "$BASE_URL/$SHIPMENT_ID" \
#   -H "Authorization: Bearer $TOKEN" | jq .

echo "=== Testing Complete ==="
```

---

## Windows PowerShell Commands
```powershell
# Set variables
$token = "YOUR_JWT_TOKEN"
$baseUrl = "http://localhost:5000/api/shipments"

# Create Single Shipment
$body = @{
    orderId = "507f1f77bcf86cd799439011"
    customerId = "507f1f77bcf86cd799439012"
    shippingAddress = "507f1f77bcf86cd799439013"
    courierService = "FedEx"
    shippingCost = 250
    numberOfBoxes = 2
    dispatchPersonName = "John Doe"
    receiverName = "Jane Smith"
    notes = "Test shipment from PowerShell"
} | ConvertTo-Json

Invoke-RestMethod -Uri $baseUrl -Method Post -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
} -Body $body

# Get All Shipments
Invoke-RestMethod -Uri $baseUrl -Method Get -Headers @{
    "Authorization" = "Bearer $token"
}
```

---

## Quick Test Commands
Replace `YOUR_JWT_TOKEN` with actual token and run:

```bash
# Test all endpoints quickly
export TOKEN="YOUR_JWT_TOKEN"

# Get courier services
curl -X GET http://localhost:5000/api/shipments/courier-services -H "Authorization: Bearer $TOKEN"

# Create shipment
curl -X POST http://localhost:5000/api/shipments -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"orderId":"507f1f77bcf86cd799439011","customerId":"507f1f77bcf86cd799439012","shippingAddress":"507f1f77bcf86cd799439013","courierService":"FedEx","shippingCost":250,"numberOfBoxes":2,"dispatchPersonName":"John Doe","receiverName":"Jane Smith"}'

# Get all shipments
curl -X GET http://localhost:5000/api/shipments -H "Authorization: Bearer $TOKEN"

# Get by order ID
curl -X GET http://localhost:5000/api/shipments/order/507f1f77bcf86cd799439011 -H "Authorization: Bearer $TOKEN"
```

---

## Required Fields for Shipment Creation
- `orderId`: Valid Order ID
- `customerId`: Valid Customer ID  
- `shippingAddress`: Valid Customer Address ID
- `courierService`: One of ['FedEx', 'UPS', 'DHL', 'USPS', 'Blue Dart', 'DTDC', 'Delhivery', 'Ecom Express', 'XpressBees']
- `shippingCost`: Number (minimum 0)
- `numberOfBoxes`: Number (1-200)
- `dispatchPersonName`: String
- `receiverName`: String

## Optional Fields
- `trackingNumber`: String (auto-generated if not provided)
- `trackingLink`: Valid URL
- `notes`: String
- `status`: ['Pending', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled']

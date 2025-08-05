# Order API - Complete cURL Commands

## Authentication
First, get your JWT token (replace with actual credentials):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

Save the token from response and use it in all order API calls below.

---

## 1. Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": "507f1f77bcf86cd799439011",
    "productInformation": "Electronics - Laptop",
    "quantity": 2,
    "numberOfBoxes": 1,
    "orderDate": "15-12-2024",
    "weight": 2.5,
    "orderValue": 75000,
    "productDescription": "Dell Inspiron 15 3000 series laptop with Intel i5 processor",
    "dimensions": {
      "length": 35.6,
      "width": 24.2,
      "height": 2.5
    },
    "specialInstructions": "Handle with care - fragile item"
  }'
```

---

## 2. Get All Orders
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Get Order by ID
```bash
curl -X GET http://localhost:5000/api/orders/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Get Orders by Customer ID
```bash
curl -X GET http://localhost:5000/api/orders/customer/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Update Order Status
```bash
curl -X PATCH http://localhost:5000/api/orders/507f1f77bcf86cd799439012/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderStatus": "processing"
  }'
```

---

## 6. Update Order Details
```bash
curl -X PUT http://localhost:5000/api/orders/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quantity": 3,
    "orderValue": 85000,
    "specialInstructions": "Urgent delivery required"
  }'
```

---

## 7. Delete Order
```bash
curl -X DELETE http://localhost:5000/api/orders/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Batch Testing Script
Save this as `test_orders.sh` and run with `bash test_orders.sh`:

```bash
#!/bin/bash

# Replace with your actual JWT token
TOKEN="YOUR_JWT_TOKEN"
BASE_URL="http://localhost:5000/api/orders"

echo "=== Testing Order API ==="

# 1. Create Order
echo "Creating order..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerId": "507f1f77bcf86cd799439011",
    "productInformation": "Test Product",
    "quantity": 1,
    "numberOfBoxes": 1,
    "orderDate": "16-12-2024",
    "weight": 1.5,
    "orderValue": 1000,
    "productDescription": "Test product description",
    "dimensions": {"length": 10, "width": 5, "height": 3}
  }')

ORDER_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created Order ID: $ORDER_ID"

# 2. Get All Orders
echo -e "\nGetting all orders..."
curl -s -X GET $BASE_URL \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Get Order by ID
echo -e "\nGetting order by ID..."
curl -s -X GET "$BASE_URL/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Update Order Status
echo -e "\nUpdating order status..."
curl -s -X PATCH "$BASE_URL/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"orderStatus": "processing"}' | jq .

# 5. Delete Order (uncomment to test)
# echo -e "\nDeleting order..."
# curl -s -X DELETE "$BASE_URL/$ORDER_ID" \
#   -H "Authorization: Bearer $TOKEN" | jq .

echo "=== Testing Complete ==="
```

## Windows PowerShell Commands
```powershell
# Set variables
$token = "YOUR_JWT_TOKEN"
$baseUrl = "http://localhost:5000/api/orders"

# Create Order
$body = @{
    customerId = "507f1f77bcf86cd799439011"
    productInformation = "Electronics - Laptop"
    quantity = 2
    numberOfBoxes = 1
    orderDate = "15-12-2024"
    weight = 2.5
    orderValue = 75000
    productDescription = "Dell Inspiron 15 3000 series laptop"
    dimensions = @{length = 35.6; width = 24.2; height = 2.5}
    specialInstructions = "Handle with care"
} | ConvertTo-Json

Invoke-RestMethod -Uri $baseUrl -Method Post -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
} -Body $body
```

## Quick Test Commands
Replace `YOUR_JWT_TOKEN` with actual token and run:

```bash
# Test all endpoints quickly
export TOKEN="YOUR_JWT_TOKEN"

# Create
curl -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"customerId":"507f1f77bcf86cd799439011","productInformation":"Test","quantity":1,"numberOfBoxes":1,"orderDate":"16-12-2024","weight":1,"orderValue":1000,"productDescription":"Test","dimensions":{"length":10,"width":5,"height":3}}'

# Get All
curl -X GET http://localhost:5000/api/orders -H "Authorization: Bearer $TOKEN"

# Get by ID (replace ID)
curl -X GET http://localhost:5000/api/orders/ORDER_ID -H "Authorization: Bearer $TOKEN"

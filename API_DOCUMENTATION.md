# Order Management API Documentation

## Base URL
`http://localhost:5000/api/orders`

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Order Schema

### Required Fields:
- **customerId** (ObjectId): Customer reference ID
- **productInformation** (String): Product name/type
- **quantity** (Number): Quantity of items
- **numberOfBoxes** (Number): Number of boxes for packaging
- **orderDate** (String): Date in DD-MM-YYYY format
- **weight** (Number): Weight in kg
- **orderValue** (Number): Order value in rupees
- **productDescription** (String): Detailed product description
- **dimensions** (Object): Product dimensions
  - **length** (Number): Length in cm
  - **width** (Number): Width in cm
  - **height** (Number): Height in cm

### Optional Fields:
- **specialInstructions** (String): Any special delivery instructions
- **orderStatus** (String): Default 'pending'

## API Endpoints

### 1. Create Order
**POST** `/api/orders`

**Request Body:**
```json
{
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
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "customerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
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
    "specialInstructions": "Handle with care - fragile item",
    "orderStatus": "pending",
    "createdAt": "2024-12-15T10:30:00.000Z",
    "updatedAt": "2024-12-15T10:30:00.000Z"
  }
}
```

### 2. Get All Orders
**GET** `/api/orders`

**Response:**
```json
{
  "success": true,
  "count": 25,
  "orders": [...]
}
```

### 3. Get Order by ID
**GET** `/api/orders/:id`

**Response:** Same as create order response

### 4. Get Orders by Customer
**GET** `/api/orders/customer/:customerId`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "orders": [...]
}
```

### 5. Update Order Status
**PATCH** `/api/orders/:id/status`

**Request Body:**
```json
{
  "orderStatus": "processing"
}
```

**Valid Status Values:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

### 6. Update Order Details
**PUT** `/api/orders/:id`

**Request Body:** Any order fields to update (except _id and createdAt)

### 7. Delete Order
**DELETE** `/api/orders/:id`

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Customer not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Error creating order",
  "error": "Detailed error message"
}
```

## Testing with Postman

1. **Get JWT Token:** First authenticate via `/api/auth/login`
2. **Set Headers:** Add `Authorization: Bearer <token>` to all requests
3. **Test Endpoints:** Use the provided request formats

## Example cURL Commands

### Create Order
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
    "productDescription": "Dell Inspiron 15 3000 series laptop",
    "dimensions": {
      "length": 35.6,
      "width": 24.2,
      "height": 2.5
    },
    "specialInstructions": "Handle with care"
  }'
